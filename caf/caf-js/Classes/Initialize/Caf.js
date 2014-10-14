/**
 * Created by dvircn on 06/08/14.
 */
var Caf = Class({
    $singleton: true,
    updated: false,
    coreUpdateChecked: false,
    appUpdateChecked: false,
    updateAsked: false,
    start: function(){
        CAppHandler.initialize(Caf.startUpdate);
    },
    startUpdate: function(){
        // Run parallel.
        CThreads.start(CAppUpdater.update);
        CThreads.start(CCoreUpdater.update);
        CThreads.run(Caf.updatedCheck,300);
    },
    updatedCheck: function(){
        if (Caf.coreUpdateChecked && Caf.appUpdateChecked && Caf.updated && !Caf.updateAsked)
            Caf.askToUpdate();
        else
            CThreads.run(Caf.updatedCheck,100);
    },
    askToUpdate: function(){
        Caf.updateAsked = true;

        CDialog.showDialog({
            hideOnOutClick: false,
            title: 'Update Ready',
            textContent: 'In order to apply the update, please reset the application.',
            dialogColor: CColor('Brown',5),
            confirmText: 'Update',
            cancelText: 'Later',
            confirmCallback: function(){
                CAppHandler.resetApp();
            }
        });
    }

});

