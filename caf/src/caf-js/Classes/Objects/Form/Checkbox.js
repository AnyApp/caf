/**
 * Created by dvircn on 17/12/14.
 */
var CCheckbox = Class(CInput,{
    $statics: {
        DEFAULT_DESIGN: {
            width: 37,
            height: 37,
            round: 'circle',
            bgColor: CColor('BlueB',10),
            cursor: 'pointer'
        },
        DEFAULT_LOGIC: {
        }
    },

    constructor: function(values) {
        if (CUtils.isEmpty(values)) return;
        // Merge Defaults.
        CObject.setObjectDefaults(values,CCheckbox);

        // Invoke parent's constructor
        CCheckbox.$super.call(this, values);
        
        this.data = this.data || {};
        this.data.value = this.data.value || false;
        this.data.defaultChecked = this.data.value || false;
            this.logic = this.logic || {};
        this.logic.icon = this.logic.icon || {
            name:   this.data.iconName    || 'check',
            size:   this.data.iconSize    || 28,
            align:  'center',
            color:  this.data.iconColor   || CColor('White'),
            design: this.data.iconDesign  || null
        };
        this.logic.onClicks = this.logic.onClicks || [];
        this.logic.onClicks.push(this.createChangeStateFunction(this));

        this.design = this.design || {};

        if (this.data.required)
            this.data.validators.unshift('isTrue');

        this.refreshState(this);
    },
    /**
     *  Build Object.
     */
    prepareBuild: function(data){
        // Prepare this element - wrap it's children.
        return CInput.$superp.prepareBuild.call(this,{
            tag: 'div',
            tagHasInner: true,
            attributes: []
        });
    },
    createChangeStateFunction: function(checkbox){
        return function(){
            if (checkbox.data.disabled === true)
                return;
            checkbox.data.value = !checkbox.data.value;
            checkbox.refreshState();
        };
    },
    refreshState: function(checkbox){
        if (CUtils.isEmpty(checkbox)) // For Async call.
            checkbox = this;
        var checkboxElement = CUtils.element(checkbox.uid());
        // If hasn't created yet, wait for creation (will happen only in init).
        if (CUtils.isEmpty(checkboxElement) && !CUtils.isEmpty(checkbox)){
            CThreads.run(function(){ checkbox.refreshState(); },200);
            return;
        }
        var icon = checkboxElement.getElementsByTagName('i')[0];
        if (CUtils.isEmpty(icon))
            return;
        if (checkbox.data.value === true)
            icon.style.color = '';
        else
            icon.style.color = 'transparent';
    },
    value: function() {
        return this.data.value;
    },
    setValue: function(value){
        this.data.value = value;
        this.refreshState();
    },
    clear: function() {
        this.data.value = this.data.defaultChecked;
        this.refreshState();
    },
    disable: function(){
        this.data.disabled = true;
    },
    enable: function(){
        this.data.disabled = false;
    }

});


