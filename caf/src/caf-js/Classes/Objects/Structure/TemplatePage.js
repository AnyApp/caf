/**
 * Created by dvircn on 25/08/14.
 */
var CTemplatePage = Class([CPage,CTemplate],{
    $statics: {
        gifLoaders:{
            'default': 'loaderDefault'
        },
        DEFAULT_DESIGN: {
            classes: CTemplator.hiddenClass
        },
        DEFAULT_LOGIC: {
        }

    },

    constructor: function(values) {
        if (CUtils.isEmpty(values)) return;
        // Merge Defaults.
        CObject.setObjectDefaults(values,CTemplatePage);

        // Invoke parent's constructor
        CTemplatePage.$super.call(this, values);
        CTemplate.prototype.constructor.call(this, values);
        // Set that there is a page container for the abstract objects.
        this.data.template.container.data.page   = this.data.template.container.data.page || {};
        if (this.data.page)
            this.data.template.container.data.page = CUtils.clone(this.data.page);

        //this.data.page                  = null;
        this.data.template.container.type        = 'Page';
        this.data.template.autoLoad = false;

    }


});



