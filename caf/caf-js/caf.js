/**
 * CAF - Codletech Application Framework.
 * Dependencies:
 * - overthrow.js
 */
var caf = {}
caf.path = '';

caf.init = function(path)
{
    caf.path = path;
    caf.ui.attributes.initAttributes();
    caf.ui.forms.init();
}

caf.log = function(msg)
{
    window.console.log(msg);
}




/**
 * Useful Platform related helper functions.
 */
caf.platforms =
{
    /**
     * Return whether or not the device platform is ios.
     * @returns {boolean}
     */
    isIOS: function()
    {
        return navigator.userAgent.match(/(iPad|iPhone|iPod)/g);
    },
    /**
     * Return whether or not the device platform is android.
     * @returns {boolean}
     */
    isAndroid: function()
    {
        if (caf.utils.isEmpty(device))      return false;
        return device.platform.toLowerCase() == 'android';
    },
    /**
     * Return the android series.
     * Examples: 4.4 => 4, 4.1 => 4, 2.3.3 => 2, 2.2 => 2, 3.2 => 3
     * @returns {number}
     */
    androidSeries: function()
    {
        if (!this.isAndroid()) return 0;

        var deviceOSVersion = device.version;  //fetch the device OS version
        return Number(deviceOSVersion.substring(0,deviceOSVersion.indexOf(".")));
    }
}


/**
 * caf ui.
 */
caf.ui = {
    updateKey:0,
    views: {},
    // Save the last click time in order to prevent burst of clicks.
    lastClick:(new Date()).getTime(),
    addView: function(view)
    {
        this.views[view.id] = view;
    },
    getView: function(id)
    {
        return this.views[id];
    },
    removeView: function(view){
        delete this.views[view.id];
    },
    /**
     * Rebuild all cached views.
     */
    refresh: function()
    {
        for (var iView in this.views)
        {
            this.views[iView].refresh();
        }
    },
    /**
     * Prevent burst of clicks.
    */
    canClick: function()
    {
        var currentTime = (new Date()).getTime();
        if (currentTime-this.lastClick>400)
        {
            this.lastClick = currentTime;
            return true;
        }
        return false;
    },
    /**
     * Check that the element has caf attributes.
     * Add to the view all the caf capabilities.
     * @param view
     * @returns {boolean}
     */
    buildView: function(view)
    {
        var isCAF= (!caf.utils.isEmpty(view.mText))||
            (!caf.utils.isEmpty(view.mClass))||
            (!caf.utils.isEmpty(view.mIconName))||
            (!caf.utils.isEmpty(view.mActiveClass))||
            (!caf.utils.isEmpty(view.mIconName))||
            (!caf.utils.isEmpty(view.mOnClickFunctions));
        if (!isCAF)
        {
            return false;
        }

        //Set Text
        if (!caf.utils.isEmpty(view.mText))
        {
            view.mElement.innerHTML = view.mText;
        }

        // Set Class.
        caf.utils.addClass(view.mElement,view.mClass);

        if (!caf.utils.isEmpty(view.mIconName))
        {
            var imgPath='url('+caf.path+'icons/'+view.mIconName+'.png)';
            view.mElement.style.backgroundImage = imgPath;
        }

        // Handle Touch only if needed.
        if ( !caf.utils.isEmpty(view.mOnClickFunctions) || !caf.utils.isEmpty(view.mActiveClass))
        {
            view.mOnClickFunctions = !caf.utils.isEmpty(view.mOnClickFunctions) ?
                view.mOnClickFunctions : function(){};
            view.mActiveClass = !caf.utils.isEmpty(view.mActiveClass) ?
                view.mActiveClass : '';

            //Unbind
            caf.utils.unbindEvent(view.mElement,'touchstart',view.mOnTouchStartEvent);
            caf.utils.unbindEvent(view.mElement,'mousedown',view.mOnTouchStartEvent);
            caf.utils.unbindEvent(view.mElement,'touchend',view.mOnTouchEndEvent);
            caf.utils.unbindEvent(view.mElement,'mouseup',view.mOnTouchEndEvent);
            caf.utils.unbindEvent(view.mElement,'mouseout',view.mOnTouchEndEvent);
            caf.utils.unbindEvent(view.mElement,'touchcancel',view.mOnTouchEndEvent);
            caf.utils.unbindEvent(view.mElement,'touchmove',view.mOnTouchMoveEvent);
            caf.utils.unbindEvent(view.mElement,'mousemove',view.mOnTouchMoveEvent);



            // Create events.
            view.mOnTouchStartEvent = function(e)
            {
                e.preventDefault();
                if (view.mDoStopPropogation)
                {
                    e.stopPropagation();
                }

                var pointer = caf.utils.getPointerEvent(e);
                // caching the start x & y
                view.touchData.startX = pointer.pageX;
                view.touchData.startY = pointer.pageY;
                view.touchData.lastX = pointer.pageX;
                view.touchData.lastY = pointer.pageY;
                caf.utils.addClass(view.mElement,view.mActiveClass);
                caf.utils.removeClass(view.mElement,view.mActiveClassRemove);
            }
            view.mOnTouchMoveEvent = function(e)
            {
                e.preventDefault();
                var pointer = caf.utils.getPointerEvent(e);
                // caching the last x & y
                view.touchData.lastX = pointer.pageX;
                view.touchData.lastY = pointer.pageY;
            }
            view.mOnTouchEndEvent = function(e)
            {
                e.preventDefault();
                var diffX = Math.abs(view.touchData.lastX-view.touchData.startX);
                var diffY = Math.abs(view.touchData.lastY-view.touchData.startY);
                var boxSize = 15;
                if (diffX<boxSize && diffY<boxSize && caf.ui.canClick())
                {
                    for (var iFunc in view.mOnClickFunctions)
                    {
                        view.mOnClickFunctions[iFunc]();
                    }

                }
                // Reset
                view.touchData.startX = -100000;
                view.touchData.startY = -100000;
                view.touchData.lastX = -200000;
                view.touchData.lastY = -200000;
                caf.utils.removeClass(view.mElement,view.mActiveClass);
                caf.utils.addClass(view.mElement,view.mActiveClassRemove);

            }

            // Set Events Handlers.
            view.mElement.addEventListener("touchstart",view.mOnTouchStartEvent);
            view.mElement.addEventListener("mousedown",view.mOnTouchStartEvent);
            view.mElement.addEventListener("touchend",view.mOnTouchEndEvent);
            view.mElement.addEventListener("mouseup",view.mOnTouchEndEvent);
            view.mElement.addEventListener("mouseout",view.mOnTouchEndEvent);
            view.mElement.addEventListener("touchcancel",view.mOnTouchEndEvent);
            view.mElement.addEventListener("touchmove",view.mOnTouchMoveEvent);
            view.mElement.addEventListener("mousemove",view.mOnTouchMoveEvent);
        }

        return true;
    },
    /**
     * Scan all the views in the DOM,
     * Rebuild only new elements or elements that have changed.
     * @param root - root to search from. Default: document.
     * @returns {boolean}
     */
    rebuildAll: function(root)
    {
        var nodeList = (root ||document).getElementsByTagName('*');
        //var nodeArray = [];

        for (var i = 0, node; node = nodeList[i]; i++) {
            this.scanView(node);
        }

        return true;
    },
    rebuildViewById: function(id)
    {
        document.getElementById(id);
    },
    /**
     * Scan view and extract caf attributes.
     * @param elm
     */
    scanView: function(elm)
    {
        var view;
        if (!caf.utils.isEmpty(elm.id) && !caf.utils.isEmpty(this.views[elm.id]))
        {
            view = this.views[elm.id];
            // Check for changes.
            if (!view.needUpdate(elm))
            {
                return;
            }
        }
        else
        {
            view = caf.ui.view(elm.id);
        }

        view.clear();

        view.applyAttributes();

        var result = view.build();
        // Not a CAF View.
        if (result==false)
        {
            this.removeView(view);
        }
    }

}

