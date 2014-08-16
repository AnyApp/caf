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
        CContainer.$super.call(this, values);
        this.data.childs = this.data.childs || [];
    },
    /**
     *  Build Object.
     */
    prepareBuild: function(data){
        var content = new CStringBuilder();
        // Prepare Build each child.
        _.each(this.data.childs,function(childID){
            var object = CObjectsHandler.object(childID);
            // Case object doesn't exist.
            if (CUtils.isEmpty(object)){
                CLog.error("CContainer.prepareBuild error: Could not find element with ID: "+childID);
                return;
            }
            //Set parent to this Object.
            object.setParent(this.uid());
            // Prepare Build Object and merge with the content.
            content.merge(object.prepareBuild({}));
        },this);
        // Prepare this element - wrap it's children.
        data.view = content;
        CContainer.$superp.prepareBuild.call(this,CUtils.mergeJSONs(data));
        return content;
    }

    ////////////////////////////////////////////////
    // A Way to Force Design: before content.merge(object.prepareBuild({}));
    // Run a function that will change the son-object design! :)
    ////////////////////////////////////////////////

});


