/**
 * Created by dvirc_000 on 23/09/14.
 */
var CPullToRefresh = Class({
    $singleton: true,
    inPull: false,
    injectedSize: 60,
    applyPullToRefresh: function(container){
        var element = CUtils.element(container.uid());
        // Set element to be relative.
        element.style.display = 'relative';

        container.events = container.events || {};
        container.pullToRefreshData = {
            startX:-100000,
            startY:-100000,
            lastX:-200000,
            lastY:-200000,
            startTime: 0,
            injectedId:''
        };
        //Unbind
        CUtils.unbindEvent(element,'touchstart',container.events.onPullToRefreshListenerStart);
        CUtils.unbindEvent(element,'mousedown',container.events.onPullToRefreshListenerStart);
        CUtils.unbindEvent(element,'touchend',container.events.onPullToRefreshListenerEnd);
        CUtils.unbindEvent(element,'mouseup',container.events.onPullToRefreshListenerEnd);
        CUtils.unbindEvent(element,'mouseout',container.events.onPullToRefreshListenerEnd);
        CUtils.unbindEvent(element,'touchcancel',container.events.onPullToRefreshListenerEnd);
        CUtils.unbindEvent(element,'touchmove',container.events.onPullToRefreshListenerMove);
        CUtils.unbindEvent(element,'mousemove',container.events.onPullToRefreshListenerMove);

        container.events.onPullToRefreshListenerStart = function(e){
            var pointer = CUtils.getPointerEvent(e);
            // caching the start x & y
            container.pullToRefreshData.startX     = pointer.pageX;
            container.pullToRefreshData.startY     = pointer.pageY;
            container.pullToRefreshData.lastX      = pointer.pageX;
            container.pullToRefreshData.lastY      = pointer.pageY;
            container.pullToRefreshData.startTime  = (new  Date()).getTime();
        };
        container.events.onPullToRefreshListenerMove = function(e){
            if (container.pullToRefreshData.startY<0) // Not started.
                return;

            var pointer = CUtils.getPointerEvent(e);
            // caching the last x & y
            container.pullToRefreshData.lastX = pointer.pageX;
            container.pullToRefreshData.lastY = pointer.pageY;
            var distance = container.pullToRefreshData.lastY-container.pullToRefreshData.startY;
            distance = distance -25;
            CLog.dlog('Y Distance: '+distance);
            if (distance<=0)
                return;


            // Append element.
            CPullToRefresh.injectElement(container);
            CPullToRefresh.inPull = true;
            e.stopPropagation();
            e.preventDefault();
            CLog.dlog('Y Distance: '+distance);
            var element = CUtils.element(container.uid());
            element.style.paddingTop = distance+'px';
            CPullToRefresh.getInjectedElement(container).style.top = ((-1)*CPullToRefresh.injectedSize)+distance+'px';
            return true;
        };
        container.events.onPullToRefreshListenerEnd = function(e){
            if (e.srcElement && e.srcElement.id!==container.uid()){
                //CLog.dlog('out: '+e.srcElement.id);
                //CLog.dlog('cid: '+container.uid());

                //return;
            }
//            if (container.onClicks.length>0 && !container.isLink())
//                e.preventDefault();
//
//            var diffX = Math.abs(container.pullToRefreshData.lastX-container.pullToRefreshData.startX);
//            var diffY = Math.abs(container.pullToRefreshData.lastY-container.pullToRefreshData.startY);
//            var boxSize = 15;
//            if (diffX<boxSize && diffY<boxSize && CClicker.canClick() && e.type!='mouseout')
//            {
//                // Execute OnClicks.
//                _.each(container.onClicks,function(onClick){
//                    onClick();
//                },this);
//            }

            // Reset
            var element = CUtils.element(container.uid());
            element.style.paddingTop = '0px';
            container.pullToRefreshData.startX = -100000;
            container.pullToRefreshData.startY = -100000;
            container.pullToRefreshData.lastX = -200000;
            container.pullToRefreshData.lastY = -200000;

            container.removeChild(container.pullToRefreshData.injectedId||'');
            container.pullToRefreshData.injectedId = '';

            CThreads.start(function(){CPullToRefresh.inPull = false},100);

            container.rebuild();
        };



        // Set Events Handlers.
        element.addEventListener("touchstart",container.events.onPullToRefreshListenerStart);
        element.addEventListener("mousedown",container.events.onPullToRefreshListenerStart);
        element.addEventListener("touchend",container.events.onPullToRefreshListenerEnd);
        element.addEventListener("mouseup",container.events.onPullToRefreshListenerEnd);
        //element.addEventListener("mouseout",container.events.onPullToRefreshListenerEnd);
        //element.addEventListener("touchcancel",container.events.onPullToRefreshListenerEnd);
        element.addEventListener("touchmove",container.events.onPullToRefreshListenerMove);
        element.addEventListener("mousemove",container.events.onPullToRefreshListenerMove);

    },
    inPullToRefresh: function(){
        return CPullToRefresh.inPull;
    },
    injectElement: function (container) {
        if (!CUtils.isEmpty(container.pullToRefreshData.injectedId))
            return;

        var injectedId = CObjectsHandler.createObject('Object',co('Object')
            .design({width:'100%',position:'absolute',height:CPullToRefresh.injectedSize,
                color:CColor('Cyan',10),fontStyle:['bold']})
            .icon('rotating16',20)
            .text('Pull To Refresh').build()
        );
        container.pullToRefreshData.injectedId = injectedId;
        container.appendChild(injectedId);
        container.rebuild(function(){
            var injected = CUtils.element(injectedId);
            injected.style.top = '-'+CPullToRefresh.injectedSize+'px';
        });
        CUtils.element(container.uid()).style.overflowY = 'hidden';
    },
    getInjectedElement: function(container){
        return CUtils.element(container.pullToRefreshData.injectedId || '');
    }


});


