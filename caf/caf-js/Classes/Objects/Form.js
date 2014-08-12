/**
 * Created by dvircn on 12/08/14.
 */
var CForm = Class(CContainer,{
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
        this.data.inputs             = this.data.inputs || [];
        this.logic.saveToUrl         = this.logic.saveToUrl || [];
        this.logic.saveToUrlCallback = this.logic.saveToUrlCallback || [];
        this.logic.onSubmit          = this.logic.onSubmit || [];
    },
    /**
     *  Build Object.
     */
    prepareBuild: function(data){
        // Prepare this element - wrap it's children.
        this.$class.$superp.prepareBuild.call(this,data);
    },
    formValues: function() {
        var values = {};
        try {
            _.each(this.data.inputs,function(inputId){
                var input = CObjectsHandler.object(inputId);
                var name = input.name;
                var value = input.value();
                var validators = input.validators;
                _.each(validators,function(name){
                    var validationResult = CValidators.validator(name).validate(value);
                    // Validation Failed!
                    if (!validationResult.isValid()){
                        // Dialog Color Showcase.
                        //TODO Remove
                        var colors = ['Blue','Pink','Red','Purple','Brown','Green','Cyan','Gray'];
                        var color = colors[Math.floor(Math.random() * colors.length)];
                        // Show Message.
                        CDialogs.show({
                            title: validationResult.getTitle(),
                            content:validationResult.getMessage(),
                            closeText:'Close',closeCallback:function(){
                                CLog.log('Closed..')
                            },
                            confirmText:'Confirm',confirmCallback:function(){
                                CLog.log('Confirmed..')
                            },
                            extraText:'Extra',extraCallback:function(){
                                CLog.log('Extra..')
                            },
                            color:color});
                        throw "Error"; // Return empty result.
                    }
                });
                // Add value to result values.
                values[name] = value;
            });
        } catch (e){
            return null;
        }
        return values;
    },
    clearForm: function() {
        // Clear each input.
        _.each(this.data.inputs,function(inputId){
            CObjectsHandler.object(inputId).clear();
        });
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
        this.logic.onSubmit(values);
    },
    sendFormToUrl: function() {
        // Retrieve the values from the form.
        var values = this.formValues();
        // Check if the was validation error.
        if (values == null)     return;
        // Run send with the values.
        CNetwork.send(this.logic.saveToUrl,values,this.logic.saveToUrlCallback);
    },
    saveFormToLocalStorage: function() {
        // Retrieve the values from the form.
        var values = this.formValues();
        // Check if the was validation error.
        if (values == null)     return;
        // save each value to the local storage.
        _.each(values,function(value,key){
            CLocalStorage.save(key,value);
        });
    }

});


