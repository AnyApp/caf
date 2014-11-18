/**
 * Created by dvircn on 16/08/14.
 */
var CDialog = Class(CContainer,{
    $statics: {
        DEFAULT_DESIGN: {
            classes:'cDialog '+CAnimations.noDisplay,
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            minHeight: 100


        },
        DEFAULT_LOGIC: {
        },
        showDialog: function(data,design){
            data                = data || {
                destroyOnHide: true
            };
            design              = design || {};

            data                = CUtils.clone(data);
            design              = CUtils.clone(design);

            var newDialog = CObjectsHandler.createObject('Dialog',{data: data,design: design });
            CObjectsHandler.object(CObjectsHandler.dialogsContainerId).appendChild(newDialog);
            var onBuildFinish = function() {CObjectsHandler.object(newDialog).show();};
            CObjectsHandler.object(CObjectsHandler.dialogsContainerId).rebuild(onBuildFinish);
            return newDialog;
        },
        hideDialogContainer: function(){
            CUtils.element(CObjectsHandler.dialogsContainerId).style.zIndex='';
            CUtils.element(CObjectsHandler.dialogsContainerId).style.display='';
        },
        showDialogContainer: function(){
            CUtils.element(CObjectsHandler.dialogsContainerId).style.zIndex='10000';
            CUtils.element(CObjectsHandler.dialogsContainerId).style.display='inherit';
        }
    },

    constructor: function(values) {
        if (CUtils.isEmpty(values)) return;

        values.design           = values.design || {};
        values.design.width     = values.design.width || 400;
        values.design.height    = 'auto';

        // Container design.
        var containerDesign = CUtils.clone(values.design);
        values.design = {};
        // Merge Defaults.
        CObject.setObjectDefaults(values,CDialog);
        // Invoke parent's constructor
        CDialog.$super.call(this, values);

        // Set defaults
        this.data.animation         = this.data.animation           || 'fade';
        this.data.topView           = this.data.topView             || CObjectsHandler.appContainerId;
        this.data.destroyOnHide     = this.data.destroyOnHide===false? false : true;
        this.data.hideOnOutClick    = this.data.hideOnOutClick===false? false : true;
        this.data.title             = this.data.title               || '';
        this.data.textContent       = this.data.textContent         || '';
        this.data.objectContent     = this.data.objectContent       || '';
        this.data.list              = this.data.list                || {};
        this.data.hideOnListChoose  = this.data.hideOnListChoose===false? false : true;
        this.data.cancelCallOnHide  = this.data.cancelCallOnHide===false? false : true;
        this.data.cancelText        = this.data.cancelText          || '';
        this.data.cancelCallback    = this.data.cancelCallback      || function(){};
        this.data.confirmText       = this.data.confirmText         || '';
        this.data.confirmCallback   = this.data.confirmCallback     || function(){};
        this.data.extraText         = this.data.extraText           || '';
        this.data.extraCallback     = this.data.extraCallback       || function(){};
        // Design
        this.data.dialogColor       = this.data.dialogColor         || CColor('TealE',8);
        this.data.bgColor           = this.data.bgColor             || {color:'Gray',level:0};
        this.data.contentColor      = this.data.contentColor        || {color:'Gray',level:12};
        this.data.listBorderColor   = this.data.listBorderColor     || {color:'Gray',level:2};
        this.data.titleColor        = this.data.titleColor          || this.data.dialogColor;
        this.data.titleAlign        = this.data.titleAlign          || 'center';
        this.data.contentAlign      = this.data.contentAlign        || CGlobals.get('appGeneralAlign') || 'center';
        this.data.dialogWidth       = this.data.dialogWidth         || 400;
        containerDesign.width       = this.data.dialogWidth;
        containerDesign.bgColor     = this.data.bgColor;


        // Init function.
        var dialog = this;
        dialog.isHidden = true;
        // Adnimation handling.
        this.data.onAnimShowComplete = function(){
            dialog.isHidden = false;
            CThreads.runTimes(dialog.onResize,0,100,15);
        };

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
    hide: function(callback){
        if (CAnimations.objectInAnim(this) && this.isHidden === false)
            return;
        // Check if need to set cancel callback\use the given callback
        // or do not call callback - empty function;
        if (CUtils.isEmpty(callback) && !CUtils.isEmpty(this.data.cancelCallback)
            && this.data.cancelCallOnHide === true) {
            callback = this.data.cancelCallback;
        }
        else if (CUtils.isEmpty(callback)) {
            callback = function(){};
        }

        callback();
        CAnimations.hide(this.uid());
    },
    postponeHide: function(dialog,callback){
        CThreads.run(function(){
            dialog.hide(callback);
        },100);
    },
    show: function(){
        if (CAnimations.objectInAnim(this) && this.isHidden === true)
            return;

        CDialog.showDialogContainer();
        CAnimations.show(this.uid());
        this.onResize();
    },
    postponeShow: function(dialog){
        CThreads.run(function(){
            dialog.show();
        },100);
    },
    switchDialog: function(){
        CAnimations.hideOrShow(this.uid());
        this.onResize();
    },
    setDestroyOnHideHandler: function(){
        var object = this;
        if (this.data.destroyOnHide){
            this.data.onAnimHideComplete = function(){
                this.isHidden = true;
                object.removeSelf();
                CUtils.unbindEvent(window,'resize',object.onResize);
                // Hide dialogs container.
                CDialog.hideDialogContainer();
            };
        }
        else {
            this.data.onAnimHideComplete = function(){
                this.isHidden = true;
                // Hide dialogs container.
                CDialog.hideDialogContainer();
            };
        }
    },
    createContainerAndOverlay: function(containerDesign){
        var dialog = this;
        var overlayOnClick = this.data.hideOnOutClick===true?
            function(){ dialog.hide();} : function(){};

        // Create Overlay.
        this.dialogOverlay = CObjectsHandler.createObject('Object',{
            design: { classes: 'cDialogOverlay' },
            logic: { doStopPropagation: true,
                onClick: overlayOnClick
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
                color: this.data.titleColor,
                borderColor: this.data.dialogColor,
                border: { bottom: 2},
                width:'100%',
                height: 45,
                fontSize:19,
                fontStyle: ['bold'],
                textAlign: this.data.titleAlign
            },
            logic: {
                text: this.data.title
            }
        });

        CObjectsHandler.object(this.dialogContainer).appendChild(this.dialogTitle);
    },
    createContainer: function(){
        // Create container.
        this.contentContainer = CObjectsHandler.createObject('Container',{
            design: {
                width:'100%',
                height: 'auto',
                //overflow: 'scrollable',
                boxSizing: 'borderBox'
            },
            logic: {}
        });
        // Set scrollable.
        CScrolling.setScrollable(CObjectsHandler.object(this.contentContainer));

        CObjectsHandler.object(this.dialogContainer).appendChild(this.contentContainer);

    },
    appendContent: function(contentId) {
        CObjectsHandler.object(this.contentContainer).appendChild(contentId);
    },
    createContent: function () {
        var contentId = null;
        if (!CUtils.isEmpty(this.data.objectContent))
            contentId = this.data.objectContent;
        else if (!CUtils.isEmpty(this.data.textContent)){
            contentId = CObjectsHandler.createObject('Object',{
                design: {
                    color: this.data.contentColor,
                    width:'95%',
                    height: 'auto',
                    fontSize:17,
                    fontStyle: ['bold'],
                    margin: 'centered',
                    paddingTop: 10,
                    paddingBottom: 10,
                    textAlign: this.data.contentAlign
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
        var list            = this.data.list;
        if (CUtils.isEmpty(list) || CUtils.isEmpty(list.logic) ||
            list.logic.template !== true || CUtils.isEmpty(list.data) || CUtils.isEmpty(list.data.template) )
            return;

        var design = {
            color: this.data.contentColor, width:'100%', height: '45', boxSizing: 'borderBox',
            fontSize:17, fontStyle: ['bold'], paddingRight:7, paddingLeft:7,
            textAlign: this.data.contentAlign, display: 'block',
            active: { bgColor: this.data.dialogColor, color: {color:'White'}}
        };

        if (!CUtils.isEmpty(list.data.template.object))
            list.data.template.object.design =
                CUtils.mergeJSONs(design,list.data.template.object.design || {});

        // List template item container - Border
        list.data.template.container    = list.data.template.container  || {type:'Container'};
        var containerDesign = {borderColor: this.data.listBorderColor,border: {top:1},
                            width:'100%',display:'inlineBlock'};
        list.data.template.container.design =
            CUtils.mergeJSONs(containerDesign,list.data.template.container.design);

        list.data.template.callback =  this.createListCallback(this,list.data.template.callback);

        var listId = CObjectsHandler.createObject('Template',list);
        this.appendContent(listId);

        return;
        /*var    iconsList       = this.data.iconsList,
            listCallbacks   = this.data.listCallbacks,
            listItemsData   = this.data.listItemsData,
            listItemsLogic  = this.data.listItemsLogic,
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
            var text = list[index] || '';
            var icon = index < iconsList.length ? iconsList[index] : '';
            var data = index < listItemsData.length ? listItemsData[index] : {};
            var logic = index < listItemsLogic.length ? listItemsLogic[index] : {};

            var listCallback = index < listCallbacks.length ?
                listCallbacks[index] : function(){};
            var chosenCallback = !CUtils.isEmpty(chooseCallback) ? function(index,text) {
                chooseCallback(index,text);
            } : function(){};

            var hideOnChoose = this.data.hideOnListChoose === true ? function(){
                dialog.hide();
            } : function(){};

            this.createListElement(index,text,data,logic,icon,listCallback,chosenCallback,hideOnChoose);
        }*/

    },
    createListCallback: function(dialog,callback){
        return this.data.hideOnListChoose === true ? function(index,data){
            callback(index,data);
            dialog.hide();
        } : function(index,data){
            callback(index,data);
        };
    },
    createListElement: function (index,text,data,customLogic,icon,listCallback,chosenCallback,hideOnChoose) {
        var design = {
            color: this.data.contentColor,
            width:'100%',
            height: '45',
            boxSizing: 'borderBox',
            fontSize:17,
            fontStyle: ['bold'],
            //margin: 'centered',
            paddingRight:7,
            paddingLeft:7,
            border: {top:1},
            borderColor: this.data.listBorderColor,
            textAlign: this.data.contentAlign,
            active: { bgColor: this.data.dialogColor, color: {color:'White'}}
        };

        design = CUtils.mergeJSONs(design,this.data.listDesign);

        if (index === 0)
            design.border = {};

        var logic = {
            text: text,
                onClick: function(){
                listCallback();
                chosenCallback(index,text);
                hideOnChoose();
            }
        };

        // Set icon design
        if (!CUtils.isEmpty(icon)) {
            var iconAlign = '';
            if (!CUtils.isEmpty(text)){
                if (this.data.iconsAlign=='left')
                    iconAlign = 'left';
                if (this.data.iconsAlign=='right')
                    iconAlign = 'right';
            }
            logic.icon = {
                name:   icon,
                size:   this.data.iconsSize,
                align:  iconAlign || null
            }
        }
        logic = CUtils.mergeJSONs(logic,customLogic);

        var contentId = CObjectsHandler.createObject('Button',{
                design: design,
                logic: logic,
                data:data
            });

        this.appendContent(contentId);
    },
    createButtons: function () {
        var countButtons = 0;
        if (!CUtils.isEmpty(this.data.cancelText))  countButtons++;
        if (!CUtils.isEmpty(this.data.confirmText)) countButtons++;
        if (!CUtils.isEmpty(this.data.extraText))   countButtons++;

        // Create Buttons container.
        if (countButtons===0)
            return;
         // Create buttons container.
        this.buttonsContainer = CObjectsHandler.createObject('Container',{
            design: {
                borderColor: this.data.dialogColor,
                border: { top: 1},
                marginTop: 1,
                width:'100%',
                height: 'auto'
            }
        });

        CObjectsHandler.object(this.dialogContainer).appendChild(this.buttonsContainer);

        // Create all buttons
        var currentButton = 0;
        if (!CUtils.isEmpty(this.data.cancelText)) {
            this.createAndAddButton(this,currentButton,countButtons,this.data.cancelText,  this.data.cancelCallback);
            currentButton++;
        }
        if (!CUtils.isEmpty(this.data.confirmText)) {
            this.createAndAddButton(this,currentButton,countButtons,this.data.confirmText, this.data.confirmCallback);
            currentButton++;
        }
        if (!CUtils.isEmpty(this.data.extraText)) {
            this.createAndAddButton(this,currentButton,countButtons,this.data.extraText,   this.data.extraCallback);
        }

    },
    createAndAddButton: function(dialog,currentButton,countButtons,text,callback){
        var design = {
            color: this.data.dialogColor,
            width:'100%',
            height: 'auto',
            boxSizing: 'borderBox',
            fontSize:18,
            fontStyle: ['bold'],
            margin: 'centered',
            display: 'inlineBlock',
            paddingTop:14,
            paddingBottom:14,
            borderColor: this.data.dialogColor,
            textAlign: 'center',
            active: { bgColor: this.data.dialogColor, color: {color:'White'}}
        };

        // Set Borders.
        // DONOT border right because in rtl things go wild..
//        if (currentButton===0 && countButtons>1/**/)
//            design.border = {right:1}
        if (currentButton===2)
            design.border = {top:1}
        // Change width if needed.
        if (currentButton<2 && countButtons>1)
            design.width = '50%'

        var contentId = CObjectsHandler.createObject('Button',{
            design: design,
            logic: {
                text: text,
                onClick: function(){
                    dialog.hide(callback);
                }
            }
        });

        // Add to container.
        CObjectsHandler.object(this.buttonsContainer).appendChild(contentId);

    },
    setPositionHandler: function () {
        var dialog = this;
        this.onResize = function(){
            if (CUtils.isEmpty(CUtils.element(dialog.dialogContainer)))
                return;

            var container           = CUtils.element(dialog.dialogContainer);
            var topView             = CUtils.element(dialog.data.topView);
            var containerRect       = container.getBoundingClientRect();
            var containerWidth      = containerRect.width;
            var topViewRect         = topView.getBoundingClientRect();
            var topViewWidth        = topViewRect.width;
            var topViewLeft         = topViewRect.left;
            var windowSize          = CUtils.wndsize();
            var windowWidth         = windowSize.width;

            var containerMaxHeight = windowSize.height;
            if (dialog.data.topView===CObjectsHandler.appContainerId){
                var top = ((windowSize.height*0.7-containerRect.height)/2);
                if (top<0)  top = CGlobals.get('headerSize') || 40;
                container.style.top = top+'px';
                containerMaxHeight = (windowSize.height-70);
            }
            else {
                var distanceFromBottom = (windowSize.height-(topViewRect.top+topViewRect.height));
                if (distanceFromBottom < 100 ){
                    container.style.top = topViewRect.top-containerRect.height+'px';
                    containerMaxHeight = (topViewRect.top-10);
                }
                else {
                    containerMaxHeight = (windowSize.height-(topViewRect.top+topViewRect.height)-10);
                    container.style.maxHeight =
                    container.style.top = (topViewRect.top+topViewRect.height)+'px';
                }
            }

            container.style.maxHeight = containerMaxHeight+'px';


            var right = (windowWidth-(topViewLeft+topViewWidth) + (topViewWidth-containerWidth)/2 );

            // Check bounds.
            if (right<1)
                right = 1;

            if (right >= (windowWidth-containerRect.width) )
                right = windowWidth-containerRect.width-1;

            container.style.right = right + 'px';

            // Set Content max height.
            if (CUtils.isEmpty(dialog.contentContainer))
                return;

            var contentContainer    = CUtils.element(dialog.contentContainer);
            var contentMaxHeight = containerMaxHeight;
            var siblings = CUtils.element(dialog.contentContainer).parentNode.children;

            _.each(siblings,function(node){
                if (node.id === dialog.contentContainer || !CObjectsHandler.isCObject(node.id) )
                    return;
                contentMaxHeight -= node.getBoundingClientRect().height;
            },this);

            contentContainer.style.maxHeight = (contentMaxHeight-5)+'px';
        };
        window.addEventListener('resize',this.onResize);
    }


});


