/**
 * Created by dvircn on 16/08/14.
 */
var CAppConfig = Class({
    $singleton: true,
    loaded: false,
    data: {
        headerSize: 45,
        footerSize: 35
    },

    load: function(){
        var savedData = JSON.parse(CLocalStorage.get('app-config'));
        this.data = CUtils.mergeJSONs(savedData,this.data);
    },
    get: function(key){
        if (!this.loaded)
            this.load();
        return this.data[key];
    },
    saveConfig: function(data){
        if (!this.loaded)
            this.load();
        this.data = CUtils.mergeJSONs(data,this.data);
        CLocalStorage.save('app-config',JSON.stringify(this.data));
    },
    baseUrl: function(){
        return window.location.toString().substring(0,window.location.toString().length-1); //TEMP ..'http://localhost:63342/CAF';//this.get('baseUrl');
    },
    basePath: function(){
        return CUtils.getUrlParts(this.baseUrl()).pathname;//this.get('baseUrl');
    }

});

