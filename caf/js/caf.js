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
        if ( elm.getAttribute('caf-active') )               view.activeClass(elm.getAttribute('caf-active'));
        if ( elm.getAttribute('caf-active-remove') )        view.activeClassRemove(elm.getAttribute('caf-active-remove'));
        if ( elm.getAttribute('caf-onclick'))               view.onClick( new Function(elm.getAttribute('caf-onclick')) );
        if ( elm.getAttribute('caf-to-url'))                view.onClick( function(){caf.utils.openURL(elm.getAttribute('caf-to-url'));} );
        if ( elm.getAttribute('caf-to-page'))               view.onClick( function() {caf.pager.moveToPage(elm.getAttribute('caf-to-page')); } );
        if ( elm.getAttribute('caf-to-tab')
            && elm.getAttribute('caf-tab-container'))       view.onClick( function() {caf.pager.moveToTab(elm.getAttribute('caf-to-tab'),elm.getAttribute('caf-tab-container')); } );
        if ( elm.getAttribute('caf-drop-menu-overlay-of'))  view.onClick( function() {caf.utils.hideOrShow(elm.getAttribute('caf-drop-menu-overlay-of'),'fadein','fadeout',300);; } );
        if ( elm.getAttribute('caf-drop-menu-container'))   view.onClick( function() {caf.utils.hideOrShow(elm.getAttribute('caf-drop-menu-container'),'fadein','fadeout',300);; } );
        if ( elm.getAttribute('caf-text')   )               view.text(elm.getAttribute('caf-text'));
        if ( elm.getAttribute('caf-iconly') )               view.iconOnly(elm.getAttribute('caf-iconly'));
        if ( elm.getAttribute('caf-icon-right') )           view.iconRight(elm.getAttribute('caf-icon-right'),elm.getAttribute('caf-icon-size') );
        if ( elm.getAttribute('caf-icon-left') )            view.iconLeft(elm.getAttribute('caf-icon-left'),elm.getAttribute('caf-icon-size') );
        if ( elm.getAttribute('caf-stop-propagation') )     view.doStopPropagation(eval(elm.getAttribute('caf-stop-propagation')));
        // Init Side Menu Swiper.
        if ( elm.getAttribute('caf-side-menu-container') && elm.getAttribute('caf-side-menu-position'))
        {
            caf.ui.swipers.initSideMenu(elm.getAttribute('caf-side-menu-container'),elm.getAttribute('caf-side-menu-position'));
        }
        if ( elm.getAttribute('swiper-container'))
        {
            caf.ui.swipers.initSwiper(elm.getAttribute('swiper-container'),elm.getAttribute('num-slides'));
        }

        // Switch menu ( Hide / Show).
        if ( elm.getAttribute('caf-side-menu-switch'))
        {
            var swiperName = elm.getAttribute('caf-side-menu-switch');
            view.onClick( function(){
                var currentSwiper = caf.ui.swipers.mSwipers[swiperName];
                currentSwiper.swipeTo((currentSwiper.activeIndex+1)%2 );
            } );
        }

        // Move to tab.
        if ( elm.getAttribute('caf-current-tab') )
        {
            caf.log('Moved To Tab: '+elm.getAttribute('caf-current-tab'));
            caf.pager.moveToTab(elm.getAttribute('caf-current-tab'),elm.id,true);
        }

        var result = view.build();
        // Not a CAF View.
        if (result==false)
        {
            this.removeView(view);
        }
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
 * Overthrow.
 */
