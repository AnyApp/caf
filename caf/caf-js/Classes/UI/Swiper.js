/**
 * Created by dvircn on 12/08/14.
 */
var CSwiper = Class({
    $singleton: true,
    mSwipers: {},
    sideMenu: null,
    sideMenuSide: 'left',
    initSwiper: function(data)
    {
        var swiperId = data.container;
        var options = {
            moveStartThreshold: 50,
            resistance: '100%'
        };
        if (!CUtils.isEmpty(data.pagination)) {
            options.pagination = '#'+data.pagination;
            options.paginationClickable= true;
        }
        if (data.loop===true)
            options.loop=true;

        options['SlideChangeStart'] = function(swiper){
            var toSlide         = swiper.activeIndex;
            var swiperButtons   = this.mSwipers[swiperId].swiperTabButtons;
            var tabRelatedButton= swiperButtons[toSlide];
            if (!CUtils.isEmpty(tabRelatedButton))
                CPager.moveToTab(tabRelatedButton,null,swiperId);

            window.setTimeout(function() {
                var height = CUtils.element(swiperId).style.height;
                CUtils.element(swiperId).style.height = '0px';
                CUtils.element(swiperId).clientHeight;
                CUtils.element(swiperId).style.height = height;
            },100);
        };

        // Fix Pagination disappear.
        options['SlideChangeEnd'] = function(swiper){
            var height = document.getElementById(swiperId).style.height;
            CUtils.element(swiperId).style.height = '0px';
            CUtils.element(swiperId).clientHeight;
            CUtils.element(swiperId).style.height = height;
        };

        this.mSwipers[swiperId] = new Swiper('#'+swiperId,options);

        this.mSwipers[swiperId].swiperTabButtons = Array();
    },
    /**
     * Add button to tab container.
     * @param object
     * @param swiperId
     */
    addButtonToTabSwiper: function(object,swiperId){
        var swiperButtons       = this.mSwipers[swiperId].swiperTabButtons;
        var currentSlideNumber  = swiperButtons.length;
        this.mSwipers[swiperId].swiperTabButtons.push(object.uid());

        CClicker.addOnClick(object,function(){
            CPager.moveToTab(object.uid(),currentSlideNumber,swiperId);
        });

        if (swiperId == 0){
            CPager.addHoldClass(object.uid());
        }
    },
    getSwiperButtons: function(swiperId){
        return this.mSwipers[swiperId].swiperTabButtons;
    },
    next: function(swiperName)
    {
        this.mSwipers[swiperName].swipeNext();
    },
    previous: function(swiperName)
    {
        this.mSwipers[swiperName].swipePrev();
    },
    moveSwiperToSlide: function(swiperContainerId,slide)
    {
        this.mSwipers[swiperContainerId].swipeTo(slide);
    },
    initSideMenu: function(positions)
    {
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
            disable: disable
        });
    },
    openOrCloseSideMenu: function(name)
    {
        if (CUtils.isEmpty(CSwiper.sideMenu)) return;
        var state = CSwiper.sideMenu.state().state;

        if (state=="closed")
            CSwiper.sideMenu.open(name);
        else
            CSwiper.sideMenu.close();
    },
    isSideMenuOpen: function()
    {
        if (CUtils.isEmpty(this.sideMenu))
            return false;
        return this.sideMenu.state().state!="closed";
    }


});


