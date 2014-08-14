/**
 * Created by dvircn on 13/08/14.
 */
var CButton = Class(CLabel,{
    $statics: {
        DEFAULT_DESIGN: {
            cursor: 'pointer',
            active:{
                bgColor:{color:'Gray',level:3}
            }
        },
        DEFAULT_LOGIC: {
        }

    },

    constructor: function(values) {
        if (CUtils.isEmpty(values)) return;
        // Merge Defaults.
        CObject.mergeWithDefaults(values,CButton);

        // Invoke parent's constructor
        CButton.$super.call(this, values);
    }


});