var doc=this.document,docElem=doc.documentElement,enabledClassName="overthrow-enabled",canBeFilledWithPoly="ontouchmove" in doc,nativeOverflow="WebkitOverflowScrolling" in docElem.style||"msOverflowStyle" in docElem.style||(!canBeFilledWithPoly&&this.screen.width>800)||(function(){var b=this.navigator.userAgent,a=b.match(/AppleWebKit\/([0-9]+)/),d=a&&a[1],c=a&&d>=534;return(b.match(/Android ([0-9]+)/)&&RegExp.$1>=3&&c||b.match(/ Version\/([0-9]+)/)&&RegExp.$1>=0&&this.blackberry&&c||b.indexOf("PlayBook")>-1&&c&&!b.indexOf("Android 2")===-1||b.match(/Firefox\/([0-9]+)/)&&RegExp.$1>=4||b.match(/wOSBrowser\/([0-9]+)/)&&RegExp.$1>=233&&c||b.match(/NokiaBrowser\/([0-9\.]+)/)&&parseFloat(RegExp.$1)===7.3&&a&&d>=533)})();caf.overthrow={};caf.overthrow.enabledClassName=enabledClassName;caf.overthrow.addClass=function(){if(docElem.className.indexOf(caf.overthrow.enabledClassName)===-1){docElem.className+=" "+caf.overthrow.enabledClassName}};caf.overthrow.removeClass=function(){docElem.className=docElem.className.replace(caf.overthrow.enabledClassName,"")};caf.overthrow.set=function(){if(nativeOverflow){caf.overthrow.addClass()}};caf.overthrow.canBeFilledWithPoly=canBeFilledWithPoly;caf.overthrow.forget=function(){caf.overthrow.removeClass()};caf.overthrow.support=nativeOverflow?"native":"none";caf.overthrow.scrollIndicatorClassName="overthrow";var doc=this.document,docElem=doc.documentElement,nativeOverflow=caf.overthrow.support==="native",canBeFilledWithPoly=caf.overthrow.canBeFilledWithPoly,configure=caf.overthrow.configure,set=caf.overthrow.set,forget=caf.overthrow.forget,scrollIndicatorClassName=caf.overthrow.scrollIndicatorClassName;caf.overthrow.closest=function(b,a){return !a&&b.className&&b.className.indexOf(scrollIndicatorClassName)>-1&&b||caf.overthrow.closest(b.parentNode)};var enabled=false;caf.overthrow.set=function(){set();if(enabled||nativeOverflow||!canBeFilledWithPoly){return}caf.overthrow.addClass();enabled=true;caf.overthrow.support="polyfilled";caf.overthrow.forget=function(){forget();enabled=false;if(doc.removeEventListener){doc.removeEventListener("touchstart",b,false)}};var d,h=[],a=[],g,j,i=function(){h=[];g=null},e=function(){a=[];j=null},f,c=function(n){f=d.querySelectorAll("textarea, input");for(var m=0,l=f.length;m<l;m++){f[m].style.pointerEvents=n}},k=function(m,n){if(doc.createEvent){var o=(!n||n===undefined)&&d.parentNode||d.touchchild||d,l;if(o!==d){l=doc.createEvent("HTMLEvents");l.initEvent("touchend",true,true);d.dispatchEvent(l);o.touchchild=d;d=o;o.dispatchEvent(m)}}},b=function(t){if(caf.overthrow.intercept){caf.overthrow.intercept()}i();e();d=caf.overthrow.closest(t.target);if(!d||d===docElem||t.touches.length>1){return}c("none");var u=t,l=d.scrollTop,p=d.scrollLeft,v=d.offsetHeight,m=d.offsetWidth,q=t.touches[0].pageY,s=t.touches[0].pageX,w=d.scrollHeight,r=d.scrollWidth,n=function(A){var x=l+q-A.touches[0].pageY,y=p+s-A.touches[0].pageX,B=x>=(h.length?h[0]:0),z=y>=(a.length?a[0]:0);if((x>0&&x<w-v)||(y>0&&y<r-m)){A.preventDefault()}else{k(u)}if(g&&B!==g){i()}if(j&&z!==j){e()}g=B;j=z;d.scrollTop=x;d.scrollLeft=y;h.unshift(x);a.unshift(y);if(h.length>3){h.pop()}if(a.length>3){a.pop()}},o=function(x){c("auto");setTimeout(function(){c("none")},450);d.removeEventListener("touchmove",n,false);d.removeEventListener("touchend",o,false)};d.addEventListener("touchmove",n,false);d.addEventListener("touchend",o,false)};doc.addEventListener("touchstart",b,false)};caf.overthrow.set();

















































// Libraries.
// Idangerous Swiper
// Overthrow


