/**
 * Created by dvircn on 07/08/14.
 */
var CObjectsHandler = Class({
    $singleton: true,
    objectsById: {},
    preparedObjects: Array(),
    appContainerId: "",
    dialogsContainerId: "",
    mainViewId: "",
    contentId: "",
    headers: {},
    footers: {},

    addObject: function(object){
        this.objectsById[object.uid()] = object;
    },
    /**
     * Remove object from the DOM and the ObjectsHandler.
     * @param objectId
     */
    removeObject: function(objectId){
        //Remove from the DOM.
        var element = CUtils.element(this.object(objectId).uid());
        element.parentNode.removeChild(element);
        // Remove from ObjectsHandler.
        delete this.objectsById[objectId];
    },
    addPreparedObject: function(object){
        this.preparedObjects.push(object);
    },
    object: function(id){
        return this.objectsById[id];
    },
    // Extend CObject method: parseRelativeObjectId
    relativeObject: function(baseObjectId,relativeId){
        var baseObject = CObjectsHandler.object(baseObjectId);
        if (CUtils.isEmpty(baseObject)) {
            baseObject = baseObjectId; // Case CObject sent and not id.
            baseObjectId = baseObject.uid();
        }
        if (CUtils.isEmpty(baseObject))
            return null;
        var relativeParentId = '';
        if (baseObject.isRelative())
            relativeParentId = baseObjectId;
        else
            relativeParentId = baseObject.getRelativeParent();
        if (!CUtils.isEmpty(relativeParentId))
            return relativeParentId+'/'+relativeId;

    },
    isCObject: function(id){
        return !CUtils.isEmpty(this.object(id));
    },
    updateUname: function(last,current){
        if (last === current)
            return;
        var object = this.object(last);
        //delete this.objectsById[last];
        this.objectsById[current] = object;
    },
    getPreparedObjects: function(){
        return this.preparedObjects;
    },
    clearPreparedObjects: function(){
        this.preparedObjects = Array();
    },
    getHeaders: function(){
        return _.keys(CObjectsHandler.headers);
    },
    getFooters: function(){
        return _.keys(CObjectsHandler.footers);
    },
    getHeader: function(id){
        return CObjectsHandler.headers[id] || null;
    },
    getFooter: function(id){
        return CObjectsHandler.footers[id] || null;
    },
    loadObjects: function(objects){
        var strongTypes = ['AppContainer','MainView','Content'];
        // Sort Objects by type.
        objects.sort(function(a,b){
            if (strongTypes.indexOf(a.type) >= 0 && strongTypes.indexOf(b.type) < 0)
                return -1;
            else if (strongTypes.indexOf(b.type) >= 0 && strongTypes.indexOf(a.type) < 0)
                return 1;
            else
                return 0;
        });
        // Load.
        _.each(objects,function(object){
            var type = object.type; // Get the Object type.
            if (CUtils.isEmpty(type)) return;
            // Try to create object.
            try {
                this.createObject(type,object);
            }
            catch (e){
                CLog.log("Failed to create object from type: "+type+". Error: "+e);
                CLog.log(e);
            }
        },this);
    },
    createObject: function(type,data){
        var cObject = eval("new C"+type+"(data)"); // Create the object.
        CObjectsHandler.addObject(cObject);
        if (type=="AppContainer") CObjectsHandler.appContainerId = cObject.uid(); // Identify App Container Object.
        if (type=="MainView") CObjectsHandler.mainViewId = cObject.uid(); // Identify Main Object.
        if (type=="Content") CObjectsHandler.contentId = cObject.uid(); // Identify Content Object.
        if (type=="Header") // Save Headers references.
            CObjectsHandler.headers[cObject.uid()] = true;
        if (type=="Footer") // Save Footers references.
            CObjectsHandler.footers[cObject.uid()] = true;
        return cObject.uid();
    },
    createFromTemplateObject: function(abstractObject,data,logic,design){
        var duplicatedObjectBase        = {};
        for (var key in abstractObject){
            duplicatedObjectBase[key] = CUtils.clone(abstractObject[key]);
        }

        duplicatedObjectBase.data   = duplicatedObjectBase.data || {};
        duplicatedObjectBase.logic  = duplicatedObjectBase.logic || {};
        duplicatedObjectBase.design = duplicatedObjectBase.design || {};
        duplicatedObjectBase.data   = CUtils.mergeJSONs(duplicatedObjectBase.data,data || {});
        duplicatedObjectBase.logic  = CUtils.mergeJSONs(duplicatedObjectBase.logic,logic || {});
        duplicatedObjectBase.design = CUtils.mergeJSONs(duplicatedObjectBase.design,design || {});

        var duplicateId = this.createObject(duplicatedObjectBase.type,duplicatedObjectBase);

        return duplicateId;
    },
    cohtmlParse: function(cohtml){
        if (CUtils.isEmpty(cohtml))
            return [];
        var xmlDoc = null;
        if (window.DOMParser) {
            var parser=new DOMParser();
            xmlDoc=parser.parseFromString(cohtml,"text/xml");
        }
        else { // Internet Explorer
            xmlDoc=new ActiveXObject("Microsoft.XMLDOM");
            xmlDoc.async=false;
            xmlDoc.loadXML(cohtml);
        }
        var elements = xmlDoc.childNodes || [];
        var childrenIDs = [];
        _.each(elements,function(element){
            var childObjectId = CObjectsHandler.cohtmlParseElement(element);
            childrenIDs.push(childObjectId);
        });
        return childrenIDs;
    },
    cohtmlParseElement: function(element){
        var children    = element.childNodes || [];
        var childrenIDs = [];
        _.each(children,function(childElement){
            var childObjectId = CObjectsHandler.cohtmlParseElement(childElement);
            childrenIDs.push(childObjectId);
        });

        var defaultType = 'Object';
        if (childrenIDs.length > 0)
            defaultType = 'Container';
        var objectType  = 'Container';
        var uname       = null;
        if (element.getAttribute) {
            objectType = element.getAttribute('co-type') || 'Container';
            uname = element.getAttribute('co-uname') || null;
        }
        var objectBuilder = co(objectType,uname);
        var prepareBuildData = {
            attributes: [],
            tag: null
        };
        if (!CUtils.isEmpty(element.tagName))
            prepareBuildData.tag = element.tagName.toLowerCase();
        if ( (element.nodeName == '#text' || element.nodeType == 3) && !CUtils.isEmpty(element.nodeValue))
            objectBuilder.text(element.nodeValue);

        var attributes = element.attributes || [];
        _.each(attributes, function(attr){
            try {
                var name    = attr.name;
                var value   = attr.value;
                if (name.indexOf('co-') === 0 && name!='co-type' && name!='co-uname'){
                    var action = name.substr(('co-').length);
                    // Parse value.
                    if (value.indexOf('s@')===0)
                        value = [value.substr(2)];
                    else if (value.indexOf('p@')===0)
                        value = eval('('+value.substr(2)+')');
                    else
                        value = [eval(value)];
                    // Apply action with value.
                    objectBuilder[action].apply(objectBuilder,value);
                }
                else{
                    prepareBuildData.attributes.push(name+'="'+value+'"')
                }
            }
            catch (e){
                CLog.error('Error in CObject.parseCOHTML');
                CLog.log(e);
            }

        });
        objectBuilder.prepareBuildData(prepareBuildData);
        if (childrenIDs.length > 0)
            objectBuilder.childs(childrenIDs);
        var builded = objectBuilder.build();
        var createdObjectId = CObjectsHandler.createObject(builded.type,builded);
        return createdObjectId;
    }


});


window.cobject = function(id) {
    return CObjectsHandler.object(id);
};
window.celement = function(id) {
    return CUtils.element(id);
};
window.crelativeObject =function(baseObjectId,relativeId) {
    return CObjectsHandler.relativeObject(baseObjectId,relativeId);
};
