/**
 * Created by dvircn on 15/08/14.
 */
var CIFrame = Class(CObject,{
    $statics: {
        DEFAULT_DESIGN: {
            classes: "",
            border: {all:0}
        },
        DEFAULT_LOGIC: {
        }

    },

    constructor: function(values) {
        if (CUtils.isEmpty(values)) return;
        // Merge Defaults.
        CObject.setObjectDefaults(values,CIFrame);

        // Invoke parent's constructor
        CVideo.$super.call(this, values);

        this.data.src = values.data.src || '';
    },
    /**
     *  Build Object.
     */
    prepareBuild: function(data){
        // Prepare this element.
        return CIFrame.$superp.prepareBuild.call(this,{
            tag: 'iframe',
            attributes: ['src="'+this.data.src+'"','frameborder="0"','webkitallowfullscreen',
                'mozallowfullscreen','allowfullscreen']
        });
    }


});

