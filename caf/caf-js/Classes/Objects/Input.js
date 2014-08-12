/**
 * Created by dvircn on 12/08/14.
 */
/**
 * Created by dvircn on 12/08/14.
 */
var CInput = Class(CObject,{
    $statics: {
        DEFAULT_DESIGN: {
        },
        DEFAULT_LOGIC: {
        }
    },

    constructor: function(values) {
        if (CUtils.isEmpty(values)) return;
        // Merge Defaults.
        CObject.mergeWithDefaults(values,CForm);

        // Invoke parent's constructor
        this.$class.$super.call(this, values);
        this.data.name               = values.name          || '';
        this.data.required           = values.required      || false;
        this.data.validators         = values.validators    || [];
        this.data.prepares           = values.prepares      || [];

        if (this.data.required)
            this.data.validators.unshift('notEmpty');
    },
    value: function() {
        var value = CUtils.element(this.uid()).value;
        _.each(this.data.prepares,function(prepareFunctionId){
            CPrepareFunctions.prepareFunction(prepareFunctionId).prepare(value);
        });
        return value;
    },
    clear: function() {
        CUtils.element(this.uid()).value = '';
        CUtils.element(this.uid()).setAttribute('value','');
    },
    getName: function(){
        return this.data.name;
    },
    getValidators: function(){
        return this.data.validators;
    }

});


