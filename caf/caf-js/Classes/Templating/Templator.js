/**
 * Created by dvircn on 09/08/14.
 */
var CTemplator = Class({
    $singleton: true,

    /**
     * Build all objects.
     */
    buildAll: function(){
        CObjectsHandler.getObjectById(CObjectsHandler.appContainerId).setParent('body');
        this.build(CObjectsHandler.appContainerId);
    },
    /**
     * Build from object.
     * @param id : Object ID.
     */
    buildFromObject: function(id){
        // Clear prepared objects.
        CObjectsHandler.clearPreparedObjects();

        // Prepare for build and get the view (If the objects aren't in the DOM).
        var currentObject   = CObjectsHandler.getObjectById(id);
        var view         = new CStringBuilder();

        currentObject.prepareBuild({view:view});

        // Append the view to the parent in the DOM.
        // Note: If the objects are already in the DOM, viewStr will be empty
        //       and the DOM won't change.
        CUtils.element(currentObject.getParent()).innerHTML += viewStr;

        // Build relevant Objects by the order of their build (Parent->Child).
        _.each(CObjectsHandler.getPreparedObjects(),function(object){
            // Apply Logic and Design on the Object.
            CDesign.applyDesign(object);
            CLogic.applyLogic(object);
        });
    }

});
