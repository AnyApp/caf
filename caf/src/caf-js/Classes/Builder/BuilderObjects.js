/**
 * Created by dvircn on 13/08/14.
 */
var CBuilderObjects = Class({
    $statics: {
        currentBuilder : null
    },

    constructor: function() {
        this.objects = [];
        this.designs = {};
        this.plugins = [];
        this.appPrefs = {};
        this.data = {};
        CBuilderObjects.currentBuilder = this;
    },
    addPlugin: function(name,version){
        var plugin = {
            name: name
        };
        if (!CUtils.isEmpty(version))
            plugin.version = version;

        this.plugins.push(plugin);
    },
    setAppPref: function(key,value){
        this.appPrefs[key] = value;
    },
    addDesign: function(name,design){
        this.designs[name] = design;
    },
    getDesign: function(name){
        return this.designs[name];
    },
    addData: function(name,data){
        this.data[name] = data;
    },
    getData: function(name){
        return this.data[name];
    },
    build: function(){
        // Create Objects.
        var builtObjects = [];
        _.each(this.objects,function(objectBuilder){
            builtObjects.push(objectBuilder.build());
        });

        var appData = {
            objects:    builtObjects,
            designs:    this.designs,
            plugins:    this.plugins,
            data:       this.data
        };
        appData = CUtils.mergeJSONs(appData,this.appPrefs);
        return appData;
    },
    create: function(type,uname){
        var objectBuilder = new CBuilderObject(type || '',uname || '');
        this.objects.push(objectBuilder);
        return objectBuilder;
    },
    createFromBuilderObject: function(builderObject){
        var createdBuilderObject = this.create();
        createdBuilderObject.properties = builderObject.properties;
        return createdBuilderObject;
    }


});