/**
 * Handler for the attributes that CAF supporting.
 */
caf.ui.attributes =
{
    list: Array(),
    addAttr: function(elmAttributes,handler)
    {
        this.list.push({
            elmAttributes: elmAttributes,
            handler: handler
        });
    },
    /**
     * Apply attributes on view.
     * @param view
     */
    applyAttributes: function(view)
    {
        var elm = view.mElement;
        // Apply each attribute.
        for (var iAttribute in this.list)
        {
            var attribute = this.list[iAttribute];
            // Init Arguments array
            var args = {
                view: view
            };
            var missingArgument = false;
            for (var iArg in attribute.elmAttributes)
            {
                var attrName = attribute.elmAttributes[iArg];
                var attrValue = elm.getAttribute(attrName);
                // Missing Argument.
                if (caf.utils.isEmpty(attrValue))
                {
                    missingArgument = true;
                    break;
                }
                args[attrName] = attrValue;
            }
            // Skip.
            if (missingArgument) continue;
            // Apply Attribute
            attribute.handler(args);
        }
    },
    initAttributes: function()
    {
        this.addAttr(['caf-active'],function(args){
            args.view.activeClass(args['caf-active']);
        });
        this.addAttr(['caf-active-remove'],function(args){
            args.view.activeClassRemove(args['caf-active-remove']);
        });
        this.addAttr(['caf-onclick'],function(args){
            args.view.onClick( new Function(args['caf-onclick']));
        });
        this.addAttr(['caf-to-url'],function(args){
            args.view.onClick( function(){caf.utils.openURL(args['caf-to-url']);} );
        });
        this.addAttr(['caf-to-page'],function(args){
            args.view.onClick( function() {caf.pager.moveToPage(args['caf-to-page']); } );
        });
        this.addAttr(['caf-to-tab','caf-tab-container'],function(args){
            args.view.onClick( function() {caf.pager.moveToTab(args['caf-to-tab'],args['caf-tab-container']); } );
        });
        this.addAttr(['caf-drop-menu-overlay-of'],function(args){
            args.view.onClick( function() {caf.utils.hideOrShow(args['caf-drop-menu-overlay-of'],'fadein','fadeout',300);; } );
        });
        this.addAttr(['caf-drop-menu-container'],function(args){
            args.view.onClick( function() {caf.utils.hideOrShow(args['caf-drop-menu-container'],'fadein','fadeout',300);; } );
        });
        this.addAttr(['caf-text'],function(args){
            args.view.text(args['caf-text']);
        });
        this.addAttr(['caf-iconly'],function(args){
            args.view.iconOnly(args['caf-iconly']);
        });
        this.addAttr(['caf-icon-right','caf-icon-size'],function(args){
            args.view.iconRight(args['caf-icon-right'],args['caf-icon-size'] );
        });
        this.addAttr(['caf-icon-left','caf-icon-size'],function(args){
            args.view.iconLeft(args['caf-icon-left'],args['caf-icon-size'] );
        });
        this.addAttr(['caf-stop-propagation'],function(args){
            args.view.doStopPropagation(eval(args['caf-stop-propagation']));
        });
        this.addAttr(['caf-side-menu-container','caf-side-menu-position'],function(args){
            caf.ui.swipers.initSideMenu(args['caf-side-menu-container'],args['caf-side-menu-position'] );
        });
        this.addAttr(['caf-swiper-container'],function(args){
            caf.ui.swipers.initSwiper(args['swiper-container'],args['num-slides']);
        });
        this.addAttr(['caf-side-menu-switch'],function(args){
            var swiperName = args['caf-side-menu-switch'];
            args.view.onClick( function(){
                var currentSwiper = caf.ui.swipers.mSwipers[swiperName];
                currentSwiper.swipeTo((currentSwiper.activeIndex+1)%2 );
            } );
        });
        this.addAttr(['caf-current-tab'],function(args){
            caf.pager.moveToTab(args['caf-current-tab'],args.view.mElement.id,true);
        });
        this.addAttr(['caf-form'],function(args){
            caf.ui.forms.createForm(args['caf-form']);
        });
        this.addAttr(['caf-form','caf-form-on-submit'],function(args){
            caf.ui.forms.setFormOnSubmit(args['caf-form'],eval(args['caf-form-on-submit']));
        });
        this.addAttr(['caf-form','caf-form-send-to-url'],function(args){
            caf.ui.forms.setFormSaveToUrl(args['caf-form'],args['caf-form-send-to-url']);
        });
        this.addAttr(['caf-form','caf-form-send-to-url-callback'],function(args){
            var callback = eval(args['caf-form-send-to-url-callback']);
            caf.ui.forms.setFormSaveToUrlCallback(args['caf-form'],callback);
        });
        this.addAttr(['caf-form-submit-button'],function(args){
            var formName = args['caf-form-submit-button'];
            args.view.onClick( function(){caf.ui.forms.submitForm(formName);} );
        });
        this.addAttr(['caf-form-send-to-url-button'],function(args){
            var formName = args['caf-form-send-to-url-button'];
            args.view.onClick( function(){caf.ui.forms.sendFormToUrl(formName);} );
        });
        this.addAttr(['caf-form-save-to-local-storage-button'],function(args){
            var formName = args['caf-form-save-to-local-storage-button'];
            args.view.onClick( function(){caf.ui.forms.saveFormToLocalStorage(formName);} );
        });
        this.addAttr(['caf-form-clear-button'],function(args){
            var formName = args['caf-form-clear-button'];
            args.view.onClick( function(){caf.ui.forms.clearForm(formName);} );
        });
        this.addAttr(['caf-form-input','caf-form-input-name','caf-form-input-type',
            'caf-form-input-validator','caf-form-input-prepare'],function(args){
            // Create input.
            caf.ui.forms.addInput(args['caf-form-input'],args.view.id,args['caf-form-input-name'],
                args['caf-form-input-type'],args['caf-form-input-validator'],
                args['caf-form-input-prepare'])
        });

    }

}

