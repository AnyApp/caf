caf.ui.forms =
{
    map: {},
    validators:{},
    prepares:{},
    init: function()
    {
        this.initValidators();
        this.initPrepares();
    },
    createForm: function(name)
    {
        this.map[name] =
        {
            inputs: {},
            name: name,
            saveToUrl: '',
            saveToUrlCallback: function(values){},
            onSubmit: function(){},
            clear: function()
            {
                caf.ui.forms.clearForm(this.name);
            },
            addInput: function(id,type)
            {
                caf.ui.forms.addInput(this.name,id,type);
            },
            values: function()
            {
                return caf.ui.forms.formValues(this.name);
            }
        }
    },
    setFormOnSubmit: function(name,onSubmit)
    {
        this.map[name].onSubmit = onSubmit;
    },
    setFormSaveToUrl: function(name,url)
    {
        this.map[name].saveToUrl = url;
    },
    setFormSaveToUrlCallback: function(name,callback)
    {
        this.map[name].saveToUrlCallback = callback;
    },
    formValues: function(name)
    {
        var form = this.map[name];
        var values = {};
        for (var iInput in form.inputs)
        {
            // Get value and validate.
            var input = form.inputs[iInput];
            var name = input.name;
            var value = input.value();
            var validators = input.validators;
            for (var iValidator in validators)
            {
                var validationResult = caf.ui.forms.validators[validators[iValidator]](value);
                // Validation Failed!
                if (!validationResult.isValid)
                {
                    // Show Message.
                    caf.ui.dialogs.showErrorMessage(validationResult.title,validationResult.msg);
                    return null; // Return empty result.
                }
            }
            // Add value to result values.
            values[name] = value;
        }
        return values;
    },
    clearForm: function(name)
    {
        var form = this.map[name];
        for (var iInput in form.inputs)
        {
            form.inputs[iInput].clear();
        }
    },
    addInput: function(formName,inputId,inputName,type,validators,prepares)
    {
        this.map[formName].inputs[inputId] = this.createInput(inputId,inputName,type,validators,prepares);
    },
    /**
     *
     * @param id - id in the DOM.
     * @param type - type of the input
     * @param validator - name of validator function or ( function(value) { return isValid; } )
     * @param prepare - name of prepare function or ( function(value) { return preparedValue; } )
     * @returns {{id: *,name: *, type: *, validators: *, prepares: *, value: Function}}
     */
    createInput: function(id,name,type,validators,prepares)
    {
        // Prepare & Validator.
        validators = caf.utils.isEmpty(validators)?
            caf.ui.forms.validators.validators['no-check'] :
            eval(validators);
        prepares = caf.utils.isEmpty(prepares)?
            this.prepares['same'] :
            eval(prepares);

        return {
            id: id,
            name: name,
            type: type,
            validators: validators,
            prepares:prepares,
            value: function()
            {
                var value = document.getElementById(this.id).value;
                for (var iPrepare in this.prepares)
                {
                    value = caf.ui.forms.prepares[this.prepares[iPrepare]](value);
                }
                return value;
            },
            clear: function()
            {
                document.getElementById(this.id).value = '';
                document.getElementById(this.id).setAttribute('value','');
            }
        };
    },
    submitForm: function(name)
    {
        var form = this.map[name];
        // Retrieve the values from the form.
        var values = form.values();
        // Check if the was validation error.
        if (values == null)     return;
        // Run onSubmit with the values.
        form.onSubmit(values);
    },
    sendFormToUrl: function(name)
    {
        var form = this.map[name];
        // Retrieve the values from the form.
        var values = form.values();
        // Check if the was validation error.
        if (values == null)     return;
        // Run send with the values.
        caf.net.send(form.saveToUrl,values,form.saveToUrlCallback);
    },
    saveFormToLocalStorage: function(name)
    {
        var form = this.map[name];
        // Retrieve the values from the form.
        var values = form.values();
        // Check if the was validation error.
        if (values == null)     return;
        // save each value to the local storage.
        for (var key in values)
        {
            caf.localStorage.save(key, values[key]);
        }
    },
    addValidator: function(name,validate,errorTitle,errorMsg)
    {
        this.validators[name] =
            function(value)
            {
                if (validate(value))    return {isValid: true, msg:'', title:''};
                else                    return {isValid: false, msg:errorMsg, title:errorTitle};
            };
    },
    initValidators: function()
    {
        this.addValidator('no-check',function(value){return true;},'','');
        this.addValidator('not-empty',function(value){return !caf.utils.isEmpty(value);},'Error','Value is empty');
    },
    addPrepare: function(name,prepare)
    {
        this.prepares[name] = prepare;
    },
    initPrepares: function()
    {
        this.addPrepare('same',function(value){return value;});
        this.addPrepare('numbers-only',function(value){
            return value.replace(/\D/g,'');
        });
    },
    logValues: function(values)
    {
        caf.log(values);
    }

}

