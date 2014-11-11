/**
 * Created by dvircn on 06/08/14.
 */
var CObject = Class({
    $statics: {
        DEFAULT_DESIGN: {
//            gpuAccelerated: true
        },
        DEFAULT_LOGIC: {
        },

        generateID: function() {
            return "c_"+Math.random().toString(36).substring(2);
        },
        setObjectDefaults: function(values,useClass){
            values.design = values.design || {};
            if (!CUtils.isString(values.design))
                values.design.defaults = CUtils.mergeJSONs(values.design.defaults,useClass.DEFAULT_DESIGN);
            values.logic = CUtils.mergeJSONs(useClass.DEFAULT_LOGIC,values.logic);
        },
        setObjectDesignDefaults: function(values,useClass){
            values.design = values.design || {};
            if (!CUtils.isString(values.design))
                values.design.defaults = CUtils.mergeJSONs(values.design.defaults,useClass.DEFAULT_DESIGN);
        }

    },

    constructor: function(values) {
        if (CUtils.isEmpty(values)) return;
        // Merge Defaults.
        CObject.setObjectDefaults(values,CObject);

        this.id             = values.id         || CObject.generateID();
        this.appId          = values.appId;
        this.uname          = values.uname;
        this.version        = values.version;
        this.platform       = values.platform   || ['All'];
        this.logic          = values.logic      || {};
        this.design         = values.design     || {};
        this.data           = values.data       || {};
        this.classes        = "";
        this.lastClasses    = "";
        this.lastLogic      = {};
        this.parent         = -1; // Object's Container Parent
        this.relativeParent = -1; // This object relative parent.
        this.relative       = values.relative || false; // Is this object relative.
        this.logic.doStopPropagation = values.logic.doStopPropagation || false;

    },
    /**
     * Return Unique identifier.
     * Enabling giving readable unique name to object.
     * @returns unique identifier.
     */
    uid: function(){
        if (CUtils.isEmpty(this.uname) || this.uname.indexOf('#/')>=0)
            return this.id;
        return this.uname;
    },
    setParent: function(parentID) {
        this.parent = parentID;
    },
    getParent: function() {
        return this.parent;
    },
    getRelativeParent: function() {
        if (this.relativeParent !== -1)
            return this.relativeParent;
        var parentObject     = CObjectsHandler.object(this.parent);
        this.relativeParent  = null;
        // Look for relative parent.
        while (!CUtils.isEmpty(parentObject)){
            if (parentObject.isRelative()){
                this.relativeParent = parentObject.uid();
                break;
            }
            else {
                parentObject = CObjectsHandler.object(parentObject.parent);
            }
        }
        // If there is no relative parent and this object is relative, return this object.
        if (this.relativeParent === null && this.isRelative())
            this.relativeParent = this.uid();
        return this.relativeParent;
    },
    getDeepRelativeParent: function(depth){
        if (depth === 0)
            return this;
        else if (depth === 1)
            return CObjectsHandler.object(this.getRelativeParent() || '');
        else
            return CObjectsHandler.object(this.getDeepRelativeParent(depth-1) || '');
    },
    isRelative: function() {
        return this.relative;
    },
    setRelative: function(relative) {
        this.relative = relative;
    },
    getLink: function() {
        return this.data.link || '';
    },
    getParentObject: function() {
        return CObjectsHandler.object(this.parent);
    },
    getDesign: function() {
        return this.design;
    },
    setDesign: function(design) {
        this.design = design;
    },
    saveLastLogic: function () {
        // Change cache only if logic was updated.
        if (!CUtils.equals(this.logic,this.lastLogic)){
            this.lastLogic = CUtils.clone(this.logic); // Clone JSON.
        }
    },
    setClasses: function(classes){
        this.classes = classes;
    },
    getClasses: function(){
        return this.classes;
    },
    setText: function(text){
        CUtils.element(this.uid()).innerHTML = text||'';
    },
    getLastLogic: function(){
        return this.lastLogic;
    },
    getLogic: function(){
        return this.logic;
    },
    clearLastBuild: function(){
        this.lastClasses = '';
        this.lastLogic = {};
    },
    parseReferences: function(obj) {
        if (CUtils.isEmpty(obj) || obj.parseReferencesVisited === true /* Circular*/)
            return;
        obj.parseReferencesVisited = true;
        for (var property in obj) {
            // Allow parse part of the template data
            if (obj.hasOwnProperty(property) && property=='template') {
                if (!CUtils.isEmpty(obj.template) && !CUtils.isEmpty(obj.template.queryData))
                    this.parseReferences(obj.template.queryData);
            }
            else if (obj.hasOwnProperty(property) && property!='template') {
                if (typeof obj[property] == "object"){
                    this.parseReferences(obj[property]);
                }
                else if (typeof obj[property] == 'string' || obj[property] instanceof String){
                    // Evaluate dynamic data.
                    var evaluated   = this.replaceReferencesInString(obj[property]);
                    obj[property] = evaluated;
                }
                else if (typeof obj[property] == 'function' || obj[property] instanceof Function){
                    // Evaluate references inside functions.
                    var evaluated   = this.replaceReferencesInFunction(obj[property]);
                    obj[property] = evaluated;
                }

            }
        }
        delete obj.parseReferencesVisited;
    },
    parseLocalReference: function(workingObject,str){
        return eval('workingObject.'+str);
    },
    parseGlobalReference: function(str){
        return CGlobals.get(str);
    },
    parsePageReference: function(str){
        return CPageData.get(str);
    },
    parseDesignReference: function(str){
        return CDesignHandler.get(str);
    },
    parseRelativeReference: function(workingObject,str){
        var relativeParentId = workingObject.getRelativeParent();
        if (!CUtils.isEmpty(relativeParentId)){
            var relativeParent = CObjectsHandler.object(relativeParentId);
            return eval('relativeParent'+str);
        }
        return null;
    },
    // Extension of this method in: CObjectHandler.relativeObject
    parseRelativeObjectId: function(workingObject,str){
        if (workingObject.isRelative())
            return eval(workingObject.uid()+str);
        var relativeParentId = workingObject.getRelativeParent();
        if (!CUtils.isEmpty(relativeParentId))
            return relativeParentId+str;
        return str.substr(1);
    },
    replaceReferencesInFunction: function(func) {
        if (CUtils.isEmpty(func))
            return func;
        var thisObjectStr = 'thisObject';
        var funcAsString = JSONfn.stringify(func);
        if (funcAsString.indexOf(thisObjectStr) < 0)
            return func;

        var thisObjectReference = 'CObjectsHandler.object(\''+this.uid()+'\')';
        // Replace all 'thisObject' to reference to this object.
        var replacedReferencesFunc = CUtils.replaceAll(funcAsString,'thisObject',
            thisObjectReference);
        return JSONfn.parse(replacedReferencesFunc);
    },
    replaceReferencesInString: function(str) {
        if (CUtils.isEmpty(str))
            return str;
        if (str.indexOf('#') < 0)
            return str;
        // Multiple reference.
        var parts = str.split(' ');
        for (var i=0; i<parts.length; i++){
            var part = parts[i];
            // not a reference.
            if (part.length<=0 || part[0]!='#')
                continue;
            /**
             * Get the object that the data needed to be extracted from.
             * Examples:'#*'    => workingObject = this
             *          '##*'   => workingObject = this.getRelativeParent()
             *          '###*'  => workingObject = this.getRelativeParent().getRelativeParent()
             *          etc..
            **/
            var countHeadHashes =   CUtils.stringCountOccurencesInHead('#',part);
            var workingObject   =   this.getDeepRelativeParent(countHeadHashes-1);
            part                =   CUtils.stringRemoveAllOccurencesInHead('#',part);
            if (part.length>5 && part.substr(0,5) == 'this.')
                parts[i] = this.parseLocalReference(workingObject,part.substr(5)) || null;
            else if (part.length>1 && part.substr(0,1) == '.')
                parts[i] = this.parseRelativeReference(workingObject,part)  || null;
            else if (part.length>1 && part.substr(0,1) == '/')
                parts[i] = this.parseRelativeObjectId(workingObject,part)   || null;
            else if (part.length>8 && part.substr(0,8) == 'globals.')
                parts[i] = this.parseGlobalReference(part.substr(8))        || null;
            else if (part.length>5 && part.substr(0,5) == 'page.')
                parts[i] = this.parsePageReference(part.substr(5))          || null;
            else if (part.length>8 && part.substr(0,8) == 'designs.')
                parts[i] = this.parseDesignReference(part.substr(8))        || null;
        }
        // Filter out empty elements.
        parts = parts.filter(function(n){ return n != undefined && n!='' && n!=null });
        // Case of single variable - could be an object reference. Otherwise, String.
        if (parts.length==1)
            return parts[0];

        return parts.join(' ');
    },
    /**
     *  Build Object.
     */
    prepareBuild: function(data){
        var view        = data['view'] || new CStringBuilder(),
            tag         = data['tag'],
            attributes  = data['attributes'],
            forceDesign = data['forceDesign'] || {},
            tagHasInner = data['tagHasInner'];

        // Check if this element is already in the DOM.
        var isCreated = !CUtils.isEmpty(CUtils.element(this.uid()));

        // Add to prepared Objects.
        CObjectsHandler.addPreparedObject(this);

        // Save old classes - previous build.
        // This will prevent unnecessary build operations - better performance.
        this.lastClasses    = this.classes;

        // Prepare Design.
        // Save original classes - append them.
        CDesigner.prepareDesign(this);

        // If already created, don't need to recreate the DOM element.
        // Notice: If parent element isn't created, neither its children.
        if (isCreated) return view;

        // If not created, set classes last build to this build
        // Because we will insert them directly to the DOM.
        this.lastClasses = this.classes;

        // Create element and add to the dom array.
        // Extra tag attributes. For example: 'href="http://www.web.com"'
        attributes  = CUtils.isEmpty(attributes)? Array() : attributes;
        // Add class attribute.
        attributes.push('id="'+this.uid()+'"');
        attributes.push('class="'+this.classes+'"');
        var inlineDesign = CDesigner.getFinalInlineStyle(this.design);
        if (!CUtils.isEmpty(inlineDesign)) {
            attributes.push('style="'+inlineDesign+'"');
        }

        // Custom tag - can be used to insert a,input..
        tag         = CUtils.isEmpty(tag)? 'div' : tag;
        var tagOpen = '<'+tag;

        // If tag has inner or not.
        tagHasInner = CUtils.isEmpty(tagHasInner)? true:tagHasInner;

        if (tagHasInner ===false) {
            view.append('/>',true);
            view.append(attributes,true);
            view.append(tagOpen,true);
        }
        else {
            // Has Inner - Wrap it.
            view.append('>',true);
            view.append(attributes,true);
            view.append(tagOpen,true);
            view.append('</'+tag+'>');      // Add to end.
        }
        return view;



    },
    assignReferences: function(){
        // Parse relative uname.
        var prevUID = this.uid();
        this.uname = this.replaceReferencesInString(this.uname);
        CObjectsHandler.updateUname(prevUID,this.uname);
        // Update reference in parent.
        if (!CUtils.isEmpty(this.getRelativeParent())){
            var parentObject = CObjectsHandler.object(this.getRelativeParent());
            var thisIndex = parentObject.getChilds().indexOf(prevUID);
            parentObject.setChildInPosition(this.uid(),thisIndex);
        }
        // Retrieve relative and local references.
        this.parseReferences(this.data);
        this.parseReferences(this.logic);
        if (CUtils.isString(this.design)){
            this.design = this.replaceReferencesInString(this.design);
            this.design = CObject.setObjectDesignDefaults(this.design,this);
        }
        else {
            this.parseReferences(this.design);
        }
    },
    isContainer: function(){
        return false;
    },
    removeSelf: function(){
        var parentContainer = CObjectsHandler.object(this.parent);
        parentContainer.removeChild(this.uid());
        parentContainer.rebuild();
    },
    rebuild: function() {
        var parentContainer = CObjectsHandler.object(this.parent);
        parentContainer.rebuild();

    }



});




