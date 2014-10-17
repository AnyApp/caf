/**
 * Created by dvircn on 17/08/14.
 */
var CGlobals = Class({
    $singleton: true,
    globals: {},

    get: function(name){
        return CGlobals.globals[name] || null;
    },
    setGlobal: function(key,value){
        CGlobals.globals[key] = value;
    },
    setGlobals: function(globals){
        _.each(globals,function(value,key){
            CGlobals.globals[key] = value;
        },this);
    }


});
