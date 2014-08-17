/**
 * Created by dvircn on 16/08/14.
 */
var  CDialog = Class(CContainer,{
    $statics: {
        DEFAULT_DESIGN: {
            classes:'cDialog',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            minHeight: 100

        },
        DEFAULT_LOGIC: {
        },
        showDialog: function(parentId){
            if (CUtils.isEmpty(parentId))
                parentId = CObjectsHandler.appContainerId;

            var newDialog = CObjectsHandler.createObject('Dialog',{
            });
            CObjectsHandler.object(parentId).appendChild(newDialog);
            CAnimations.show(newDialog);
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
            design: { classes: 'cDialogOverlay' },
            logic: { doStopPropagation: true,
                onClick: function(){ dialog.switchDialog(); }
            }
        });
        // Create Dialog Container.
        this.dialogContainer = CObjectsHandler.createObject('DialogContainer',{
            data: { childs: this.data.childs || []}
        });

        this.data.childs = [this.dialogContainer,this.dialogOverlay];

         // Add to Childs array.
        //this.data.childs.push(this.dialogOverlay);

        // Set default animation
        this.data.animation         =  this.data.animation  || 'fade';
        this.data.animationDuration =  this.data.animationDuration  || 300;



    },
    switchDialog: function(){
        CUtils.hideOrShow(this.uid(),'fadein300','fadeout300',300);
    }

});


