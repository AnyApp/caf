/**
 * Created by dvircn on 11/08/14.
 */
var CClicker = Class({
    $singleton: true,
    isScrolling: undefined,
    lastClick: 0,
    /**
     * Prevent burst of clicks.
     */
    canClick: function()
    {
        var currentTime = (new Date()).getTime();
        if (currentTime-CClicker.lastClick>400)
        {
            CClicker.lastClick = currentTime;
            return true;
        }
        return false;
    },
    addOnClick: function(object,onClick) {
        // Set on click-able.
        if (CUtils.isEmpty(object.onClicks))
            CClicker.setOnClickable(object);
        // Add onclick.
        if (onClick)
            object.onClicks.push(onClick);
    },
    setOnClickable: function(object){
        // Init
        var design = object.getDesign();
        // Check
        object.clicker = {};
        object.clicker.activeClasses       = CDesigner.designToClasses(CDesigner.mergeParents(object.getDesign()||{}).active);
        object.clicker.activeRemoveClasses = CDesigner.designToClasses(CDesigner.mergeParents(object.getDesign()||{}).activeRemove);
        object.doStopPropogation = object.doStopPropogation || false;
        object.touchData = {
            startX:-100000,
            startY:-100000,
            lastX:-200000,
            lastY:-200000,
            startTime: 0
        };
        object.events = {onTouchStartEvent:null,onTouchEndEvent:null,onTouchMoveEvent:null};
        object.onClicks = Array();

        var element = CUtils.element(object.uid());
        //Unbind
        CUtils.unbindEvent(element,'touchstart',object.events.onTouchStartEvent);
        CUtils.unbindEvent(element,'mousedown',object.events.onTouchStartEvent);
        CUtils.unbindEvent(element,'touchend',object.events.onTouchEndEvent);
        CUtils.unbindEvent(element,'mouseup',object.events.onTouchEndEvent);
        CUtils.unbindEvent(element,'mouseout',object.events.onTouchEndEvent);
        CUtils.unbindEvent(element,'touchcancel',object.events.onTouchEndEvent);
        CUtils.unbindEvent(element,'touchmove',object.events.onTouchMoveEvent);
        CUtils.unbindEvent(element,'mousemove',object.events.onTouchMoveEvent);


        // Create events.
        object.events.onTouchStartEvent = function(e)
        {
            var isRightClick = ((e.which && e.which == 3) || (e.button && e.button == 2));
            if (isRightClick) return false;

//            e.preventDefault();

            if (object.logic.doStopPropagation===true)
                e.stopPropagation();

            var pointer = CUtils.getPointerEvent(e);
            // caching the start x & y
            object.touchData.startX     = pointer.pageX;
            object.touchData.startY     = pointer.pageY;
            object.touchData.lastX      = pointer.pageX;
            object.touchData.lastY      = pointer.pageY;
            object.touchData.startTime  = (new  Date()).getTime();
            CUtils.addClass(element,object.clicker.activeClasses);
            CUtils.removeClass(element,object.clicker.activeRemoveClasses);
        }
        object.events.onTouchMoveEvent = function(e)
        {
            var currentTime = (new  Date()).getTime();
            var pointer = CUtils.getPointerEvent(e);
            // caching the last x & y
            object.touchData.lastX = pointer.pageX;
            object.touchData.lastY = pointer.pageY;
            var isSwipeEvent = CClicker.isTouchOutOfBoundries(object,30,30);
            if (isSwipeEvent)
                CClicker.resetTouch(object);
        }
        object.events.onTouchEndEvent = function(e)
        {
            var notAClick = CClicker.isTouchOutOfBoundries(object,15,15);
            if (!notAClick && CClicker.canClick() && e.type!='mouseout'
                && !CPullToRefresh.inPullToRefresh())
            {
                if (object.onClicks.length>0)
                    e.preventDefault();
                // Execute OnClicks.
                _.each(object.onClicks,function(onClick){
                    onClick();
                },this);
            }
            // Reset
            CClicker.resetTouch(object);

        }

        // Set Events Handlers.
        element.addEventListener("touchstart",object.events.onTouchStartEvent);
        element.addEventListener("mousedown",object.events.onTouchStartEvent);
        element.addEventListener("touchend",object.events.onTouchEndEvent);
        element.addEventListener("mouseup",object.events.onTouchEndEvent);
        element.addEventListener("mouseout",object.events.onTouchEndEvent);
        element.addEventListener("touchcancel",object.events.onTouchMoveEvent);
        element.addEventListener("touchmove",object.events.onTouchMoveEvent);
        element.addEventListener("mousemove",object.events.onTouchMoveEvent);

    },
    isTouchOutOfBoundries: function(object,radiusX,radiusY){
        var diffX = Math.abs(object.touchData.lastX-object.touchData.startX);
        var diffY = Math.abs(object.touchData.lastY-object.touchData.startY);
        return diffX > radiusX || diffY > radiusY;
    },
    resetTouch: function(object){
        var element = CUtils.element(object.uid());
        object.touchData.startX = -100000;
        object.touchData.startY = -100000;
        object.touchData.lastX = -200000;
        object.touchData.lastY = -200000;
        CUtils.removeClass(element,object.clicker.activeClasses);
        CUtils.addClass(element,object.clicker.activeRemoveClasses);
    }


});

