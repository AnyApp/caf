/**
 * Created by dvircn on 06/08/14.
 */

var CContainer = Class(CObject,{
    $statics: {
        DEFAULT_DESIGN: {
        },
        DEFAULT_LOGIC: {
        }
    },

    constructor: function(values) {
        if (CUtils.isEmpty(values)) return;
        // Merge Defaults.
        CObject.mergeWithDefaults(values,CContainer);

        // Invoke parent's constructor
        this.$class.$super.call(this, values);
        this.data.childs = this.data.childs || [];
    },
    /**
     *  Build Object.
     */
    prepareBuild: function(){
        this.$class.$superp.prepareBuild.call(this);
        // Prepare Build each child.
        _.each(this.data.childs,function(childID){
            var object = CObjectsHandler.getObjectById(childID);
            // Case object doesn't exist.
            if (CUtils.isEmpty(object)){
                CLog.log("CContainer.prepareBuild error: Could not find element with ID: "+childID);
                return;
            }
            // Prepare Build Object.
            object.prepareBuild();
        });
    }



});


