/**
 * Created by dvircn on 25/08/14.
 */
var CDynamicPage = Class([CPage,CDynamicObject],{
    $statics: {
        gifLoaders:{
            default: 'loaderDefault'
        },
        DEFAULT_DESIGN: {
            classes: CDynamics.hiddenClass
        },
        DEFAULT_LOGIC: {
        }

    },

    constructor: function(values) {
        if (CUtils.isEmpty(values)) return;
        // Merge Defaults.
        CObject.mergeWithDefaults(values,CDynamicPage);

        // Invoke parent's constructor
        CDynamicPage.$super.call(this, values);
        CDynamicObject.prototype.constructor.call(this, values);
        // Set that there is a page container for the abstract objects.
        this.data.abstractContainer.data.page   = this.data.abstractContainer.data.page || this.data.page || {};
        //this.data.page                  = null;
        this.data.abstractContainer.type        = 'Page';

    }


});



