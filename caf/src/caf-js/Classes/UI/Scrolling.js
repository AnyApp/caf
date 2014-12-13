/**
 * Created by dvircn on 12/08/14.
 */
var CScrolling = Class({
    $singleton: true,
    scrollers: {},
    isNative: null,
    setScrollable: function(object){
        object.logic              = object.logic || {};
        object.design             = object.design ||{};
        object.logic.scrollable   = true;
        object.design.scrollable  = true;
    },
    scrollableClass: function(){
        return 'overthrow';
    },
    isScroller: function(object){
        if (CScrolling.isNativeScrolling())
            return object.getClasses().indexOf(CScrolling.scrollableClass()) > 0;
        else
            return !CUtils.isEmpty(object.scroller);
    },
    isNativeScrolling: function(){
        if (this.isNative===null){
            this.isNative = ! (CPlatforms.isAndroid() && CPlatforms.androidSeries()>0 &&
                                CPlatforms.androidSeries()<4);
        }
        return this.isNative;
    },
    getScrollerTop: function(scrollerId){
        if (CScrolling.isNativeScrolling()) {
            var element = CUtils.element(scrollerId);
            if (!CUtils.isEmpty(element))
                return element.scrollTop;
        }
        else {
            var scroller = CObjectsHandler.object(scrollerId).scroller;
            if (!CUtils.isEmpty(scroller))
                return scroller.getScrollTop();
        }
        return 10000000;
    },
    getClosestScrollableObject: function(object){
        if (CScrolling.isScroller(object))
            return object;
        var parent = CObjectsHandler.object(object.parent);
        if (!CUtils.isEmpty(parent))
            return CScrolling.getClosestScrollableObject(parent);
        return null;
    }
});


