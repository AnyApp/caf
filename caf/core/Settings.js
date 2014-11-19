/**
 * Created by dvircn on 14/10/14.
 */
var CSettings = {
    settings: {},
    set: function(key,value){
        CSettings.settings[key] = value;
    },
    get: function(key){
        return CSettings.settings[key];
    },
    initialize: function(){
        CSettings.set('appID','54454949ff3211020039f812');
    }
}

CSettings.initialize();