/**
 *  Create new button.
 * @param elm
 * @constructor
 */
caf.ui.view = function(id)
{
    var elm = document.getElementById(id);
    // Case element creation needed.
    if (caf.utils.isEmpty(id) || caf.utils.isEmpty(elm))
    {
        var ul = document.createElement('ul');
        ul.innerHTML = '<div id="'+id+'"></div>';
        elm = ul.firstChild;
    }

    var View =
    {
        id: id,
        mElement: elm,
        mElementString:'',
        mText: '',
        mClass: '',
        mActiveClass: '',
        mActiveClassRemove: '',
        mIconName:'',
        mOnClickFunctions: Array(),
        mOnClickEvent: null,
        mOnTouchStartEvent: null,
        mOnTouchEndEvent: null,
        mOnTouchMoveEvent: null,
        mDoStopPropogation: false,
        touchData: {
            startX:-100000,
            startY:-100000,
            lastX:-200000,
            lastY:-200000
        },
        clear: function()
        {
            this.mElementString='',
            this.mText= '',
            this.mClass= '',
            this.mActiveClass= '',
            this.mActiveClassRemove= '',
            this.mIconName='',
            this.mOnClickFunctions= Array(),
            this.mOnClickEvent= null,
            this.mOnTouchStartEvent= null,
            this.mOnTouchEndEvent= null,
            this.mOnTouchMoveEvent= null,
            this.mDoStopPropogation= false,
            this.touchData= {
                startX:-100000,
                startY:-100000,
                lastX:-200000,
                lastY:-200000
        }
        },
        needUpdate: function(elm)
        {
            return this.mElementString != caf.utils.getElementDef(elm);
        },
        cacheElement:function()
        {
            this.mElementString = caf.utils.getElementDef(this.mElement);
        },
        activeClass: function(className)
        {
            this.mActiveClass = className;
            return this;
        },
        activeClassRemove: function(className)
        {
            this.mActiveClassRemove = className;
            return this;
        },
        onClick: function(func)
        {
            this.mClass += ' pointer ';
            this.mOnClickFunctions.push(func);
            return this;
        },
        text: function(text)
        {
            this.mText = text;
            return this;
        },
        iconOnly: function(name){
            this.mClass += ' iconOnly ';
            this.mIconName = name;
            return this;
        },
        iconRight: function(name,size){
            size = size || 'm';
            this.mClass += ' '+size+'IconRight borderBox';
            this.mIconName = name;
            return this;
        },
        iconLeft: function(name,size){
            size = size || 'm';
            this.mClass += ' '+size+'IconLeft borderBox';
            this.mIconName = name;
            return this;
        },
        doStopPropagation: function(doStop)
        {
            this.mDoStopPropogation = doStop;
        },
        build: function()
        {
            var result = caf.ui.buildView(this);
            this.cacheElement();
            return result;
        },
        refresh: function()
        {
            this.build();
        },
        applyAttributes: function()
        {
            caf.ui.attributes.applyAttributes(this);
        }
    };

    // Add the button to the views list.
    caf.ui.addView(View);

    return View;
}

