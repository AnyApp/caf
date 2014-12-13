/**
 * Created by dvircn on 12/10/14.
 */
var CDesignHandler = Class({
    $singleton: true,
    designs: {},
    get: function(name){
        return CDesignHandler.designs[name] || null;
    },
    addDesign: function(name,design){
        CDesignHandler.designs[name] = design;
    },
    addDesigns: function(designs){
        _.each(designs,function(design,name){
            CDesignHandler.designs[name] = design;
        },this);
    }


});

