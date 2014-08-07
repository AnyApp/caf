/**
 * Created by dvircn on 06/08/14.
 */
var CLocalStorage = Class({
    $singleton: true,
    save: function(key,value){
        window.localStorage.setItem(key,value);
    },
    get: function(key){
        var value = window.localStorage.getItem(key);
        if (CUtils.isEmpty(value)) return null;
        return value;
    },
    empty: function(key){
        return CUtils.isEmpty(window.localStorage.getItem(key));
    }

});


