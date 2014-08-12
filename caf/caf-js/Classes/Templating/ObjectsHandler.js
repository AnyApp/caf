/**
 * Created by dvircn on 07/08/14.
 */
var CObjectsHandler = Class({
    $singleton: true,
    objectsById: {},
    preparedObjects: Array(),
    appContainerId: "",

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
            if (type=="AppContainer") this.appContainerId = object.uid(); // Identify Main Object.
            // Try to create object.
            try {
                var cObject = eval("new C"+type+"()"); // Create the object.
                CObjectsHandler.addObject(cObject);
            }
            catch (e){
                CLog.log("Failed to create object from type: "+type);
            }

        });
    }


});


