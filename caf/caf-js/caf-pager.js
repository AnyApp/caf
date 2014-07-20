caf.pager = {
    firstLoad: true,
    historyStack: new Array(),
    currentPage: "",
    mainPage: '',
    backButtonId: '',

    setMainPage: function(mainPage)
    {
        this.mainPage = mainPage;
        this.moveToPage(mainPage);
    },
    setBackButton: function(backButtonId)
    {
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
    restructure: function()
    {
        for (var i=this.historyStack.length-1; i>=0; i--) {
            document.getElementById(this.historyStack[i]).style.zIndex = (i+1)*10;
        }
    },
    moveToTab: function(tabId,tabContainerId,force)
    {
        // Get container.
        var tabContainer = document.getElementById(tabContainerId);
        // Current Tab.
        var currentTabId = tabContainer.getAttribute('caf-current-tab');
        // Return if already in tab.
        if (currentTabId == tabId && !force) return;

        var currentTab = document.getElementById(currentTabId);

        // Get Tabs.
        var tabs = eval(tabContainer.getAttribute('caf-tabs'));
        // Restructure z-indexes.
        for (var iTab in tabs)
        {
            var tab = document.getElementById(tabs[iTab]);
            caf.utils.removeClass(tab,'currentTab');
            caf.utils.removeClass(tab,'lastTab');
            // Remove hold mark.
            this.removeHoldClass(tab.getAttribute('caf-related-button'));
        }
        caf.utils.addClass(currentTab,'lastTab');


        // Set new current tab.
        tabContainer.setAttribute('caf-current-tab',tabId);

        var toShowTab = document.getElementById(tabId);

        caf.utils.addClass(toShowTab,'currentTab');
        caf.utils.addClass(toShowTab,'hidden');
        var clientHeight = toShowTab.clientHeight;
        caf.utils.removeClass(toShowTab,'hidden');
        caf.utils.addClass(toShowTab,'fadein');
        // on load page.
        caf.pager.onLoadPage(toShowTab);

        window.setTimeout(function(){
            caf.utils.removeClass(toShowTab,'fadein');

        },300);

        // Mark button as hold.
        this.addHoldClass(toShowTab.getAttribute('caf-related-button'));

    },
    addHoldClass: function(tabButtonId)
    {
        if (!caf.utils.isEmpty(tabButtonId))
        {
            var tabButton = document.getElementById(tabButtonId);
            var holdClass = tabButton.getAttribute('caf-hold');
            if (!caf.utils.isEmpty(holdClass))
            {
                caf.utils.addClass(tabButton,holdClass);
            }
        }
    },
    removeHoldClass: function(tabButtonId)
    {
        if (!caf.utils.isEmpty(tabButtonId))
        {
            var tabButton = document.getElementById(tabButtonId);
            var holdClass = tabButton.getAttribute('caf-hold');
            if (!caf.utils.isEmpty(holdClass))
            {
                caf.utils.removeClass(tabButton,holdClass);
            }
        }
    },
    /**
     * move to page.
     */
    moveToPage: function(toPageId,isRealPage,inAnim,outAnim)
    {
        // Check if need to move back.
        if (toPageId == 'move-back')
        {
            this.moveBack();
            return;
        }

        if (this.currentPage == toPageId)
        {
            return;
        }

        var lastPageId = this.currentPage;

        //Replace current page.
        this.currentPage = toPageId;
        this.insertPageToStack(toPageId);
        this.restructure();
        var toPageDiv = document.getElementById(toPageId);

        if (caf.utils.isEmpty(lastPageId))
        {
            // on load page.
            caf.pager.onLoadPage(toPageDiv);
            // Hide back button if needed.
            this.checkAndChangeBackButtonState();
            return;
        }

        caf.ui.fadeIn(toPageDiv,300);

        // on load page.
        caf.pager.onLoadPage(toPageDiv);
        // Hide back button if needed.
        this.checkAndChangeBackButtonState();


    },
    moveBack: function()
    {
        if (this.historyStack.length <= 1)
        {
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

        caf.ui.fadeOut(lastPageDiv,300,function() { lastPageDiv.style.zIndex = 0;});

        // on load page.
        caf.pager.onLoadPage(toPageDiv);
        // Hide back button if needed.

        this.checkAndChangeBackButtonState();



    },
    onLoadPage: function(pageElement)
    {
        if ( pageElement.getAttribute('caf-page-load')  )
        {
            var onLoad = new Function(pageElement.getAttribute('caf-page-load'));
            onLoad();
        }
    },
    checkAndChangeBackButtonState:function()
    {
        if (caf.utils.isEmpty(this.backButtonId)) return;

        if (this.currentPage == this.mainPage)
        {
            caf.utils.addClass(document.getElementById(this.backButtonId),'hidden');
        }
        else
        {
            caf.utils.removeClass(document.getElementById(this.backButtonId),'hidden');
        }
    }

}
