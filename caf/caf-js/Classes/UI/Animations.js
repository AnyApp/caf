/**
 * Created by dvircn on 12/08/14.
 */
var CAnimations = Class({
    $singleton: true,
    init: function(object){
        object.data.animation           = object.data.animation             || 'fade';
        object.data.animationDuration   = object.data.animationDuration     || 300;
        object.data.onAnimShowComplete  = object.data.onAnimShowComplete    || function(){};
        object.data.onAnimHideComplete  = object.data.onAnimHideComplete    || function(){};

    },
    cascadeShow: function(objectsIds){
        CLog.dlog(objectsIds);

        for (var i in objectsIds){
            var index = Number(i);
            var objectId        = objectsIds[index];
            // Hide all elements.
            CUtils.addClass(CUtils.element(objectId),'hidden');

            if (index+1 == objectsIds.length)
                continue;

            var nextObjectId    = objectsIds[index+1];
            var object          = CObjectsHandler.object(objectId);
            object.data.onAnimShowComplete = this.createCascadeFunction(nextObjectId);
        }

        CAnimations.show(objectsIds[0]);
    },
    createCascadeFunction: function(nextObjectId){
        return function(){
            CAnimations.show(nextObjectId);
        };
    },
    show: function(objectId){
        var object = CObjectsHandler.object(objectId);
        this.init(object);
        this[object.data.animation]['in'](CUtils.element(objectId),object.data.animationDuration,
            object.data.onAnimShowComplete);
    },
    hide: function(objectId){
        var object = CObjectsHandler.object(objectId);
        this.init(object);
        this[object.data.animation]['out'](CUtils.element(objectId),object.data.animationDuration,
            object.data.onAnimHideComplete);
    },
    fade: {
        in: function(elm,duration,onEnter) {
            CLog.dlog('showing');
            CUtils.addClass(elm,'hidden');
            var clientHeight = elm.clientHeight;
            CUtils.removeClass(elm,'hidden');
            CUtils.addClass(elm,'fadein'+duration);
            window.setTimeout(function(){
                CUtils.removeClass(elm,'fadein'+duration);
                onEnter();
            },duration);
        },
        out: function(elm,duration,onOut) {
            CUtils.addClass(elm,'fadeout'+duration);
            window.setTimeout(function(){
                CUtils.removeClass(elm,'fadeout'+duration);
                onOut();
            },duration);
        }
    }
    
});


