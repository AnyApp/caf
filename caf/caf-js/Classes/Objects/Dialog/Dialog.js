/**
 * Created by dvircn on 16/08/14.
 */
var  CDialog = Class(CContainer,{
    $statics: {
        DEFAULT_DESIGN: {
            classes:'cDialog',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            minHeight: 100


        },
        DEFAULT_LOGIC: {
        },
        showDialog: function(parentId){
            if (CUtils.isEmpty(parentId))
                parentId = CObjectsHandler.appContainerId;

            var newDialog = CObjectsHandler.createObject('Dialog',{
                data: {
                    title: 'Confirmation',
                    topView: 'form-submit-button'
                },
                design: {
                    width: 250,
                    height:400
                }
            });
            CObjectsHandler.object(parentId).appendChild(newDialog);
            CObjectsHandler.object(newDialog).show();
        }
    },

    constructor: function(values) {
        if (CUtils.isEmpty(values)) return;

        values.design = values.design || {};
        // Container design.
        var containerDesign = CUtils.clone(values.design);
        values.design = {};
        // Merge Defaults.
        CObject.mergeWithDefaults(values,CDialog);
        // Invoke parent's constructor
        CDialog.$super.call(this, values);

        var dialog = this;

        // Create Overlay.
        this.dialogOverlay = CObjectsHandler.createObject('Object',{
            design: { classes: 'cDialogOverlay' },
            logic: { doStopPropagation: true,
                onClick: function(){ dialog.hide(); }
            }
        });
        // Create Dialog Container.
        this.dialogContainer = CObjectsHandler.createObject('DialogContainer',{
            data: { childs: this.data.childs || []},
            design: containerDesign
        });
        // Add to Childs array.
        this.data.childs = [this.dialogContainer,this.dialogOverlay];

        // Set default animation
        this.data.animation         =  this.data.animation          || 'fade';
        this.data.animationDuration =  this.data.animationDuration  || 100;

        this.data.topView = this.data.topView || CObjectsHandler.appContainerId;

        // Set Destroy on Hide.
        this.setDestroyOnHide();
        // Create title view if needed.
        this.setTitle();

        // Set Position.
        this.setPosition();

        var dialog = this;
        this.logic.init = function(){
            dialog.onResize();
        }
    },
    hide: function(){
        CAnimations.hide(this.uid());
    },
    show: function(){
        CAnimations.show(this.uid());
    },
    switchDialog: function(){
        CAnimations.hideOrShow(this.uid());
    },
    setDestroyOnHide: function(){
        var object = this;
        this.data.destroyOnhide = this.data.destroyOnhide || true;
        if (this.data.destroyOnhide){
            this.data.onAnimHideComplete = function(){
                object.removeSelf();
                CUtils.unbindEvent(window,'resize',object.onResize);
            };
        }
    },
    setTitle: function(){
        this.data.title = this.data.title || '';
        if (CUtils.isEmpty(this.data.title))
            return;
        // Create Title.
        this.dialogTitle = CObjectsHandler.createObject('Object',{
            design: {
                color: {color:'Blue',level:0},
                borderColor: {color:'Blue',level:0},
                border: { bottom: 2},
                width:'100%',
                height: 45,
                fontSize:18,
                fontStyle: ['bold'],
                textAlign: 'center'
            },
            logic: {
                text: this.data.title
            }
        });

        CObjectsHandler.object(this.dialogContainer).data.childs.push(this.dialogTitle);
    },
    setPosition: function () {
        var dialog = this;
        this.onResize = function(){
            var position        = dialog.data.position || 'center';
            var container       = CUtils.element(dialog.dialogContainer);
            var topView         = CUtils.element(dialog.data.topView);
            var containerRect   = container.getBoundingClientRect();
            var containerWidth  = containerRect.width;
            var topViewRect     = topView.getBoundingClientRect();
            var topViewWidth    = topViewRect.width;
            var topViewLeft     = topViewRect.left;
            var windowSize      = CUtils.wndsize();
            var windowWidth     = windowSize.width;


            if (dialog.data.topView===CObjectsHandler.appContainerId)
                container.style.top = (CAppConfig.get('headerSize')+20)+'px';
            else {
                var distanceFromBottom = (windowSize.height-(topViewRect.top+topViewRect.height));
                if (distanceFromBottom < 100 ){
                    
                }
                else {
                    container.style.maxHeight = (windowSize.height-(topViewRect.top+topViewRect.height))+'px'
                    container.style.top = (topViewRect.top+topViewRect.height)+'px';
                }
            }

            // Align Right
            if (position==='right')
                container.style.right = (windowWidth-(topViewLeft+topViewWidth))+'px';
            // Align Left
            else if (position==='left')
                container.style.right = (windowWidth-(topViewLeft+topViewWidth) + (topViewWidth-containerWidth))+'px';
            // Align Center
            else
                container.style.right = (windowWidth-(topViewLeft+topViewWidth) + (topViewWidth-containerWidth)/2 )+'px';

        };
        window.addEventListener('resize',this.onResize);
    }


});


