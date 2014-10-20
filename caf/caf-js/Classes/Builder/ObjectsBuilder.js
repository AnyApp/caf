/**
 * Created by dvircn on 13/08/14.
 */
var CBuilderObjects = Class({
    $statics: {

    },

    constructor: function() {
        this.objects = [];
        this.designs = {};
        this.data = {};
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
            data:       this.data
        };
        return appData;
    },
    create: function(type,uname){
        var objectBuilder = new CBuilderObject(type || '',uname || '');
        this.objects.push(objectBuilder);
        return objectBuilder;
    },
    saveAppDataToFile: function(path){

    }


});

