/**
 * Created by dvircn on 15/08/14.
 */
var CSlider = Class(CContainer,{
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
        CObject.mergeWithDefaults(values,CSlider);

        // Invoke parent's constructor
        CSlider.$super.call(this, values);

        // Create Container.
        this.sliderContainer = CObjectsHandler.createObject('CSliderContainer',{
            data: {  childs: [this.uid()] }
        });
        // Create Pagination
        var paginationDesign = values.pagination ===true ? {} :
        {  display: 'hidden' };
        this.pagination = CObjectsHandler.createObject('CPagination',{
            design: paginationDesign
        });

        // Create Slides
        var childs = this.data.childs;
        this.data.childs = [];
        _.each(childs,function(child){
            var sliderId = CObjectsHandler.createObject('CSlider',{
                data: {  childs: [child] }
            });
            this.data.childs.push(sliderId);
        });



        this.logic.swipeView = {
            container: this.sliderContainer,
            pagination: this.pagination,
            loop: values.data.loop || false
        }

    }


});

