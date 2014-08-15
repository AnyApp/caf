/**
 * Created by dvircn on 15/08/14.
 */
var CGallery = Class(CSlider,{
    $statics: {
        DEFAULT_DESIGN: {
        },
        DEFAULT_LOGIC: {
        }

    },

    constructor: function(values) {
        if (CUtils.isEmpty(values)) return;
        // Merge Defaults.
        CObject.mergeWithDefaults(values,CGallery);

        // Invoke parent's constructor
        CGallery.$super.call(this, values);
    }


});

