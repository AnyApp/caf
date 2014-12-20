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
        CObject.setObjectDefaults(values,CForm);

        // Invoke parent's constructor
        this.$class.$super.call(this, values);
        this.data.inputs            = values.data.inputs || [];
        this.data.sendToUrl         = values.data.sendToUrl || '';
        this.data.sendToUrlPrepare  = values.data.sendToUrlPrepare || function(){};
        this.data.formOnValidationFailure  = values.data.formOnValidationFailure || function(){};
        this.data.sendToUrlCallback = values.data.sendToUrlCallback || function(){};
        this.data.onSubmit          = values.data.onSubmit ||  function(){};
        this.data.prepareValues     = values.data.prepareValues ||  function(values) {return values;};
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
                        /*
                        CDialog.showDialog({
                            title: validationResult.getTitle(),
                            textContent: validationResult.getMessage(),
                            cancelText: 'OK',
                            dialogColor: {color:'Red', level: 4}
                        });
                        */
                        throw {
                            source: 'formValues',
                            msg: 'Validation Error: '+validationResult.getMessage(),
                            input: input.getName(),
                            validator: name
                        }; // Throw Exception.
                    }
                },this);
                // Add value to result values.
                values[name] = value;
            },this);
        } catch (e){
            CLog.error('Error occured while getting Form.formValues.');
            CLog.log(e);
            if (this.data.formOnValidationFailure)
                this.data.formOnValidationFailure(this,e);
            return null;
        }
        values = this.data.prepareValues(values);
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
        if (this.data.sendToUrlPrepare)
            this.data.sendToUrlPrepare(this);
        // Run send with the values.
        CNetwork.send(this.data.sendToUrl,values,this.getFormSendToURLCallback(this),this.getFormSendToURLCallback(this));
    },
    getFormSendToURLCallback: function(form){
        return function(result){
            form.data.sendToUrlCallback(form,result);
        }
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


