/**
 * Created by dvircn on 06/08/14.
 */
var Caf = Class({
    constructor: function() {
    },
    init: function(objects){
        var startLoadObjects = (new  Date()).getTime();
        CObjectsHandler.loadObjects(objects);
        var endLoadObjects  = (new  Date()).getTime();

        var startBuildAll = (new  Date()).getTime();

        CTemplator.buildAll();
        var endBuildAll = (new  Date()).getTime();
        CLog.dlog('Load Objects Time     : '+(endLoadObjects-startLoadObjects)+' Milliseconds.');
        CLog.dlog('Build Time            : '+(endBuildAll-startBuildAll)+' Milliseconds.');
        CLog.dlog('Total Initialize Time : '+(endBuildAll-startLoadObjects)+' Milliseconds.');

        CPager.initialize();
    }

});

