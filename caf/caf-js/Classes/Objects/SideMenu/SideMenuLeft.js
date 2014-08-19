/**
 * Created by dvircn on 13/08/14.
 */
var CSideMenuLeft = Class(CContainer,{
    $statics: {
        DEFAULT_DESIGN: {
            classes:'snap-drawer snap-drawer-left',
            bgColor:{color:'Gray',level:7},
            textAlign: 'center'
        },
        DEFAULT_LOGIC: {
        }
    },

    constructor: function(values) {
        if (CUtils.isEmpty(values)) return;
        // Merge Defaults.
        CObject.mergeWithDefaults(values,CSideMenuLeft);
        // Invoke parent's constructor
        CSideMenuLeft.$super.call(this, values);
        this.uname = 'side-menu-left';
    }

});


