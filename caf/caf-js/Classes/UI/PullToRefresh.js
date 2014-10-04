/**
 * Created by dvirc_000 on 23/09/14.
 */
var CPullToRefresh = Class({
    $singleton: true,
    inPull: false,
    spinnerSize: 60,
    minDistance: 70,
    applyPullToRefresh: function(template){
        var element = CUtils.element(template.uid());
        // Set element to be relative.
        element.style.display = 'relative';

        template.events = template.events || {};
        template.pullToRefreshData = {
            startX:-100000,
            startY:-100000,
            lastX:-200000,
            lastY:-200000,
            lastDistance: 0,
            startTime: 0,
            spinnerId:''
        };
        //Unbind
        CUtils.unbindEvent(element,'touchstart',template.events.onPullToRefreshListenerStart);
        CUtils.unbindEvent(element,'mousedown',template.events.onPullToRefreshListenerStart);
        CUtils.unbindEvent(element,'touchend',template.events.onPullToRefreshListenerEnd);
        CUtils.unbindEvent(element,'mouseup',template.events.onPullToRefreshListenerEnd);
        CUtils.unbindEvent(element,'mouseout',template.events.onPullToRefreshListenerEnd);
        CUtils.unbindEvent(element,'touchcancel',template.events.onPullToRefreshListenerEnd);
        CUtils.unbindEvent(element,'touchmove',template.events.onPullToRefreshListenerMove);
        CUtils.unbindEvent(element,'mousemove',template.events.onPullToRefreshListenerMove);

        template.events.onPullToRefreshListenerStart = function(e){
            // Check that the scroller is on top.
            var closestScroller = template.getClosestScroller();
            if (CUtils.isEmpty(closestScroller) || closestScroller.getScrollTop()>5){
                CLog.dlog(closestScroller.getScrollTop());
                return;
            }


            var pointer = CUtils.getPointerEvent(e);
            // caching the start x & y
            template.pullToRefreshData.startX     = pointer.pageX;
            template.pullToRefreshData.startY     = pointer.pageY;
            template.pullToRefreshData.lastX      = pointer.pageX;
            template.pullToRefreshData.lastY      = pointer.pageY;
            e.preventDefault();
        };
        template.events.onPullToRefreshListenerMove = function(e){
            if (template.pullToRefreshData.startY<0) // Not started.
                return;
            var pointer = CUtils.getPointerEvent(e);

            // caching the last x & y
            template.pullToRefreshData.lastX = pointer.pageX;
            template.pullToRefreshData.lastY = pointer.pageY;
            var distance = template.pullToRefreshData.lastY-template.pullToRefreshData.startY;
            distance = distance -50;

            if (distance<=0)
                return;

            distance = distance - (Math.max(0,distance/1.5-30)); // Slower speed when distance is high.
            distance = Math.min(110,distance); // Set max distance
            template.pullToRefreshData.lastDistance = distance;

            // Append element.
            CPullToRefresh.injectSpinner(template);
            CPullToRefresh.inPull = true;
            e.stopPropagation();
            e.preventDefault();

            var element = CUtils.element(template.uid());
            element.style.paddingTop = distance+'px';
            CPullToRefresh.getInjectedSpinner(template).style.top = ((-1)*CPullToRefresh.spinnerSize)+distance+'px';
            if (distance>CPullToRefresh.minDistance)
                CObjectsHandler.object(template.pullToRefreshData.spinnerId).startSpin();

        };
        template.events.onPullToRefreshListenerEnd = function(e){
            if (!CPullToRefresh.inPull) // Not started.
                return;

            var pointer = CUtils.getPointerEvent(e);

            if (pointer && pointer.type && pointer.type ==='mouseout' &&
                CPullToRefresh.isDeepChild(template.uid(),e.toElement)){
                return;
            }

            e.stopPropagation();
            // not need refresh.

            if (template.pullToRefreshData.lastDistance<=CPullToRefresh.minDistance){
                CPullToRefresh.reset(template);}

            // refresh.
            template.reload(null,function(){
                // Reset
                CPullToRefresh.reset(template);
            },null);

        };



        // Set Events Handlers.
        element.addEventListener("touchstart",template.events.onPullToRefreshListenerStart);
        element.addEventListener("mousedown",template.events.onPullToRefreshListenerStart);
        element.addEventListener("touchend",template.events.onPullToRefreshListenerEnd);
        element.addEventListener("mouseup",template.events.onPullToRefreshListenerEnd);
        element.addEventListener("mouseout",template.events.onPullToRefreshListenerEnd);
        element.addEventListener("touchcancel",template.events.onPullToRefreshListenerEnd);
        element.addEventListener("touchmove",template.events.onPullToRefreshListenerMove);
        element.addEventListener("mousemove",template.events.onPullToRefreshListenerMove);
    },
    inPullToRefresh: function(){
        return CPullToRefresh.inPull;
    },
    injectSpinner: function (template) {
        if (!CUtils.isEmpty(template.pullToRefreshData.spinnerId))
            return;

        var spinnerId = CObjectsHandler.createObject('LoadSpinner',co()
            .design({position:'absolute',height:CPullToRefresh.spinnerSize}).build()
        );
        template.pullToRefreshData.spinnerId = spinnerId;
        template.appendChild(spinnerId);
        template.rebuild(function(){
            var spinner = CUtils.element(spinnerId);
            spinner.style.top = '-'+CPullToRefresh.spinnerSize+'px';
        });
        CUtils.element(template.uid()).style.overflowY = 'hidden';
    },
    getInjectedSpinner: function(template){
        return CUtils.element(template.pullToRefreshData.spinnerId || '');
    },
    reset: function(template){
        var element = CUtils.element(template.uid());
        element.style.paddingTop = '0px';
        template.pullToRefreshData.startX = -100000;
        template.pullToRefreshData.startY = -100000;
        template.pullToRefreshData.lastX = -200000;
        template.pullToRefreshData.lastY = -200000;

        template.removeChild(template.pullToRefreshData.spinnerId||'');
        template.pullToRefreshData.spinnerId = '';

        CThreads.run(function(){CPullToRefresh.inPull = false;},100);

        template.rebuild();
    },
    isDeepChild: function(parentId,element){
        if (CUtils.isEmpty(element))
            return false;
        return parentId === element.id || CPullToRefresh.isDeepChild(parentId,element.parentElement);
    }


});


