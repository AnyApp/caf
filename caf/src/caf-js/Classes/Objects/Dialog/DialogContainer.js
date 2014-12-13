/**
 * Created by dvircn on 17/08/14.
 */
var  CDialogContainer = Class(CContainer,{
    $statics: {
        DEFAULT_DESIGN: {
            classes:'cDialogContainer',
            minHeight: 100,
            maxWidth: '90%',
            maxHeight: '80%',
            //round:2,
            bgColor:{color:'White'},
            //border: { all: 1},
            borderColor:{color:'Gray',level:2}
        },
        DEFAULT_LOGIC: {
        }
    },

    constructor: function(values) {
        if (CUtils.isEmpty(values)) return;
        // Merge Defaults.
        CObject.setObjectDefaults(values,CDialogContainer);
        // Invoke parent's constructor
        CDialogContainer.$super.call(this, values);

        this.design.top = CGlobals.get('headerSize')+20;
    }

});


