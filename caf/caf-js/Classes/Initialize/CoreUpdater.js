/**
 * Created by dvircn on 12/10/14.
 */
var CCoreUpdater = Class({
    $singleton:             true,
    cafFilePrefix:          'caf-file-',
    coreCSSName:            'core-css',
    coreJSName:             'core-js',
    coreCSSPath:            'http://',
    coreJSPath:             'http://',


    update: function(){
        CCoreUpdater.updateJS();
    },
    updateJS: function(){
        CCoreUpdater.updateFile(CCoreUpdater.coreJSPath,CCoreUpdater.coreJSName,
            function() {CCoreUpdater.updateCSS();});
    },
    updateCSS: function(){
        CCoreUpdater.updateFile(CCoreUpdater.coreCSSPath,CCoreUpdater.coreCSSName,
            function(){
                // Marked as checked.
                Caf.coreUpdateChecked = true;
            });
    },
    updateFile: function(path,name,callback){
        callback            = callback || function(){};
        var currentFileData = CLocalStorage.get(CCoreUpdater.cafFilePrefix+name);
        var hashObj         = new jsSHA(currentFileData, "TEXT");
        var hash            = hashObj.getHash("SHA-512", "HEX");
        CCoreUpdater.requestUpdateFile(path,name,hash,callback);

    },
    requestUpdateFile: function(path,name,hash,callback) {
        CNetwork.request(path,{name:name,hash:hash},function(content){
            // Updated (data===true means the versions matched and no update needed).
            if (!CUtils.isEmpty(content) && content !== true){
                CLocalStorage.save(CCoreUpdater.cafFilePrefix+name,content);
                Caf.updated = true;
            }
            callback();
        });
    }


});

