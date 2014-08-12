/**
 * Created by dvircn on 12/08/14.
 */
var CPrepareFunctions = Class({
    $singleton: true,
    prepares: {
        same: new CValidator(
            function(value){
                return value;
            }
        ),
        numbersOnly: new CPrepareFunction(
            function(value){
                return value.replace(/\D/g,'');
            }
        )
    },

    prepareFunction: function(name){
        return this.prepares[name];
    }


});
