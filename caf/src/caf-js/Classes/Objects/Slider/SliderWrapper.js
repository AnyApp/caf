/**
 * Created by dvircn on 15/08/14.
 */
var CSliderWrapper = Class(CContainer,{
    $statics: {
        DEFAULT_DESIGN: {
            classes:'swiper-wrapper'
        },
        DEFAULT_LOGIC: {
        }

    },

    constructor: function(values) {
        if (CUtils.isEmpty(values)) return;
        // Merge Defaults.
        CObject.setObjectDefaults(values,CSliderWrapper);

        // Invoke parent's constructor
        CSliderWrapper.$super.call(this, values);


    }


});

