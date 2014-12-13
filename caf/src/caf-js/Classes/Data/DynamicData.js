/**
 * Created by dvircn on 15/08/14.
 */
var CDynamicData = Class({
    $statics: {
        create: function(){
            
        }
    },

    constructor: function(source) {
        this.source = source;
        this.isDynamicData = true;
    },
    value: function(){
        return CData.parseReference(this.source);
    }




});

