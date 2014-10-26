/**
 * Created by dvircn on 06/08/14.
 */
var CLocalStorage = Class({
    $singleton: true,
    base: '',
    initBase: function(){
        CLocalStorage.base = CSettings.get('appID') || '';
    },
    save: function(key,value){
        CLocalStorage.initBase();
        window.localStorage.setItem(CLocalStorage.base+key,JSONfn.stringify(value));
    },
    get: function(key){
        CLocalStorage.initBase();
        var value = window.localStorage.getItem(CLocalStorage.base+key);
        if (CUtils.isEmpty(value)) return null;
        return JSONfn.parse(value);
    },
    empty: function(key){
        CLocalStorage.initBase();
        return CUtils.isEmpty(window.localStorage.getItem(CLocalStorage.base+key));
    }

});


