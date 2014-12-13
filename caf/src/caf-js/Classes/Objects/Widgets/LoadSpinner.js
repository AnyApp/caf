/**
 * Created by dvircn on 13/08/14.
 */
var CLoadSpinner = Class(CObject,{
    $statics: {
        DEFAULT_DESIGN: {
            height: 60,
            width: '100%',
            fontStyle:['bold'],
            color:CColor('TealE',7)

        },
        DEFAULT_LOGIC: {
            icon: { name:   'spinner9' }
        },
        spinClass:'infiniteSpin750'

    },

    constructor: function(values) {
        if (CUtils.isEmpty(values)) return;
        // Merge Defaults.
        CObject.setObjectDefaults(values,CLoadSpinner);

        // Invoke parent's constructor
        CLoadSpinner.$super.call(this, values);
        this.data.spinnerSize = this.data.spinnerSize || 40;
        this.logic.icon.size = this.data.spinnerSize;
        this.logic.icon.design = this.logic.icon.design || {};
        this.logic.icon.design.inline = this.logic.icon.design.inline ||'';
        this.logic.icon.design.inline += 'vertical-align: initial;';
        if (this.data.spinnerAutoStart===true){
            this.design.classes = this.design.classes || '';
            this.design.classes += CLoadSpinner.spinClass;
        }
    },
    startSpin: function(){
        var spinner = CUtils.element(this.uid());
        CUtils.addClass(spinner,CLoadSpinner.spinClass);
    },
    stopSpin: function(){
        var spinner = CUtils.element(this.uid());
        CUtils.removeClass(spinner,CLoadSpinner.spinClass);
    }


});

