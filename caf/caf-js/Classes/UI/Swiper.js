/**
 * Created by dvircn on 12/08/14.
 */
var CSwiper = Class({
    $singleton: true,
    mSwipers: {},
    sideMenu: null,
    sideMenuSide: 'left',

    initSwiper: function(data) {
        var swiperId = data.container;
        var options = {
            moveStartThreshold: 50,
            resistance: '100%'
        };
        if (!CUtils.isEmpty(data.pagination)) {
            options.pagination = '#'+data.pagination;
            options.paginationClickable= true;
        }
        if (data.loop === true)
            options.loop = true;
        if (data.autoPlay === true)
            options.autoplay = data.slideTime;
        if (data.centeredSlides === true)
            options.centeredSlides = true;
        if (!CUtils.isEmpty(data.slidesPerView))
            options.slidesPerView = data.slidesPerView;

        options['onSlideChangeStart'] =  this.createSlideChangeStartCallback(swiperId);

        var slidesOnLoads   = data.onLoads      || [];
        var onSlideLoad     = data.onSlideLoad  || function(){};

        // Fix Pagination disappear.
        options['onSlideChangeEnd']   = this.createSlideChangeEndCallback(swiperId,onSlideLoad,slidesOnLoads);

        this.mSwipers[swiperId] = new Swiper('#'+swiperId,options);

        this.mSwipers[swiperId].swiperTabButtons = Array();
        // Add buttons.
        _.each(data.tabberButtons,function(buttonId){
            this.addButtonToTabSwiper(buttonId,swiperId);
        },this);
    },
    createSlideChangeStartCallback: function(swiperId){
        return function(swiper){
            var toSlide         = swiper.activeIndex;
            var swiperButtons   = CSwiper.mSwipers[swiperId].swiperTabButtons;
            var tabRelatedButton= swiperButtons[toSlide];
            if (!CUtils.isEmpty(tabRelatedButton)){
                CTabber.moveToTab(tabRelatedButton,null,swiperId);
            }

/*
            window.setTimeout(function() {
                var height = CUtils.element(swiperId).style.height;
                CUtils.element(swiperId).style.height = '0px';
                CUtils.element(swiperId).clientHeight;
                CUtils.element(swiperId).style.height = height;
            },1000);
*/
        };
    },
    createSlideChangeEndCallback: function(swiperId,onSlideLoad,slidesOnLoads){
        return function(swiper){

            // On load callbacks.
            onSlideLoad(swiper.activeIndex);
            if (swiper.activeIndex < slidesOnLoads.length)
                slidesOnLoads[swiper.activeIndex]();
        };
    },
    /**
     * Add button to tab container.
     * @param object
     * @param swiperId
     */
    addButtonToTabSwiper: function(objectId,swiperId){
        var swiperButtons       = this.mSwipers[swiperId].swiperTabButtons;
        var currentSlideNumber  = swiperButtons.length;
        this.mSwipers[swiperId].swiperTabButtons.push(objectId);

        CClicker.addOnClick(CObjectsHandler.object(objectId),function(){
            CTabber.moveToTab(objectId,currentSlideNumber,swiperId);
        });

        if (currentSlideNumber == 0){
            CTabber.addHoldClass(objectId);
        }
    },
    resizeFix: function(){
        window.setTimeout(function(){
            _.each(CSwiper.mSwipers,function(swiper){
                swiper.resizeFix();
            },CSwiper);
        },0);

    },
    getSwiperButtons: function(swiperId){
        return this.mSwipers[swiperId].swiperTabButtons;
    },
    getSwiperCurrentSlide: function(swiperId){
        return this.mSwipers[swiperId].activeIndex;
    },
    getSwiperPreviousSlide: function(swiperId){
        return this.mSwipers[swiperId].previousIndex;
    },
    next: function(swiperName) {
        this.mSwipers[swiperName].swipeNext();
    },
    previous: function(swiperName) {
        this.mSwipers[swiperName].swipePrev();
    },
    moveSwiperToSlide: function(swiperContainerId,slide) {
        this.mSwipers[swiperContainerId].swipeTo(slide);
    },
    initSideMenu: function(positions,width) {
        var hasLeft     = positions.indexOf('left')>=0;
        var hasRight    = positions.indexOf('right')>=0;
        var disable     = 'none';
        if (!hasLeft && !hasRight)   return;
        if (!hasLeft)
            disable  = 'left';
        if (!hasRight)
            disable  = 'right';
        //disable = 'right';
        this.sideMenu = new Snap({
            element: CUtils.element(CObjectsHandler.mainViewId),
            disable: disable,
            maxPosition: width,
            minPosition: -width
        });
    },
    openOrCloseSideMenu: function(name) {
        if (CUtils.isEmpty(CSwiper.sideMenu)) return;
        var state = CSwiper.sideMenu.state().state;

        if (state=="closed")
            CSwiper.sideMenu.open(name);
        else
            CSwiper.sideMenu.close();
    },
    isSideMenuOpen: function() {
        if (CUtils.isEmpty(this.sideMenu))
            return false;/**/
        return this.sideMenu.state().state!="closed";
    }


});


