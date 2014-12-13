/**
 * Created by dvircn on 06/08/14.
 */
var CPrepareFunction = Class({

    constructor: function(func) {
        this.func = func;
    },
    prepare: function(value){
        return this.func(value);
    }

});
