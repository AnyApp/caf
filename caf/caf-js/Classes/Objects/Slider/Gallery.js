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
        CObject.setObjectDefaults(values,CGallery);

        this.data = values.data || {};
        this.data.childs = values.data.childs || [];

        // Create Images.
        _.each(this.data.images,function(imageSrc){
            var imageId = CObjectsHandler.createObject('ZoomedImage',{
                data: {  src: [imageSrc] }
            });
            this.appendChild(imageId);
        },this);

        // Invoke parent's constructor
        CGallery.$super.call(this, values);

    }


});

