/**
 * Created by dvircn on 16/08/14.
 */
var CTab = Class(CContainer,{
    $statics: {
        DEFAULT_DESIGN: {
            bgColor:{
                color: 'White'
            },
            width: '100%',
            height: '100%'
        },
        DEFAULT_LOGIC: {
        }

    },

    constructor: function(values) {
        if (CUtils.isEmpty(values)) return;
        // Merge Defaults.
        CObject.mergeWithDefaults(values,CTab);

        // Invoke parent's constructor
        CTab.$super.call(this, values);

        // Tab properties.
        this.data.onLoad  = this.data.onLoad  || function(){};
    }


});

