/**
 * Created by dvircn on 17/08/14.
 */
var  CDialogContainer = Class(CContainer,{
    $statics: {
        DEFAULT_DESIGN: {
            classes:'cDialogContainer',
            minHeight: 100,
            maxWidth: 400,
            maxHeight: '70%',
            margin: 'auto',
            round:2,
            bgColor:{color:'White',level:-4},
            border: { all: 1},
            borderColor:{color:'WhiteSmoke',level:1},
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

        this.design.top = CAppConfig.get('headerSize')+20;
    }

});


