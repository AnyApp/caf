/**
 * Created by dvircn on 12/10/14.
 */
var CCoreUpdater = Class({
    $singleton:             true,
    upToDateSign:           'File up to date',
    cafFilePrefix:          'caf-file-',
    coreCSSName:            'caf.min.css',
    coreJSName:             'caf.min.js',
    coreCSSPath:            'https://codletech-builder.herokuapp.com/getGlobalFile',
    coreJSPath:             'https://codletech-builder.herokuapp.com/getGlobalFile',


    update: function(){
        CThreads.start(CCoreUpdater.updateJS);
        CThreads.start(CCoreUpdater.updateCSS);
    },
    updateJS: function(){
        CCoreUpdater.updateFile(CCoreUpdater.coreJSPath,CCoreUpdater.coreJSName,
            function() {
                // Marked as checked.
                Caf.coreJSUpdateChecked = true;
            });
    },
    updateCSS: function(){
        CCoreUpdater.updateFile(CCoreUpdater.coreCSSPath,CCoreUpdater.coreCSSName,
            function(){
                // Marked as checked.
                Caf.coreCSSUpdateChecked = true;
            });
    },
    updateFile: function(path,name,callback){
        callback            = callback || function(){};
        var currentFileData = CLocalStorage.get(CCoreUpdater.cafFilePrefix+name);
        if (currentFileData == null || currentFileData == undefined)
            currentFileData = '';
        var shaObj         = new jsSHA(currentFileData, "TEXT");
        var sha            = shaObj.getHash("SHA-512", "HEX");
        CCoreUpdater.requestUpdateFile(path,name,sha,callback);

    },
    requestUpdateFile: function(path,name,sha,callback) {
        CNetwork.request(path,{fileName:name,fileSha:sha},function(content){
            if (CUtils.isEmpty(content)){
                callback();
                return;
            }
            var dontNeedUpdate = content.status === 1 || content.status === -1;
            // Updated (data===true means the versions matched and no update needed).
            if (!dontNeedUpdate){
                try {
                    CLocalStorage.save(CCoreUpdater.cafFilePrefix+name,content);
                    Caf.coreUpdated = true;
                }
                catch (e) {
                    CLog.error('Error at:'+name);
                    CLog.error(e);
                }
                CLog.dlog('Update Needed:\t\t'+name);
            }
            else{
                CLog.dlog('Don\'t Need Update:\t'+name);
            }
            callback();
        },callback);
    },
    clearAll: function(){
        CLocalStorage.save(CCoreUpdater.cafFilePrefix+CCoreUpdater.coreCSSName,'');
        CLocalStorage.save(CCoreUpdater.cafFilePrefix+CCoreUpdater.coreJSName,'');
    }


});

