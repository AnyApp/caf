/**
 * Created by dvircn SliderSlide on 15/08/14.
 */
var CSliderSlide = Class(CContainer,{
    $statics: {
        DEFAULT_DESIGN: {
            classes:'swiper-slide',
            width:'100%',
            height:'100%'
        },
        DEFAULT_LOGIC: {
        }

    },

    constructor: function(values) {
        if (CUtils.isEmpty(values)) return;
        // Merge Defaults.
        CObject.mergeWithDefaults(values,CSliderSlide);

        // Invoke parent's constructor
        CSliderSlide.$super.call(this, values);

    }


});

