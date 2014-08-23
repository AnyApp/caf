/**
 * Created by dvircn on 22/08/14.
 */
var CDynamics = Class({
    $singleton: true,
    applyDynamic: function(object,value) {
        if (CUtils.isEmpty(value) || CUtils.isEmpty(value.url))
            return;
        // Do not re-initiate
        if (this.dynamicApplied(object.uid()))
            return;
        // Initialize and set defaults.
        object.dynamic              = CUtils.clone(value);
        object.dynamic.url          = object.dynamic.url        || '';
        object.dynamic.data         = object.dynamic.data       || {};
        object.dynamic.autoLoad     = object.dynamic.autoLoad   || false;
        object.dynamic.loaded       = object.dynamic.loaded     || false;
        object.dynamic.abstract     = object.dynamic.abstract   === false ? false : true;
        object.dynamic.duplicates   = object.dynamic.data       || [];

        if (object.dynamic.autoLoad === true)
            this.load();
    },
    dynamicApplied: function(objectId){
        var object = CObjectsHandler.object(objectId);
        return !CUtils.isEmpty(object.dynamic);
    },
    load: function(objectId) {
        var object = CObjectsHandler.object(objectId);
        // Do not rebuild again.
        if (object.dynamic.loaded === true)
            return;

        // Request.
        CNetwork.request(object.dynamic.url,object.dynamic.data,
        function(){
            
        });
    }

});


