/**
 * Created by dvircn on 06/08/14.
 */
var CObject = Class({
    $statics: {
        DEFAULT_DESIGN: {
            width: "150px",
            wow:" gi",
            woke:" gi"
        },
        DEFAULT_LOGIC: {
        },

        CURRENT_ID:   0,

        generateID: function() {
            this.CURRENT_ID += 1;
            return "CObjectId_"+this.CURRENT_ID;
        },
        mergeWithDefaults: function(values,useClass){
            values.design = CUtils.mergeJSONs(useClass.DEFAULT_DESIGN,values.design);
            values.logic = CUtils.mergeJSONs(useClass.DEFAULT_LOGIC,values.logic);
        }
    },

    constructor: function(values) {
        if (CUtils.isEmpty(values)) return;
        // Merge Defaults.
        CObject.mergeWithDefaults(values,CObject);

        this.id         = values.id         || CObject.generateID();
        this.appId      = values.appId;
        this.uname      = values.uname;
        this.version    = values.version;
        this.platform   = values.platform   || ['All'];
        this.logic      = values.logic      || {};
        this.design     = values.design     || {};
        this.data       = values.data       || {};
        this.classes    = "";
        this.functions  = Array();
        this.buildPrepared = false;
    },

    /**
     *  Build Object.
     */
    prepareBuild: function(){
        this.$class.$superp.prepareBuild.call(this);
        CDesign.prepareDesign(this);
        CLogic.prepareLogic(this);
        this.buildPrepared = true;

    },
    isBuildPrepared: function(){
        return this.buildPrepared;
    },
    setBuildPrepared: function(prepared){
        this.buildPrepared = prepared;
    }


});




