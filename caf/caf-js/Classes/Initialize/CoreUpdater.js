/**
 * Created by dvircn on 12/10/14.
 */
var CCoreUpdater = Class({
    $singleton:             true,
    cafFilePrefix:          'caf-file-',
    coreCSSName:            'core-css',
    coreJSName:             'core-js',
    coreCSSPath:            'http:///caf/css/caf-all.css',
    coreJSPath:             'http:///caf/js/caf.min.js',
    localCoreCSSPath:       '/caf/css/caf-all.css',
    localCoreJSPath:        '/caf/js/caf.min.js',

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
    updateFile: function(root,name,callback){
        callback = callback || function(){};
        CNetwork.request(root,{file:name},function(content){
            // Updated (data===true means the versions matched and no update needed).
            if (!CUtils.isEmpty(content) && content !== true){
                CLocalStorage.save(CCoreUpdater.cafFilePrefix+name,content);
                Caf.updated = true;
            }
            callback();
        });
    },
    getFile: function(name){

    },
    localLoad: function(callback){
        if (CCoreUpdater.neverLoaded())
            CCoreUpdater.localLoadJS(callback);
        else
            callback();
    },
    localLoadJS: function(callback){
        CCoreUpdater.updateFile(CCoreUpdater.localCoreJSPath,'core-js',
            function() {CCoreUpdater.localLoadCSS(callback);});
    },
    localLoadCSS: function(callback){
        CCoreUpdater.updateFile(CCoreUpdater.localCoreCSSPath,'core-css',callback);
    },
    neverLoaded: function(){
        var jsNotLoaded  = CLocalStorage.empty(CCoreUpdater.cafFilePrefix+CCoreUpdater.coreJSName);
        var cssNotLoaded = CLocalStorage.empty(CCoreUpdater.cafFilePrefix+CCoreUpdater.coreCSSName);
        if (jsNotLoaded || cssNotLoaded)
            return true;
        return false;
    }


});

