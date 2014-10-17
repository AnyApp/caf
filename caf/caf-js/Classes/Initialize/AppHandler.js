/**
 * Created by dvircn on 06/08/14.
 */
var CAppHandler = Class({
    $singleton:         true,
    appDataKey:         'application-data',
    appVersionKey:      'app-version',
    appData:            {},
    localDataPath:      'core/data.dcaf',
    start: function(callback){
        CAppHandler.loadAppObjects(function(){
            CAppHandler.initialize(callback);
        });
    },
    initialize: function(callback){
        var startLoadObjects = (new  Date()).getTime();

        var appData = CAppHandler.appData;
        CAppHandler.appData = null; // Remove reference.

        // After finished getting the data, we can run the callback.
        CThreads.start(callback);

        // Set named designs and globals.
        CDesignHandler.addDesigns(appData.designs || {});
        CGlobals.setGlobals(appData.data || {});

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
    },
    loadAppObjects: function(callback){
        var data = CLocalStorage.get(CAppHandler.appDataKey) || null;
        if (!CUtils.isEmpty(data)){
            CAppHandler.appData = data;
            callback();
        }
        else {
            // Load the local file.
            CNetwork.request(CAppHandler.localDataPath,function(content){
                if (!CUtils.isEmpty(content)){
                    CLocalStorage.save(CAppHandler.appDataKey,content);
                    CAppHandler.appData = JSONfn.parse(content);
                }
                callback();
            });
        }
    }

});

