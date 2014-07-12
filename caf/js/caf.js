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


caf.utils =
{
    hideOrShow: function(id,showClass,outClass,duration)
    {
        var elm = document.getElementById(id);
        if (this.hasClass(elm,'hidden'))
        {
            this.removeClass(elm,'hidden');
            this.removeClass(elm,outClass);
            this.addClass(elm,showClass);
        }
        else
        {
            if (!this.isEmpty(showClass))
            {
                window.setTimeout(function(){caf.utils.addClass(elm,'hidden');},duration || 300);
            }
            else
            {
                caf.utils.addClass(elm,'hidden');
            }
            this.addClass(elm,outClass);
            this.removeClass(elm,showClass);
        }
    },
    isEmpty: function(obj)
    {
        return obj == undefined || obj == null || obj == '' || obj.toString()=='';
    },
    isString: function(variable)
    {
        return (typeof variable == 'string' || variable instanceof String)
            && variable.trim().indexOf("function")!=0;
    },
    isStringFunction: function(variable)
    {
        return variable.trim().indexOf("function")==0;
    },
    getElementDef: function(elm){
        var str = elm.outerHTML;
        return str.substring(0,str.indexOf('>'));
    },
    hasClass: function(el, name)
    {
        return new RegExp('(\\s|^)'+name+'(\\s|$)').test(el.className);
    },
    addClass: function(el, name)
    {
        if (!caf.utils.hasClass(el, name)) { el.className += (el.className ? ' ' : '') +name; }
    },
    removeClass: function(el, name)
    {
        if (caf.utils.hasClass(el, name)) {
            el.className=el.className.replace(new RegExp('(\\s|^)'+name+'(\\s|$)'),' ').replace(/^\s+|\s+$/g, '');
        }
    },
    unbindEvent: function(elm,eventName,event)
    {
        if (!caf.utils.isEmpty(elm) && !caf.utils.isEmpty(event))
        {
            elm.removeEventListener(eventName,event);
        }
    },
    getPointerEvent: function(event) {
        return event.targetTouches ? event.targetTouches[0] : event;
    },
    openURL: function(url)
    {
        if (caf.platforms.isIOS())
        {
            window.open(url,  '_system', 'location=yes');
        }
        else
        {
            try
            {
                navigator.app.loadUrl(url, {openExternal:true});
            }
            catch (e)
            {
                window.open(url,  '_system', 'location=yes');
            }
        }
    }

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
        this.addAttr(['to-url'],function(args){
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
        this.addAttr(['caf-icon-right'],function(args){
            args.view.iconRight(args['caf-icon-right'],args['caf-icon-size'] );
        });
        this.addAttr(['caf-icon-left'],function(args){
            args.view.iconLeft(args['caf-icon-left'],args['caf-icon-size'] );
        });
        this.addAttr(['caf-stop-propagation'],function(args){
            args.view.doStopPropagation(eval(args['caf-stop-propagation']));
        });
        this.addAttr(['caf-side-menu-container','caf-side-menu-position'],function(args){
            caf.ui.swipers.initSideMenu(args['caf-side-menu-container'],args['caf-side-menu-position'] );
        });
        this.addAttr(['swiper-container'],function(args){
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
        this.addAttr(['caf-form','caf-form-on-submit'],function(args){
            caf.ui.forms.createForm(args['caf-form'],eval(args['caf-form-on-submit']));
        });
        this.addAttr(['caf-form-submit-button'],function(args){
            var formName = args['caf-form-submit-button'];
            args.view.onClick( function(){caf.ui.forms.submitForm(formName);} );
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
            this.mClass += ' '+size+'IconRight ';
            this.mIconName = name;
            return this;
        },
        iconLeft: function(name,size){
            size = size || 'm';
            this.mClass += ' '+size+'IconLeft ';
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
            initialSlide: initialSlide
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
    createForm: function(name,onSubmit)
    {
        this.map[name] =
        {
            name: name,
            inputs: {},
            onSubmit: onSubmit || function(){},
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
            var validationResult = input.validator(value);
            // Validation Failed!
            if (!validationResult.isValid)
            {
                // Show Message.
                caf.ui.popups.showErrorMessage(validationResult.title,validationResult.msg);
                return null; // Return empty result.
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
    addInput: function(formName,inputId,inputName,type,validator,prepare)
    {
        this.map[formName].inputs[inputId] = this.createInput(inputId,inputName,type,validator,prepare);
    },
    /**
     *
     * @param id - id in the DOM.
     * @param type - type of the input
     * @param validator - name of validator function or ( function(value) { return isValid; } )
     * @param prepare - name of prepare function or ( function(value) { return preparedValue; } )
     * @returns {{id: *,name: *, type: *, validator: Function, prepare: Function, value: Function}}
     */
    createInput: function(id,name,type,validator,prepare)
    {
        // Prepare & Validator.
        validator = caf.utils.isEmpty(validator)?
            this.validators['no-check'] :
            (caf.utils.isString(validator) && !caf.utils.isStringFunction(validator) ) ?
            caf.ui.forms.validators[validator] :
            new Function(validator);
        prepare = caf.utils.isEmpty(prepare)?
            this.prepares['same'] :
            (caf.utils.isString(prepare) && !caf.utils.isStringFunction(prepare) ) ?
            caf.ui.forms.prepares[prepare] :
            new Function(prepare);

        return {
            id: id,
            name: name,
            type: type,
            validator: validator,
            prepare:prepare,
            value: function()
            {
                return this.prepare(document.getElementById(this.id).value);
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
        // Retreive the values from the form.
        var values = form.values();
        // Check if the was validation error.
        if (values == null)     return;
        // Run onSubmit with the values.
        form.onSubmit(values);
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
        this.addValidator('check',function(value){return false;},'wow','error');
    },
    addPrepare: function(name,prepare)
    {
        this.prepares[name] = prepare;
    },
    initPrepares: function()
    {
        this.addPrepare('same',function(value){return value;});
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

// Overthrow.
var doc=this.document,docElem=doc.documentElement,enabledClassName="overthrow-enabled",canBeFilledWithPoly="ontouchmove" in doc,nativeOverflow="WebkitOverflowScrolling" in docElem.style||"msOverflowStyle" in docElem.style||(!canBeFilledWithPoly&&this.screen.width>800)||(function(){var b=this.navigator.userAgent,a=b.match(/AppleWebKit\/([0-9]+)/),d=a&&a[1],c=a&&d>=534;return(b.match(/Android ([0-9]+)/)&&RegExp.$1>=3&&c||b.match(/ Version\/([0-9]+)/)&&RegExp.$1>=0&&this.blackberry&&c||b.indexOf("PlayBook")>-1&&c&&!b.indexOf("Android 2")===-1||b.match(/Firefox\/([0-9]+)/)&&RegExp.$1>=4||b.match(/wOSBrowser\/([0-9]+)/)&&RegExp.$1>=233&&c||b.match(/NokiaBrowser\/([0-9\.]+)/)&&parseFloat(RegExp.$1)===7.3&&a&&d>=533)})();caf.overthrow={};caf.overthrow.enabledClassName=enabledClassName;caf.overthrow.addClass=function(){if(docElem.className.indexOf(caf.overthrow.enabledClassName)===-1){docElem.className+=" "+caf.overthrow.enabledClassName}};caf.overthrow.removeClass=function(){docElem.className=docElem.className.replace(caf.overthrow.enabledClassName,"")};caf.overthrow.set=function(){if(nativeOverflow){caf.overthrow.addClass()}};caf.overthrow.canBeFilledWithPoly=canBeFilledWithPoly;caf.overthrow.forget=function(){caf.overthrow.removeClass()};caf.overthrow.support=nativeOverflow?"native":"none";caf.overthrow.scrollIndicatorClassName="overthrow";var doc=this.document,docElem=doc.documentElement,nativeOverflow=caf.overthrow.support==="native",canBeFilledWithPoly=caf.overthrow.canBeFilledWithPoly,configure=caf.overthrow.configure,set=caf.overthrow.set,forget=caf.overthrow.forget,scrollIndicatorClassName=caf.overthrow.scrollIndicatorClassName;caf.overthrow.closest=function(b,a){return !a&&b.className&&b.className.indexOf(scrollIndicatorClassName)>-1&&b||caf.overthrow.closest(b.parentNode)};var enabled=false;caf.overthrow.set=function(){set();if(enabled||nativeOverflow||!canBeFilledWithPoly){return}caf.overthrow.addClass();enabled=true;caf.overthrow.support="polyfilled";caf.overthrow.forget=function(){forget();enabled=false;if(doc.removeEventListener){doc.removeEventListener("touchstart",b,false)}};var d,h=[],a=[],g,j,i=function(){h=[];g=null},e=function(){a=[];j=null},f,c=function(n){f=d.querySelectorAll("textarea, input");for(var m=0,l=f.length;m<l;m++){f[m].style.pointerEvents=n}},k=function(m,n){if(doc.createEvent){var o=(!n||n===undefined)&&d.parentNode||d.touchchild||d,l;if(o!==d){l=doc.createEvent("HTMLEvents");l.initEvent("touchend",true,true);d.dispatchEvent(l);o.touchchild=d;d=o;o.dispatchEvent(m)}}},b=function(t){if(caf.overthrow.intercept){caf.overthrow.intercept()}i();e();d=caf.overthrow.closest(t.target);if(!d||d===docElem||t.touches.length>1){return}c("none");var u=t,l=d.scrollTop,p=d.scrollLeft,v=d.offsetHeight,m=d.offsetWidth,q=t.touches[0].pageY,s=t.touches[0].pageX,w=d.scrollHeight,r=d.scrollWidth,n=function(A){var x=l+q-A.touches[0].pageY,y=p+s-A.touches[0].pageX,B=x>=(h.length?h[0]:0),z=y>=(a.length?a[0]:0);if((x>0&&x<w-v)||(y>0&&y<r-m)){A.preventDefault()}else{k(u)}if(g&&B!==g){i()}if(j&&z!==j){e()}g=B;j=z;d.scrollTop=x;d.scrollLeft=y;h.unshift(x);a.unshift(y);if(h.length>3){h.pop()}if(a.length>3){a.pop()}},o=function(x){c("auto");setTimeout(function(){c("none")},450);d.removeEventListener("touchmove",n,false);d.removeEventListener("touchend",o,false)};d.addEventListener("touchmove",n,false);d.addEventListener("touchend",o,false)};doc.addEventListener("touchstart",b,false)};caf.overthrow.set();







