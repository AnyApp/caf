/**
 * Created by dvircn on 13/08/14.
 */
var CBuilderObject = Class({
    $statics: {

    },

    constructor: function(type,uname) {
        this.properties         = {};
        this.properties.type    = type   || 'Object';
        if (!CUtils.isEmpty(uname))
            this.properties.uname   = uname  || '';
        this.properties.data        = {};
        this.properties.design      = {};
        this.properties.logic       = {};
    },
    build: function(){
        return this.properties;
    },
    initTemplate: function(){
        this.properties.data.template   = this.properties.data.template || {};
        this.properties.data.template.container    = this.properties.data.template.container  || {type:'Container'};
        this.properties.logic.template  = true;
    },
    childs: function(childs){
        this.properties.data.childs    = childs;
        return this;
    },
    child: function(child){
        this.properties.data.childs    = this.properties.data.childs || [];
        this.properties.data.childs.push(child);
        return this;
    },
    page: function(name,title,onLoad){
        this.properties.data.page =
                { name: name || '', title: title || '', onLoads: [onLoad] || [] };
        this.properties.logic.page = true;
        return this;
    },
    pageOnLoad: function(onLoad){
        this.properties.data.page = this.properties.data.page || {};
        this.properties.data.page.onLoads = this.properties.data.page.onLoads || [];
        this.properties.data.page.onLoads.push(onLoad  || function() {});
        this.properties.logic.page = true;
        return this;
    },
    pageOnLoadPrepare: function(onLoadPrepare){
        this.properties.data.page = this.properties.data.page || {};
        this.properties.data.page.onLoadPrepares = this.properties.data.page.onLoadPrepares || [];
        this.properties.data.page.onLoadPrepares.push(onLoadPrepare  || function() {});
        this.properties.logic.page = true;
        return this;
    },
    onShowAnimateChildren: function(animations,intervals,start) {
        this.properties.logic.onShowAnimateChildren = {
            animations:     animations,
            intervals:      intervals,
            start:          start
        };
        return this;
    },
    onShowAnimation: function(objects,animations,intervals,start) {
        this.properties.logic.onShowAnimation = {
            objects:        objects,
            animations:     animations,
            intervals:      intervals,
            start:          start
        };
        return this;
    },
    onShowSelfAnimation: function(animation,start) {
        this.properties.logic.onShowAnimation = {
            objects:        null,
            animations:     animation,
            intervals:      0,
            start:          start
        };
        return this;
    },
    sideMenuWidth: function(width) {
        this.properties.data.sideMenuWidth = width;
        return this;
    },
    sideMenuLeftContainer: function(leftContainer) {
        this.properties.data.leftContainer = leftContainer;
        return this;
    },
    sideMenuRightContainer: function(rightContainer) {
        this.properties.data.rightContainer = rightContainer;
        return this;
    },
    headerLeft: function(left) {
        this.properties.data.left = left;
        return this;
    },
    headerRight: function(right) {
        this.properties.data.right = right;
        return this;
    },
    headerTitleDesign: function(design) {
        this.properties.data.titleDesign = design;
        return this;
    },
    text: function(text) {
        this.properties.logic.text = text;
        return this;
    },
    scrollable: function() {
        CScrolling.setScrollable(this.properties);
        return this;
    },
    template: function(url,autoLoad,queryData){
        this.initTemplate();
        this.properties.data.template = {
            url:        url         || null,
            autoLoad:   autoLoad,
            queryData:  queryData   || null
        };
        return this;
    },
    templateDataPrepareFunction: function(prepareFunction){
        this.initTemplate();
        this.properties.data.template.prepareFunction = prepareFunction;
        return this;
    },
    templateRootObjects: function(rootObjects) {
        this.initTemplate();
        this.properties.data.template.rootObjects = rootObjects;
        return this;
    },
    templateObjects: function(objects) {
        this.initTemplate();
        this.properties.data.template.objects = [];
        // Build objects.
        _.each(objects,function(objectBuilder){
            this.properties.data.template.objects.push(objectBuilder.build());
        },this);

        return this;
    },
    templateObject: function(object) {
        this.initTemplate();
        this.properties.data.template.object = object.build();
        return this;
    },
    templatePullToRefresh: function() {
        this.initTemplate();
        this.properties.data.template.pullToRefresh = true;
        return this;
    },
    templateLoaderColor: function(loaderColor) {
        this.initTemplate();
        this.properties.data.template.loaderColor = loaderColor || null;
        return this;
    },
    templateData: function(data) {
        this.initTemplate();
        this.properties.data.template.data = data;
        return this;
    },
    templateContainerDesign: function(design) {
        this.initTemplate();
        this.properties.data.template.container.design = design;
        return this;
    },
    templateResetOnReload: function(resetOnReload) {
        this.initTemplate();
        this.properties.data.template.resetOnReload = resetOnReload;
        return this;
    },
    templateBorder: function(color,size) {
        this.initTemplate();
        this.properties.data.template.container.design
            = this.properties.data.template.container.design || {};
        this.properties.data.template.container.design.border = {top:size||1};
        this.properties.data.template.container.design.borderColor = color || CColor('Gray',4);
        return this;
    },
    templateItemOnClick: function(onClick) {
        this.initTemplate();
        this.properties.data.template.callback = onClick;
        return this;
    },
    templateItemOnClicks: function(onClicks) {
        this.initTemplate();
        this.properties.data.template.callbacks = onClicks;
        return this;
    },
    request: function(url,data,callback){
        this.properties.logic.request = {
            url:        url             || null,
            data:       data            || null,
            callback:   callback        || null
        }
        return this;
    },
    reloadDynamicButton: function(object,reset,queryData,onFinish){
        this.properties.logic.buttonReloadDynamic = {
            object:     object          || null,
            reset:      reset           || null,
            onFinish:   onFinish        || null,
            queryData:  queryData       || null
        }
        return this;
    },
    formInputs: function(inputsIds) {
        this.properties.data.inputs = inputsIds || null;
        return this;
    },
    formSaveToUrl: function(url) {
        this.properties.data.saveToUrl = url || null;
        return this;
    },
    formSaveToUrlCallback: function(callback) {
        this.properties.data.saveToUrlCallback = callback || null;
        return this;
    },
    formOnSubmit: function(onSubmit) {
        this.properties.data.onSubmit = onSubmit || null;
        return this;
    },
    formInputs: function(inputsIds) {
        this.properties.data.inputs= inputsIds || [];
        return this;
    },
    inputName: function(name) {
        this.properties.data.name = name || null;
        return this;
    },
    inputType: function(type) {
        this.properties.data.type = type || null;
        return this;
    },
    inputValue: function(value) {
        this.properties.data.value = value || null;
        return this;
    },
    inputRequired: function() {
        this.properties.data.required = true;
        return this;
    },
    inputDisabled: function() {
        this.properties.data.disabled = true;
        return this;
    },
    inputEnabled: function() {
        this.properties.data.disabled = false;
        return this;
    },
    inputNotRequired: function() {
        this.properties.data.required = false;
        return this;
    },
    inputPlaceholder: function(placeholder) {
        this.properties.data.placeholder = placeholder;
        return this;
    },
    inputOnFileSelect: function(inputOnFileSelect) {
        this.properties.logic.inputOnFileSelect = inputOnFileSelect;
        return this;
    },
    inputValidators: function(validators) {
        this.properties.data.validators = validators;
        return this;
    },
    inputValidator: function(validator) {
        this.properties.data.validators = this.properties.data.validators || [];
        this.properties.data.validators.push(validator);
        return this;
    },
    inputPrepares: function(prepares) {
        this.properties.data.prepares = prepares;
        return this;
    },
    inputPrepare: function(prepare) {
        this.properties.data.prepares = this.properties.data.prepares || [];
        this.properties.data.prepares.push(prepare);
        return this;
    },
    formPrepareValues: function(prepareValuesFunction) {
        this.properties.data.prepareValues = prepareValuesFunction;
        return this;
    },
    formLoadInputFromStorage: function() {
        this.properties.logic.loadInputFromStorage = true;
        return this;
    },
    formNotLoadInputFromStorage: function() {
        this.properties.logic.loadInputFromStorage = false;
        return this;
    },
    formClearButton: function(formName) {
        this.properties.logic.formClearButton = formName;
        return this;
    },
    formSaveToLocalStorageButton: function(formName) {
        this.properties.logic.formSaveToLocalStorageButton = formName;
        return this;
    },
    formSendToUrlButton: function(formName) {
        this.properties.logic.formSendToUrlButton = formName;
        return this;
    },
    formSubmitButton: function(formName) {
        this.properties.logic.formSubmitButton = formName;
        return this;
    },
    dialogSwitch: function(dialogId) {
        this.properties.logic.dialogSwitch = dialogId;
        return this;
    },
    swipeNext: function(swiperId) {
        this.properties.logic.swipeNext = swiperId;
        return this;
    },
    swipePrev: function(swiperId) {
        this.properties.logic.swipePrev = swiperId;
        return this;
    },
    sideMenuSwitch: function(side) {
        this.properties.logic.sideMenuSwitch = side;
        return this;
    },
    backButton: function() {
        this.properties.logic.backButton = true;
        return this;
    },
    imageSource: function(src) {
        this.properties.data.src = src;
        return this;
    },
    staticMapData: function(staticMapData) {
        this.properties.data.mapData = staticMapData;
        return this;
    },
    videoSource: function(src) {
        this.properties.data.src = src;
        return this;
    },
    iframeSource: function(src) {
        this.properties.data.src = src;
        return this;
    },
    galleryImages: function(images) {
        this.properties.data.images = images;
        return this;
    },
    sliderPagination: function() {
        this.properties.data.pagination = true;
        return this;
    },
    sliderAutoPlay: function() {
        this.properties.data.autoPlay = true;
        return this;
    },
    sliderNotAutoPlay: function() {
        this.properties.data.autoPlay = false;
        return this;
    },
    sliderSlideTime: function(slideTime) {
        this.properties.data.slideTime = slideTime || null;
        return this;
    },
    sliderOnSlideLoad: function(onSlideLoad) {
        this.properties.data.slideTime = onSlideLoad || function(slideIndex){};
        return this;
    },
    sliderSlidesPerView: function(slidesPerView) {
        this.properties.data.slidesPerView = slidesPerView || null;
        return this;
    },
    tabberTabs: function(tabs) {
        this.properties.data.tabs = tabs || null;
        return this;
    },
    tabberLoop: function() {
        this.properties.data.loop = true;
        return this;
    },
    tabberOnLoads: function(onLoads) {
        this.properties.data.onLoads = onLoads || null;
        return this;
    },
    tabberButtonsTexts: function(texts) {
        this.properties.data.buttons = this.properties.data.buttons || {};
        this.properties.data.buttons.texts = texts || null;
        return this;
    },
    tabberButtonsIcons: function(icons,align) {
        this.properties.data.buttons    = this.properties.data.buttons || {};
        this.properties.data.buttons.icons      = icons || null;
        this.properties.data.buttons.iconsAlign = align || null;
        return this;
    },
    tabberButtonsDesign: function(design) {
        this.properties.data.buttons = this.properties.data.buttons || {};
        this.properties.data.buttons.design = design || null;
        return this;
    },
    tabberButtonsHeight: function(height) {
        this.properties.data.buttons = this.properties.data.buttons || {};
        this.properties.data.buttons.height = height || null;
        return this;
    },
    tabberButtonsPerView: function(perView) {
        this.properties.data.buttons = this.properties.data.buttons || {};
        this.properties.data.buttons.perView = perView || null;
        return this;
    },
    onClick: function(onClickHandler) {
        this.properties.logic.onClick = onClickHandler;
        return this;
    },
    onCreate: function(onCreateHandler) {
        this.properties.logic.onCreate = onCreateHandler;
        return this;
    },
    onCreateAsync: function(onCreateAsyncHandler) {
        this.properties.logic.onCreateAsync = onCreateAsyncHandler;
        return this;
    },
    phoneCall: function(number) {
        this.properties.logic.phoneCall = number;
        return this;
    },
    openNavigationApp: function(address) {
        this.properties.logic.openNavigationApp = address;
        return this;
    },
    openFacebookPageOrProfile: function(pageId) {
        this.properties.logic.openFacebookPageOrProfile = pageId;
        return this;
    },
    openMailTo: function(mail) {
        this.properties.logic.openMail = {
            to:[mail || '']
        };
        return this;
    },
    /**
         Mail: message, subject, image.
         Twitter: message, image, link (which is automatically shortened).
         Google+ / Hangouts: message, subject, link
         Facebook iOS: message, image, link.
         Facebook Android: sharing a message is not possible. Sharing links and images is, but a description can not be prefilled.
     */
    share: function(subject,msg,image,link) {
        this.properties.logic.share = {
            msg:     msg     || null,
            subject: subject || null,
            image:   image   || null,
            link:    link    || null
        };
        return this;
    },
    shareImage: function(subject,msg,image) {
        this.properties.logic.share = {
            msg:     msg     || null,
            subject: subject || null,
            image:   image   || null,
            link:    null
        };
        return this;
    },
    shareLink: function(subject,msg,link) {
        this.properties.logic.share = {
            msg:     msg     || null,
            subject: subject || null,
            image:   null,
            link:    link    || null
        };
        return this;
    },
    link: function(path,data,globalData) {
        this.properties.logic.link = {
            path:           path || null,
            data:           data || null,
            globalData:     globalData || null
        };
        return this;
    },
    icon: function(name,size,align,color,design) {
        this.properties.logic.icon = {
            name:   name    || null,
            size:   size    || null,
            align:  align   || null,
            color: color    || null,
            design: design  || null
        };
        return this;
    },
    iconLeft: function(name,size,color,design) {
        this.properties.logic.iconLeft = {
            name:   name || null,
            size:   size || null,
            color: color || null,
            design: design  || null
        };
        return this;
    },
    iconRight: function(name,size,color,design) {
        this.properties.logic.iconRight = {
            name:   name || null,
            size:   size || null,
            color: color || null,
            design: design  || null
        };
        return this;
    },
    showDialog: function(data,design) {
        this.properties.logic.showDialog = {
            data: data || {},
            design: design || {}
        };
        return this;
    },
    spinnerAutoStart: function() {
        this.properties.data.spinnerAutoStart = true;
        return this;
    },
    data: function(data){
        this.properties.data    = data;
        return this;
    },
    design: function(design,weakerDesign){
        if (!CUtils.isEmpty(weakerDesign))
            design = CUtils.mergeJSONs(weakerDesign,design);

        this.properties.design  = design;
        return this;
    },
    logic: function(logic){
        this.properties.logic   = logic;
        return this;
    }


});


window.co = function(type,uname){
    var objectBuilder = new CBuilderObject(type || '',uname || '');
    return objectBuilder;
};

