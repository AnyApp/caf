caf.ui.dialogs =
{
    dialog:
    {
        callbacks: {},
        callOnCloseCallback: true,
        closeCallback: function(){},
        modal: null
    },
    dialogTitle: function(title)
    {
        return '<div class="dialogTitle hp40 bold white textCenter mFontSize bgDark'+this.dialog.color+'">'+title+'</div>';
    },
    dialogContent: function(content)
    {
        return '<div class="dialogContent pt10 pb10 pr10 pl10 borderBox textCenter bold sFontSize bgWhite">'+content+'</div>';
    },
    dialogButton: function(id,text,callback)
    {
        var color =this.dialog.color;

        if (caf.utils.isEmpty(text)) return "";
        var bCallback = caf.utils.isEmpty(callback) ? function(){caf.ui.dialogs.dialog.modal.close();} :
            function() {
                caf.ui.dialogs.dialog.callOnCloseCallback = false;
                callback();
                caf.ui.dialogs.dialog.modal.close();
            };
        this.dialog.callbacks[id] = bCallback;
        return '<div id="'+id+
            '" class="pt10 pb10 pr10 pl10 borderBox textCenter cDark'+color+' bold sFontSize borderTop1p bcDark'+color+'" '+
            'data-caf-active="bgDark'+color+' white"'+
            'data-caf-active-remove="cDark'+color+'" '+
            'data-caf-onclick="(function(){caf.ui.dialogs.dialog.callbacks[\''+id+'\']();})" data-caf-text="'+text+'"></div>';
    },
    show: function(options){
        var title           = options.title || "";
        var content         = options.content || "";
        var closeText       = options.closeText || "";
        var closeCallback   = options.closeCallback || function(){};
        var confirmText     = options.confirmText || "";
        var confirmCallback   = options.confirmCallback || function(){};
        var extraText     = options.extraText || "";
        var extraCallback   = options.extraCallback || function(){};

        this.dialog.color = options.color || 'Blue';
        this.dialog.callbacks = {};
        this.dialog.closeCallback = closeCallback;
        caf.ui.dialogs.dialog.callOnCloseCallback = true;
        this.dialog.modal = picoModal({
            content: this.dialogTitle(title)+this.dialogContent(content)+
                        this.dialogButton('dialogConfirmButton',confirmText,confirmCallback)+
                        this.dialogButton('dialogCloseButton',closeText,closeCallback)+
                        this.dialogButton('dialogExtraButton',extraText,extraCallback),
            closeButton: false,
            overlayStyles: {
                backgroundColor: "#000",
                opacity: 0.3
            },
            width: 'empty'
        })
        //.afterClose(function (modal) { caf.log('hi'); modal.destroy(); caf.log(document.getElementById('dialogButton1'));document.clientHeight; caf.ui.rebuildAll(); })
        .afterShow(function(modal){
            caf.ui.fadeIn(modal.modalElem(),500);
            caf.ui.rebuildAll();
        })
        .beforeClose(function(modal, event) {
            event.preventDefault();
            caf.ui.fadeOut(modal.modalElem(), 200, function() {
                modal.destroy();
                caf.ui.rebuildAll();
                if (caf.ui.dialogs.dialog.callOnCloseCallback)
                {
                    caf.ui.dialogs.dialog.closeCallback();
                }
            });
        })
        .show();
    }
}
