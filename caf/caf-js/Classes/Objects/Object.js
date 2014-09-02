/**
 * Created by dvircn on 06/08/14.
 */
var CObject = Class({
    $statics: {
        DEFAULT_DESIGN: {
            gpuAccelerated: true
        },
        DEFAULT_LOGIC: {
        },

        generateID: function() {
            return "c_"+Math.random().toString(36).substring(2);
        },
        mergeWithDefaults: function(values,useClass){
            values.design = CUtils.mergeJSONs(useClass.DEFAULT_DESIGN,values.design);
            values.logic = CUtils.mergeJSONs(useClass.DEFAULT_LOGIC,values.logic);
        }
    },

    constructor: function(values) {
        if (CUtils.isEmpty(values)) return;
        // Merge Defaults.
        CObject.mergeWithDefaults(values,CObject);

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
        this.enterAnimation = '';
        this.entered        = false;
        this.logic.doStopPropagation = values.logic.doStopPropagation || false;

        // Replace all references.
        this.applyDynamicVariables(this.logic);
        // don't apply dynamic variables on dynamic data.

/*
        if (!CUtils.isEmpty(this.data.abstractObjects)) {
            var dynamicData = this.data.abstractObjects;
            this.data.abstractObjects = null;
            this.applyDynamicVariables(this.data);
            this.data.abstractObjects = dynamicData;
        }
        else{
            this.applyDynamicVariables(this.data);
        }
*/

    },
    applyDynamicVariables: function(obj) {
        for (var property in obj) {
            if (obj.hasOwnProperty(property)) {
                if (typeof obj[property] == "object")
                    this.applyDynamicVariables(obj[property]);
                else if (typeof obj[property] == 'string' || obj[property] instanceof String){
                    // Evaluate dynamic data.
                    if (obj[property].substr(0,6)==="$this.")
                        obj[property] = eval(obj[property].substr(1));
                }

            }
        }
    },
    /**
     * Return Unique identifier.
     * Enabling giving readable unique name to object.
     * @returns unique identifier.
     */
    uid: function(){
        if (CUtils.isEmpty(this.uname))
            return this.id;
        return this.uname;
    },
    setParent: function(parentID) {
        this.parent = parentID;
    },
    getParent: function() {
        return this.parent;
    },
    setLink: function(link) {
        if (CUtils.isUrlRelative(link)) {
            this.data.link = CAppConfig.baseUrl()+'/'+link;
        }
        else {
            this.data.link = link;
        }

    },
    getLink: function() {
        return this.data.link || '';
    },
    hasLink: function(){
        return !CUtils.isEmpty(this.logic.link);
    },
    isLink: function(){
        return !CUtils.isEmpty(this.logic.link);
    },
    isLinkLocal: function(){
        return this.data.link.indexOf(CAppConfig.baseUrl())>=0;
    },
    setEnterAnimation: function(enterAnimation) {
        this.enterAnimation = enterAnimation;
    },
    getEnterAnimation: function() {
        return this.enterAnimation;
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
        CDesign.prepareDesign(this);

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

        // Custom tag - can be used to insert a,input..
        if (this.hasLink()){
            this.setLink(this.logic.link.path+ CPager.dataToPath(this.logic.link.data));
            tag = 'a';
            // Allow outer links only in browser. Avoid links opening inside app.
            if (this.isLinkLocal() || CPlatforms.isWeb())
                attributes.push('href="'+this.data.link+'"');
        }
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
    isContainer: function(){
        return false;
    },
    showAnimation: function(){
        if (!this.entered){
            this.entered = true;
            CAnimations.applyAnimation(this.uid(),
                this.logic.anim,this.logic.animDuration,this.logic.animOnComplete);
        }
    },
    hideAnimation: function(){

    },
    removeSelf: function(){
        var parentContainer = CObjectsHandler.object(this.parent);
        parentContainer.removeChild(this.uid());
    }



});




