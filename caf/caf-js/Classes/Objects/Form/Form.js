/**
 * Created by dvircn on 12/08/14.
 */
var CForm = Class(CContainer,{
    $statics: {
        DEFAULT_DESIGN: {
            marginRight:1,
            marginLeft:1,
            marginTop:1,
            margin: 'centered',
            textAlign: 'center'
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
        this.data.inputs            = values.data.inputs || [];
        this.data.saveToUrl         = values.data.saveToUrl || '';
        this.data.saveToUrlCallback = values.data.saveToUrlCallback || function(){};
        this.data.onSubmit          = values.data.onSubmit ||  function(){};
    },
    formValues: function() {
        var values = {};
        try {
            _.each(this.data.inputs,function(inputId){
                var input = CObjectsHandler.object(inputId);
                var name = input.getName();
                var value = input.value();
                var validators = input.getValidators();

                _.each(validators,function(name){
                    var validationResult = CValidators.validator(name).validate(value);
                    // Validation Failed!
                    if (!validationResult.isValid()){
                        CDialog.showDialog({
                            title: validationResult.getTitle(),
                            textContent: validationResult.getMessage(),
                            cancelText: 'OK',
                            dialogColor: 'Olive'
                        });
                        throw "Error"; // Return empty result.
                    }
                },this);
                // Add value to result values.
                values[name] = value;
            },this);
        } catch (e){
            return null;
        }
        return values;
    },
    clearForm: function() {
        // Clear each input.
        _.each(this.data.inputs,function(inputId){
            CObjectsHandler.object(inputId).clear();
        },this);
    },
    addInput: function(inputId) {
        this.data.inputs.push(inputId);
    },
    submitForm: function() {
        // Retrieve the values from the form.
        var values = this.formValues();
        // Check if the was validation error.
        if (values == null)     return;
        // Run onSubmit with the values.
        this.data.onSubmit(values);
    },
    sendFormToUrl: function() {
        // Retrieve the values from the form.
        var values = this.formValues();
        // Check if the was validation error.
        if (values == null)     return;
        // Run send with the values.
        CNetwork.send(this.data.saveToUrl,values,this.data.saveToUrlCallback);
    },
    saveFormToLocalStorage: function() {
        // Retrieve the values from the form.
        var values = this.formValues();
        // Check if the was validation error.
        if (values == null)     return;
        // save each value to the local storage.
        _.each(values,function(value,key){
            CLocalStorage.save(key,value);
        },this);
    }

});


