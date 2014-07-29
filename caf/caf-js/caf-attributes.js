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
        var updated = false;
        // Apply each attribute.
        for (var iAttribute in this.list)
        {
            var attribute = this.list[iAttribute];
            // Init Arguments array
            var args = {
                view: view
            };
            var missingArgument = false;
            var attributes = {};
            for (var iArg in attribute.elmAttributes)
            {
                var attrName = attribute.elmAttributes[iArg];
                var attrValue = elm.getAttribute(attrName);
                // Missing Argument.
                if (caf.utils.isEmpty(attrValue) && attrValue!=="")
                {
                    missingArgument = true;
                    break;
                }
                attributes[attrName] = attrValue;
                args[attrName] = attrValue;
            }
            // Skip - missing argument.
            if (missingArgument) continue;
            // Skip - Attributes haven't changed.
            if (!view.hasAttributesChanged(attributes)) continue;

            updated = true;

            //Add attributes to the View.
            view.setAttributes(attributes);
            // Apply Attribute
            attribute.handler(args);
        }

        return updated;
    },
    initAttributes: function()
    {
        this.addAttr(['data-caf-active'],function(args){
            args.view.activeClass(args['data-caf-active']);
        });
        this.addAttr(['data-caf-active-remove'],function(args){
            args.view.activeClassRemove(args['data-caf-active-remove']);
        });
        this.addAttr(['data-caf-onclick'],function(args){
            args.view.onClick( eval("("+args['data-caf-onclick']+")"));
        });
        this.addAttr(['data-caf-to-url'],function(args){
            args.view.onClick( function(){caf.utils.openURL(args['data-caf-to-url']);} );
        });
        this.addAttr(['data-caf-to-page'],function(args){
            args.view.onClick( function() {caf.pager.moveToPage(args['data-caf-to-page']); } );
        });
        this.addAttr(['data-caf-to-tab','data-caf-tab-container'],function(args){
            var tabId = args.view.id;
            var toSlide = args['data-caf-to-tab'];
            var tabContainer = args['data-caf-tab-container'];
            args.view.onClick( function() {caf.pager.moveToTab(tabId,toSlide,tabContainer); } );

            if (toSlide == 0)
            {
                caf.pager.addHoldClass(tabId);
            }
        });
        this.addAttr(['data-caf-drop-menu-overlay-of'],function(args){
            args.view.onClick( function() {caf.utils.hideOrShow(args['data-caf-drop-menu-overlay-of'],'fadein300','fadeout300',300); } );
        });
        this.addAttr(['data-caf-drop-menu-container'],function(args){
            args.view.onClick( function() {caf.utils.hideOrShow(args['data-caf-drop-menu-container'],'fadein300','fadeout300',300); } );
        });
        this.addAttr(['data-caf-text'],function(args){
            args.view.text(args['data-caf-text']);
        });
        this.addAttr(['data-caf-iconly'],function(args){
            args.view.iconOnly(args['data-caf-iconly']);
        });
        this.addAttr(['data-caf-icon-right','data-caf-icon-size'],function(args){
            args.view.iconRight(args['data-caf-icon-right'],args['data-caf-icon-size'] );
        });
        this.addAttr(['data-caf-icon-left','data-caf-icon-size'],function(args){
            args.view.iconLeft(args['data-caf-icon-left'],args['data-caf-icon-size'] );
        });
        this.addAttr(['data-caf-stop-propagation'],function(args){
            args.view.doStopPropagation(eval(args['data-caf-stop-propagation']));
        });
        this.addAttr(['data-caf-side-menu-container','data-caf-side-menu-position'],function(args){
            caf.ui.swipers.initSideMenu(args['data-caf-side-menu-container'],args['data-caf-side-menu-position'] );
        });
        this.addAttr(['data-caf-swipe-view','data-caf-swipe-view-options'],function(args){
            caf.log(args['data-caf-swipe-view']+" "+args['data-caf-swipe-view-options']);
            var pagination = args.view.mElement.getAttribute('data-caf-swipe-view-pagination');
            caf.ui.swipers.initSwiper(args['data-caf-swipe-view'],eval(args['data-caf-swipe-view-options']),pagination);
        });
        this.addAttr(['data-caf-swipe-view-next'],function(args){
            var swiperName = args['data-caf-swipe-view-next'];
            args.view.onClick( function(){
                caf.ui.swipers.next(swiperName);
            } );
        });
        this.addAttr(['data-caf-swipe-view-previous'],function(args){
            var swiperName = args['data-caf-swipe-view-previous'];
            args.view.onClick( function(){
                caf.ui.swipers.previous(swiperName);
            } );
        });
        this.addAttr(['data-caf-side-menu-switch'],function(args){
            var swiperName = args['data-caf-side-menu-switch'];
            args.view.onClick( function(){
                //var currentSwiper = caf.ui.swipers.mSwipers[swiperName];
                caf.ui.swipers.openOrCloseSideMenu('');
            } );
        });
        this.addAttr(['data-caf-current-tab'],function(args){
            //caf.pager.moveToTab(args['data-caf-current-tab'],args.view.mElement.id,true);
        });
        this.addAttr(['data-caf-form'],function(args){
            caf.ui.forms.createForm(args['data-caf-form']);
        });
        this.addAttr(['data-caf-form','data-caf-form-on-submit'],function(args){
            caf.ui.forms.setFormOnSubmit(args['data-caf-form'],eval(args['data-caf-form-on-submit']));
        });
        this.addAttr(['data-caf-form','data-caf-form-send-to-url'],function(args){
            caf.ui.forms.setFormSaveToUrl(args['data-caf-form'],args['data-caf-form-send-to-url']);
        });
        this.addAttr(['data-caf-form','data-caf-form-send-to-url-callback'],function(args){
            var callback = eval(args['data-caf-form-send-to-url-callback']);
            caf.ui.forms.setFormSaveToUrlCallback(args['data-caf-form'],callback);
        });
        this.addAttr(['data-caf-form-submit-button'],function(args){
            var formName = args['data-caf-form-submit-button'];
            args.view.onClick( function(){caf.ui.forms.submitForm(formName);} );
        });
        this.addAttr(['data-caf-form-send-to-url-button'],function(args){
            var formName = args['data-caf-form-send-to-url-button'];
            args.view.onClick( function(){caf.ui.forms.sendFormToUrl(formName);} );
        });
        this.addAttr(['data-caf-form-save-to-local-storage-button'],function(args){
            var formName = args['data-caf-form-save-to-local-storage-button'];
            args.view.onClick( function(){caf.ui.forms.saveFormToLocalStorage(formName);} );
        });
        this.addAttr(['data-caf-form-clear-button'],function(args){
            var formName = args['data-caf-form-clear-button'];
            args.view.onClick( function(){caf.ui.forms.clearForm(formName);} );
        });
        this.addAttr(['data-caf-form-input','data-caf-form-input-name','data-caf-form-input-type',
            'data-caf-form-input-validator','data-caf-form-input-prepare'],function(args){
            // Create input.
            caf.ui.forms.addInput(args['data-caf-form-input'],args.view.id,args['data-caf-form-input-name'],
                args['data-caf-form-input-type'],args['data-caf-form-input-validator'],
                args['data-caf-form-input-prepare'])
        });
        this.addAttr(['data-caf-main-page'],function(args){
            caf.pager.setMainPage(args['data-caf-main-page']);
        });
        this.addAttr(['data-caf-back-button'],function(args){
            caf.pager.setBackButton(args['data-caf-back-button']);
        });


    }

}

