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
        this.data.page.params        = [];
    },
    reloadWithParams: function(params){
        if (!CUtils.equals(this.data.params,params)){
            this.data.page.params = params;
            this.reload();
        }
    },
    reload: function(){
        this.data.page.onLoad(this.data.params);
    },
    getPageTitle: function(){
        return this.data.page.title;
    },
    getPageName: function(){
        return this.data.page.name;
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

