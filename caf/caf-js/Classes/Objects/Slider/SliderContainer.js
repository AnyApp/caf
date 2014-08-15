/**
 * Created by dvircn on 15/08/14.
 */
var CSliderContainer = Class(CContainer,{
    $statics: {
        DEFAULT_DESIGN: {
            classes:'swiper-container'
        },
        DEFAULT_LOGIC: {
        }

    },

    constructor: function(values) {
        if (CUtils.isEmpty(values)) return;
        // Merge Defaults.
        CObject.mergeWithDefaults(values,CSliderContainer);

        // Invoke parent's constructor
        CSliderContainer.$super.call(this, values);


    }


});

