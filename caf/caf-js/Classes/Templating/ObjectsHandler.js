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
    loadObjects: function(objects){
        _.each(objects,function(object){
            var type = object.type; // Get the Object type.
            if (CUtils.isEmpty(type)) return;
            // Try to create object.
            //try {
                this.createObject(type,object);
            //}
            //catch (e){
            //    CLog.log("Failed to create object from type: "+type+". Error: "+e);
            //}

        },this);
    },
    createObject: function(type,data){
        var cObject = eval("new C"+type+"(data)"); // Create the object.
        CObjectsHandler.addObject(cObject);
        if (type=="AppContainer") CObjectsHandler.appContainerId = cObject.uid(); // Identify App Container Object.
        if (type=="MainView") CObjectsHandler.mainViewId = cObject.uid(); // Identify Main Object.
        return cObject.uid();
    },
    createFromTemplateObject: function(abstractObject,data,logic,design){
        var duplicatedObjectBase        = {};
        for (var key in abstractObject){
            duplicatedObjectBase[key] = CUtils.clone(abstractObject[key]);
        }

        duplicatedObjectBase.data   = CUtils.mergeJSONs(duplicatedObjectBase.data,data);
        duplicatedObjectBase.logic  = CUtils.mergeJSONs(duplicatedObjectBase.logic,logic);
        duplicatedObjectBase.design = CUtils.mergeJSONs(duplicatedObjectBase.design,design);

        var duplicateId = this.createObject(duplicatedObjectBase.type,duplicatedObjectBase);

        return duplicateId;
    }


});


