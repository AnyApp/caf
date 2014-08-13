/**
 * Created by dvircn on 06/08/14.
 */

var CLabel = Class(CObject,{
    $statics: {
        DEFAULT_DESIGN: {
            minHeight: 20
        },
        DEFAULT_LOGIC: {
        }

    },

    constructor: function(values) {
        if (CUtils.isEmpty(values)) return;
        // Merge Defaults.
        CObject.mergeWithDefaults(values,CLabel);

        // Invoke parent's constructor
        this.$class.$super.call(this, values);
    },
    /**
     *  Build Object.
     */
    prepareBuild: function(data){
        return CLabel.$superp.prepareBuild.call(this,data);
    }



});

var x = new CLabel({text:"dvir",design:{width:"0px",ad:"hok"}});

