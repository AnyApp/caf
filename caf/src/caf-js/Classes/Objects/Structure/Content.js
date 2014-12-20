/**
 * Created by dvircn on 16/08/14.
 */
var CContent = Class(CContainer,{
    $statics: {
        DEFAULT_DESIGN: {
            classes: 'content',
            bgColor:{
                color: 'White'
            }
        },
        DEFAULT_LOGIC: {
        }

    },

    constructor: function(values) {
        if (CUtils.isEmpty(values)) return;
        // Merge Defaults.
        CObject.setObjectDefaults(values,CContent);

        // Invoke parent's constructor
        CContent.$super.call(this, values);

        this.design.top     =   CGlobals.get('headerSize');
        this.design.bottom  =   CGlobals.get('footerSize');
        this.data.mainPageChooser = this.data.mainPageChooser || null;
        if (!CUtils.isEmpty(this.data.mainPageChooser))
            CGlobals.set('main-chooser',this.data.mainPageChooser);

    }


});

