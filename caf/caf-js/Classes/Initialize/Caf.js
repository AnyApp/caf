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
        // Check for update start in 5 seconds - make sure the app will get updated in any case.
        CThreads.run(Caf.updateStartCheck,5000);

        Caf.firstLoad = CLocalStorage.get(Caf.firstLoadKey);
        if (CUtils.isEmpty(Caf.firstLoad))
            Caf.firstLoad = true;

        CAppHandler.start(function(){
            if (Caf.firstLoad) {
                Caf.showWaitToLoad();
                Caf.startUpdate();
            }
            else
                Caf.startUpdate();
        });

        // Phonegap on ready.
        document.addEventListener('deviceready', Caf.onDeviceReady, false);

    },
    onDeviceReady : function() {
        if (navigator && navigator.splashscreen)
            navigator.splashscreen.hide();
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
            if (Caf.appUpdated || Caf.coreUpdated) {
                CDialog.showDialog({
                    hideOnOutClick: false,
                    title: 'עדכון מוכן',
                    textContent: 'כדי להחיל את השינויים, אנא הפעל את האפליקציה מחדש.',
                    dialogColor: CColor('TealE',8),
                    cancelText: 'מאוחר יותר',
                    confirmText: 'הפעל מחדש',
                    confirmCallback: function() { CAppHandler.resetApp(); },

                });
            }

        }

    },
    showWaitToLoad: function(){
        Caf.waitToLoadDialog = CDialog.showDialog({
            hideOnOutClick: false,
            title: 'מכין מספר דברים...',
            dialogColor: CColor('TealE',8)
        }, { minHeight: 'auto'});
    }

});

