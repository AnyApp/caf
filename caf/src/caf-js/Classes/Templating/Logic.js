/**
 * Created by dvircn on 06/08/14.
 */
var CLogic = Class({
    $singleton: true,
    logics: {
        onCreate: function(object,value){
            if (!CUtils.isEmpty(value))
                value(object);
        },
        onCreateAsync: function(object,value){
            if (!CUtils.isEmpty(value))
                CThreads.start(function(){
                    value(object);
                });
        },
        onClick: function(object,value){
            CClicker.addOnClick(object,value);
        },
        onClicks: function(object,value){
            if (CUtils.isEmpty(value))
                return;
            _.each(value,function(onClick){
                CClicker.addOnClick(object,onClick);
            });
        },
        onTemplateElementClick: function(object,value){
            CClicker.addOnClick(object,value);
        },
        openFacebookPageOrProfile: function(object,value){
            if (CUtils.isEmpty(value))
                return;
            CClicker.addOnClick(object,function(){
                var url = CData.value(value);
                CAppAvailability.hasFacebook(
                    function(){
                        CUtils.openURL('fb://profile/' + url, "_system");
                    },
                    function(){
                        CUtils.openURL('http://facebook.com/' + url +'', "_system");
                    }
                )
            });

        },
        phoneCall: function(object,value){
            if (CUtils.isEmpty(value))
                return;
            CClicker.addOnClick(object,function(){
                window.location = 'tel:'+CData.value(value);
            });
        },
        openNavigationApp: function(object,value){
            if (CUtils.isEmpty(value))
                return;
            CClicker.addOnClick(object,function(){
                var location = CData.value(value);
                if (CPlatforms.isIOS())
                    CUtils.openURL("maps:q=" + location, "_system");
                else if (CPlatforms.isAndroid())
                    CUtils.openURL("geo:0,0?q=" + location, "_system");
                else
                    CUtils.openURL("http://maps.google.com/?q=" + location, "_system");
            });
        },
        openMail: function(object,value){
            if (CUtils.isEmpty(value))
                return;
            CClicker.addOnClick(object,function(){
                CMail.open(CData.value(value));
            });
        },
        scan: function(object,value){
            if (CUtils.isEmpty(value))
                return;
            CClicker.addOnClick(object,function(){
                CBarcodeScanner.scan(value.onSuccess || null,value.onFailure || null);
            });
        },
        link: function(object,value){
            if (CUtils.isEmpty(value) || CUtils.isEmpty(value.path))
                return;
            value.path = value.path+''; // Cast to string.

            CClicker.addOnClick(object,function(){
                var linkValue = CData.value(value,true);
                if ((!CUtils.isURLLocal(linkValue.path))) // HTTP url
                    CUtils.openURL(linkValue.path);
                else { // Local URL
                    if (linkValue.path === '/') // Main Page link.
                        linkValue.path = '';
                    linkValue.data = linkValue.data || {};
                    linkValue.globalData = linkValue.globalData || {};
                    var finalData = CUtils.clone(linkValue.data);
                    // Evaluate dynamic global data.
                    _.each(linkValue.globalData,function(globalName,key){
                        finalData[key] = CGlobals.get(globalName) || '';
                    });
                    CUtils.openLocalURL(linkValue.path+CPager.mapDataToPath(finalData));
                }
            });

        },
        share: function(object,value){
            // Retreive share data.
            CClicker.addOnClick(object,function(){
                CSharer.share(value || {});
            });
        },
        backgroundSMS: function(object,value){
            // Retreive share data.
            CClicker.addOnClick(object,function(){
                var phones  = value.phones  || [];
                var msg     = value.msg     || '';
                CSMS.sendBackgroundSMS(phones,msg);
            });
        },
        showDialog: function(object,value){
            CClicker.addOnClick(object,function(){
                CDialog.showDialog(value.data || {},value.design || {});
            });
        },
        request: function(object,value){
            CClicker.addOnClick(object,function(){
                CNetwork.request(value.url || '',value.data || {},value.callback || function(){});
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
            CUtils.element(object.uid()).innerHTML += value;
        },
        html: function(object,value){
            CUtils.element(object.uid()).innerHTML += value;
        },
        icon: function(object,value){
            var size    = CUtils.isEmpty(value.size)? '': ' iconSize'+value.size;
            var align   = CUtils.isEmpty(value.align)?'': ' iconAlign'+value.align;
            var color   = CUtils.isEmpty(value.color)?'': ' '+CDesigner.designs.color(value.color);
            var classes = CUtils.isEmpty(value.design)?'':
                ' '+CDesigner.designToClasses(value.design);
            var inline  = CUtils.isEmpty(value.design)?'': value.design.inline || '';
//            var align   = CUtils.isEmpty(value.align)?'': ' ml'+value.marginLeft;
//            var align   = CUtils.isEmpty(value.align)?'': ' mr'+value.marginRight;
            var iconElmText = '<i class="icon-'+value.name+size+align+color+classes+'" style="'+inline+'"></i>';

            var elm = CUtils.element(object.uid());
            elm.innerHTML = iconElmText+elm.innerHTML;
        },
        iconLeft: function(object,value){
            value.align = 'left';
            CLogic.logics.icon(object,value);
        },
        iconRight: function(object,value){
            value.align = 'right';
            CLogic.logics.icon(object,value);
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
        sideMenu: function(object,value){
            CSwiper.initSideMenu(value.positions,value.width || 266);
        },
        swipeView: function(object,value){
            //CThreads.start(function(){
                CSwiper.initSwiper(value);
            //});
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
        inputOnFileSelect: function(object,value){
            var element = CUtils.element(object.uid());
            element.addEventListener('change', value, false);
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
        template: function(object,value){
            if (value ===true)
                CTemplator.applyDynamic(object);
        },
        buttonReloadDynamic:  function(object,value){
            CClicker.addOnClick(object,function(){
                CTemplator.load(value.object,value.queryData || {},value.onFinish || function(){},value.reset || false);
            });
        },
        page: function(object,value){
            //CTemplator.applyDynamic(object,value);
            if (value===true)
                CPager.addPage(object);
        },
        pullToRefresh: function(object,value){
            if (value === true)
                CPullToRefresh.applyPullToRefresh(object);
        },
        scrollable: function(object,value){
            if (value!==true)
                return;
            // Old android only
            if (!CScrolling.isNativeScrolling())
                object.scroller = $('#'+object.uid()).niceScroll({});
        },
        // Lazy get children - support template that reload and replace children.
        onShowAnimateChildren: function(object,value){
            // Register on prepare show
            CEvents.register(CEvents.events.prepareReshow,object.uid(),function(event){
                _.each(object.getChilds(),function(objectId){
                    CAnimations.quickHide(objectId);
                });
            });

            // Register on show
            CEvents.register(CEvents.events.reshow,object.uid(),function(event){
                CThreads.start(function(){
                    CAnimations.cascadeAnimate(object.getChilds(),value.intervals,value.animations,value.start);
                });
            });
        },
        onShowAnimation: function(object,value){
            // If value.objects is empty then animate this object.
            if (CUtils.isEmpty(value.objects))
                value.objects = [object.uid()];

            // Register on prepare show
            CEvents.register(CEvents.events.prepareReshow,object.uid(),function(event){
                _.each(value.objects,function(objectId){
                    CAnimations.quickHide(objectId);
                });
            });

            // Register on show
            CEvents.register(CEvents.events.reshow,object.uid(),function(event){
                CThreads.start(function(){
                    CAnimations.cascadeAnimate(value.objects,value.intervals,value.animations,value.start);
                });
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
            if (CUtils.isEmpty(this.logics[attribute])){
                CLog.error('Logic does not exist: "'+attribute+'".');
                return;
            }
            // Apply Logic.
            this.logics[attribute](object,value);
        },this);
        // Save last logic build.
        object.saveLastLogic();
    }


});


