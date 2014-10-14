/**
 * Created by dvircn on 17/08/14.
 */
var CGlobals = Class({
    $singleton: true,
    globals: {},

    get: function(name,value){
        return CGlobals.globals[name] || null;
    },
    setGlobal: function(key,value){
        CDesignHandler.designs[key] = value;
    },
    setGlobals: function(globals){
        _.each(globals,function(value,key){
            CDesignHandler.designs[key] = value;
        },this);
    }


});
