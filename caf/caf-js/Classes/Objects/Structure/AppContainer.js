/**
 * Created by dvircn on 07/08/14.
 */
var CAppContainer = Class(CContainer,{
    $statics: {
        DEFAULT_DESIGN: {
            classes: 'app_container',
            direction: 'ltr'
        },
        DEFAULT_LOGIC: {
        }
    },

    constructor: function(values) {
        if (CUtils.isEmpty(values)) return;
        // Merge Defaults.
        CObject.mergeWithDefaults(values,CAppContainer);

        // Invoke parent's constructor
        CAppContainer.$super.call(this, values);

        this.data.childs = this.data.childs || [];
        var dialogsContainer = CObjectsHandler.createObject('Container',{
            design:{
                position: 'absolute',
                display:'displayNone',
                top:0,bottom:0,right:0,left:0
            }
        });
        CObjectsHandler.dialogsContainerId = dialogsContainer;
        this.appendChild(dialogsContainer);
    }

});


