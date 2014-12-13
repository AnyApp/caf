/**
 * Created by dvircn on 17/08/14.
 */
var CGlobals = Class({
    $singleton: true,
    globals: {},
    initialized: false,
    defaults: {
        headerSize: 55,
        footerSize: 35
    },
    get: function(name){
        var value = CGlobals.globals[name];
        if (CUtils.isEmpty(value) && !CUtils.isEmpty(CGlobals.defaults[name]))
            value = CGlobals.defaults[name];
        return value;
    },
    getDeep: function(path){
        var value = CUtils.deepFind(CGlobals.globals,path);
        if (CUtils.isEmpty(value) && !CUtils.isEmpty(CGlobals.defaults[path]))
            value = CGlobals.defaults[path];
        return value || null;
    },
    exist: function(name){
        return !CUtils.isEmpty(CGlobals.get(name));
    },
    set: function(key,value){
        CGlobals.globals[key] = value;
    },
    setGlobals: function(globals){
        _.each(globals,function(value,key){
            CGlobals.globals[key] = value;
        },this);
    }

});
