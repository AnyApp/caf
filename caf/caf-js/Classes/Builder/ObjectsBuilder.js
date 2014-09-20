/**
 * Created by dvircn on 13/08/14.
 */
var CBuilderObjects = Class({
    $statics: {

    },

    constructor: function() {
        this.objects = [];
        this.designs = {};
        this.datas = {};
    },
    addDesign: function(name,design){
        this.designs[name] = design;
    },
    getDesign: function(name){
        return this.designs[name];
    },
    addData: function(name,data){
        this.datas[name] = data;
    },
    getData: function(name){
        return this.datas[name];
    },
    build: function(){
        var builtObjects = [];
        _.each(this.objects,function(objectBuilder){
            builtObjects.push(objectBuilder.build());
        });
        return builtObjects;
    },
    create: function(type,uname){
        var objectBuilder = new CBuilderObject(type || '',uname || '');
        this.objects.push(objectBuilder);
        return objectBuilder;
    }


});

