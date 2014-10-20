/**
 * Created by dvircn on 14/10/14.
 */
var CInitiator = {
    cafFilePrefix:          'caf-file-',
    coreCSSName:            'caf.min.css',
    coreJSName:             'caf.min.js',
    localCoreCSSPath:       'core/caf.min.css',
    localCoreJSPath:        'core/caf.min.js',
    localStorageCSSID:      'caf-ls-stylesheet',
    script:                 null,
    doneLoadScript:         false,
    initiate: function(){
        var cssData = CInitiator.getFromLocalStorage(CInitiator.coreCSSName);
        var jsData  = CInitiator.getFromLocalStorage(CInitiator.coreJSName);

        if (CInitiator.isEmpty(cssData)  || CInitiator.isEmpty(jsData))
            CInitiator.loadFromLocal();
        else
            CInitiator.loadFromStorage(cssData,jsData);
    },
    startCAF: function(){
        Caf.start();
    },
    loadFromStorage: function(cssData,jsData){
        // Prepare CSS Load
        var style                   = document.createElement('style');
        style.id                    = CInitiator.localStorageCSSID;
        style.type                  = "text/css";
        style.innerHTML             = cssData;

        // Load css
        var head         = document.head || document.getElementsByTagName("head")[0];
        head.appendChild(style);

        // Try load script.
        try {
            eval.call(window,jsData);
            CInitiator.handleLoad();
        }
        catch (e){
            // revert and load local.
            var stylesheet = document.getElementById(CInitiator.localStorageCSSID);
            stylesheet.innerHTML = '';
            CInitiator.doneLoadScript = false;
            CInitiator.loadFromLocal();
        }

    },
    loadFromLocal: function(){
        // Prepare JS Load
        CInitiator.script           = document.createElement('script');
        CInitiator.script.type      = "text/javascript";
        CInitiator.script.src       = CInitiator.localCoreJSPath;
        CInitiator.setScriptLoadCallback();
        // Prepare CSS Load
        var style                   = document.createElement('link');
        style.type                  = "text/css";
        style.rel                   = "stylesheet";
        style.href                  = CInitiator.localCoreCSSPath;

        // Load both
        var head         = document.head || document.getElementsByTagName("head")[0];
        head.appendChild(CInitiator.script);
        head.appendChild(style);
    },
    setScriptLoadCallback: function(){
        CInitiator.script.onload = CInitiator.handleLoad;
        CInitiator.script.onreadystatechange = CInitiator.handleReadyStateChange;
    },
    handleLoad: function () {
        if (!CInitiator.doneLoadScript) {
            CInitiator.doneLoadScript = true;
            CInitiator.startCAF();

        }
    },
    handleReadyStateChange: function () {
        var state;

        if (!CInitiator.doneLoadScript) {
            state = CInitiator.script.readyState;
            if (state === "complete") {
                CInitiator.handleLoad();
            }
        }
    },
    getFromLocalStorage: function(key){
        var value = window.localStorage.getItem(CInitiator.cafFilePrefix+key);
        if (value == null) return null;
        return CInitiator.JSONfnParse(value);
    },
    isStorageValueEmpty: function(key){
        return window.localStorage.getItem(key) == null;
    },
    JSONfnParse: function (str, date2obj) {

        var iso8061 = date2obj ? /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/ : false;

        return JSON.parse(str, function (key, value) {
            var prefix;

            if (typeof value != 'string') {
                return value;
            }
            if (value.length < 8) {
                return value;
            }

            prefix = value.substring(0, 8);

            if (iso8061 && value.match(iso8061)) {
                return new Date(value);
            }
            if (prefix === 'function') {
                return eval('(' + value + ')');
            }
            if (prefix === '_PxEgEr_') {
                return eval(value.slice(8));
            }

            return value;
        });
    },
    isEmpty: function(obj) {
        return obj === undefined || obj === null || obj === '' || obj.toString()==='';
    }

}

CInitiator.initiate();

