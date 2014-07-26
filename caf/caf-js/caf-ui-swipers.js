caf.ui.swipers =
{
    mSwipers: {},
    sideMenu: null,
    sideMenuSide: 'left',
    initSwiper: function(swiperContainerId,pagination)
    {
        var options = {
            moveStartThreshold: 50,
            resistance: '100%'
        };
        if (!caf.utils.isEmpty(pagination))
        {
            options.pagination = '#'+pagination;
            options.paginationClickable= true;
        }

        this.mSwipers[swiperContainerId] = new Swiper('#'+swiperContainerId,options);

        this.mSwipers[swiperContainerId].addCallback('SlideChangeStart', function(swiper){
            var toSlide = swiper.activeIndex;
            var slideElement = swiper.getSlide(toSlide);
            var tabRelatedButton = slideElement.getAttribute('caf-tab-related-button');
            if (!caf.utils.isEmpty(tabRelatedButton))
            {
                caf.pager.moveToTab(tabRelatedButton,null,swiperContainerId);
            }
            window.setTimeout(function()
            {
                var height = document.getElementById(swiperContainerId).style.height;
                document.getElementById(swiperContainerId).style.height = '0px';
                document.getElementById(swiperContainerId).clientHeight;
                document.getElementById(swiperContainerId).style.height = height;
            },100);
        });

        // Fix Pagination disappear.
        this.mSwipers[swiperContainerId].addCallback('SlideChangeEnd', function(swiper){
            var height = document.getElementById(swiperContainerId).style.height;
            document.getElementById(swiperContainerId).style.height = '0px';
            document.getElementById(swiperContainerId).clientHeight;
            document.getElementById(swiperContainerId).style.height = height;
        });

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

