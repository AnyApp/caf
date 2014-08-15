/**
 * Created by dvircn on 15/08/14.
 */
var CImage = Class(CObject,{
    $statics: {
        DEFAULT_DESIGN: {
            height: 40,
            width: 40,
            marginRight:1,
            marginLeft:1,
            marginTop:1,
            marginBottom:1
        },
        DEFAULT_LOGIC: {
        }

    },

    constructor: function(values) {
        if (CUtils.isEmpty(values)) return;
        // Merge Defaults.
        CObject.mergeWithDefaults(values,CImage);

        // Invoke parent's constructor
        CImage.$super.call(this, values);

        this.data.src = values.data.src || '';
    },
    /**
     *  Build Object.
     */
    prepareBuild: function(data){
        // Prepare this element - wrap it's children.
        return CImage.$superp.prepareBuild.call(this,{
            tag: 'img',
            attributes: ['src="'+this.data.src+'"'],
            tagHasInner: false
        });
    }


});

