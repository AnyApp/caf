/**
 * Created by dvircn on 15/08/14.
 */
var CGallery = Class(CSlider,{
    $statics: {
        DEFAULT_DESIGN: {
        },
        DEFAULT_LOGIC: {
        }

    },

    constructor: function(values) {
        if (CUtils.isEmpty(values)) return;
        // Merge Defaults.
        CObject.mergeWithDefaults(values,CGallery);

        this.data = values.data || {};
        this.data.childs = values.data.childs || [];

        // Create Images.
        _.each(this.data.images,function(imageSrc){
            var imageId = CObjectsHandler.createObject('Image',{
                data: {  src: [imageSrc] }
            });
            this.data.childs.push(imageId);
        },this);

        // Invoke parent's constructor
        CGallery.$super.call(this, values);

    }


});

