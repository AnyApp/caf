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
        try {
            var startLoadObjects        = (new  Date()).getTime();

            var appData                 = CAppHandler.appData;
            CAppHandler.appData         = null; // Remove reference.

            appData.data                = appData.data || {};
            appData.data.app_settings   = appData.data.app_settings || {};

            // Load Theme if chosen.
            if (appData.data.app_settings['app_main_theme'] && !CUtils.isEmpty(appData.data.app_settings['app_main_theme']))
                CThemes.loadTheme(appData.data['app_main_theme']);
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

            // Load custom css,js and css,js links.
            CThreads.start(function(){ CAppHandler.loadJSLinks(     appData.jsLinks     || []) });
            CThreads.start(function(){ CAppHandler.loadCSSLinks(    appData.cssLinks    || []) });
            CThreads.start(function(){ CAppHandler.loadCustomCSS(   appData.cssCustom   || []) });
            CThreads.start(function(){ CAppHandler.loadCustomJS(    appData.jsCustom    || []) });
        }
        catch (e){
            CLog.error('CAppHandler.initialize error occured.');
            CLog.log(e);
        }
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
    },
    loadJSLinks: function(links){
        // Append default links.
        _.each(links, function(link){
            var resource = document.createElement('script');
            resource.setAttribute("type","text/javascript");
            resource.setAttribute("src", link);
            var head = document.head || document.getElementsByTagName("head")[0];
            head.appendChild(resource);
        });
    },
    loadCSSLinks: function(links){
        // Append default links.
        links.unshift('core/icons/flaticon.css');

        _.each(links, function(link){
            var resource = document.createElement('link');
            resource.setAttribute("rel", "stylesheet");
            resource.setAttribute("href",link);
            resource.setAttribute("type","text/css");
            var head = document.head || document.getElementsByTagName("head")[0];
            head.appendChild(resource);
        });
    },
    loadCustomCSS: function(cssArray){
        var cssStyle = new CStringBuilder();
        var cssStyleElement     = document.createElement('style');
        cssStyleElement.id      = 'app-custom-css-style';
        cssStyleElement.type    = 'text/css';
        _.each(cssArray, function(css){
            cssStyle.append(css);
        });
        // Append CSS string.
        cssStyleElement.innerHTML = cssStyle.build(' ');
        // Load css
        var head = document.head || document.getElementsByTagName("head")[0];
        head.appendChild(cssStyleElement);
    },
    loadCustomJS: function(jsArray){
        var jsCode = new CStringBuilder();
        _.each(jsArray, function(js){
            jsCode.append(js);
        });
        eval.call(window,jsCode.build(' '));
    },


});

