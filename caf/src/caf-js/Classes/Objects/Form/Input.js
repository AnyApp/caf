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
            padding: 2,
            fontSize:16,
            fontStyle:['bold']
        },
        DEFAULT_LOGIC: {
        }
    },

    constructor: function(values) {
        if (CUtils.isEmpty(values)) return;
        // Merge Defaults.
        CObject.setObjectDefaults(values,CInput);

        // Invoke parent's constructor
        this.$class.$super.call(this, values);
        this.data.name               = values.data.name          || '';
        this.data.type               = values.data.type          || 'text';
        this.data.value              = values.data.value         || '';
        this.data.disabled           = values.data.disabled      || false;
        this.data.disabledAttribute  = values.data.disabled===true? 'disabled' : '';
        this.data.required           = values.data.required      || false;
        this.data.validators         = values.data.validators    || [];
        this.data.prepares           = values.data.prepares      || [];
        this.data.placeholder        = values.data.placeholder   || '';

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
            tagHasInner: false,
            attributes: [
                'placeholder="' +this.data.placeholder+'"',
                'value="'       +this.data.value+'"',
                'type="'        +this.data.type+'"',
                this.data.disabledAttribute

            ]
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
        if (this.data.disabled === true) // Do not clear if disabled.
            return;
        CUtils.element(this.uid()).value = '';
        CUtils.element(this.uid()).setAttribute('value','');
    },
    getName: function(){
        return this.data.name;
    },
    getValidators: function(){
        return this.data.validators;
    },
    disable: function(){
        this.data.disabled = true;
        CUtils.element(this.uid()).setAttribute('disabled','');
    },
    enable: function(){
        this.data.disabled = false;
        CUtils.element(this.uid()).removeAttribute('disabled');
    }

});


