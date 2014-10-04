/**
 * Created by dvircn on 16/08/14.
 */
var CContent = Class(CContainer,{
    $statics: {
        DEFAULT_DESIGN: {
            classes: 'content',
            bgColor:{
                color: 'White'
            }/*,
            overflow: 'scrollable'*/
        },
        DEFAULT_LOGIC: {
            scrollable: true
        }

    },

    constructor: function(values) {
        if (CUtils.isEmpty(values)) return;
        // Merge Defaults.
        CObject.mergeWithDefaults(values,CContent);

        // Invoke parent's constructor
        CContent.$super.call(this, values);

        this.design.top     =   CAppConfig.get('headerSize');
        this.design.bottom  =   CAppConfig.get('footerSize');


    }


});

