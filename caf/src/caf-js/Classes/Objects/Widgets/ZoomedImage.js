/**
 * Created by dvircn on 15/08/14.
 */
var CZoomedImage = Class(CObject,{
    $statics: {
        DEFAULT_DESIGN: {
            classes: "zoomedImage",
            width: '100%',
            height: '100%'
        },
        DEFAULT_LOGIC: {
        }

    },

    constructor: function(values) {
        if (CUtils.isEmpty(values)) return;
        // Merge Defaults.
        CObject.setObjectDefaults(values,CZoomedImage);

        // Invoke parent's constructor
        CZoomedImage.$super.call(this, values);

        this.data.src = values.data.src || '';
    },
    /**
     *  Build Object.
     */
    prepareBuild: function(data){
        // Prepare this element - wrap it's children.
        return CImage.$superp.prepareBuild.call(this,{
            attributes: ['style="background-image: url('+this.data.src+');"']
        });
    }


});

