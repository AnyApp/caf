/**
 * Created by dvircn on 25/08/14.
 */
var CDynamicObject = Class(CObject,{
    $statics: {
        gifLoaders:{
            default: 'loaderDefault'
        },
        DEFAULT_DESIGN: {
            classes: CDynamics.hiddenClass,
            height: 50
        },
        DEFAULT_LOGIC: {
        }

    },

    constructor: function(values) {
        if (CUtils.isEmpty(values)) return;
        // Merge Defaults.
        CObject.mergeWithDefaults(values,CDynamicObject);

        // Invoke parent's constructor
        CDynamicObject.$super.call(this, values);

        this.data.object    = this.data.object      || {};
        this.logic.dynamic  = this.logic.dynamic    || {};
        this.design.classes = this.design.classes   || '';
        this.design.classes += ' ' +CDynamicObject.gifLoaders.default+' ';
    },
    reload: function(){
        CDynamics.load(this.uid());
    },
    showLoading: function(){
        CUtils.removeClass(CUtils.element(this.uid()),CDynamics.hiddenClass);
    },
    stopLoading: function(){
        CUtils.addClass(CUtils.element(this.uid()),CDynamics.hiddenClass);
    }


});

