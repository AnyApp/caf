/**
 * Created by dvircn on 16/08/14.
 */
var CDialog = Class(CContainer,{
    $statics: {
        DEFAULT_DESIGN: {
            classes:'cDialog',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            minHeight: 100,
            display: 'hidden'


        },
        DEFAULT_LOGIC: {
        },
        showDialog: function(parentId){
            var startLoadObjects = (new  Date()).getTime();
            if (CUtils.isEmpty(parentId))
                parentId = CObjectsHandler.appContainerId;

            var newDialog = CObjectsHandler.createObject('Dialog',{
                data: {
                    title: 'Confirmation',
                    //topView: 'main-button',
                    //textContent: 'Always do good things. Good things lead to better society, happiness, health and freedom.'
                    list: ['dvir','cohen','tal','levi']
                },
                design: {
                    width: 250,
                    height:'auto'
                }
            });

            CObjectsHandler.object(parentId).appendChild(newDialog);
            CObjectsHandler.object(newDialog).show();
            var endLoadObjects  = (new  Date()).getTime();
            //alert((endLoadObjects-startLoadObjects)/1000+" Time");
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

        // Set defaults
        this.data.animation         = this.data.animation           || 'fade';
        this.data.animationDuration = this.data.animationDuration   || 300;
        this.data.topView           = this.data.topView             || CObjectsHandler.appContainerId;
        this.data.destroyOnhide     = this.data.destroyOnhide       || true;
        this.data.titleAlign        = this.data.titleAlign          || 'center';
        this.data.textContentAlign  = this.data.textContentAlign    || CAppConfig.get('textAlign') || 'center';
        this.data.textContent       = this.data.textContent         || '';
        this.data.textContentAlign  = this.data.textContentAlign    || CAppConfig.get('textAlign') || 'center';
        this.data.objectContent     = this.data.objectContent       || '';
        this.data.list              = this.data.list                || [];
        this.data.iconsList         = this.data.iconsList           || [];
        this.data.iconsAlign        = this.data.iconsAlign          || CAppConfig.get('textAlign') || 'left';
        this.data.listCallbacks     = this.data.listCallbacks       || [];
        this.data.chooseCallback    = this.data.chooseCallback      || function(index,value){};
        this.data.hideOnListChoose  = this.data.hideOnListChoose    || true;
        this.data.cancelText        = this.data.cancelText          || '';
        this.data.cancelCallback    = this.data.cancelCallback      || function(){};
        this.data.confirmText       = this.data.confirmText         || '';
        this.data.confirmCallback   = this.data.confirmCallback     || function(){};
        this.data.extraText         = this.data.extraText           || '';
        this.data.extraCallback     = this.data.extraCallback       || function(){};

        // Init function.
        var dialog = this;
        this.logic.init = function(){ dialog.onResize(); }
        // Set destroy on hide handler.
        this.setDestroyOnHideHandler();
        // Create sub views.
        this.createContainerAndOverlay(containerDesign);
        // Create title view if needed.
        this.createTitle();
        this.createContainer();
        this.createContent();
        this.createList();
        this.createButtons();
        // Set Position.
        this.setPositionHandler();

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
    setDestroyOnHideHandler: function(){
        var object = this;
        if (this.data.destroyOnhide){
            this.data.onAnimHideComplete = function(){
                object.removeSelf();
                CUtils.unbindEvent(window,'resize',object.onResize);
            };
        }
    },
    createContainerAndOverlay: function(containerDesign){
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

    },
    createTitle: function(){
        if (CUtils.isEmpty(this.data.title))
            return;
        // Create Title.
        this.dialogTitle = CObjectsHandler.createObject('Object',{
            design: {
                color: {color:'Cyan',level:1},
                borderColor: {color:'Cyan',level:1},
                border: { bottom: 2},
                width:'100%',
                height: 45,
                fontSize:18,
                fontStyle: ['bold'],
                textAlign: this.data.titleAlign
            },
            logic: {
                text: this.data.title
            }
        });

        CObjectsHandler.object(this.dialogContainer).data.childs.push(this.dialogTitle);
    },
    createContainer: function(){
        if (CUtils.isEmpty(this.data.title))
            return;
        // Create Title.
        this.contentContainer = CObjectsHandler.createObject('Container',{
            design: {
                width:'100%',
                height: 'auto',
                marginTop: 4
            }
        });

        CObjectsHandler.object(this.dialogContainer).data.childs.push(this.contentContainer);

    },
    appendContent: function(contentId){
        CObjectsHandler.object(this.contentContainer).data.childs.push(contentId);
    },
    createContent: function () {
        var contentId = null;
        if (!CUtils.isEmpty(this.data.objectContent))
            contentId = this.data.objectContent;
        else if (!CUtils.isEmpty(this.data.textContent)){
            contentId = CObjectsHandler.createObject('Object',{
                design: {
                    color: {color:'Black'},
                    width:'95%',
                    height: 'auto',
                    fontSize:16,
                    fontStyle: ['bold'],
                    margin: 'centered',
                    textAlign: this.data.textContentAlign
                },
                logic: {
                    text: this.data.textContent
                }
            });
        }

        if (contentId!=null)
            this.appendContent(contentId);
    },
    createList: function () {
        var list            = this.data.list,
            iconsList       = this.data.iconsList,
            listCallbacks   = this.data.listCallbacks,
            chooseCallback  = this.data.chooseCallback,
            actualCallbacks = [],
            dialog          = this;

        // Allow create icon only list.
        while (list.length < iconsList.length){
            list.push('');
        }

        // Set up callbacks.
        for (var i=0;i<list.length;i++) {
            var index = i;
            var listCallback = index < listCallbacks.length ?
                listCallbacks[index] : function(){};
            var chosenCallback = !CUtils.isEmpty(chooseCallback) ? function() {
                chooseCallback(index);
            } : function(){};
            var hideOnChoose = this.hideOnListChoose ? function(){
                dialog.hide();
            } : function(){};

            actualCallbacks[index] = function(){
                listCallback();
                chosenCallback();
                hideOnChoose();
            };
        }

        // Create elements.
        _.each(list,function(text,index){
            var icon = index < iconsList.length ? iconsList[index] : '';
            this.createListElement(text,icon,actualCallbacks[index]);
        },this);


    },
    createListElement: function (text,icon,callback) {
        var design = {
            color: {color:'Black'},
            width:'100%',
            height: 'auto',
            boxSizing: 'borderBox',
            fontSize:16,
            fontStyle: ['bold'],
            margin: 'centered',
            paddingTop:7,
            paddingBottom:7,
            paddingRight:7,
            paddingLeft:7,
            textAlign: this.data.textContentAlign,
            active: { bgColor: { color: 'Cyan',level:0}, color: {color:'White'}}
        };

        // Set icon design
        if (!CUtils.isEmpty(icon)) {
            var iconDesign = 'iconOnly';
            if (!CUtils.isEmpty(text)){
                if (this.iconsAlign=='left')
                    iconDesign = 'iconLeft';
                if (this.iconsAlign=='right')
                    iconDesign = 'iconRight';
            }
            design[iconDesign] = icon;
        }


        var contentId = CObjectsHandler.createObject('Button',{
                design: design,
                logic: {
                    text: text,
                    onClick: callback
                }
            });

        this.appendContent(contentId);
    },
    createButtons: function () {

    },
    setPositionHandler: function () {
        var dialog = this;
        this.onResize = function(){
            if (CUtils.isEmpty(CUtils.element(dialog.dialogContainer)))
                return;

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
                    container.style.top = topViewRect.top-containerRect.height+'px';
                    container.style.maxHeight = (topViewRect.top-10)+'px';
                }
                else {
                    container.style.maxHeight = (windowSize.height-(topViewRect.top+topViewRect.height)-10)+'px';
                    container.style.top = (topViewRect.top+topViewRect.height)+'px';
                }
            }

            var right = (windowWidth-(topViewLeft+topViewWidth) + (topViewWidth-containerWidth)/2 );

            // Check bounds.
            if (right<1)
                right = 1;

            if (right >= (windowWidth-containerRect.width) )
                right = windowWidth-containerRect.width-1;

            container.style.right = right + 'px';

        };
        window.addEventListener('resize',this.onResize);
    }


});


