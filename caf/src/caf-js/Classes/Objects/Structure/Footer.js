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
        CObject.setObjectDefaults(values,CFooter);

        // Invoke parent's constructor
        CFooter.$super.call(this, values);
        this.design.height = CGlobals.get('footerSize');
        this.data.isMainFooter  = this.data.isMainFooter    || false;

    },
    isMainFooter: function(){
        return this.data.isMainFooter === true;
    }



});

