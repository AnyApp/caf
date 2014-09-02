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

        this.logic.dynamic          = this.logic.dynamic            || {};
        this.design.classes         = this.design.classes           || '';
        this.design.classes         += ' ' +CDynamicObject.gifLoaders.default+ ' ';
        this.data.abstractObjects   = this.data.abstractObjects     || [];
        this.data.abstractObject    = this.data.abstractObject      || null;
        if (!CUtils.isEmpty(this.data.abstractObject)) // Allow syntactic sugar.
            this.data.abstractObjects.push(this.data.abstractObject);
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

