/**
 * Created by dvircn on 12/08/14.
 */
var CValidationResult = Class({

    constructor: function(valid,message,title) {
        this.valid      = valid;
        this.message    = message;
        this.title      = title;
    },
    isValid: function(){
        return this.valid;
    },
    getMessage: function(){
        return this.message;
    },
    getTitle: function(){
        return this.title;
    }


});




