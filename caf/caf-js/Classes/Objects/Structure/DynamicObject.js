/**
 * Created by dvircn on 25/08/14.
 */
var CDynamicObject = Class(CObject,{
    $statics: {
        DEFAULT_DESIGN: {
            classes: 'displayNone',
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
    },
    reload: function(){
        CDynamics.load(this.uid());
    }


});

