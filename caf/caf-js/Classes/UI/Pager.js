/**
 * Created by dvircn on 11/08/14.
 */
var CPager = Class({
    $singleton: true,
    firstLoad: true,
    historyStack: new Array(),
    currentPageNumber: 0,
    maxPageNumber: 0,
    mainPage: '',
    backButtonId: '',
    pages: {},

    initialize: function(){
        var base = CAppConfig.basePath();
        page.base(base);
        //this.sammy = Sammy();

        // Add all pages names to the router.
        _.each(this.pages,function(pageId,name){
            var currentPage = CObjectsHandler.object(pageId);
            var load = function(context){
                if (CUtils.isEmpty(context.state.pageNumber)) {
                    CPager.maxPageNumber += 1;
                    context.state.pageNumber = CPager.maxPageNumber;
                }
                CPager.currentPageNumber = context.state.pageNumber;
                var params = CPager.fetchParams(context);
                CPager.showPage(name,params);
            }
            if (!CUtils.isEmpty(currentPage.getPageName())){
                // Custom page.
                page('/'+currentPage.getPageName()+'',load);
                page('/'+currentPage.getPageName()+'/*',load);
            }
            else {
                // Main Page.
                page('',load);
            }
        },this);
        page('*', function() { CLog.dlog('page not found')});
        this.resetPages();
        page.start();
    },
    fetchParams: function(context) {
        if (CUtils.isEmpty(context.path))
            return [];

        var params = context.path.split('/');
        if (params.length>0 && params[0]=='')
            params.shift();
        if (params.length>0 && params[params.length-1]=='')
            params.pop();
        return params;
    },
    addPage: function(object){
        this.pages[object.getPageName()] = object.uid();
    },
    setMainPage: function(mainPage) {
        this.mainPage = mainPage;
        this.moveToPage(mainPage);
    },
    setBackButton: function(backButtonId) {
        this.backButtonId = backButtonId;
        this.checkAndChangeBackButtonState();
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

        var holdClass = CDesign.designToClasses(CObjectsHandler.object(tabButtonId).getDesign().hold);
        if (!CUtils.isEmpty(holdClass))
            CUtils.addClass(CUtils.element(tabButtonId),holdClass);
    },
    removeHoldClass: function(tabButtonId) {
        if (CUtils.isEmpty(tabButtonId))    return;

        var holdClass = CDesign.designToClasses(CObjectsHandler.object(tabButtonId).getDesign().hold);
        if (!CUtils.isEmpty(holdClass))
            CUtils.removeClass(CUtils.element(tabButtonId),holdClass);
    },
    dataToPath: function (data) {
        data = data || [];
        var path = '';
        _.each(data,function(value){
            path += '/'+value;
        },CPager);
        return path;
    },
    /**
     * move to page.
     */
    moveToPage: function(path/*toPageId,isRealPage,inAnim,outAnim*/) {
        // convert data to path. Example: {area:'north',side:'r'}=>/area/north/side/r


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
        history.back();
    },
    onLoadPage: function(pageId) {
        var onPageLoad = CObjectsHandler.object(pageId).getLogic().page.onLoad;
        if (CUtils.isEmpty(onPageLoad))
            return;
        // Execute onPageLoad.
        onPageLoad();
    },
    checkAndChangeBackButtonState:function() {
        if (CUtils.isEmpty(this.backButtonId)) return;

        if (this.currentPageNumber <= 1) {
            CUtils.addClass(CUtils.element(this.backButtonId),'hidden');
        }
        else {
            CUtils.removeClass(CUtils.element(this.backButtonId),'hidden');
        }
    },
    getPagePath: function(name,params){
        return name+CPager.dataToPath(params);
    },
    showPage: function(name,params){
        // Check if the page need to be reloaded with template data
        // or already loaded template page.
        var id                  = CPager.pages[name];
        if (!CUtils.isEmpty(params)) {
            var pagePath = CPager.getPagePath(name,params);
            id = CPager.pages[pagePath];
            if (CUtils.isEmpty(id)) {
                id = CPager.pages[name];
                // Check if template.
                if (CTemplator.objectHasDynamic(id)) {
                    CPager.tempPageId     = id;
                    CPager.tempPagePath   = pagePath;
                    var onFinish = function(){
                        var pageId = CTemplator.lastDuplicate(CPager.tempPageId);
                        if (!CUtils.isEmpty(pageId)) {
                            CPager.pages[CPager.tempPagePath] = pageId;
                            CPager.showPage(name,params); // show page.
                        }

                        CPager.tempPageId     = '';
                        CPager.tempPagePath   = '';
                    };
                    CTemplator.loadObjectWithData(id,CPager.getParamsAsMap(params),onFinish);
                    return; // Return and move when page created callback.
                }
            }
        }

        var lastPage            = CPager.currentPage || '';
        CPager.currentPage      = id;

        // Do not reload the same page over and over again.
        if (CPager.currentPage == lastPage)
            return;

        // Normal page hide.
        if (!CUtils.isEmpty(lastPage))
            CAnimations.hide(lastPage,{});

        var animationOptions    = {};
        // Page Load.
        animationOptions.onAnimShowComplete = function() {
            var page = CObjectsHandler.object(CPager.currentPage);
            page.reload();
        };
        var page = CObjectsHandler.object(CPager.currentPage);
        CUI.setTitle(page.getPageTitle());
        page.setParams(this.getParamsAsMap(params));

        // Showing current page.
        if (CUtils.isEmpty(lastPage))
            CAnimations.quickShow(CPager.currentPage);
        else
            CAnimations.show(CPager.currentPage,animationOptions);

        this.checkAndChangeBackButtonState();

    },
    // Immediate hide to all pages on first load.
    resetPages: function() {
        // Hide All Pages except current.
        _.each(CPager.pages,function(pageId){
                CAnimations.quickHide(pageId);
        },CPager);
    },
    getParamsAsMap: function(params){
        var map = {};
        var cParams = CUtils.clone(params);
        // If there is no argument for the page name -
        if (cParams.length%2 ==1) {
            map[cParams.shift()] = '';
        }
        // Iterate and put.
        for (var i=0; i < cParams.length; i+=2){
            map[cParams[i]] = cParams[i+1];
        }
        return map;
    }


});