/**
 * Set Title on the element with the id 'title'.
 * @param title
 */
caf.ui.title = function(title)
{
    document.getElementById('title').innerHTML = title;
}

caf.ui.swipers =
{
    mSwipers: {},
    initSwiper: function(swiperContainerId,initialSlide,slidesPerView)
    {
        initialSlide = caf.utils.isEmpty(initialSlide)? 0 : initialSlide;
        slidesPerView = caf.utils.isEmpty(slidesPerView)? 'auto' : slidesPerView;
        this.mSwipers[swiperContainerId] = new Swiper('#'+swiperContainerId,{
            slidesPerView: slidesPerView,
            moveStartThreshold: 50,
            initialSlide: initialSlide,
            resistance: '100%'
        });
    },
    initSideMenu: function(swiperContainerId,position)
    {
        var initialSlide = position=='left'? 1:0;
        caf.ui.swipers.initSwiper(swiperContainerId,initialSlide)
    }

}

caf.ui.forms =
{
    map: {},
    validators:{},
    prepares:{},
    init: function()
    {
        this.initValidators();
        this.initPrepares();
    },
    createForm: function(name)
    {
        this.map[name] =
        {
            inputs: {},
            name: name,
            saveToUrl: '',
            saveToUrlCallback: function(values){},
            onSubmit: function(){},
            clear: function()
            {
                caf.ui.forms.clearForm(this.name);
            },
            addInput: function(id,type)
            {
                caf.ui.forms.addInput(this.name,id,type);
            },
            values: function()
            {
                return caf.ui.forms.formValues(this.name);
            }
        }
    },
    setFormOnSubmit: function(name,onSubmit)
    {
        this.map[name].onSubmit = onSubmit;
    },
    setFormSaveToUrl: function(name,url)
    {
        this.map[name].saveToUrl = url;
    },
    setFormSaveToUrlCallback: function(name,callback)
    {
        this.map[name].saveToUrlCallback = callback;
    },
    formValues: function(name)
    {
        var form = this.map[name];
        var values = {};
        for (var iInput in form.inputs)
        {
            // Get value and validate.
            var input = form.inputs[iInput];
            var name = input.name;
            var value = input.value();
            var validators = input.validators;
            for (var iValidator in validators)
            {
                var validationResult = caf.ui.forms.validators[validators[iValidator]](value);
                // Validation Failed!
                if (!validationResult.isValid)
                {
                    // Show Message.
                    caf.ui.popups.showErrorMessage(validationResult.title,validationResult.msg);
                    return null; // Return empty result.
                }
            }
            // Add value to result values.
            values[name] = value;
        }
        return values;
    },
    clearForm: function(name)
    {
        var form = this.map[name];
        for (var iInput in form.inputs)
        {
            form.inputs[iInput].clear();
        }
    },
    addInput: function(formName,inputId,inputName,type,validators,prepares)
    {
        this.map[formName].inputs[inputId] = this.createInput(inputId,inputName,type,validators,prepares);
    },
    /**
     *
     * @param id - id in the DOM.
     * @param type - type of the input
     * @param validator - name of validator function or ( function(value) { return isValid; } )
     * @param prepare - name of prepare function or ( function(value) { return preparedValue; } )
     * @returns {{id: *,name: *, type: *, validators: *, prepares: *, value: Function}}
     */
    createInput: function(id,name,type,validators,prepares)
    {
        // Prepare & Validator.
        validators = caf.utils.isEmpty(validators)?
            caf.ui.forms.validators.validators['no-check'] :
            eval(validators);
        prepares = caf.utils.isEmpty(prepares)?
            this.prepares['same'] :
            eval(prepares);

        return {
            id: id,
            name: name,
            type: type,
            validators: validators,
            prepares:prepares,
            value: function()
            {
                var value = document.getElementById(this.id).value;
                for (var iPrepare in this.prepares)
                {
                    value = caf.ui.forms.prepares[this.prepares[iPrepare]](value);
                }
                return value;
            },
            clear: function()
            {
                document.getElementById(this.id).value = '';
                document.getElementById(this.id).setAttribute('value','');
            }
        };
    },
    submitForm: function(name)
    {
        var form = this.map[name];
        // Retrieve the values from the form.
        var values = form.values();
        // Check if the was validation error.
        if (values == null)     return;
        // Run onSubmit with the values.
        form.onSubmit(values);
    },
    sendFormToUrl: function(name)
    {
        var form = this.map[name];
        // Retrieve the values from the form.
        var values = form.values();
        // Check if the was validation error.
        if (values == null)     return;
        // Run sendToServer with the values.
        caf.net.sendToServer(form.saveToUrl,values,form.saveToUrlCallback);
    },
    saveFormToLocalStorage: function(name)
    {
        var form = this.map[name];
        // Retrieve the values from the form.
        var values = form.values();
        // Check if the was validation error.
        if (values == null)     return;
        // save each value to the local storage.
        for (var key in values)
        {
            caf.localStorage.save(key, values[key]);
        }
    },
    addValidator: function(name,validate,errorTitle,errorMsg)
    {
        this.validators[name] =
            function(value)
            {
                if (validate(value))    return {isValid: true, msg:'', title:''};
                else                    return {isValid: false, msg:errorMsg, title:errorTitle};
            };
    },
    initValidators: function()
    {
        this.addValidator('no-check',function(value){return true;},'','');
        this.addValidator('not-empty',function(value){return !caf.utils.isEmpty(value);},'Error','Value is empty');
    },
    addPrepare: function(name,prepare)
    {
        this.prepares[name] = prepare;
    },
    initPrepares: function()
    {
        this.addPrepare('same',function(value){return value;});
        this.addPrepare('numbers-only',function(value){
            return value.replace(/\D/g,'');
        });
    },
    logValues: function(values)
    {
        caf.log(values);
    }

}

