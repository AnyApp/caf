caf.ui.swipers =
{
    mSwipers: {},
    initSwiper: function(swiperContainerId,initialSlide,slidesPerView)
    {
        initialSlide = caf.utils.isEmpty(initialSlide)? 0 : initialSlide;
        slidesPerView = caf.utils.isEmpty(slidesPerView)? 'auto' : slidesPerView;
        this.mSwipers[swiperContainerId] = new Swiper('#'+swiperContainerId,{
            slidesPerView: slidesPerView,
            moveStartThreshold: 50,
            initialSlide: initialSlide,
            resistance: '100%'
        });
    },
    initSideMenu: function(swiperContainerId,position)
    {
        var initialSlide = position=='left'? 1:0;
        caf.ui.swipers.initSwiper(swiperContainerId,initialSlide)
    }

}

