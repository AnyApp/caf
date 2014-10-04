/**
 * Created by dvircn on 13/08/14.
 */
var CMainView = Class(CContainer,{
    $statics: {
        DEFAULT_DESIGN: {
            classes:'snap-content',
            bgColor:{color:'White'},
            textAlign: 'center'/*,
            overflow: 'scrollable'*/

        },
        DEFAULT_LOGIC: {
            scrollable: true
        }
    },

    constructor: function(values) {
        if (CUtils.isEmpty(values)) return;
        // Merge Defaults.
        CObject.mergeWithDefaults(values,CMainView);
        // Invoke parent's constructor
        CMainView.$super.call(this, values);
    }

});


