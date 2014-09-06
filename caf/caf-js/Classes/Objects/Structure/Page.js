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
        CObject.mergeWithDefaults(values,CPage);

        // Invoke parent's constructor
        CPage.$super.call(this, values);

        // Page properties.
        this.data.page         = this.data.page           || {};
        this.data.page.name    = this.data.page.name      || '';
        this.data.page.title   = this.data.page.title     || '';
        this.data.page.onLoad  = this.data.page.onLoad    || function(){};
        this.data.page.id      = this.uid();
        this.data.page.loaded  = false;
        this.data.page.params  = [];
    },
    reloadWithParams: function(params,force){
        force = force || false;
        var mapParams = CPager.getParamsAsMap(params);
        var notLoaded = this.data.page.loaded===false;
        if (notLoaded || force || !CUtils.equals(this.data.page.params,mapParams)){
            this.data.page.params = mapParams;
            this.reload();
        }
    },
    reload: function(force){
        force = force || false;
        if (this.data.page.loaded===false || force ===true) {
            this.data.page.loaded = true;
            this.data.page.onLoad(this.data.page.params);
        }
    },
    getPageTitle: function(){
        return this.data.page.title;
    },
    getPageName: function(){
        return this.data.page.name;
    }



});

