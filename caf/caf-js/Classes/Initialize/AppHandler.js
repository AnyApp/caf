/**
 * Created by dvircn on 06/08/14.
 */
var CAppHandler = Class({
    $singleton:         true,
    appDataKey:         'application-data',
    appVersionKey:      'app-version',
    appData:            {},
    localDataPath:      'core/data.dcaf',
    failedLoadDCAF:     false,
    start: function(callback){
        callback = callback || function(){};
        CAppHandler.loadAppObjects(function(){
            CAppHandler.initialize(callback);
        });
    },
    initialize: function(callback){
        // Load objects failure.
//        if (CAppHandler.failedLoadDCAF === true) {
//            CThreads.start(callback);
//            return;
//        }

        var startLoadObjects = (new  Date()).getTime();

        var appData = CAppHandler.appData;
        CAppHandler.appData = null; // Remove reference.

        appData.data = appData.data || {};

        // Load Theme if chosen.
        if (appData.data['app-main-theme'] && !CUtils.isEmpty(appData.data['app-main-theme']))
            CThemes.loadTheme(appData.data['app-main-theme']);
        // Set named designs and globals.
        CDesignHandler.addDesigns(appData.designs || {});
        CGlobals.setGlobals(appData.data || {});

        // Check if objects empty. If so, create app-container so the build won't fail.
        if (CUtils.isEmpty(appData.objects) || _.keys(appData.objects).length===0 /*Empty object*/){
            appData.objects = [{type: "AppContainer", uname: "app-container"}];
        }

        // Load Objects.
        CObjectsHandler.loadObjects(appData.objects || []);
        var endLoadObjects  = (new  Date()).getTime();

        var startBuildAll = (new  Date()).getTime();

        CBuilder.buildAll();
        var endBuildAll = (new  Date()).getTime();
        CLog.dlog('Load Objects Time     : '+(endLoadObjects-startLoadObjects)+' Milliseconds.');
        CLog.dlog('Build Time            : '+(endBuildAll-startBuildAll)+' Milliseconds.');
        CLog.dlog('Total Initialize Time : '+(endBuildAll-startLoadObjects)+' Milliseconds.');

        CPager.initialize();

        // After finished, we can run the callback.
        CThreads.start(callback);
    },
    resetApp: function() {
        window.location.hash = '';
        window.location.reload();
    },
    loadAppObjects: function(callback){
        var data = CLocalStorage.get(CAppHandler.appDataKey) || null;
        if (!CUtils.isEmpty(data)){
            CAppHandler.appData = data;
            callback();
        }
        else {
            // Load the local file.
            CNetwork.request(CAppHandler.localDataPath,{},function(content){
                if (!CUtils.isEmpty(content)){
                    CLocalStorage.save(CAppHandler.appDataKey,JSONfn.parse(content));
                    // Re-Parse the data. In case that the data hasn't parsed functions.
                    CAppHandler.appData = JSONfn.parse(content);
                }
                callback();
            },function() {
                CAppHandler.failedLoadDCAF = true;
                CLog.error('Failed to load local objects, waiting for remote load.');
                callback();
            });
        }
    }

});

