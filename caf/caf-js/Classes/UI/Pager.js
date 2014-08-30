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
    pages: {},

    initialize: function(){
        var base = CAppConfig.basePath();
        page.base(base);
        //this.sammy = Sammy();

        // Add all pages names to the router.
        _.each(this.pages,function(value){
            var load = function(context){
                var params = CPager.fetchParams(context);
                CPager.showPage(value.id,params);
                CLog.dlog('Loaded: '+value.id);
            }
            if (!CUtils.isEmpty(value.name)){
                // Custom page.
                page('/'+value.name+'',load);
                page('/'+value.name+'/*',load);
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
    addPage: function(name,data){
        this.pages[name] = data;
    },
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
        data = data || {};
        var path = '';
        _.each(data,function(value,key){
            path += '/'+key+'/'+value;
        },this);
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
    checkAndChangeBackButtonState:function() {/**/
        if (CUtils.isEmpty(this.backButtonId)) return;

        if (this.currentPage == this.mainPage) {
            CUtils.addClass(document.getElementById(this.backButtonId),'hidden');
        }
        else {
            CUtils.removeClass(document.getElementById(this.backButtonId),'hidden');
        }
    },
    showPage: function(id,params){
        var lastPage            = this.currentPage || '';
        this.currentPage        = id;
        var animationOptions    = {};
        // Initialize animation options
        if (CUtils.isEmpty(lastPage))
            animationOptions.animationDuration = 0;
        // Do not reload the same page over and over again.
        else if (this.currentPage == lastPage)
            return;

        // Normal page hide.
        if (!CUtils.isEmpty(lastPage)){
            CAnimations.hide(lastPage,animationOptions);
        }

        // Showing current page.
        CAnimations.show(this.currentPage,animationOptions);

    },
    // Immediate hide to all pages on first load.
    resetPages: function() {
        // Hide All Pages except current.
        _.each(this.pages,function(page){
                CAnimations.quickHide(CObjectsHandler.object(page.id));
        },this);
    }


});


