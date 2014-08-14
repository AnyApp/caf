/**
 * Created by dvircn on 13/08/14.
 */
var CSideMenuRight = Class(CContainer,{
    $statics: {
        DEFAULT_DESIGN: {
            classes:'snap-drawer snap-drawer-right',
            bgColor:{color:'Gray',level:4},
            overflow: 'scrollable',
            textAlign: 'center'
        },
        DEFAULT_LOGIC: {
        }
    },

    constructor: function(values) {
        if (CUtils.isEmpty(values)) return;
        // Merge Defaults.
        CObject.mergeWithDefaults(values,CSideMenuRight);
        // Invoke parent's constructor
        CSideMenuRight.$super.call(this, values);
        this.uname = 'side-menu-right';
    }

});


