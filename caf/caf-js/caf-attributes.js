/**
 * Handler for the attributes that CAF supporting.
 */
caf.ui.attributes =
{
    list: Array(),
    addAttr: function(elmAttributes,handler)
    {
        this.list.push({
            elmAttributes: elmAttributes,
            handler: handler
        });
    },
    /**
     * Apply attributes on view.
     * @param view
     */
    applyAttributes: function(view)
    {
        var elm = view.mElement;
        // Apply each attribute.
        for (var iAttribute in this.list)
        {
            var attribute = this.list[iAttribute];
            // Init Arguments array
            var args = {
                view: view
            };
            var missingArgument = false;
            for (var iArg in attribute.elmAttributes)
            {
                var attrName = attribute.elmAttributes[iArg];
                var attrValue = elm.getAttribute(attrName);
                // Missing Argument.
                if (caf.utils.isEmpty(attrValue))
                {
                    missingArgument = true;
                    break;
                }
                args[attrName] = attrValue;
            }
            // Skip.
            if (missingArgument) continue;
            // Apply Attribute
            attribute.handler(args);
        }
    },
    initAttributes: function()
    {
        this.addAttr(['caf-active'],function(args){
            args.view.activeClass(args['caf-active']);
        });
        this.addAttr(['caf-active-remove'],function(args){
            args.view.activeClassRemove(args['caf-active-remove']);
        });
        this.addAttr(['caf-onclick'],function(args){
            args.view.onClick( new Function(args['caf-onclick']));
        });
        this.addAttr(['caf-to-url'],function(args){
            args.view.onClick( function(){caf.utils.openURL(args['caf-to-url']);} );
        });
        this.addAttr(['caf-to-page'],function(args){
            args.view.onClick( function() {caf.pager.moveToPage(args['caf-to-page']); } );
        });
        this.addAttr(['caf-to-tab','caf-tab-container'],function(args){
            args.view.onClick( function() {caf.pager.moveToTab(args['caf-to-tab'],args['caf-tab-container']); } );
        });
        this.addAttr(['caf-drop-menu-overlay-of'],function(args){
            args.view.onClick( function() {caf.utils.hideOrShow(args['caf-drop-menu-overlay-of'],'fadein','fadeout',300);; } );
        });
        this.addAttr(['caf-drop-menu-container'],function(args){
            args.view.onClick( function() {caf.utils.hideOrShow(args['caf-drop-menu-container'],'fadein','fadeout',300);; } );
        });
        this.addAttr(['caf-text'],function(args){
            args.view.text(args['caf-text']);
        });
        this.addAttr(['caf-iconly'],function(args){
            args.view.iconOnly(args['caf-iconly']);
        });
        this.addAttr(['caf-icon-right','caf-icon-size'],function(args){
            args.view.iconRight(args['caf-icon-right'],args['caf-icon-size'] );
        });
        this.addAttr(['caf-icon-left','caf-icon-size'],function(args){
            args.view.iconLeft(args['caf-icon-left'],args['caf-icon-size'] );
        });
        this.addAttr(['caf-stop-propagation'],function(args){
            args.view.doStopPropagation(eval(args['caf-stop-propagation']));
        });
        this.addAttr(['caf-side-menu-container','caf-side-menu-position'],function(args){
            caf.ui.swipers.initSideMenu(args['caf-side-menu-container'],args['caf-side-menu-position'] );
        });
        this.addAttr(['caf-swiper-container'],function(args){
            caf.ui.swipers.initSwiper(args['swiper-container'],args['num-slides']);
        });
        this.addAttr(['caf-side-menu-switch'],function(args){
            var swiperName = args['caf-side-menu-switch'];
            args.view.onClick( function(){
                var currentSwiper = caf.ui.swipers.mSwipers[swiperName];
                currentSwiper.swipeTo((currentSwiper.activeIndex+1)%2 );
            } );
        });
        this.addAttr(['caf-current-tab'],function(args){
            caf.pager.moveToTab(args['caf-current-tab'],args.view.mElement.id,true);
        });
        this.addAttr(['caf-form'],function(args){
            caf.ui.forms.createForm(args['caf-form']);
        });
        this.addAttr(['caf-form','caf-form-on-submit'],function(args){
            caf.ui.forms.setFormOnSubmit(args['caf-form'],eval(args['caf-form-on-submit']));
        });
        this.addAttr(['caf-form','caf-form-send-to-url'],function(args){
            caf.ui.forms.setFormSaveToUrl(args['caf-form'],args['caf-form-send-to-url']);
        });
        this.addAttr(['caf-form','caf-form-send-to-url-callback'],function(args){
            var callback = eval(args['caf-form-send-to-url-callback']);
            caf.ui.forms.setFormSaveToUrlCallback(args['caf-form'],callback);
        });
        this.addAttr(['caf-form-submit-button'],function(args){
            var formName = args['caf-form-submit-button'];
            args.view.onClick( function(){caf.ui.forms.submitForm(formName);} );
        });
        this.addAttr(['caf-form-send-to-url-button'],function(args){
            var formName = args['caf-form-send-to-url-button'];
            args.view.onClick( function(){caf.ui.forms.sendFormToUrl(formName);} );
        });
        this.addAttr(['caf-form-save-to-local-storage-button'],function(args){
            var formName = args['caf-form-save-to-local-storage-button'];
            args.view.onClick( function(){caf.ui.forms.saveFormToLocalStorage(formName);} );
        });
        this.addAttr(['caf-form-clear-button'],function(args){
            var formName = args['caf-form-clear-button'];
            args.view.onClick( function(){caf.ui.forms.clearForm(formName);} );
        });
        this.addAttr(['caf-form-input','caf-form-input-name','caf-form-input-type',
            'caf-form-input-validator','caf-form-input-prepare'],function(args){
            // Create input.
            caf.ui.forms.addInput(args['caf-form-input'],args.view.id,args['caf-form-input-name'],
                args['caf-form-input-type'],args['caf-form-input-validator'],
                args['caf-form-input-prepare'])
        });
        this.addAttr(['caf-main-page'],function(args){
            caf.pager.setMainPage(args['caf-main-page']);
        });
        this.addAttr(['caf-back-button'],function(args){
            caf.pager.setBackButton(args['caf-back-button']);
        });


    }

}

