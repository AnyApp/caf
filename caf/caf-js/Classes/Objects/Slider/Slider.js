/**
 * Created by dvircn on 15/08/14.
 */
var CSlider = Class(CContainer,{
    $statics: {
        DEFAULT_DESIGN: {
            height: 300,
            widthSM: 10,
            widthXS: 10,
            classes:'swiper-container'
        },
        DEFAULT_LOGIC: {
        }

    },

    constructor: function(values) {
        if (CUtils.isEmpty(values)) return;
        // Merge Defaults.
        CObject.mergeWithDefaults(values,CSlider);

        // Invoke parent's constructor
        CSlider.$super.call(this, values);

        // Create Pagination
        var paginationDesign = values.data.pagination ===true ? {} :
        {  display: 'hidden' };
        this.pagination = CObjectsHandler.createObject('Pagination',{
            design: paginationDesign
        });

        // Create Slides
        var childs = this.data.childs;
        this.data.childs = [];
        _.each(childs,function(child){
            var sliderId = CObjectsHandler.createObject('SliderSlide',{
                data: {  childs: [child] }
            });
            this.data.childs.push(sliderId);
        },this);

        var wrapperChilds = this.data.childs;
        // Create Wrapper.
        this.sliderWrapper = CObjectsHandler.createObject('SliderWrapper',{
            data: {  childs: wrapperChilds }
        });

        // Set the wrapper to be the only child.
        this.data.childs     = [this.sliderWrapper,this.pagination];

        this.data.loop       = this.data.loop     === false ? false : true;
        this.data.autoPlay   = this.data.autoPlay === false ? false : true;
        this.data.slideTime  = this.data.slideTime      || 3000;
        this.data.onSlideLoad= this.data.onSlideLoad    || function(){};
        this.data.tabberButtons= this.data.tabberButtons    || [];
        this.data.animation= this.data.animation    || null;
        this.data.slidesPerView= this.data.slidesPerView    || null;

        this.logic.swipeView = {
            container:  this.uid(),
            pagination: this.pagination,
            loop:       false,//this.data.loop,
            autoPlay:   this.data.autoPlay,
            slideTime:  this.data.slideTime,
            onSlideLoad: this.data.onSlideLoad,
            tabberButtons: this.data.tabberButtons,
            animation: this.data.animation,
            slidesPerView: this.data.slidesPerView,
            centeredSlides: this.data.centeredSlides
        };


    }


});
