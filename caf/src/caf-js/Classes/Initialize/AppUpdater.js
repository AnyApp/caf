/**
 * Created by dvircn on 06/08/14.
 */
var CAppUpdater = Class({
    $singleton: true,
    appUpdateURL: 'http://codletech-builder.herokuapp.com/getAppData',
    update: function(onFinish){
        var currentVersion = CLocalStorage.get(CAppHandler.appVersionKey) || -1;
        var appID = CSettings.get('appID') || '';
        if (CUtils.isEmpty(appID)) { // Mark as checked.
            Caf.appUpdateChecked = true;
            if (onFinish) onFinish();
            return;
        }
        // Request Update.
        CNetwork.request(CAppUpdater.appUpdateURL,
            {appID: appID,version: currentVersion},
            function(data){
                // Updated (data===true means the versions matched and no update needed).
                var dontNeedUpdate = !CUtils.isEmpty(data) && !CUtils.isEmpty(data.status);
                if (!CUtils.isEmpty(data) && !CUtils.isEmpty(data.objects) && !dontNeedUpdate ){
                    CLog.dlog('App Updated');
                    CAppUpdater.saveApp(data);
                    CLocalStorage.save(CAppHandler.appVersionKey,data.version);
                    Caf.appUpdated = true;
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
        if (!CUtils.isEmpty(data.objects))
            CLocalStorage.save(CAppHandler.appDataKey,data);

    },
    clearAppData: function(data){
        CLocalStorage.save(CAppHandler.appDataKey,'');
    }

});