caf.ui.popups =
{
    showErrorMessage: function(title,msg){
        caf.log("Title: "+title+", Message: "+msg);
    }
}

caf.net =
{
    sendToServer: function(url,data,callback)
    {
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function()
        {
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200)
            {
                var data = xmlhttp.responseText;
                // If the response in JSON, Parse it.
                try {
                    data = JSON.parse(data);
                } catch (e) {}
                if (!caf.utils.isEmpty(callback))
                {
                    callback(data); // callback
                }
            }
        };
        xmlhttp.open("POST", url);
        xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xmlhttp.send(JSON.stringify(data));
    }
}

caf.localStorage =
{
    save: function(key,value)
    {
        window.localStorage.setItem(key,value);
    },
    get: function(key)
    {
        var value = window.localStorage.getItem(key);
        if (caf.utils.isEmpty(value)) return null;
        return value;
    },
    empty: function(key)
    {
        return caf.utils.isEmpty(window.localStorage.getItem(key));
    }
}

caf.pager = {
    firstLoad: true,
    historyStack: new Array(),
    currentPage: "",
    mainPage: '',
    backButtonId: '',

    init: function(mainPage,backButtonId)
    {
        this.mainPage = mainPage;
        this.backButtonId = backButtonId;
        this.moveToPage(mainPage);
    },
    insertPageToStack: function(pageId) {
        for (var i=this.historyStack.length-1; i>=0; i--) {
            if (this.historyStack[i] === pageId) {
                this.historyStack.splice(i, 1);
                // break;       //<-- Uncomment  if only the first term has to be removed
            }
        }
        this.historyStack.push(pageId);
    },
    /**
     * Restructure that pages z-index as their position in the history.
     * Recent page equals greater z-index.
     */
    restructure: function()
    {
        for (var i=this.historyStack.length-1; i>=0; i--) {
            document.getElementById(this.historyStack[i]).style.zIndex = (i+1)*10;
        }
    },
    moveToTab: function(tabId,tabContainerId,force)
    {
        // Get container.
        var tabContainer = document.getElementById(tabContainerId);
        // Current Tab.
        var currentTabId = tabContainer.getAttribute('caf-current-tab');
        // Return if already in tab.
        if (currentTabId == tabId && !force) return;

        var currentTab = document.getElementById(currentTabId);

        // Get Tabs.
        var tabs = eval(tabContainer.getAttribute('caf-tabs'));
        // Restructure z-indexes.
        for (var iTab in tabs)
        {
            var tab = document.getElementById(tabs[iTab]);
            caf.utils.removeClass(tab,'currentTab');
            caf.utils.removeClass(tab,'lastTab');
            // Remove hold mark.
            this.removeHoldClass(tab.getAttribute('caf-related-button'));
        }
        caf.utils.addClass(currentTab,'lastTab');


        // Set new current tab.
        tabContainer.setAttribute('caf-current-tab',tabId);

        var toShowTab = document.getElementById(tabId);

        caf.utils.addClass(toShowTab,'currentTab');
        caf.utils.addClass(toShowTab,'hidden');
        var clientHeight = toShowTab.clientHeight;
        caf.utils.removeClass(toShowTab,'hidden');
        caf.utils.addClass(toShowTab,'fadein');
        // on load page.
        caf.pager.onLoadPage(toShowTab);

        window.setTimeout(function(){
            caf.utils.removeClass(toShowTab,'fadein');

        },300);

        // Mark button as hold.
        this.addHoldClass(toShowTab.getAttribute('caf-related-button'));

    },
    addHoldClass: function(tabButtonId)
    {
        if (!caf.utils.isEmpty(tabButtonId))
        {
            var tabButton = document.getElementById(tabButtonId);
            var holdClass = tabButton.getAttribute('caf-hold');
            if (!caf.utils.isEmpty(holdClass))
            {
                caf.utils.addClass(tabButton,holdClass);
            }
        }
    },
    removeHoldClass: function(tabButtonId)
    {
        if (!caf.utils.isEmpty(tabButtonId))
        {
            var tabButton = document.getElementById(tabButtonId);
            var holdClass = tabButton.getAttribute('caf-hold');
            if (!caf.utils.isEmpty(holdClass))
            {
                caf.utils.removeClass(tabButton,holdClass);
            }
        }
    },
    /**
     * move to page.
     */
    moveToPage: function(toPageId,isRealPage,inAnim,outAnim)
    {
        // Check if need to move back.
        if (toPageId == 'move-back')
        {
            this.moveBack();
            return;
        }

        if (this.currentPage == toPageId)
        {
            return;
        }

        var lastPageId = this.currentPage;

        //Replace current page.
        this.currentPage = toPageId;
        this.insertPageToStack(toPageId);
        this.restructure();
        var toPageDiv = document.getElementById(toPageId);

        if (caf.utils.isEmpty(lastPageId))
        {
            // on load page.
            caf.pager.onLoadPage(toPageDiv);
            // Hide back button if needed.
            this.checkAndChangeBackButtonState();
            return;
        }


        caf.utils.addClass(toPageDiv,'hidden');
        var clientHeight = toPageDiv.clientHeight;
        caf.utils.removeClass(toPageDiv,'hidden');
        caf.utils.addClass(toPageDiv,'fadein');
        // on load page.
        caf.pager.onLoadPage(toPageDiv);
        // Hide back button if needed.
        this.checkAndChangeBackButtonState();

        window.setTimeout(function(){
            caf.utils.removeClass(toPageDiv,'fadein');

        },300);

    },
    moveBack: function()
    {
        if (this.historyStack.length <= 1)
        {
            // TODO: Ask to leave app.
            return;
        }

        //Remove last page from the history.
        var toRemovePageId = this.historyStack.pop();
        var toPageId = this.historyStack.pop();

        //Replace current page.
        this.currentPage = toPageId;
        this.insertPageToStack(toPageId);
        this.restructure();

        var lastPageDiv = document.getElementById(toRemovePageId);
        var toPageDiv = document.getElementById(toPageId);

        caf.utils.addClass(lastPageDiv,'fadeout');
        // on load page.
        caf.pager.onLoadPage(toPageDiv);
        // Hide back button if needed.

        this.checkAndChangeBackButtonState();

        window.setTimeout(function(){
            caf.utils.removeClass(lastPageDiv,'fadeout');
            lastPageDiv.style.zIndex = 0;
        },300);


    },
    onLoadPage: function(pageElement)
    {
        if ( pageElement.getAttribute('caf-page-load')  )
        {
            var onLoad = new Function(pageElement.getAttribute('caf-page-load'));
            onLoad();
        }
    },
    checkAndChangeBackButtonState:function()
    {
        if (caf.utils.isEmpty(this.backButtonId)) return;

        if (this.currentPage == this.mainPage)
        {
            caf.utils.addClass(document.getElementById(this.backButtonId),'hidden');
        }
        else
        {
            caf.utils.removeClass(document.getElementById(this.backButtonId),'hidden');
        }
    }

}


