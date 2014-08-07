/**
 * Created by dvircn on 06/08/14.
 */
var CUI = Class({
    $singleton: true,

    /**
     * Build all objects.
     */
    buildAll: function(){
        this.build(CObjectsHandler.appContainerId);
    },
    /**
     * Build from object.
     * @param id : Object ID.
     */
    buildFromObject: function(id){
        // Clear prepared objects.
        CObjectsHandler.clearPreparedObjects();
        // Prepare for build.
        CObjectsHandler.getObjectById(id).prepareBuild();
        // Build relevant Objects.
        _.each(CObjectsHandler.getObjectsOrdered(),function(object){
            // Check if the object need to be build.
            if (!object.isBuildPrepared()) return;
            // Apply Logic and Design on the Object.
            CLogic.applyLogic(object);
            CDesign.applyDesign(object);
        });

    }

});


