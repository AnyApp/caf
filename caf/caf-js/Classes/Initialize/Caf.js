/**
 * Created by dvircn on 06/08/14.
 */
var Caf = Class({
    $singleton: true,
    coreJSUpdateChecked: false,
    coreCSSUpdateChecked: false,
    appUpdateChecked: false,
    appUpdated: false,
    coreUpdated: false,
    updateCheckFinished: false,
    waitToLoadDialog: null,
    firstLoadKey: 'caf-first-load',
    firstLoad: false,
    start: function(){
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

    },
    startUpdate: function(){
        // Run parallel.
        CThreads.start(CAppUpdater.update);
        CThreads.start(CCoreUpdater.update);
        CThreads.run(Caf.updatedCheck,300);
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
            if (Caf.appUpdated) {
                CDialog.showDialog({
                    hideOnOutClick: false,
                    title: 'Update Ready',
                    textContent: 'In order to apply the changes, you need to restart the application.',
                    dialogColor: CColor('Blue',9),
                    cancelText: 'Later',
                    confirmText: 'Restart',
                    confirmCallback: function() { CAppHandler.resetApp(); },

                });
            }

        }

    },
    showWaitToLoad: function(){
        Caf.waitToLoadDialog = CDialog.showDialog({
            hideOnOutClick: false,
            title: 'Setting Up Some Things..',
            dialogColor: CColor('Blue',9)
        }, { minHeight: 'auto'});
    }

});

