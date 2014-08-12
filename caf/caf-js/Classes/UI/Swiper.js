/**
 * Created by dvircn on 12/08/14.
 */
var CSwiper = Class({
    $singleton: true,
    mSwipers: {},
    sideMenu: null,
    sideMenuSide: 'left',
    initSwiper: function(swiperId,swiperOptionsArray,pagination)
    {
        var options = {
            moveStartThreshold: 50,
            resistance: '100%'
        };
        if (!CUtils.isEmpty(pagination)) {
            options.pagination = '#'+pagination;
            options.paginationClickable= true;
        }
        if (!CUtils.isEmpty(swiperOptionsArray)) {
            if (swiperOptionsArray.indexOf('loop')>=0)
                options.loop=true;
        }

        this.mSwipers[swiperId] = new Swiper('#'+swiperId,options);

        this.mSwipers[swiperId].addCallback('SlideChangeStart', function(swiper){
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
        });

        // Fix Pagination disappear.
        this.mSwipers[swiperId].addCallback('SlideChangeEnd', function(swiper){
            var height = document.getElementById(swiperId).style.height;
            CUtils.element(swiperId).style.height = '0px';
            CUtils.element(swiperId).clientHeight;
            CUtils.element(swiperId).style.height = height;
        });

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
        if (CUtils.isEmpty(this.sideMenu)) return;
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


});


