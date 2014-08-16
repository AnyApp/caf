/**
 * Created by dvircn on 16/08/14.
 */
var CPage = Class(CContainer,{
    $statics: {
        DEFAULT_DESIGN: {
            bgColor:{
                color: 'White'
            },
            height:'100%',
            width:'100%',
            position: 'relative',
            overflow: 'scrollable'
        },
        DEFAULT_LOGIC: {
        }

    },

    constructor: function(values) {
        if (CUtils.isEmpty(values)) return;
        // Merge Defaults.
        CObject.mergeWithDefaults(values,CPage);

        // Invoke parent's constructor
        CPage.$super.call(this, values);


    }


});

