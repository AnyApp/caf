/**
 * Created by dvircn on 09/08/14.
 */
var CTemplator = Class({
    $singleton: true,

    /**
     * Build all objects.
     */
    buildAll: function(){
        CObjectsHandler.object(CObjectsHandler.appContainerId).setParent('body');
        this.buildFromObject(CObjectsHandler.appContainerId);
    },
    /**
     * Build from object.
     * @param id : Object ID.
     */
    buildFromObject: function(id){
        // Clear prepared objects.
        CObjectsHandler.clearPreparedObjects();

        // Prepare for build and get the view (If the objects aren't in the DOM).
        var currentObject   = CObjectsHandler.object(id);
        var view            = new CStringBuilder();

        var viewBuilder = currentObject.prepareBuild({view:view});
        var viewStr     = viewBuilder.build(' ');

        // Append the view to the parent in the DOM.
        // Note: If the objects are already in the DOM, viewStr will be empty
        //       and the DOM won't change.
        CUtils.element(currentObject.getParent()).innerHTML += viewStr;

        // Build relevant Objects by the order of their build (Parent->Child).
        _.each(CObjectsHandler.getPreparedObjects(),function(object){
            // Apply Logic and Design on the Object.
            CDesign.applyDesign(object);
            CLogic.applyLogic(object);
        },this);

        // Clear Whitespaces.
        CUtils.cleanWhitespace();
    },
    objectJSON: function(type,uname,design,logic,data){
        var object = {};
        object.type     = type;
        object.uname    = uname;
        object.design   = design;
        object.logic    = logic;
        object.data     = data;
    }


});
