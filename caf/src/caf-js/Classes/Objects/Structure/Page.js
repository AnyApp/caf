/**
 * Created by dvircn on 16/08/14.
 */
var CPage = Class(CContainer,{
    $statics: {
        DEFAULT_DESIGN: {
            bgColor:{
                color: 'White'
            },
            top: 0,
            right: 0,
            left: 0,
            bottom: 0,
            position: 'absolute'
        },
        DEFAULT_LOGIC: {
        }

    },

    constructor: function(values) {
        if (CUtils.isEmpty(values)) return;
        // Merge Defaults.
        CObject.setObjectDefaults(values,CPage);

        // Invoke parent's constructor
        CPage.$super.call(this, values);
        CScrolling.setScrollable(this);
        // Page properties.
        this.data.page                  = this.data.page                || {};
        this.data.page.name             = this.data.page.name           || '';
        this.data.page.title            = this.data.page.title          || '';
        this.data.page.header           = this.data.page.header         || '';
        this.data.page.footer           = this.data.page.footer         || '';
        this.data.page.onLoads          = this.data.page.onLoads        || [];
        this.data.page.onShows          = this.data.page.onShows        || [];
        this.data.page.onLoadPrepares   = this.data.page.onLoadPrepares || [];
        this.data.page.id               = this.uid();
        this.data.page.loaded           = false;
        this.data.page.params           = {};
        this.data.page.paramsChanged    = false;

        this.design = this.design || {};
        this.design.classes = this.design.classes || '';
        var classPageName = this.data.page.name;
        if (CUtils.isEmpty(classPageName))
            classPageName = 'page-main';
        this.design.classes += ' co-page-'+classPageName+' ';
    },
    setParams: function(params){
        // Set PageData
        CPageData.setPageData(this.uid(),params);
        if ( !CUtils.equals(this.data.page.params,params)){
            this.data.page.params = params;
            this.data.page.paramsChanged = true;
        }
    },
    reload: function(force){
        // On Show.
        _.each(this.data.page.onShows,function(onShow){
            if (onShow)
                onShow(this.data.page.params,this);
        },this);

        force = force || false;
        var needReload = this.data.page.loaded===false || this.data.page.paramsChanged || force ===true;
        if (needReload) {
            this.data.page.loaded = true;
            this.data.page.paramsChanged = false;
            // Run each onLoad .
            _.each(this.data.page.onLoads,function(onLoad){
                if (onLoad)
                    onLoad(this.data.page.params,this);
            },this);
        }

        // re-show event.
        if (this.uid() === CPager.currentPage) {
            CEvents.fire(CEvents.events.reshow,this.uid(),{pageId:this.uid()},
                function(object,data){ // Filter out objects that aren't in this page.
                    return object.uid() === data.pageId ||
                            object.getObjectPage() === data.pageId;
                }
            );
        }

        CSwiper.resizeFix();
    },
    prepareReload: function(){
        // Run load prepares.
        _.each(this.data.page.onLoadPrepares,function(onLoadPrepare){
            if (onLoadPrepare)
                onLoadPrepare(this.data.page.params,this);
        },this);
        // prepare re-show event.
        if (this.uid() === CPager.currentPage) {
            CEvents.fire(CEvents.events.prepareReshow,this.uid(),{pageId:this.uid()},
                function(object,data){ // Filter out objects that aren't in this page.
                    return object.getObjectPage() === data.pageId;
                }
            );
        }
    },
    getPageHeaderID: function(){
        return this.data.page.header;
    },
    getPageFooterID: function(){
        return this.data.page.footer;
    },
    getPageTitle: function(){
        return this.data.page.title;
    },
    getPageName: function(){
        return this.data.page.name;
    },
    isPageLoaded: function(){
        return this.data.page.loaded === true;
    }



});

