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
        ),
        email: new CPrepareFunction(
            function(value){
                var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                return re.test(value);
            }
        )


},

    prepareFunction: function(name){
        return this.prepares[name];
    }


});
