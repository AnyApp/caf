caf.ui.swipers =
{
    mSwipers: {},
    sideMenu: null,
    sideMenuSide: 'left',
    initSwiper: function(swiperContainerId,initialSlide,slidesPerView)
    {
        this.mSwipers[swiperContainerId] = new Swiper('#'+swiperContainerId,{
            moveStartThreshold: 50,
            resistance: '100%'
        });

        this.mSwipers[swiperContainerId].addCallback('SlideChangeStart', function(swiper){
            var toSlide = swiper.activeIndex;
            var slideElement = swiper.getSlide(toSlide);
            var tabRelatedButton = slideElement.getAttribute('caf-tab-related-button');
            if (!caf.utils.isEmpty(tabRelatedButton))
            {
                caf.pager.moveToTab(tabRelatedButton,null,swiperContainerId);
            }
        })
    },
    moveSwiperToSlide: function(swiperContainerId,slide)
    {
        this.mSwipers[swiperContainerId].swipeTo(slide);
    },
    initSideMenu: function(swiperContainerId,position)
    {
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
    },
    isSideMenuOpen: function()
    {
        return this.sideMenu.state().state!="closed";
    }

}

