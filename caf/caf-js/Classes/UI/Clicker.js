/**
 * Created by dvircn on 11/08/14.
 */
var CClicker = Class({
    $singleton: true,
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
        object.onClicks.push(onClick);
    },
    setOnClickable: function(object){
        // Init
        var design = object.getDesign();
        design.active       = design.active         || '';
        design.activeRemove = design.activeRemove   || '';
        object.doStopPropogation = object.doStopPropogation || false;
        object.touchData = {
            startX:-100000,
            startY:-100000,
            lastX:-200000,
            lastY:-200000
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

            e.preventDefault();
            if (object.doStopPropogation)
            {
                e.stopPropagation();
            }

            var pointer = CUtils.getPointerEvent(e);
            // caching the start x & y
            object.touchData.startX = pointer.pageX;
            object.touchData.startY = pointer.pageY;
            object.touchData.lastX = pointer.pageX;
            object.touchData.lastY = pointer.pageY;
            CUtils.addClass(element,object.getDesign().active);
            CUtils.removeClass(element,object.getDesign().activeRemove);
        }
        object.events.onTouchMoveEvent = function(e)
        {
            e.preventDefault();
            var pointer = CUtils.getPointerEvent(e);
            // caching the last x & y
            object.touchData.lastX = pointer.pageX;
            object.touchData.lastY = pointer.pageY;
        }
        object.events.onTouchEndEvent = function(e)
        {
            e.preventDefault();

            var diffX = Math.abs(object.touchData.lastX-object.touchData.startX);
            var diffY = Math.abs(object.touchData.lastY-object.touchData.startY);
            var boxSize = 15;
            if (diffX<boxSize && diffY<boxSize && CClicker.canClick() && e.type!='mouseout')
            {
                // Execute OnClicks.
                _.each(object.onClicks,function(onClick){
                    onClick();
                },this);
            }
            // Reset
            object.touchData.startX = -100000;
            object.touchData.startY = -100000;
            object.touchData.lastX = -200000;
            object.touchData.lastY = -200000;
            CUtils.removeClass(element,object.getDesign().active);
            CUtils.addClass(element,object.getDesign().activeRemove);

        }

        // Set Events Handlers.
        element.addEventListener("touchstart",object.events.onTouchStartEvent);
        element.addEventListener("mousedown",object.events.onTouchStartEvent);
        element.addEventListener("touchend",object.events.onTouchEndEvent);
        element.addEventListener("mouseup",object.events.onTouchEndEvent);
        element.addEventListener("mouseout",object.events.onTouchEndEvent);
        element.addEventListener("touchcancel",object.events.onTouchEndEvent);
        element.addEventListener("touchmove",object.events.onTouchMoveEvent);
        element.addEventListener("mousemove",object.events.onTouchMoveEvent);

    }


});


