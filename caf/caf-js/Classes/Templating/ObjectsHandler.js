/**
 * Created by dvircn on 07/08/14.
 */
var CObjectsHandler = Class({
    $singleton: true,
    objectsById: {},
    objectsOrdered: Array(),
    preparedObjects: Array(),
    appContainerId: "",

    addObject: function(object){
        this.objectsOrdered.push(object);
        this.objectsById[object.id] = object;
    },
    addPreparedObject: function(object){
        this.preparedObjects.push(object);
    },
    getObjectById: function(id){
        return this.objectsById[id];
    },
    getObjectsOrdered: function(){
        return this.objectsOrdered;
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
            if (type=="AppContainer") this.appContainerId = object.id; // Identify Main Object.
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


