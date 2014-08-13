/**
 * Created by dvircn on 11/08/14.
 */
var CPager = Class({
    $singleton: true,
    firstLoad: true,
    historyStack: new Array(),
    currentPage: "",
    mainPage: '',
    backButtonId: '',

    setMainPage: function(mainPage) {
        this.mainPage = mainPage;
        this.moveToPage(mainPage);
    },
    setBackButton: function(backButtonId) {
        this.backButtonId = backButtonId;
        this.checkAndChangeBackButtonState();
    },
    insertPageToStack: function(pageId) {
        for (var i=this.historyStack.length-1; i>=0; i--) {
            if (this.historyStack[i] === pageId) {
                this.historyStack.splice(i, 1);
                // break;       //<-- Uncomment  if only the first term has to be removed
            }
        }
        this.historyStack.push(pageId);
    },
    /**
     * Restructure that pages z-index as their position in the history.
     * Recent page equals greater z-index.
     */
    restructure: function() {
        for (var i=this.historyStack.length-1; i>=0; i--) {
            CUtils.element(this.historyStack[i]).style.zIndex = (i+1)*10;
        }
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

        var holdClass = CObjectsHandler.object(tabButtonId).getDesign().hold;
        if (!CUtils.isEmpty(holdClass))
            CUtils.addClass(CUtils.element(tabButtonId),holdClass);
    },
    removeHoldClass: function(tabButtonId) {
        if (CUtils.isEmpty(tabButtonId))    return;

        var holdClass = CObjectsHandler.object(tabButtonId).getDesign().hold;
        if (!CUtils.isEmpty(holdClass))
            CUtils.removeClass(CUtils.element(tabButtonId),holdClass);
    },
    /**
     * move to page.
     */
    moveToPage: function(toPageId,isRealPage,inAnim,outAnim) {
        // Check if need to move back.
        if (toPageId == 'move-back') {
            this.moveBack();
            return;
        }

        if (this.currentPage == toPageId) {
            return;
        }

        var lastPageId = this.currentPage;

        //Replace current page.
        this.currentPage = toPageId;
        this.insertPageToStack(toPageId);
        this.restructure();
        var toPageDiv = document.getElementById(toPageId);

        if (CUtils.isEmpty(lastPageId)) {
            // on load page.
            CPager.onLoadPage(toPageDiv);
            // Hide back button if needed.
            this.checkAndChangeBackButtonState();
            return;
        }

        CAnimations.fadeIn(toPageDiv,300);

        // on load page.
        CPager.onLoadPage(toPageDiv);
        // Hide back button if needed.
        this.checkAndChangeBackButtonState();


    },
    moveBack: function() {
        if (this.historyStack.length <= 1) {
            // TODO: Ask to leave app.
            return;
        }

        //Remove last page from the history.
        var toRemovePageId = this.historyStack.pop();
        var toPageId = this.historyStack.pop();

        //Replace current page.
        this.currentPage = toPageId;
        this.insertPageToStack(toPageId);
        this.restructure();

        var lastPageDiv = document.getElementById(toRemovePageId);
        var toPageDiv = document.getElementById(toPageId);

        CAnimations.fadeOut(lastPageDiv,300,function() { lastPageDiv.style.zIndex = 0;});

        // on load page.
        CPager.onLoadPage(toPageDiv);
        // Hide back button if needed.

        this.checkAndChangeBackButtonState();



    },
    onLoadPage: function(pageId) {
        var onPageLoad = CObjectsHandler.object(pageId).getLogic().page.onLoad;
        if (CUtils.isEmpty(onPageLoad))
            return;
        // Execute onPageLoad.
        onPageLoad();
    },
    checkAndChangeBackButtonState:function()
    {
        if (CUtils.isEmpty(this.backButtonId)) return;

        if (this.currentPage == this.mainPage)
        {
            CUtils.addClass(document.getElementById(this.backButtonId),'hidden');
        }
        else
        {
            CUtils.removeClass(document.getElementById(this.backButtonId),'hidden');
        }
    }


});


