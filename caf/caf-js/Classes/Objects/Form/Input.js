/**
 * Created by dvircn on 12/08/14.
 */
/**
 * Created by dvircn on 12/08/14.
 */
var CInput = Class(CObject,{
    $statics: {
        DEFAULT_DESIGN: {
            height:35,
            marginRight:1,
            marginLeft:1,
            marginTop:1,
            padding: 2,
            fontSize:16,
            fontStyle:['bold'],
            round: 2
        },
        DEFAULT_LOGIC: {
        }
    },

    constructor: function(values) {
        if (CUtils.isEmpty(values)) return;
        // Merge Defaults.
        CObject.mergeWithDefaults(values,CInput);

        // Invoke parent's constructor
        this.$class.$super.call(this, values);
        this.data.name               = values.data.name          || '';
        this.data.required           = values.data.required      || false;
        this.data.validators         = values.data.validators    || [];
        this.data.prepares           = values.data.prepares      || [];

        if (this.data.required)
            this.data.validators.unshift('notEmpty');
    },
    /**
     *  Build Object.
     */
    prepareBuild: function(data){
        // Prepare this element - wrap it's children.
        return CInput.$superp.prepareBuild.call(this,{
            tag: 'input',
            tagHasInner: false
        });
    },
    value: function() {
        var value = CUtils.element(this.uid()).value;
        _.each(this.data.prepares,function(prepareFunctionId){
            CPrepareFunctions.prepareFunction(prepareFunctionId).prepare(value);
        },this);
        return value;
    },
    setValue: function(value){
        CUtils.element(this.uid()).value = value;
        CUtils.element(this.uid()).setAttribute('value',value);
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


