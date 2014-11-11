/**
 * Created by dvircn on 25/08/14.
 */
var CTemplate = Class(CContainer,{
    $statics: {
        gifLoaders:{
            'default': 'loaderDefault'
        },
        DEFAULT_DESIGN: {
            //classes: CTemplator.hiddenClass,
            //height: 50
        },
        DEFAULT_LOGIC: {
        }

    },

    constructor: function(values) {
        if (CUtils.isEmpty(values)) return;
        // Merge Defaults.
        CObject.setObjectDefaults(values,CTemplate);

        // Invoke parent's constructor
        CTemplate.$super.call(this, values);

        this.design.classes             = this.design.classes           || '';
        //this.design.classes             += ' ' +CTemplate.gifLoaders.default+ ' ';
        this.logic.template             = true;
        this.data.template.pullToRefresh= this.data.template.pullToRefresh || false;
        if (this.data.template.pullToRefresh === true)
            this.logic.pullToRefresh    = true;
        this.data.template              = this.data.template            || {};
        this.data.template.url          = this.data.template.url        || '';
        this.data.template.callback     = this.data.template.callback   || function(){};
        this.data.template.prepareFunction = this.data.template.prepareFunction   || function(data){return data;};
        this.data.template.callbacks    = this.data.template.callbacks  || [];
        this.data.template.queryData    = this.data.template.queryData  || {};
        this.data.template.data         = this.data.template.data       || null;
        this.data.template.applied      = this.data.template.applied    || false;
        this.data.template.showLoader   = this.data.template.showLoader === false ? false : true;
        this.data.template.loaderColor  = this.data.template.loaderColor|| CColor('TealE',9);
        this.data.template.autoLoad     = this.data.template.autoLoad   === false ? false : true;
        this.data.template.resetOnReload= this.data.template.resetOnReload=== false ? false : true;
        this.data.template.loaded       = this.data.template.loaded     || false;
        this.data.template.duplicates   = this.data.template.duplicates || [];
        this.data.template.rootObjects  = this.data.template.rootObjects|| [];
        this.data.template.objects      = this.data.template.objects    || [];
        this.data.template.object       = this.data.template.object     || null;
        if (this.data.template.object !== null) // Allow syntactic sugar.
            this.data.template.objects.push(this.data.template.object);

        this.data.template.container    = this.data.template.container  || {type:'Container'};
        this.data.template.container.relative    = true;
        this.data.template.container.data        = this.data.template.container.data  || {};
        this.data.template.container.logic       = this.data.template.container.logic || {};
        this.data.template.container.design      = this.data.template.container.design|| {};

        this.data.template.containerToData       = this.data.template.containerToData || {};

        if (!CUtils.isEmpty(this.data.template.data)){
            this.data.template.applied = true;
            CTemplator.loadObjectWithDataNoRebuild(this,this.data.template.data);
        }

    },
    setTemplateData: function(data){
        this.data.template.data = data;
        this.parseReferences(this.data.template.data);
        CTemplator.loadObjectWithData(this,data,null,true);
    },
    filter: function(filterFunction){
        filterFunction = filterFunction || function(data) { return true; };
        _.each(this.data.template.containerToData,function(data,id){
            data = data || {};
            if (filterFunction(data)===true)
                CUtils.element(id).style.display = '';
            else
                CUtils.element(id).style.display = 'none';
        },this);
    },
    clearFilter: function(){
      this.filter();
    },
    showLoading: function(){
        if (this.data.template.showLoader!==true || !CUtils.isEmpty(this.spinnerId))
            return;
        this.spinnerId = CObjectsHandler.createObject('LoadSpinner',
            co().spinnerAutoStart()
                .design({color:this.getLoaderColor()}) // Set spinner color.
                .build());
        this.addChildToStart(this.spinnerId);
        this.rebuild();
    },
    stopLoading: function(){
        if (this.data.template.showLoader!==true)
            return
        this.removeChild(this.spinnerId);
        this.rebuild();
        delete this.spinnerId;
    },
    reload: function(queryData,onFinish, reset){
        CTemplator.load(this.uid(),queryData||this.data.template.queryData,
            onFinish||function(){},reset||this.data.template.resetOnReload);
    },
    getLoaderColor: function(){
        return this.data.template.loaderColor;
    }


});

