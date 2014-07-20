caf.ui.dialogs =
{

    dialogTitle: function(title)
    {
        return '<div class="dialogTitle hp40 bold white textCenter mFontSize bgXDarkBlue">'+title+'</div>';
    },
    dialogContent: function(content)
    {
        return '<div class="dialogContent pt10 pb10 pr10 pl10 borderBox textCenter bold sFontSize bgWhite">'+content+'</div>';
    },
    showErrorMessage: function(options){
        var title           = options.title || "";
        var content         = options.content || "";
        var closeText       = options.closeText || "";
        var closeCallback   = options.closeCallback || function(){};
        var confirmText     = options.confirmText || "";
        var confirmCallback   = options.confirmCallback || function(){};
        var extraText     = options.extraText || "";
        var extraCallback   = options.extraCallback || function(){};



        caf.log("Title: "+title+", Message: "+content);
        var modal = picoModal({
            content: this.dialogTitle(title)+this.dialogContent(content)+
                        this.dialogButton(confirmText,confirmCallback)+
                        this.dialogButton(closeText,function() { modal.close(); closeCallback(); })+
                        this.dialogButton(extraText,extraCallback),
            closeButton: false,
            overlayStyles: {
                backgroundColor: "#000",
                opacity: 0.3
            },
            width: 'empty'
        })
        .afterClose(function (modal) { modal.destroy(); })
        .afterShow(function(modal){
            caf.ui.fadeIn(modal.modalElem(),500);
        })
        .beforeClose(function(modal, event) {
            event.preventDefault();
            caf.ui.fadeOut(modal.modalElem(), 200, function() { modal.destroy(); });
        })
        .show();
    }
}
