/**
 * Created by dvircn on 12/08/14.
 */
var CAnimations = Class({
    $singleton: true,
    noDisplay: 'displayNone',
    defaultAnim: 'rotateCarouselRight',
    inAnim: false,
    anims: {
        fade: {'in':'pt-page-fadeIn',out:'pt-page-fadeOut et-page-ontop',duration:600},
        rotateFall: {'in':'pt-page-scaleUp',out:'pt-page-rotateFall et-page-ontop',duration:1000},
        rotateNewspaper: {'in':'pt-page-rotateInNewspaper pt-page-delay500',out:'pt-page-rotateOutNewspaper',duration:1000},
        rotateSlide: {'in':'pt-page-rotateSlideIn pt-page-delay200',out:'pt-page-rotateSlideOut',duration:1200},
        rotateSlide2: {'in':'pt-page-rotateSlideIn',out:'pt-page-rotateSlideOut',duration:1000},
        rotateCarouselBottom: {'in':'pt-page-rotateCarouselBottomIn',out:'pt-page-rotateCarouselBottomOut et-page-ontop',duration:800},
        rotateCarouselTop: {'in':'pt-page-rotateCarouselTopIn',out:'pt-page-rotateCarouselTopOut et-page-ontop',duration:800},
        rotateCarouselRight: {'in':'pt-page-rotateCarouselRightIn',out:'pt-page-rotateCarouselRightOut et-page-ontop',duration:800},
        rotateCarouselLeft: {'in':'pt-page-rotateCarouselLeftIn',out:'pt-page-rotateCarouselLeftOut et-page-ontop',duration:800},
        rotateCubeBottom: {'in':'pt-page-rotateCubeBottomIn',out:'pt-page-rotateCubeBottomOut et-page-ontop',duration:600},
        rotateCubeTop: {'in':'pt-page-rotateCubeTopIn',out:'pt-page-rotateCubeTopOut et-page-ontop',duration:600},
        rotateCubeRight: {'in':'pt-page-rotateCubeRightIn',out:'pt-page-rotateCubeRightOut et-page-ontop',duration:600},
        rotateCubeLeft: {'in':'pt-page-rotateCubeLeftIn',out:'pt-page-rotateCubeLeftOut et-page-ontop',duration:600},
        rotateRoomBottom: {'in':'pt-page-rotateRoomBottomIn',out:'pt-page-rotateRoomBottomOut et-page-ontop',duration:800},
        rotateRoomTop: {'in':'pt-page-rotateRoomTopIn',out:'pt-page-rotateRoomTopOut et-page-ontop',duration:800},
        rotateRoomRight: {'in':'pt-page-rotateRoomRightIn',out:'pt-page-rotateRoomRightOut et-page-ontop',duration:800},
        rotateRoomLeft: {'in':'pt-page-rotateRoomLeftIn',out:'pt-page-rotateRoomLeftOut et-page-ontop',duration:800},
        rotateUnfoldBottom: {'in':'pt-page-rotateUnfoldBottom',out:'pt-page-moveToTopFade',duration:700},
        rotateUnfoldTop: {'in':'pt-page-rotateUnfoldTop',out:'pt-page-moveToBottomFade',duration:700},
        rotateUnfoldRight: {'in':'pt-page-rotateUnfoldRight',out:'pt-page-moveToLeftFade',duration:700},
        rotateUnfoldLeft: {'in':'pt-page-rotateUnfoldLeft',out:'pt-page-moveToRightFade',duration:700},
        moveToTopFade: {'in':'pt-page-moveFromBottomFade',out:'pt-page-rotateFoldTop',duration:700},
        moveToBottomFade: {'in':'pt-page-moveFromTopFade',out:'pt-page-rotateFoldBottom',duration:700},
        moveToRightFade: {'in':'pt-page-moveFromLeftFade',out:'pt-page-rotateFoldRight',duration:700},
        moveToLeftFade: {'in':'pt-page-moveFromRightFade',out:'pt-page-rotateFoldLeft',duration:700},
        moveToTopFade2: {'in':'pt-page-moveFromBottomFade',out:'pt-page-moveToTopFade',duration:700},
        moveToBottomFade2: {'in':'pt-page-moveFromTopFade',out:'pt-page-moveToBottomFade',duration:700},
        moveToRightFade2: {'in':'pt-page-moveFromLeftFade',out:'pt-page-moveToRightFade',duration:700},
        moveToLeftFade2: {'in':'pt-page-moveFromRightFade',out:'pt-page-moveToLeftFade',duration:700},
        moveToTopFade3: {'in':'pt-page-moveFromBottom',out:'pt-page-fade',duration:700},
        moveToBottomFade3: {'in':'pt-page-moveFromTop',out:'pt-page-fade',duration:700},
        moveToRightFade3: {'in':'pt-page-moveFromLeft',out:'pt-page-fade',duration:700},
        moveToLeftFade3: {'in':'pt-page-moveFromRight',out:'pt-page-fade',duration:700},
        rotatePullBottom: {'in':'pt-page-rotatePullBottom pt-page-delay180',out:'pt-page-rotatePushBottom',duration:800},
        rotatePullTop: {'in':'pt-page-rotatePullTop pt-page-delay180',out:'pt-page-rotatePushTop',duration:800},
        rotatePullRight: {'in':'pt-page-rotatePullRight pt-page-delay180',out:'pt-page-rotatePushRight',duration:800},
        rotatePullLeft: {'in':'pt-page-rotatePullLeft pt-page-delay180',out:'pt-page-rotatePushLeft',duration:800},
        flipBottom: {'in':'pt-page-flipInBottom pt-page-delay500',out:'pt-page-flipOutTop',duration:1000},
        flipTop: {'in':'pt-page-flipInTop pt-page-delay500',out:'pt-page-flipOutBottom',duration:1000},
        flipLeft: {'in':'pt-page-flipInLeft pt-page-delay500',out:'pt-page-flipOutRight',duration:1000},
        flipRight: {'in':'pt-page-flipInRight pt-page-delay500',out:'pt-page-flipOutLeft',duration:1000},
        moveToTop: {'in':'pt-page-moveFromBottom pt-page-delay20 et-page-ontop',out:'pt-page-rotateBottomSideFirst',duration:800},
        moveToBottom: {'in':'pt-page-moveFromTop pt-page-delay20 et-page-ontop',out:'pt-page-rotateTopSideFirst',duration:800},
        moveToRight: {'in':'pt-page-moveFromLeft pt-page-delay20 et-page-ontop',out:'pt-page-rotateLeftSideFirst',duration:800},
        moveToLeft: {'in':'pt-page-moveFromRight pt-page-delay20 et-page-ontop',out:'pt-page-rotateRightSideFirst',duration:800},
        moveToTop2: {'in':'pt-page-moveFromBottom',out:'pt-page-rotatePushTop',duration:800},
        moveToBottom2: {'in':'pt-page-moveFromTop',out:'pt-page-rotatePushBottom',duration:800},
        moveToRight2: {'in':'pt-page-moveFromLeft',out:'pt-page-rotatePushRight',duration:800},
        moveToLeft2: {'in':'pt-page-moveFromRight',out:'pt-page-rotatePushLeft',duration:800},
        moveToTop3: {'in':'pt-page-moveFromBottom',out:'pt-page-moveToTop',duration:600},
        moveToBottom3: {'in':'pt-page-moveFromTop',out:'pt-page-moveToBottom',duration:600},
        moveToRight3: {'in':'pt-page-moveFromLeft',out:'pt-page-moveToRight',duration:600},
        moveToLeft3: {'in':'pt-page-moveFromRight',out:'pt-page-moveToLeft',duration:600},
        scaleUpCenter: {'in':'pt-page-scaleUpCenter pt-page-delay400',out:'pt-page-scaleDownCenter',duration:800},
        scaleUpToBottom: {'in':'pt-page-scaleUp et-page-ontop',out:'pt-page-moveToBottom',duration:700},
        scaleUpToTop: {'in':'pt-page-scaleUp et-page-ontop',out:'pt-page-moveToTop',duration:700},
        scaleUpToLeft: {'in':'pt-page-scaleUp et-page-ontop',out:'pt-page-moveToLeft',duration:700},
        scaleUpToRight: {'in':'pt-page-scaleUp et-page-ontop',out:'pt-page-moveToRight',duration:700},
        scaleDownFromBottom: {'in':'pt-page-moveFromBottom et-page-ontop',out:'pt-page-scaleDown',duration:700},
        scaleDownFromTop: {'in':'pt-page-moveFromTop et-page-ontop',out:'pt-page-scaleDown',duration:700},
        scaleDownFromLeft: {'in':'pt-page-moveFromLeft et-page-ontop',out:'pt-page-scaleDown',duration:700},
        scaleDownFromRight: {'in':'pt-page-moveFromRight et-page-ontop',out:'pt-page-scaleDown',duration:700},
        scaleDownUp: {'in':'pt-page-scaleUp pt-page-delay300',out:'pt-page-scaleDownUp',duration:1000},
        scaleUpDown: {'in':'pt-page-scaleUpDown pt-page-delay300',out:'pt-page-scaleDown',duration:1000},
        easeToBottom: {'in':'pt-page-moveFromTop',out:'pt-page-moveToBottomEasing et-page-ontop',duration:700},
        easeToTop: {'in':'pt-page-moveFromBottom',out:'pt-page-moveToTopEasing et-page-ontop',duration:700},
        easeToRight: {'in':'pt-page-moveFromLeft',out:'pt-page-moveToLeftEasing et-page-ontop',duration:700},
        easeToLeft: {'in':'pt-page-moveFromRight',out:'pt-page-moveToRightEasing et-page-ontop',duration:700}

    },
    init: function(object){
        object.data.animation           = object.data.animation             || CAnimations.defaultAnim;
        object.data.onAnimShowComplete  = object.data.onAnimShowComplete    || function(){};
        object.data.onAnimHideComplete  = object.data.onAnimHideComplete    || function(){};
        object.data.inAnim              = true;
        object.data.lastOnEnd           = 0;
        object.data.lastOnStart         = 0;
    },
    cascadeAnimate: function(objects,intervals,animations,start){
        start = start || 0;
        if (CUtils.isEmpty(objects) || CUtils.isEmpty(animations))
            return;
        // Setup animations.
        animations = CAnimations.cascadeAnimateSetupAnimations(animations,objects.length);
        // Animate each object after the last one finished.
        if (CUtils.isEmpty(intervals)){
            CAnimations.cascadeAnimateEachAfterEnd(objects,animations);
            return;
        }
        // Setup intervals
        intervals = CAnimations.cascadeAnimateSetupIntervals(intervals,objects.length);
        // Do Cascade animate.
        for (var i in objects){
            var objectId = objects[i];
            // Run animation
            CThreads.run(
                CAnimations.createCascadeShowFunction(objectId,animations[i]),
                intervals[i]+start // Run time.
            );
        }
    },
    createCascadeShowFunction: function(objectId,animation){
        return function(){
            CAnimations.show(objectId,{animation:animation});
        };
    },
    cascadeAnimateSetupAnimations: function(animations,total){
        if (CUtils.isString(animations))
            animations = [animations];
        while (animations.length < total)
            animations.push(animations[0]);
        return animations;
    },
    cascadeAnimateSetupIntervals: function(intervals,total){
        // If Array, return, else: number, setup intervals.
        if (CUtils.isArray(intervals))
            return intervals;
        interval = Number(intervals); // intervals is a number.
        intrvals = [];
        for (var i=0;i<total;i++) {
            intrvals.push(interval * i);
        }
        return intrvals;
    },
    cascadeAnimateEachAfterEnd: function(objects,animations){
        for (var i in objects){
            var index       = Number(i);
            var objectId    = objects[index];

            var nextObjectId    = objects[index+1];
            var object          = CObjectsHandler.object(objectId);
            object.data.animation = animations[index] || '';

            if (index+1 < objects.length)
                object.data.onAnimShowComplete = CAnimations.createCascadeEachAfterEndFunction(nextObjectId);
        }

        CAnimations.show(objects[0]);
    },
    createCascadeEachAfterEndFunction: function(nextObjectId){
        return function(){
            CAnimations.show(nextObjectId);
        };
    },
    objectInAnim: function(object){
        return object.data.inAnim===true;
    },
    prepareObjectAnimation: function(caller,objectId,options){
        var object = CObjectsHandler.object(objectId);
        // Wait until current animation is finished.
        if (CAnimations.objectInAnim(object)){
            CThreads.run(function(){caller(objectId,options);},100);
            return null;
        }

        CAnimations.init(object);
        options                          = options || {};
        var finalOptions                 = {};
        finalOptions.animation           = options.animation             || object.data.animation;
        finalOptions.onAnimShowComplete  = options.onAnimShowComplete    || object.data.onAnimShowComplete;
        finalOptions.onAnimHideComplete  = options.onAnimHideComplete    || object.data.onAnimHideComplete;
        finalOptions.object              = object;
        return finalOptions;
    },
    hideOrShow: function(objectId,options){
        options = options || {};
        var elm = CUtils.element(objectId);
        if (CUtils.hasClass(elm,CAnimations.noDisplay))
            CAnimations.show(objectId,options);
        else
            CAnimations.hide(objectId,options);
    },
    show: function(objectId,options){
        var fOptions = CAnimations.prepareObjectAnimation(CAnimations.show,objectId,options);
        if (!CUtils.isEmpty(fOptions))
            CAnimations.animateIn(fOptions.object,CUtils.element(objectId),fOptions.animation,fOptions.onAnimShowComplete);
    },
    hide: function(objectId,options){
        var fOptions = CAnimations.prepareObjectAnimation(CAnimations.hide,objectId,options);
        if (!CUtils.isEmpty(fOptions))
            CAnimations.animateOut(fOptions.object,CUtils.element(objectId),fOptions.animation,fOptions.onAnimHideComplete);
    },
    quickShow: function(objectId,options){
        var fOptions = CAnimations.prepareObjectAnimation(CAnimations.quickShow,objectId,options);
        if (!CUtils.isEmpty(fOptions)){
            CUtils.removeClass(CUtils.element(objectId),CAnimations.noDisplay);
            fOptions.object.data.inAnim = false;
        }
    },
    quickHide: function(objectId,options){
        var fOptions = CAnimations.prepareObjectAnimation(CAnimations.quickHide,objectId,options);
        if (!CUtils.isEmpty(fOptions)){
            CUtils.addClass(CUtils.element(objectId),CAnimations.noDisplay);
            fOptions.object.data.inAnim = false;
        }
    },
    animateIn: function(object,elm,anim,onFinish){
        CUtils.removeClass(elm,CAnimations.noDisplay);
        CUtils.removeClass(elm,CAnimations.anims[anim]['out']);

        CUtils.addClass(elm,CAnimations.anims[anim]['in']);
        //window.setTimeout(,CAnimations.anims[anim].duration);
        var animEnd = function(){
            // Make sure this function called once per event end.
            var time = (new Date()).getTime();
            if (time-object.data.lastOnEnd<30)
                return;
            object.data.lastOnEnd = time;
            object.data.inAnim = false;
            CUtils.removeClass(elm,CAnimations.anims[anim]['in']);
            onFinish();
            CAnimations.unbindAnimationEnd(object,elm);
        };
        this.bindAnimationEnd(object,elm,animEnd);
    },
    animateOut: function(object,elm,anim,onFinish){
        CUtils.removeClass(elm,CAnimations.anims[anim]['in']);
        CUtils.addClass(elm,CAnimations.anims[anim]['out']);

        var animEnd = function(){
            // Make sure this function called once per event end.
            var time = (new Date()).getTime();
            if (time-object.data.lastOnEnd<30)
                return;
            object.data.lastOnEnd = time;
            object.data.inAnim = false;
            CUtils.addClass(elm,CAnimations.noDisplay);
            CUtils.removeClass(elm,CAnimations.anims[anim]['out']);
            onFinish();
            CAnimations.unbindAnimationEnd(object,elm);
        };
        this.bindAnimationEnd(object,elm,animEnd);
    },
    bindAnimationEnd: function(object,elm,callback){
        if (CUtils.isEmpty(elm)){
            callback();
            return;
        }

        elm.addEventListener("animationend", callback, false);
        elm.addEventListener("webkitAnimationEnd", callback, false);
        elm.addEventListener("oanimationend", callback, false);
        elm.addEventListener("MSAnimationEnd", callback, false);
        object.data.animationEndCallback = callback;
    },
    unbindAnimationEnd: function(object,elm){
        if (CUtils.isEmpty(elm))
            return;
        var callback = object.data.animationEndCallback || function(){};
        CUtils.unbindEvent(elm,"animationend", callback, false);
        CUtils.unbindEvent(elm,"webkitAnimationEnd", callback, false);
        CUtils.unbindEvent(elm,"oanimationend", callback, false);
        CUtils.unbindEvent(elm,"MSAnimationEnd", callback, false);

        object.data.animationEndCallback = null;
    }

    
});


