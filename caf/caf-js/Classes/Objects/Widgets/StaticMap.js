/**
 * Created by dvircn on 15/08/14.
 */
var CStaticMap = Class(CImage,{
    $statics: {
        DEFAULT_DESIGN: {
            classes: ""
        },
        DEFAULT_LOGIC: {
        }

    },

    constructor: function(values) {
        if (CUtils.isEmpty(values)) return;
        // Merge Defaults.
        CObject.setObjectDefaults(values,CStaticMap);

        // Invoke parent's constructor
        CStaticMap.$super.call(this, values);

        this.data.mapData = this.data.mapData ||
                                {width:'600',height:'300',center:'',zoom:13,
                                    maptype:'roadmap',marker:{color:'blue',position:''}};
        this.data.src = 'https://maps.googleapis.com/maps/api/staticmap?center='+
            this.data.mapData.center+'&zoom='+this.data.mapData.zoom
            +'&size='+this.data.mapData.width+'x'+this.data.mapData.height
            +'&maptype='+this.data.mapData.maptype+'&markers=color:'+this.data.mapData.marker.color
            +'%7C'+this.data.mapData.marker.position;
    },
    /**
     *  Build Object.
     */
    prepareBuild: function(data){
        // Prepare this element - wrap it's children.
        return CStaticMap.$superp.prepareBuild.call(this,{
            tag: 'img',
            attributes: ['src="'+this.data.src+'"'],
            tagHasInner: false
        });
    }


});

