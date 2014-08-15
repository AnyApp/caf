/**
 * Created by dvircn on 15/08/14.
 */
var CPagination = Class(CObject,{
    $statics: {
        DEFAULT_DESIGN: {
            classes:'pagination'
        },
        DEFAULT_LOGIC: {
        }

    },

    constructor: function(values) {
        if (CUtils.isEmpty(values)) return;
        // Merge Defaults.
        CObject.mergeWithDefaults(values,CPagination);

        // Invoke parent's constructor
        CPagination.$super.call(this, values);

    }


});