/**
 * Libraries
 */

/* Overthrow */
var doc=this.document,docElem=doc.documentElement,enabledClassName="overthrow-enabled",canBeFilledWithPoly="ontouchmove" in doc,nativeOverflow="WebkitOverflowScrolling" in docElem.style||"msOverflowStyle" in docElem.style||(!canBeFilledWithPoly&&this.screen.width>800)||(function(){var b=this.navigator.userAgent,a=b.match(/AppleWebKit\/([0-9]+)/),d=a&&a[1],c=a&&d>=534;return(b.match(/Android ([0-9]+)/)&&RegExp.$1>=3&&c||b.match(/ Version\/([0-9]+)/)&&RegExp.$1>=0&&this.blackberry&&c||b.indexOf("PlayBook")>-1&&c&&!b.indexOf("Android 2")===-1||b.match(/Firefox\/([0-9]+)/)&&RegExp.$1>=4||b.match(/wOSBrowser\/([0-9]+)/)&&RegExp.$1>=233&&c||b.match(/NokiaBrowser\/([0-9\.]+)/)&&parseFloat(RegExp.$1)===7.3&&a&&d>=533)})();caf.overthrow={};caf.overthrow.enabledClassName=enabledClassName;caf.overthrow.addClass=function(){if(docElem.className.indexOf(caf.overthrow.enabledClassName)===-1){docElem.className+=" "+caf.overthrow.enabledClassName}};caf.overthrow.removeClass=function(){docElem.className=docElem.className.replace(caf.overthrow.enabledClassName,"")};caf.overthrow.set=function(){if(nativeOverflow){caf.overthrow.addClass()}};caf.overthrow.canBeFilledWithPoly=canBeFilledWithPoly;caf.overthrow.forget=function(){caf.overthrow.removeClass()};caf.overthrow.support=nativeOverflow?"native":"none";caf.overthrow.scrollIndicatorClassName="overthrow";var doc=this.document,docElem=doc.documentElement,nativeOverflow=caf.overthrow.support==="native",canBeFilledWithPoly=caf.overthrow.canBeFilledWithPoly,configure=caf.overthrow.configure,set=caf.overthrow.set,forget=caf.overthrow.forget,scrollIndicatorClassName=caf.overthrow.scrollIndicatorClassName;caf.overthrow.closest=function(b,a){return !a&&b.className&&b.className.indexOf(scrollIndicatorClassName)>-1&&b||caf.overthrow.closest(b.parentNode)};var enabled=false;caf.overthrow.set=function(){set();if(enabled||nativeOverflow||!canBeFilledWithPoly){return}caf.overthrow.addClass();enabled=true;caf.overthrow.support="polyfilled";caf.overthrow.forget=function(){forget();enabled=false;if(doc.removeEventListener){doc.removeEventListener("touchstart",b,false)}};var d,h=[],a=[],g,j,i=function(){h=[];g=null},e=function(){a=[];j=null},f,c=function(n){f=d.querySelectorAll("textarea, input");for(var m=0,l=f.length;m<l;m++){f[m].style.pointerEvents=n}},k=function(m,n){if(doc.createEvent){var o=(!n||n===undefined)&&d.parentNode||d.touchchild||d,l;if(o!==d){l=doc.createEvent("HTMLEvents");l.initEvent("touchend",true,true);d.dispatchEvent(l);o.touchchild=d;d=o;o.dispatchEvent(m)}}},b=function(t){if(caf.overthrow.intercept){caf.overthrow.intercept()}i();e();d=caf.overthrow.closest(t.target);if(!d||d===docElem||t.touches.length>1){return}c("none");var u=t,l=d.scrollTop,p=d.scrollLeft,v=d.offsetHeight,m=d.offsetWidth,q=t.touches[0].pageY,s=t.touches[0].pageX,w=d.scrollHeight,r=d.scrollWidth,n=function(A){var x=l+q-A.touches[0].pageY,y=p+s-A.touches[0].pageX,B=x>=(h.length?h[0]:0),z=y>=(a.length?a[0]:0);if((x>0&&x<w-v)||(y>0&&y<r-m)){A.preventDefault()}else{k(u)}if(g&&B!==g){i()}if(j&&z!==j){e()}g=B;j=z;d.scrollTop=x;d.scrollLeft=y;h.unshift(x);a.unshift(y);if(h.length>3){h.pop()}if(a.length>3){a.pop()}},o=function(x){c("auto");setTimeout(function(){c("none")},450);d.removeEventListener("touchmove",n,false);d.removeEventListener("touchend",o,false)};d.addEventListener("touchmove",n,false);d.addEventListener("touchend",o,false)};doc.addEventListener("touchstart",b,false)};caf.overthrow.set();
/* Placeholders.js v3.0.2 */
(function(t){"use strict";function e(t,e,r){return t.addEventListener?t.addEventListener(e,r,!1):t.attachEvent?t.attachEvent("on"+e,r):void 0}function r(t,e){var r,n;for(r=0,n=t.length;n>r;r++)if(t[r]===e)return!0;return!1}function n(t,e){var r;t.createTextRange?(r=t.createTextRange(),r.move("character",e),r.select()):t.selectionStart&&(t.focus(),t.setSelectionRange(e,e))}function a(t,e){try{return t.type=e,!0}catch(r){return!1}}t.Placeholders={Utils:{addEventListener:e,inArray:r,moveCaret:n,changeType:a}}})(this),function(t){"use strict";function e(){}function r(){try{return document.activeElement}catch(t){}}function n(t,e){var r,n,a=!!e&&t.value!==e,u=t.value===t.getAttribute(V);return(a||u)&&"true"===t.getAttribute(D)?(t.removeAttribute(D),t.value=t.value.replace(t.getAttribute(V),""),t.className=t.className.replace(R,""),n=t.getAttribute(F),parseInt(n,10)>=0&&(t.setAttribute("maxLength",n),t.removeAttribute(F)),r=t.getAttribute(P),r&&(t.type=r),!0):!1}function a(t){var e,r,n=t.getAttribute(V);return""===t.value&&n?(t.setAttribute(D,"true"),t.value=n,t.className+=" "+I,r=t.getAttribute(F),r||(t.setAttribute(F,t.maxLength),t.removeAttribute("maxLength")),e=t.getAttribute(P),e?t.type="text":"password"===t.type&&M.changeType(t,"text")&&t.setAttribute(P,"password"),!0):!1}function u(t,e){var r,n,a,u,i,l,o;if(t&&t.getAttribute(V))e(t);else for(a=t?t.getElementsByTagName("input"):b,u=t?t.getElementsByTagName("textarea"):f,r=a?a.length:0,n=u?u.length:0,o=0,l=r+n;l>o;o++)i=r>o?a[o]:u[o-r],e(i)}function i(t){u(t,n)}function l(t){u(t,a)}function o(t){return function(){m&&t.value===t.getAttribute(V)&&"true"===t.getAttribute(D)?M.moveCaret(t,0):n(t)}}function c(t){return function(){a(t)}}function s(t){return function(e){return A=t.value,"true"===t.getAttribute(D)&&A===t.getAttribute(V)&&M.inArray(C,e.keyCode)?(e.preventDefault&&e.preventDefault(),!1):void 0}}function d(t){return function(){n(t,A),""===t.value&&(t.blur(),M.moveCaret(t,0))}}function g(t){return function(){t===r()&&t.value===t.getAttribute(V)&&"true"===t.getAttribute(D)&&M.moveCaret(t,0)}}function v(t){return function(){i(t)}}function p(t){t.form&&(T=t.form,"string"==typeof T&&(T=document.getElementById(T)),T.getAttribute(U)||(M.addEventListener(T,"submit",v(T)),T.setAttribute(U,"true"))),M.addEventListener(t,"focus",o(t)),M.addEventListener(t,"blur",c(t)),m&&(M.addEventListener(t,"keydown",s(t)),M.addEventListener(t,"keyup",d(t)),M.addEventListener(t,"click",g(t))),t.setAttribute(j,"true"),t.setAttribute(V,x),(m||t!==r())&&a(t)}var b,f,m,h,A,y,E,x,L,T,N,S,w,B=["text","search","url","tel","email","password","number","textarea"],C=[27,33,34,35,36,37,38,39,40,8,46],k="#ccc",I="placeholdersjs",R=RegExp("(?:^|\\s)"+I+"(?!\\S)"),V="data-placeholder-value",D="data-placeholder-active",P="data-placeholder-type",U="data-placeholder-submit",j="data-placeholder-bound",q="data-placeholder-focus",z="data-placeholder-live",F="data-placeholder-maxlength",G=document.createElement("input"),H=document.getElementsByTagName("head")[0],J=document.documentElement,K=t.Placeholders,M=K.Utils;if(K.nativeSupport=void 0!==G.placeholder,!K.nativeSupport){for(b=document.getElementsByTagName("input"),f=document.getElementsByTagName("textarea"),m="false"===J.getAttribute(q),h="false"!==J.getAttribute(z),y=document.createElement("style"),y.type="text/css",E=document.createTextNode("."+I+" { color:"+k+"; }"),y.styleSheet?y.styleSheet.cssText=E.nodeValue:y.appendChild(E),H.insertBefore(y,H.firstChild),w=0,S=b.length+f.length;S>w;w++)N=b.length>w?b[w]:f[w-b.length],x=N.attributes.placeholder,x&&(x=x.nodeValue,x&&M.inArray(B,N.type)&&p(N));L=setInterval(function(){for(w=0,S=b.length+f.length;S>w;w++)N=b.length>w?b[w]:f[w-b.length],x=N.attributes.placeholder,x?(x=x.nodeValue,x&&M.inArray(B,N.type)&&(N.getAttribute(j)||p(N),(x!==N.getAttribute(V)||"password"===N.type&&!N.getAttribute(P))&&("password"===N.type&&!N.getAttribute(P)&&M.changeType(N,"text")&&N.setAttribute(P,"password"),N.value===N.getAttribute(V)&&(N.value=x),N.setAttribute(V,x)))):N.getAttribute(D)&&(n(N),N.removeAttribute(V));h||clearInterval(L)},100)}M.addEventListener(t,"beforeunload",function(){K.disable()}),K.disable=K.nativeSupport?e:i,K.enable=K.nativeSupport?e:l}(this);
// PicoModal
(function(e,g){function h(l){if(typeof Node==="object"){return l instanceof Node}else{return l&&typeof l==="object"&&typeof l.nodeType==="number"}}function d(l){return typeof l==="string"}function c(){var l=[];return{watch:l.push.bind(l),trigger:function(q){var m=true;var p={preventDefault:function n(){m=false}};for(var o=0;o<l.length;o++){l[o](q,p)}return m}}}function f(l){this.elem=l}f.div=function(l){var m=g.createElement("div");(l||g.body).appendChild(m);return new f(m)};f.prototype={child:function(){return f.div(this.elem)},stylize:function(l){l=l||{};if(typeof l.opacity!=="undefined"){l.filter="alpha(opacity="+(l.opacity*100)+")"}for(var m in l){if(l.hasOwnProperty(m)){this.elem.style[m]=l[m]}}return this},clazz:function(l){this.elem.className+=" "+l;return this},html:function(l){if(h(l)){this.elem.appendChild(l)}else{this.elem.innerHTML=l}return this},getWidth:function(){return this.elem.clientWidth},onClick:function(l){if(this.elem.attachEvent){this.elem.attachEvent("onclick",l)}else{this.elem.addEventListener("click",l)}return this},destroy:function(){g.body.removeChild(this.elem)},hide:function(){this.elem.style.display="none"},show:function(){this.elem.style.display="block"},anyAncestor:function(l){var m=this.elem;while(m){if(l(new f(m))){return true}else{m=m.parentNode}}return false}};function k(l,m){return f.div().clazz("pico-overlay").clazz(l("overlayClass","")).stylize({display:"block",position:"fixed",top:"0px",left:"0px",height:"100%",width:"100%",zIndex:10000}).stylize(l("overlayStyles",{opacity:0.5,background:"#000"})).onClick(function(){if(l("overlayClose",true)){m()}})}function i(l,o){var n=f.div().clazz("pico-content").clazz(l("modalClass","")).stylize({display:"block",position:"fixed",zIndex:10001,left:"50%",top:"50px"}).html(l("content")).onClick(function(q){var p=new f(q.target).anyAncestor(function(r){return/\bpico-close\b/.test(r.elem.className)});if(p){o()}});var m=l("width",n.getWidth());n.stylize({width:m+"px",margin:"0 0 0 "+(-(m/2)+"px")}).stylize(l("modalStyles",{backgroundColor:"white",padding:"20px",borderRadius:"5px"}));return n}function j(m,l){if(l("closeButton",true)){return m.child().html(l("closeHtml","&#xD7;")).clazz("pico-close").clazz(l("closeClass")).stylize(l("closeStyles",{borderRadius:"2px",cursor:"pointer",height:"15px",width:"15px",position:"absolute",top:"5px",right:"5px",fontSize:"16px",textAlign:"center",lineHeight:"15px",background:"#CCC"}))}}function b(l){return function(){return l().elem}}function a(A){if(d(A)||h(A)){A={content:A}}var t=c();var w=c();var m=c();var p=c();var s=c();function l(C,B){var D=A[C];if(typeof D==="function"){D=D(B)}return D===undefined?B:D}function z(){o().hide();r().hide();s.trigger(q)}function y(){if(p.trigger(q)){z()}}function v(B){return function(){B.apply(this,arguments);return q}}var n;function x(B){if(!n){var C=i(l,y);n={modal:C,overlay:k(l,y),close:j(C,l)};t.trigger(q)}return n[B]}var r=x.bind(e,"modal");var o=x.bind(e,"overlay");var u=x.bind(e,"close");var q={modalElem:b(r),closeElem:b(u),overlayElem:b(o),show:function(){if(w.trigger(q)){o().show();u();r().show();m.trigger(q)}return this},close:v(y),forceClose:v(z),destroy:function(){r=r().destroy();o=o().destroy();u=undefined},options:function(B){A=B},afterCreate:v(t.watch),beforeShow:v(w.watch),afterShow:v(m.watch),beforeClose:v(p.watch),afterClose:v(s.watch)};return q}if(typeof e.define==="function"&&e.define.amd){e.define(function(){return a})}else{e.picoModal=a}}(window,document));





