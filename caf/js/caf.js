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

caf.title = function(title)
{
    document.getElementById('title').innerHTML = title;
}

caf.Utilities =
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
                window.setTimeout(function(){caf.Utilities.addClass(elm,'hidden');},duration || 300);
            }
            else
            {
                caf.Utilities.addClass(elm,'hidden');
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
        if (!caf.Utilities.hasClass(el, name)) { el.className += (el.className ? ' ' : '') +name; }
    },
    removeClass: function(el, name)
    {
        if (caf.Utilities.hasClass(el, name)) {
            el.className=el.className.replace(new RegExp('(\\s|^)'+name+'(\\s|$)'),' ').replace(/^\s+|\s+$/g, '');
        }
    },
    unbindEvent: function(elm,eventName,event)
    {
        if (!caf.Utilities.isEmpty(elm) && !caf.Utilities.isEmpty(event))
        {
            elm.removeEventListener(eventName,event);
        }
    },
    getPointerEvent: function(event) {
        return event.targetTouches ? event.targetTouches[0] : event;
    }

}





/**
 * Views Handler.
 */
caf.Views = {
    updateKey:0,
    views: {},
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
    refresh: function()
    {
        for (var iView in this.views)
        {
            this.views[iView].refresh();
        }
    },
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
    buildView: function(view)
    {
        var isCAF= (!caf.Utilities.isEmpty(view.mText))||
            (!caf.Utilities.isEmpty(view.mClass))||
            (!caf.Utilities.isEmpty(view.mIconName))||
            (!caf.Utilities.isEmpty(view.mActiveClass))||
            (!caf.Utilities.isEmpty(view.mIconName))||
            (!caf.Utilities.isEmpty(view.mOnClickFunctions));
        if (!isCAF)
        {
            return false;
        }

        //Set Text
        if (!caf.Utilities.isEmpty(view.mText))
        {
            view.mElement.innerHTML = view.mText;
        }

        // Set Class.
        caf.Utilities.addClass(view.mElement,view.mClass);

        if (!caf.Utilities.isEmpty(view.mIconName))
        {
            var imgPath='url('+caf.path+'icons/'+view.mIconName+'.png)';
            view.mElement.style.backgroundImage = imgPath;
        }

        // Handle Touch only if needed.
        if ( !caf.Utilities.isEmpty(view.mOnClickFunctions) || !caf.Utilities.isEmpty(view.mActiveClass))
        {
            view.mOnClickFunctions = !caf.Utilities.isEmpty(view.mOnClickFunctions) ?
                view.mOnClickFunctions : function(){};
            view.mActiveClass = !caf.Utilities.isEmpty(view.mActiveClass) ?
                view.mActiveClass : '';

            //Unbind
            caf.Utilities.unbindEvent(view.mElement,'touchstart',view.mOnTouchStartEvent);
            caf.Utilities.unbindEvent(view.mElement,'mousedown',view.mOnTouchStartEvent);
            caf.Utilities.unbindEvent(view.mElement,'touchend',view.mOnTouchEndEvent);
            caf.Utilities.unbindEvent(view.mElement,'mouseup',view.mOnTouchEndEvent);
            caf.Utilities.unbindEvent(view.mElement,'mouseout',view.mOnTouchEndEvent);
            caf.Utilities.unbindEvent(view.mElement,'touchcancel',view.mOnTouchEndEvent);
            caf.Utilities.unbindEvent(view.mElement,'touchmove',view.mOnTouchMoveEvent);
            caf.Utilities.unbindEvent(view.mElement,'mousemove',view.mOnTouchMoveEvent);



            // Create events.
            view.mOnTouchStartEvent = function(e)
            {
                e.preventDefault();
                e.stopPropagation();
                var pointer = caf.Utilities.getPointerEvent(e);
                // caching the start x & y
                view.touchData.startX = pointer.pageX;
                view.touchData.startY = pointer.pageY;
                view.touchData.lastX = pointer.pageX;
                view.touchData.lastY = pointer.pageY;
                caf.Utilities.addClass(view.mElement,view.mActiveClass);
                caf.Utilities.removeClass(view.mElement,view.mActiveClassRemove);
            }
            view.mOnTouchMoveEvent = function(e)
            {
                e.preventDefault();
                var pointer = caf.Utilities.getPointerEvent(e);
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
                if (diffX<boxSize && diffY<boxSize && caf.Views.canClick())
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
                caf.Utilities.removeClass(view.mElement,view.mActiveClass);
                caf.Utilities.addClass(view.mElement,view.mActiveClassRemove);

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
    rebuildAll: function(context)
    {
        var nodeList = (context ||document).getElementsByTagName('*');
        //var nodeArray = [];

        for (var i = 0, node; node = nodeList[i]; i++) {
            this.rebuildView(node);
        }

        return true;
    },
    rebuildViewById: function(id)
    {
        document.getElementById(id);
    },
    rebuildView: function(elm)
    {
        var view;
        if (!caf.Utilities.isEmpty(elm.id) && !caf.Utilities.isEmpty(this.views[elm.id]))
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
            view = caf.View(elm.id);
        }

        view.clear();
        if ( elm.getAttribute('caf-class')  )           view.class(elm.getAttribute('caf-class'));
        if ( elm.getAttribute('caf-active') )           view.activeClass(elm.getAttribute('caf-active'));
        if ( elm.getAttribute('caf-active-remove') )    view.activeClassRemove(elm.getAttribute('caf-active-remove'));
        if ( elm.getAttribute('caf-onclick'))           view.onClick( new Function(elm.getAttribute('caf-onclick')) );
        if ( elm.getAttribute('caf-to-page'))           view.onClick( function() {caf.pager.moveToPage(elm.getAttribute('caf-to-page')); } );
        if ( elm.getAttribute('caf-to-tab')
            && elm.getAttribute('caf-tab-container'))   view.onClick( function() {caf.pager.moveToTab(elm.getAttribute('caf-to-tab'),elm.getAttribute('caf-tab-container')); } );
        if ( elm.getAttribute('caf-drop-menu-overlay-of'))   view.onClick( function() {caf.Utilities.hideOrShow(elm.getAttribute('caf-drop-menu-overlay-of'),'fadein','fadeout',300);; } );
        if ( elm.getAttribute('caf-drop-menu-container')) view.onClick( function() {caf.Utilities.hideOrShow(elm.getAttribute('caf-drop-menu-container'),'fadein','fadeout',300);; } );
        if ( elm.getAttribute('caf-text')   )           view.text(elm.getAttribute('caf-text'));
        if ( elm.getAttribute('caf-iconly') )           view.iconOnly(elm.getAttribute('caf-iconly'));
        if ( elm.getAttribute('caf-icon-right') )       view.iconRight(elm.getAttribute('caf-icon-right'),elm.getAttribute('caf-icon-size') );
        if ( elm.getAttribute('caf-icon-left') )        view.iconLeft(elm.getAttribute('caf-icon-left'),elm.getAttribute('caf-icon-size') );

        // Move to tab.
        if ( elm.getAttribute('caf-current-tab') )
        {
            caf.log(elm.getAttribute('caf-current-tab'));
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
caf.View = function(id)
{
    var elm = document.getElementById(id);
    // Case element creation needed.
    if (caf.Utilities.isEmpty(id) || caf.Utilities.isEmpty(elm))
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
            this.touchData= {
                startX:-100000,
                startY:-100000,
                lastX:-200000,
                lastY:-200000
        }
        },
        needUpdate: function(elm)
        {
            return this.mElementString != caf.Utilities.getElementDef(elm);
        },
        cacheElement:function()
        {
            this.mElementString = caf.Utilities.getElementDef(this.mElement);
        },
        class: function(className,override)
        {
            this.mClass += className;
            if (override)
            {
                this.mClass = className;
            }
            return this;
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
        addElement: function()
        {
            return this;
        },
        build: function()
        {
            var result = caf.Views.buildView(this);
            this.cacheElement();
            return result;
        },
        refresh: function()
        {
            this.build();
        }
    };

    // Add the button to the views list.
    caf.Views.addView(View);

    return View;
}




caf.rebuildAll = function(context)
{
    caf.Views.rebuildAll(context);
};


caf.getElementsByAttribute = function(attribute, context)
{
    var nodeList = (context || document).getElementsByTagName('*');
    var nodeArray = [];

    for (var i = 0, node; node = nodeList[i]; i++) {
        if ( node.getAttribute(attribute) ) nodeArray.push(node);
    }

    return nodeArray;
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
            caf.Utilities.removeClass(tab,'currentTab');
            caf.Utilities.removeClass(tab,'lastTab');
            // Remove hold mark.
            this.removeHoldClass(tab.getAttribute('caf-related-button'));
        }
        caf.Utilities.addClass(currentTab,'lastTab');


        // Set new current tab.
        tabContainer.setAttribute('caf-current-tab',tabId);

        var toShowTab = document.getElementById(tabId);

        caf.Utilities.addClass(toShowTab,'currentTab');
        caf.Utilities.addClass(toShowTab,'hidden');
        toShowTab.clientHeight;
        caf.Utilities.removeClass(toShowTab,'hidden');
        caf.Utilities.addClass(toShowTab,'fadein');
        // on load page.
        caf.pager.onLoadPage(toShowTab);

        window.setTimeout(function(){
            caf.Utilities.removeClass(toShowTab,'fadein');

        },300);

        // Mark button as hold.
        this.addHoldClass(toShowTab.getAttribute('caf-related-button'));

    },
    addHoldClass: function(tabButtonId)
    {
        if (!caf.Utilities.isEmpty(tabButtonId))
        {
            var tabButton = document.getElementById(tabButtonId);
            var holdClass = tabButton.getAttribute('caf-hold');
            if (!caf.Utilities.isEmpty(holdClass))
            {
                caf.Utilities.addClass(tabButton,holdClass);
            }
        }
    },
    removeHoldClass: function(tabButtonId)
    {
        if (!caf.Utilities.isEmpty(tabButtonId))
        {
            var tabButton = document.getElementById(tabButtonId);
            var holdClass = tabButton.getAttribute('caf-hold');
            if (!caf.Utilities.isEmpty(holdClass))
            {
                caf.Utilities.removeClass(tabButton,holdClass);
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

        if (caf.Utilities.isEmpty(lastPageId))
        {
            // on load page.
            caf.pager.onLoadPage(toPageDiv);
            // Hide back button if needed.
            this.checkAndChangeBackButtonState();
            return;
        }


        caf.Utilities.addClass(toPageDiv,'hidden');
        toPageDiv.clientHeight;
        caf.Utilities.removeClass(toPageDiv,'hidden');
        caf.Utilities.addClass(toPageDiv,'fadein');
        // on load page.
        caf.pager.onLoadPage(toPageDiv);
        // Hide back button if needed.
        this.checkAndChangeBackButtonState();

        window.setTimeout(function(){
            caf.Utilities.removeClass(toPageDiv,'fadein');

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

        caf.Utilities.addClass(lastPageDiv,'fadeout');
        // on load page.
        caf.pager.onLoadPage(toPageDiv);
        // Hide back button if needed.
        this.checkAndChangeBackButtonState();

        window.setTimeout(function(){
            caf.Utilities.removeClass(lastPageDiv,'fadeout');
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
        if (caf.Utilities.isEmpty(this.backButtonId)) return;

        if (this.currentPage == this.mainPage)
        {
            caf.Utilities.addClass(document.getElementById(this.backButtonId),'hidden');
        }
        else
        {
            caf.Utilities.removeClass(document.getElementById(this.backButtonId),'hidden');
        }
    }

}