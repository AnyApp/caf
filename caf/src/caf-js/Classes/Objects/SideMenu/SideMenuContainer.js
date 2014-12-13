/**
 * Created by dvircn on 13/08/14.
 */
var CSideMenuContainer = Class(CContainer,{
    $statics: {
        DEFAULT_DESIGN: {
            height:'100%'
        },
        DEFAULT_LOGIC: {
        }
    },

    constructor: function(values) {
        if (CUtils.isEmpty(values)) return;
        // Merge Defaults.
        CObject.setObjectDefaults(values,CSideMenuContainer);
        // Invoke parent's constructor
        CSideMenuContainer.$super.call(this, values);
        this.design             = this.design || {};
        this.design.height      = '100%';
        CScrolling.setScrollable(this);

    }

});


