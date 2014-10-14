/**
 * Created by dvircn on 06/08/14.
 */
var CAppHandler = Class({
    $singleton: true,
    appDataKey: 'application-data',
    appVersionKey: 'app-version',
    initialize: function(callback){
        var startLoadObjects = (new  Date()).getTime();

        var appData = CLocalStorage.get(CAppHandler.appDataKey) || {};

        // After finished getting the data, we can run the callback.
        CThreads.start(callback);

        // Set named designs and globals.
        CDesignHandler.addDesigns(appData.designs || {});
        CGlobals.setGlobals(appData.globals || {});

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
    },
    resetApp: function() {
        window.location.hash = '';
        window.location.reload();
    }

});

