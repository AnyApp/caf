/**
 * Created by dvircn on 12/08/14.
 */
var CValidators = Class({
    $singleton: true,
    validators: {
        passAll: new CValidator('','','','',
            function(value){
                return true;
            }
        ),
        notEmpty: new CValidator('Error','Value is empty','','',
            function(value){
                return !CUtils.isEmpty(value);
            }
        ),
        isTrue: new CValidator('Error','Value is not true','','',
            function(value){
                return value === true;
            }
        )
    },

    validator: function(name){
        return this.validators[name];
    }


});




