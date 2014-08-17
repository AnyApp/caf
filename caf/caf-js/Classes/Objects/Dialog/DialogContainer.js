/**
 * Created by dvircn on 17/08/14.
 */
var  CDialogContainer = Class(CContainer,{
    $statics: {
        DEFAULT_DESIGN: {
            classes:'cDialog',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            minHeight: 100,
            maxWidth: 400,
            margin: 'auto',
            round:2,
            bgColor:{color:'WhiteSmoke',level:-2},
            border: { all: 1},
            borderColor:{color:'WhiteSmoke',level:3},
            overflow: 'scrollable'
        },
        DEFAULT_LOGIC: {
        }
    },

    constructor: function(values) {
        if (CUtils.isEmpty(values)) return;
        // Merge Defaults.
        CObject.mergeWithDefaults(values,CDialogContainer);
        // Invoke parent's constructor
        CDialogContainer.$super.call(this, values);


    }

});


