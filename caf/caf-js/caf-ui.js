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
    removeViewIfNotExist: function(view){
        if (caf.utils.isEmpty(document.getElementById(view.id)) )
        {
            delete this.views[view.id];
        }
    },
    removeNotExistingViews: function(){
        for (var iView in this.views)
        {
            this.removeViewIfNotExist(this.views[iView]);
        }
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
                var isRightClick = ((e.which && e.which == 3) || (e.button && e.button == 2));
                if (isRightClick) return false;

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
                if (diffX<boxSize && diffY<boxSize && caf.ui.canClick() && e.type!='mouseout')
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
        var start = new Date().getTime();

        /* Remove not exist elements. */
        this.removeNotExistingViews();

        var nodeList = (root ||document).getElementsByTagName('*');
        //var nodeArray = [];

        for (var i = 0, node; node = nodeList[i]; i++) {
            this.scanView(node);
        }

        caf.log( ((new Date()).getTime() - start) /1000);
        //alert(((new Date()).getTime() - start) /1000);
        return true;
    },
    rebuildFrom: function(root)
    {
        return this.rebuildAll(root);
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
        var isCAF= caf.utils.getElementDef(elm).indexOf("data-caf-")>0;
        if (!isCAF)
        {
            return false;
        }

        var view;
        if (!caf.utils.isEmpty(elm.id) && !caf.utils.isEmpty(this.views[elm.id]))
        {
            view = this.views[elm.id];
        }
        else
        {
            view = caf.ui.view(elm.id);
        }

        var needRebuild = view.applyAttributes();

        //view.clear();

        if (needRebuild)
        {
            view.prepareBuild();
            //caf.log(elm.id);
        }
    }

}

