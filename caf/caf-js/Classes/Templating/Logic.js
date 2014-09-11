/**
 * Created by dvircn on 06/08/14.
 */
var CLogic = Class({
    $singleton: true,
    logics: {
        onClick: function(object,value){
            CClicker.addOnClick(object,value);
        },
        toUrl: function(object,value){
            CClicker.addOnClick(object,function(){
                CUtils.openURL(value);
            });
        },
        toPage: function(object,value){
            CClicker.addOnClick(object,function(){
                CPager.moveToPage(object.getLink());
            });
        },
        link: function(object,value){
            if (!object.isLinkLocal() && !CPlatforms.isWeb()){
                CClicker.addOnClick(object,function(){
                    CUtils.openURL(value);
                });
            }
            CClicker.addOnClick(object,null);

        },
        toTab: function(object,value){
            CSwiper.addButtonToTabSwiper(object,value);
        },
        showDialog: function(object,value){
            CClicker.addOnClick(object,function(){
                CDialog.showDialog(value.data || {},value.design || {});
            });
        },
        sideMenuSwitch: function(object,value){
            object.logic.doStopPropagation = true;
            CClicker.addOnClick(object,function(){
                CSwiper.openOrCloseSideMenu(value);
            });
        },
        swipePrev: function(object,value){
            CClicker.addOnClick(object,function(){
                CSwiper.previous(value);
            });
        },
        swipeNext: function(object,value){
            CClicker.addOnClick(object,function(){
                CSwiper.next(value);
            });
        },
        text: function(object,value){
            CUtils.element(object.uid()).innerHTML = value;
        },
        doStopPropagation: function(object,value){
            if (value==false)
                return;
            object.logic.doStopPropagation = true;
        },
        backButton: function(object,value){
            if (value !== true)
                return;
            CPager.setBackButton(object.uid());
            CClicker.addOnClick(object,function(){
                CPager.moveBack();
            });
        },
        mainPage: function(object,value){
            CPager.setMainPage(value);
        },
        sideMenu: function(object,value){
            CSwiper.initSideMenu(value.positions);
        },
        swipeView: function(object,value){
            CThreads.start(function(){
                CSwiper.initSwiper(value);
            });
        },
        tabberButtons: function(object,value){
            _.each(value,function(buttonId){
                CSwiper.addButtonToTabSwiper(buttonId,object.uid());
            });
        },
        dialogSwitch: function(object,value){
            CClicker.addOnClick(object,function(){
                CObjectsHandler.object(value).switchDialog();
            });
        },
        formSubmitButton: function(object,value){
            CClicker.addOnClick(object,function(){
                var form = CObjectsHandler.object(value);
                form.submitForm();
            });
        },
        formSendToUrlButton: function(object,value){
            CClicker.addOnClick(object,function(){
                var form = CObjectsHandler.object(value);
                form.sendFormToUrl();
            });
        },
        formSaveToLocalStorageButton: function(object,value){
            CClicker.addOnClick(object,function(){
                var form = CObjectsHandler.object(value);
                form.saveFormToLocalStorage();
            });
        },
        formClearButton: function(object,value){
            CClicker.addOnClick(object,function(){
                var form = CObjectsHandler.object(value);
                form.clearForm();
            });
        },
        loadInputFromStorage: function(object,value){
            if (value===true){
                CThreads.start(function() {
                    var inputStoredValue = CLocalStorage.get(object.getName());
                    if (!CUtils.isEmpty(inputStoredValue))
                        object.setValue(inputStoredValue);
                });
            }
        },
        init: function(object,value){
            value();
        },
        dynamic: function(object,value){
            CDynamics.applyDynamic(object,value);
        },
        buttonReloadDynamic:  function(object,value){
            CClicker.addOnClick(object,function(){
                CDynamics.load(value.object,value.queryData || {},value.onFinish || function(){},value.reset || false);
            });
        },
        page: function(object,value){
            //CDynamics.applyDynamic(object,value);
            if (value===true)
                CPager.addPage(object);
        }

    },
    applyLogic: function(object){
        var logic = object.getLogic();
        var lastLogic = object.getLastLogic();
        // Check if need to apply logic.
        if (CUtils.equals(logic,lastLogic))
            return; // Logic hasn't changed from the last build.

        // Run each function.
        _.each(logic,function(value,attribute){
            // Apply only if the logic have changed / never applied before.
            if (CUtils.equals(logic[attribute],lastLogic[attribute]))
                return;
            // Apply Logic.
            this.logics[attribute](object,value);
        },this);
        // Save last logic build.
        object.saveLastLogic();
    }


});


