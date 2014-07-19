/**
 * caf ui.
 */
caf.ui = {
    updateKey:0,
    views: {},
    // Save the last click time in order to prevent burst of clicks.
    lastClick:(new Date()).getTime(),
    /**
     * Set Title on the element with the id 'title'.
     * @param title
     */
    title: function(title)
    {
        document.getElementById('title').innerHTML = title;
    },
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

