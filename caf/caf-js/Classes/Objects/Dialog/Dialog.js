/**
 * Created by dvircn on 16/08/14.
 */
var  CDialog = Class(CContainer,{
    $statics: {
        DEFAULT_DESIGN: {
            classes:'cDialog',
            top: 50,
            left: 0,
            right: 0,
            minHeight: 100/*,
            display: 'hidden'*/
        },
        DEFAULT_LOGIC: {
        },
        showDialog: function(parentId){
            if (CUtils.isEmpty(parentId))
                parentId = 'main-view';//CObjectsHandler.appContainerId;

            var newDialog = CObjectsHandler.createObject('Dialog',{
                design: {
                    bgColor:{color:'Red',level:1}
                }
            });
            CObjectsHandler.object(parentId).appendChild(newDialog);
        }
    },

    constructor: function(values) {
        if (CUtils.isEmpty(values)) return;
        // Merge Defaults.
        CObject.mergeWithDefaults(values,CDialog);
        // Invoke parent's constructor
        CDialog.$super.call(this, values);

        var dialog = this;

        // Create Overlay.
        this.dialogOverlay = CObjectsHandler.createObject('Object',{
            design: {
                classes: 'cDialogOverlay'
            },
            logic: {
                doStopPropagation: true,
                onClick: function(){
                    dialog.switchDialog();
                }
            }
        });
         // Add to Childs array.
        this.data.childs.push(this.dialogOverlay);



    },
    switchDialog: function(){
        CUtils.hideOrShow(this.uid(),'fadein300','fadeout300',300);
    }

});


