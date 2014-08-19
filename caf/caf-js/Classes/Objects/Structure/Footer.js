/**
 * Created by dvircn on 15/08/14.
 */
var CFooter = Class(CContainer,{
    $statics: {
        DEFAULT_DESIGN: {
            classes: 'footer',
            bottom:0,
            bgColor:{
                color: 'Blue',
                level: 4
            }
        },
        DEFAULT_LOGIC: {
        }

    },

    constructor: function(values) {
        if (CUtils.isEmpty(values)) return;
        // Merge Defaults.
        CObject.mergeWithDefaults(values,CFooter);

        // Invoke parent's constructor
        CFooter.$super.call(this, values);

        this.design.height = CAppConfig.get('footerSize');

    }


});

