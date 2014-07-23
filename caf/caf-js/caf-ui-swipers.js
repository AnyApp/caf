caf.ui.swipers =
{
    mSwipers: {},
    sideMenu: null,
    sideMenuSide: 'left',
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
        //var initialSlide = position=='left'? 1:0;
        //caf.ui.swipers.initSwiper(swiperContainerId,initialSlide)
        this.sideMenuSide = position || 'left';

        this.sideMenu = new Snap({
            element: document.getElementById(swiperContainerId),
            disable: position=='left'? 'right' : 'left',
            resistance:10000000
        });
    },
    openOrCloseSideMenu: function(name)
    {
        if (caf.utils.isEmpty(this.sideMenu)) return;
        var state = this.sideMenu.state().state;

        if (state=="closed")
            this.sideMenu.open(this.sideMenuSide);
        else
            this.sideMenu.close();
    }

}

