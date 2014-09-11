/**
 * Created by dvircn on 15/08/14.
 */
var CTabber = Class(CSlider,{
    $statics: {
        DEFAULT_DESIGN: {
            classes: ""
        },
        DEFAULT_LOGIC: {
        }

    },

    constructor: function(values) {
        if (CUtils.isEmpty(values)) return;
        // Merge Defaults.
        CObject.mergeWithDefaults(values,CImage);

        // Invoke parent's constructor
        CImage.$super.call(this, values);

        this.data.tabberButtons     = this.data.tabberButtons || [];
        this.logic.tabberButtons    = this.data.tabberButtons;
    },
    moveToTab: function(tabButtonId,toSlide,swiperId) {
        // Get Tabs.
        var tabs = CSwiper.getSwiperButtons(swiperId);
        _.each(tabs,function(buttonId){
            // Remove hold mark.
            this.removeHoldClass(buttonId);
        },this);

        this.addHoldClass(tabButtonId);

        if (!CUtils.isEmpty(toSlide))
            CSwiper.moveSwiperToSlide(swiperId,toSlide);

    },
    addHoldClass: function(tabButtonId) {
        if (CUtils.isEmpty(tabButtonId))    return;

        var holdClass = CDesign.designToClasses(CObjectsHandler.object(tabButtonId).getDesign().hold);
        if (!CUtils.isEmpty(holdClass))
            CUtils.addClass(CUtils.element(tabButtonId),holdClass);
    },
    removeHoldClass: function(tabButtonId) {
        if (CUtils.isEmpty(tabButtonId))    return;

        var holdClass = CDesign.designToClasses(CObjectsHandler.object(tabButtonId).getDesign().hold);
        if (!CUtils.isEmpty(holdClass))
            CUtils.removeClass(CUtils.element(tabButtonId),holdClass);
    }


});

