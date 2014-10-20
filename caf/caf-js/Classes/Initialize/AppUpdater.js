/**
 * Created by dvircn on 06/08/14.
 */
var CAppUpdater = Class({
    $singleton: true,
    appUpdateURL: 'http://codletech-builder.herokuapp.com/getAppData',
    update: function(onFinish){
        var currentVersion = CLocalStorage.get(CAppHandler.appVersionKey) || -1;
        // Request Update.
        CNetwork.request(CAppUpdater.appUpdateURL,
            {appID: CSettings.get('appID'),version: currentVersion},
            function(data){
                // Updated (data===true means the versions matched and no update needed).
                var dontNeedUpdate = !CUtils.isEmpty(data) && !CUtils.isEmpty(data.status);
                if (!CUtils.isEmpty(data) && !dontNeedUpdate ){
                    CLog.dlog('App Updated');
                    CAppUpdater.saveApp(data);
                    CLocalStorage.save(CAppHandler.appVersionKey,data.version);
                    Caf.updated = true;
                }
                // Mark as checked.
                Caf.appUpdateChecked = true;
            },
            function(e){ // Failed
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

    }

});

