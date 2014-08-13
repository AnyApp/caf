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
        toUrl: function(object,value){
            CClicker.addOnClick(object,function(){
                CUtils.openURL(value);
            });
        },
        toPage: function(object,value){
            CClicker.addOnClick(object,function(){
                CPager.moveToPage(value);
            });
        },
        toTab: function(object,value){
            CSwiper.addButtonToTabSwiper(object,value);
        },
        sideMenuSwitch: function(object,value){
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
            object.doStopPropagation = true;
        },
        backButton: function(object,value){
            CPager.setBackButton(object.uid());
        },
        mainPage: function(object,value){
            CPager.setMainPage(value);
        },
        sideMenu: function(object,value){
            CSwiper.initSideMenu(object.uid(),value.position);
        },
        swipeView: function(object,value){
            CSwiper.initSwiper(object.uid(),value.options,value.pagination);
        },
        dropMenuSwitch: function(object,value){
            CClicker.addOnClick(object,function(){
                CUtils.hideOrShow(value,'fadein300','fadeout300',300);
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
            //if (CUtils.isEmpty(value))  return;
            // Apply Logic.
            this.logics[attribute](object,value);
        },this);
        // Save last logic build.
        object.saveLastLogic();
    }


});


