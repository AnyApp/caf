/**
 * Created by dvircn on 11/08/14.
 */
var CPager = Class({
    $singleton: true,
    firstLoad: true,
    historyStack: new Array(),
    mainPage: '',
    backButtonIds: [],
    pages: {},
    router: null,
    currentPageNumber: 0,
    currentPage: null,
    lastPage: null,
    initialize: function(){
        // Move to current main page.
        var mainPageChooser = CGlobals.get('main-chooser');
        if (!CUtils.isEmpty(mainPageChooser)){
            //window.location.hash = mainPageChooser(window.location.hash || '');
            if (!CUtils.isEmpty(window.location.hash))
                window.location.replace(''+mainPageChooser(window.location.hash || ''));
            else
                window.location.replace('#'+mainPageChooser(window.location.hash || ''));

        }

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
    setBackButton: function(backButtonId) {
        this.backButtonIds.push(backButtonId);
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
            if (CUtils.isEmpty(value))
                value = 'null';
            path += '/'+key+'/'+value;
        });
        return path;
    },
    moveBack: function() {
        window.history.back();
    },
    open: function(path,getData,postData,globalData){
        if ((!CUtils.isURLLocal(path))) // HTTP url
            CUtils.openURL(path);
        else { // Local URL
            if (path === '/') // Main Page link.
                path = '';
            getData     = getData    || {};
            globalData  = globalData || {};
            postData    = postData   || {};
            var finalData = CUtils.clone(getData);
            // Evaluate dynamic global data.
            _.each(globalData,function(globalName,key){
                finalData[key] = CGlobals.get(globalName) || '';
            });
            CUtils.openLocalURL(path+CPager.mapDataToPath(getData));
        }
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
        if (CUtils.isEmpty(CPager.backButtonIds) || !CPager.hashHistory ) return;
        _.each(CPager.backButtonIds,function(backButtonID){
            if (CPager.currentPageNumber===0)
                CUtils.addClass(CUtils.element(backButtonID),'hidden');
            else
                CUtils.removeClass(CUtils.element(backButtonID),'hidden');
        });

    },
    showPage: function(name,params){
        // Check if the page need to be reloaded with template data
        // or already loaded template page.
        var id                  = CPager.pages[name];
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

        // Notice: Update Current Page can be called outside of CPager. Example: Page.
        CPager.lastPage         = CPager.currentPage;
        CPager.currentPage      = id;

        var currentPage = CPager.currentPage;
        var lastPage = CPager.lastPage;

        // Do not reload the same page over and over again.
        if (currentPage == lastPage)
            return;

        // Normal page hide.
        if (!CUtils.isEmpty(lastPage) && !CTemplator.objectHasDynamic(lastPage))
            CAnimations.hide(lastPage,{});

        // Check to-page dynamic.
        var toPageBareId    = CPager.pages[name];
        var toPageBare      = CObjectsHandler.object(toPageBareId);
        // Template page
        if (toPageBare && toPageBare.data && toPageBare.data.template){
            CUtils.element(toPageBareId).style.zIndex       = '';
        }


        var animationOptions    = {};
        // Page Load.
        animationOptions.onAnimShowComplete = function() {
            var page = CObjectsHandler.object(currentPage);
            page.reload();
            // Check from-page dynamic.
            if (!CUtils.isEmpty(lastPage)){
                var fromPage                = CObjectsHandler.object(lastPage);
                var fromPageBareParent    = CObjectsHandler.object(fromPage.parent );
                // Template page
                if (fromPageBareParent && fromPageBareParent.data && fromPageBareParent.data.template){
                    CUtils.element(fromPage.parent).style.zIndex       = '-1';
                }
            }
            // Fire pageLoaded Event
            CEvents.fire(CEvents.pageLoaded,'Pager',page);
        };
        var page = CObjectsHandler.object(currentPage);

        // Replace Header if needed.
        var usedHeader = CPager.replaceHeader(page);
        // Replace title object
        var currentTitleID = cobject(usedHeader).getHeaderTitleID();
        CTitleHandler.setTitleObject(currentTitleID);
        CTitleHandler.setTitle(page.getPageTitle());

        page.setParams(this.getParamsAsMap(params));

        // Prepare Load of Page.
        page.prepareReload();


        // Showing current page.
        if (CUtils.isEmpty(lastPage)){
            CAnimations.quickShow(currentPage);
            animationOptions.onAnimShowComplete();
        }
        else
            CAnimations.show(currentPage,animationOptions);

    },
    replaceHeader: function(page){
        var headerID    = page.getPageHeaderID();
        var allHeaders  = CObjectsHandler.getHeaders();
        var usedHeader  = '';
        _.each(allHeaders,function(currentHeaderID){
            var header = CObjectsHandler.object(currentHeaderID);
            var isMainHeader = allHeaders.length == 1 || header.isMainHeader();
            if (headerID == currentHeaderID || (isMainHeader && CUtils.isEmpty(headerID)) ){
                CAnimations.quickShow(currentHeaderID);
                usedHeader = currentHeaderID;
            }
            else {
                CAnimations.quickHide(currentHeaderID);
            }
        });
        return usedHeader;
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
    // Immediate hide to all pages on first load.
    resetPages: function() {
        // Hide All Pages except current.
        _.each(CPager.pages,function(pageId){
            if (!CTemplator.objectHasDynamic(pageId))
                CAnimations.quickHide(pageId);
            else { //Parent dynamic page.
                var pageElement = CUtils.element(pageId);
                if (!CUtils.isEmpty(pageElement)) {
                    pageElement.style.zIndex = '-1';
                    pageElement.style.background   = 'rgba(0, 0, 0, 0)';
                }
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