window.setTimeout(function(){
    body.cinScroll = false;
    body.touchData = {
        startX:-100000,
        startY:-100000,
        lastX:-200000,
        lastY:-200000,
        startTime: 0
    };
    body.events = {};
    body.events.onTouchStartEvent = function(e){
        var pointer = CUtils.getPointerEvent(e);
        // caching the start x & y
        body.touchData.startX     = pointer.pageX;
        body.touchData.startY     = pointer.pageY;
        body.touchData.lastX      = pointer.pageX;
        body.touchData.lastY      = pointer.pageY;
        body.touchData.startTime  = (new  Date()).getTime();
        body.cinScroll = false;
    };
    body.events.onTouchMoveEvent = function(e){
        var pointer = CUtils.getPointerEvent(e);
        // caching the last x & y
        body.touchData.lastX = pointer.pageX;
        body.touchData.lastY = pointer.pageY;
        var isScrollEvent = CClicker.isTouchOutOfBoundries(body,3,500) &&
            body.touchData.lastX !== 0 && body.touchData.lastY !== 0;
        CLog.dlog('XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX');
        CLog.dlog(body.cinScroll);
        CLog.dlog(isScrollEvent);
        CLog.dlog(body.touchData.lastX !== 0 && body.touchData.lastY !== 0);
        CLog.dlog(CClicker.isTouchOutOfBoundries(body,0,500));
        CLog.dlog(body.touchData);
        CLog.dlog('XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX');
        if (!isScrollEvent && body.cinScroll === false)
            e.preventDefault();
        else
            body.cinScroll = true;
    };
    body.events.onTouchEndEvent = function(e){
        body.touchData = {
            startX:-100000,
            startY:-100000,
            lastX:-200000,
            lastY:-200000,
            startTime: 0
        };
        body.cinScroll = false;
    };

//    body.addEventListener("touchstart",body.events.onTouchStartEvent);
//    body.addEventListener("mousedown",body.events.onTouchStartEvent);
//    body.addEventListener("touchend",body.events.onTouchEndEvent);
//    body.addEventListener("mouseup",body.events.onTouchEndEvent);
//    body.addEventListener("mouseout",body.events.onTouchEndEvent);
//    body.addEventListener("touchcancel",body.events.onTouchMoveEvent);
//    body.addEventListener("touchmove",body.events.onTouchMoveEvent);
//    body.addEventListener("mousemove",body.events.onTouchMoveEvent);

},600)

