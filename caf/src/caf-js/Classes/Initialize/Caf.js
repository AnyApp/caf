/**
 * Created by dvircn on 06/08/14.
 */
var Caf = Class({
    $singleton: true,
    coreJSUpdateChecked: false,
    coreCSSUpdateChecked: false,
    appUpdateChecked: false,
    appUpdated: false,
    appUpdateStarted: false,
    coreUpdated: false,
    updateCheckFinished: false,
    waitToLoadDialog: null,
    firstLoadKey: 'caf-first-load',
    firstLoad: false,
    start: function(){

        var isApp = document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1;

        // Phonegap on ready.
        if (isApp === true)
            document.addEventListener('deviceready', Caf.onDeviceReady, false);
        else
            Caf.actualStart();

    },
    actualStart : function() {
        // Check for update start in 5 seconds - make sure the app will get updated in any case.
        /*
        CThreads.run(Caf.updateStartCheck,5000);


        Caf.firstLoad = CLocalStorage.get(Caf.firstLoadKey);

        if (CUtils.isEmpty(Caf.firstLoad))
            Caf.firstLoad = true;
        */

        // Start.
        CAppHandler.start();
        /*CAppHandler.start(function(){
            if (Caf.firstLoad) {
                Caf.showWaitToLoad();
                CThreads.run(Caf.startUpdate,3000); // Let the app begin.
            }
            else
                CThreads.run(Caf.startUpdate,3000); // Let the app begin.
        });*/
    },
    onDeviceReady : function(){
        Caf.actualStart();

        if (navigator && navigator.splashscreen){
            var splashHideDelay = 0;
            if (CAppHandler.appData && CAppHandler.appData.data && CAppHandler.appData.data.splashHideDelay)
                splashHideDelay = CAppHandler.appData.data.splashHideDelay;
            CThreads.run(function(){ navigator.splashscreen.hide(); },splashHideDelay);
        }

        // prevent ghost real clicks on body
        document.body.addEventListener('click', CClicker.preventGhostClick, true);
        if (CPlatforms.isIOS() && window.StatusBar !== undefined && window.StatusBar.overlaysWebView !== undefined)
            window.StatusBar.overlaysWebView(false);
    },
    startUpdate: function(){
        if (Caf.appUpdateStarted === true) // Update check already performed.
            return;
        Caf.appUpdateStarted = true; // Mark as started.

        // Run parallel.
        CThreads.start(CAppUpdater.update);
        CThreads.start(CCoreUpdater.update);
        CThreads.run(Caf.updatedCheck,300);
    },
    updateStartCheck: function(){
        if (Caf.appUpdateStarted === false)
            Caf.startUpdate();
    },
    updatedCheck: function(){
        if (Caf.coreCSSUpdateChecked && Caf.coreJSUpdateChecked
            && Caf.appUpdateChecked && !Caf.updateCheckFinished)
            Caf.hideWaitToLoad();
        else
            CThreads.run(Caf.updatedCheck,100);
    },
    hideWaitToLoad: function(){
        Caf.updateCheckFinished = true;
        if (Caf.firstLoad) {
            CLocalStorage.save(Caf.firstLoadKey,false);
            if (Caf.appUpdated || Caf.coreUpdated)
                CAppHandler.resetApp();
            else
                CObjectsHandler.object(Caf.waitToLoadDialog).hide();
        }
        else {
            if (Caf.appUpdated/* || Caf.coreUpdated*/ /*Notify only when app is updated.*/) {
                CDialog.showDialog({
                    hideOnOutClick: false,
                    title: 'עדכון מוכן',
                    textContent: 'כדי להחיל את השינויים, אנא הפעל את האפליקציה מחדש.',
                    dialogColor: CColor('TealE',8),
                    cancelText: 'מאוחר יותר',
                    confirmText: 'הפעל מחדש',
                    confirmCallback: function() { CAppHandler.resetApp(); }
                });
            }

        }

    },
    showWaitToLoad: function(){
        Caf.waitToLoadDialog = CDialog.showDialog({
            hideOnOutClick: false,
            title: 'מכין מספר דברים...',
            dialogColor: CColor('TealE',8)
        }, { direction:'rtl',minHeight: 'auto'});
    }


});

