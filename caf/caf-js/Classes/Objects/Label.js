/**
 * Created by dvircn on 06/08/14.
 */

var CLabel = Class(CObject,{
    $statics: {
        DEFAULT_DESIGN: {
            doyou: "nom",
            wow:"g"
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
    prepareBuild: function(){
        this.$class.$superp.prepareBuild.call(this);
    }



});

var x = new CLabel({text:"dvir",design:{width:"0px",ad:"hok"}});

