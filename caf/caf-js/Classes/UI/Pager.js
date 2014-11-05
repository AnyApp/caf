/**
 * Created by dvircn on 11/08/14.
 */
var CPager = Class({
    $singleton: true,
    firstLoad: true,
    historyStack: new Array(),
    mainPage: '',
    backButtonId: '',
    pages: {},
    router: null,
    currentPageNumber: 0,

    initialize: function(){
        this.resetPages();
        this.setBackForwardDetection();
        // Add all pages names to the router.
        _.each(this.pages,function(pageId,name){
            var currentPage = CObjectsHandler.object(pageId);
            var load = function(){
                var params = CPager.fetchParams(window.location.hash);
                CPager.showPage(name,params);
            }
            if (!CUtils.isEmpty(currentPage.getPageName())){
                // Custom page.
                routie(currentPage.getPageName()+'',load);
                routie(currentPage.getPageName()+'/*',load);
            }
            else // Main Page.
                routie('',load);

        },this);
        routie('*', function() { CLog.dlog('page not found')});

        this.checkAndChangeBackButtonState();
    },
    fetchParams: function(path) {
        if (CUtils.isEmpty(path))
            return [];
        path = path.substr(path.indexOf('#')+1);

        var params = path.split('/');
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
    dataToPath: function (data) {
        data = data || [];
        var path = '';
        _.each(data,function(value){
            path += '/'+value;
        },CPager);
        return path;
    },
    mapDataToPath: function (data) {
        data = data || {};
        var path = '';
        _.each(data,function(value,key){
            path += '/'+key+'/'+value;
        });
        return path;
    },
    moveBack: function() {
        window.history.back();
    },
    setBackForwardDetection: function () {
        var detectBackOrForward = function() {
            CPager.hashHistory   = [window.location.hash];
            CPager.historyLength = window.history.length;
            CPager.historyStart  = CPager.hashHistory.length;
            CPager.currentPageNumber = 0;

            return function() {
                var hash = window.location.hash, length = window.history.length;
                if (CPager.hashHistory.length && CPager.historyLength == length) {
                    if (CPager.hashHistory[CPager.hashHistory.length - 2] == hash) {
                        CPager.hashHistory.pop();
                        CPager.currentPageNumber = CPager.currentPageNumber -1;
                    } else {
                        CPager.hashHistory.push(hash);
                        CPager.currentPageNumber = CPager.currentPageNumber +1;
                    }
                } else {
                    CPager.hashHistory.push(hash);
                    CPager.currentPageNumber = CPager.currentPageNumber +1;
                    CPager.historyLength = length;
                }

                CPager.checkAndChangeBackButtonState();

            }
        };

        window.addEventListener("hashchange", detectBackOrForward());
    },
    checkAndChangeBackButtonState:function() {
        if (CUtils.isEmpty(CPager.backButtonId) || !CPager.hashHistory ) return;
        if (CPager.currentPageNumber===0)
            CUtils.addClass(CUtils.element(CPager.backButtonId),'hidden');
        else
            CUtils.removeClass(CUtils.element(CPager.backButtonId),'hidden');
    },
    onLoadPage: function(pageId) {
        var onPageLoad = CObjectsHandler.object(pageId).getLogic().page.onLoad;
        if (CUtils.isEmpty(onPageLoad))
            return;
        // Execute onPageLoad.
        onPageLoad();
    },
    getPagePath: function(name,params){
        return name+CPager.dataToPath(params);
    },
    showPage: function(name,params){
        // Check if the page need to be reloaded with template data
        // or already loaded template page.
        var id                  = CPager.pages[name];
        var dynamicPageId       = '';
        if (!CUtils.isEmpty(params)) {
            var pagePath = CPager.getPagePath(name,params);
            id = CPager.pages[pagePath];
            if (CUtils.isEmpty(id)) { // Page not exist.
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

        // Cancel Pull to refresh.
        CPullToRefresh.interrupt();

        var lastPage            = CPager.currentPage || '';
        CPager.currentPage      = id;

        // Do not reload the same page over and over again.
        if (CPager.currentPage == lastPage)
            return;

        // Normal page hide.
        if (!CUtils.isEmpty(lastPage) && !CTemplator.objectHasDynamic(lastPage))
            CAnimations.hide(lastPage,{});

        var animationOptions    = {};
        // Page Load.
        animationOptions.onAnimShowComplete = function() {
            var page = CObjectsHandler.object(CPager.currentPage);
            page.reload();
        };
        var page = CObjectsHandler.object(CPager.currentPage);
        CTitleHandler.setTitle(page.getPageTitle());
        page.setParams(this.getParamsAsMap(params));

        // Showing current page.
        if (CUtils.isEmpty(lastPage))
            CAnimations.quickShow(CPager.currentPage);
        else
            CAnimations.show(CPager.currentPage,animationOptions);

        //this.checkAndChangeBackButtonState();

    },
    // Immediate hide to all pages on first load.
    resetPages: function() {
        // Hide All Pages except current.
        _.each(CPager.pages,function(pageId){
            if (!CTemplator.objectHasDynamic(pageId))
                CAnimations.quickHide(pageId);
            else { //Parent dynamic page.
                var pageElement = CUtils.element(pageId);
                if (!CUtils.isEmpty(pageElement))
                    pageElement.style.display = 'none';
            }
        },CPager);
    },
    getParamsAsMap: function(params){
        var map = {};
        if (CUtils.isEmpty(params))
            return map;
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


