/**
 * Created by dvirc_000 on 23/09/14.
 */
var CPullToRefresh = Class({
    $singleton: true,
    inPull: false,
    inPullTemplate: null,
    spinnerSize: 60,
    minDistance: 70,
    enabled: true,
    applyPullToRefresh: function(template){
        var element = CUtils.element(template.uid());
        // Set element to be relative.
        element.style.display = 'relative';

        template.events = template.events || {};
        template.pullToRefreshData = {
            started: false,
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
            var isRightClick = ((e.which && e.which == 3) || (e.button && e.button == 2));
            if (isRightClick) return;

            // Disabled.
            if (!CPullToRefresh.enabled)
                return;

            // Check that the scroller is on top.
            var closestScroller = CScrolling.getClosestScrollableObject(template);
            if (CUtils.isEmpty(closestScroller.uid()) ||
                    CScrolling.getScrollerTop(closestScroller.uid())>5){
                return;
            }


            var pointer = CUtils.getPointerEvent(e);
            // caching the start x & y
            template.pullToRefreshData.started    = true;
            template.pullToRefreshData.startX     = pointer.pageX;
            template.pullToRefreshData.startY     = pointer.pageY;
            template.pullToRefreshData.lastX      = pointer.pageX;
            template.pullToRefreshData.lastY      = pointer.pageY;
            //e.preventDefault();

            // Check if template is not showing anymore.
            CPullToRefresh.runNotVisibleCheck(template);
        };
        template.events.onPullToRefreshListenerMove = function(e){
            // Disabled.
            if (!CPullToRefresh.enabled) {
                CPullToRefresh.interrupt();
                return;
            }
            if (template.pullToRefreshData.startY<0) // Not started.
                return;
            var pointer = CUtils.getPointerEvent(e);

            // caching the last x & y
            template.pullToRefreshData.lastX = pointer.pageX;
            template.pullToRefreshData.lastY = pointer.pageY;
            var distance = template.pullToRefreshData.lastY-template.pullToRefreshData.startY;
            distance = distance -10;

            if (distance<=0)
                return;

            distance = distance - (Math.max(0,distance/1.5-10)); // Slower speed when distance is high.
            distance = Math.min(110,distance); // Set max distance
            template.pullToRefreshData.lastDistance = distance;

            // Append element.
            CPullToRefresh.injectSpinner(template);
            CPullToRefresh.inPull = true;
            CPullToRefresh.inPullTemplate = template;
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
                CUtils.isDeepChild(template.uid(),e.toElement)){
                return;
            }

            e.stopPropagation();
            // not need refresh.

            if (template.pullToRefreshData.lastDistance<=CPullToRefresh.minDistance){
                CPullToRefresh.reset(template);
                return;
            }

            // refresh.
            template.reload(null,function(){},null);
            // Reset and remove spinner.
            CPullToRefresh.reset(template);

        };



        // Set Events Handlers.
        element.addEventListener("touchstart",template.events.onPullToRefreshListenerStart);
        element.addEventListener("mousedown",template.events.onPullToRefreshListenerStart);
        element.addEventListener("touchend",template.events.onPullToRefreshListenerEnd);
        element.addEventListener("mouseup",template.events.onPullToRefreshListenerEnd);
        element.addEventListener("mouseout",template.events.onPullToRefreshListenerEnd);
        element.addEventListener("touchcancel",template.events.onPullToRefreshListenerMove);
        element.addEventListener("touchmove",template.events.onPullToRefreshListenerMove);
        element.addEventListener("mousemove",template.events.onPullToRefreshListenerMove);
    },
    runNotVisibleCheck: function (template) {
        CThreads.runTimes(function(){
            if (!template.pullToRefreshData.started)
                return;
            var elm = CUtils.element(template.uid());
            if (elm.clientHeight === 0 && elm.clientWidth === 0)
                CPullToRefresh.reset(template);
        },200,200,20);
    },
    inPullToRefresh: function(){
        return CPullToRefresh.inPull;
    },
    injectSpinner: function (template) {
        if (!CUtils.isEmpty(template.pullToRefreshData.spinnerId))
            return;

        var spinnerId = CObjectsHandler.createObject('LoadSpinner',co()
            .design({position:'absolute',height:CPullToRefresh.spinnerSize,
                        color: template.getLoaderColor()}).build()
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
    interrupt: function(){
        if (!CUtils.isEmpty(CPullToRefresh.inPullTemplate))
            CPullToRefresh.reset(CPullToRefresh.inPullTemplate);
    },
    disable: function(){
        CPullToRefresh.enabled = false;
    },
    enable: function(){
        CPullToRefresh.enabled = true;
    },
    reset: function(template){
        var element = CUtils.element(template.uid());
        element.style.paddingTop = '0px';
        template.pullToRefreshData.started = false;
        template.pullToRefreshData.startX = -100000;
        template.pullToRefreshData.startY = -100000;
        template.pullToRefreshData.lastX = -200000;
        template.pullToRefreshData.lastY = -200000;

        template.removeChild(template.pullToRefreshData.spinnerId||'');
        template.pullToRefreshData.spinnerId = '';

        CThreads.run(function(){
            CPullToRefresh.inPull = false;
            CPullToRefresh.inPullTemplate = null;
        },100);

        template.rebuild();
    }


});


