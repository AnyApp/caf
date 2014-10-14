/**
 * Created by dvircn on 06/08/14.
 */
var CAppUpdater = Class({
    $singleton: true,
    appUpdateURL: 'http://',
    cafAppObjects: 'caf-app-objects',
    load: function(onFinish){
        var tryUpdate = function() {CAppUpdater.update(onFinish);};

        if (CLocalStorage.empty(CAppUpdater.cafAppObjects))
            CAppUpdater.localLoad(tryUpdate);
        else
            tryUpdate();

    },
    update: function(onFinish){
        var currentVersion = CLocalStorage.get(CAppHandler.appVersionKey) || -1;
        // Request Update.
        CNetwork.request(CAppUpdater.appUpdateURL,{version: currentVersion},
            function(data){
                // Updated (data===true means the versions matched and no update needed).
                if (!CUtils.isEmpty(data) && data !== true){
                    CAppUpdater.saveApp(data);
                    Caf.updated = true;
                }
                // Mark as checked.
                Caf.appUpdateChecked = true;
            }
        );
        if (onFinish) onFinish();
    },
    saveApp: function(data){
        data.objects =  data.objects    || [];
        data.designs =  data.designs    || {};
        data.data    =  data.data       || {};

        // Save to local storage.
        CLocalStorage.save(CAppHandler.appDataKey,data);

    },
    localLoad: function(onFinish){

    }

});

