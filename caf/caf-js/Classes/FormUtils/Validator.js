/**
 * Created by dvircn on 12/08/14.
 */
var CValidator = Class({

    constructor: function(errorTitle,errorMsg,successTitle,successMsg,validator) {
        this.validator      = validator;
        this.errorTitle     = errorTitle;
        this.errorMsg       = errorMsg;
        this.successTitle   = successTitle;
        this.successMsg     = successMsg;
    },
    validate: function(value){
        if (this.validator(value))
            return new CValidationResult(true,this.successMsg,this.successTitle);
        else
            return new CValidationResult(false,this.errorMsg,this.errorTitle);

    }

});




