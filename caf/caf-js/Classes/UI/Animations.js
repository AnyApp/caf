/**
 * Created by dvircn on 12/08/14.
 */
var CAnimations = Class({
    $singleton: true,
    applyAnimation: function(objectId,anim,duration,onComplete){
        this[anim](CUtils.element(objectId),duration,onComplete);
    },
    /* Animate view with fade in or out */
    fadeIn: function(elm,time,onEnter) {
        onEnter = onEnter || function(){};
        CUtils.addClass(elm,'hidden');
        var clientHeight = elm.clientHeight;
        CUtils.removeClass(elm,'hidden');
        CUtils.addClass(elm,'fadein'+time);
        window.setTimeout(function(){
            CUtils.removeClass(elm,'fadein'+time);
            onEnter();
        },time);
    },
    fadeOut: function(elm,time,onOut) {
        onOut = onOut || function(){};
        CUtils.addClass(elm,'fadeout'+time);
        window.setTimeout(function(){
            CUtils.removeClass(elm,'fadeout'+time);
            onOut();
        },time);
    }
    
});


