/**
 * Created by dvircn on 07/08/14.
 */
var CLog = Class({
    $singleton: true,
    log: function(data){
        window.console.log(data);
    },
    dlog: function(data){
        window.console.log(data);
    },
    error: function(error){
        window.console.log(error);
    }


});


