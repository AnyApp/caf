/**
 * Created by dvircn on 15/08/14.
 */
var CTabber = Class(CContainer,{
    $statics: {
        DEFAULT_DESIGN: {
            classes: "",
            width: '100%',
            height: '100%',
            position: 'relative'
        },
        DEFAULT_LOGIC: {
        },
        moveToTab: function(tabButtonId,toSlide,swiperId) {
            // Get Tabs.
            var tabs = CSwiper.getSwiperButtons(swiperId);
            _.each(tabs,function(buttonId){
                // Remove hold mark.
                CTabber.removeHoldClass(buttonId);
            },CTabber);

            CTabber.addHoldClass(tabButtonId);

            if (!CUtils.isEmpty(toSlide))
                CSwiper.moveSwiperToSlide(swiperId,toSlide);

            // Move buttons.
            // Get Tabber.
            var tabber = CObjectsHandler.object(CObjectsHandler.object(swiperId).parent);
            var slider = CObjectsHandler.object(CObjectsHandler.object(swiperId).parent);
            // Check if tabber
            if (CUtils.isEmpty(tabber.tabberButtonsSlider))
                return;
            var currentIndex    = CSwiper.getSwiperCurrentSlide(swiperId);
            //var beforeIndex     = CSwiper.getSwiperPreviousSlide(swiperId);
            //var perView         = tabber.data.buttons.perView;

            CSwiper.moveSwiperToSlide(tabber.tabberButtonsSlider,currentIndex);
        },
        addHoldClass: function(tabButtonId) {
            if (CUtils.isEmpty(tabButtonId))    return;

            var holdClass = CDesign.designToClasses(CObjectsHandler.object(tabButtonId).getDesign().hold);
            if (!CUtils.isEmpty(holdClass))
                CUtils.addClass(CUtils.element(tabButtonId),holdClass);
        },
        removeHoldClass: function(tabButtonId) {
            if (CUtils.isEmpty(tabButtonId))    return;

            var holdClass = CDesign.designToClasses(CObjectsHandler.object(tabButtonId).getDesign().hold);
            if (!CUtils.isEmpty(holdClass))
                CUtils.removeClass(CUtils.element(tabButtonId),holdClass);
        }

    },

    constructor: function(values) {
        if (CUtils.isEmpty(values)) return;
        // Merge Defaults.
        CObject.mergeWithDefaults(values,CTabber);

        // Invoke parent's constructor
        CTabber.$super.call(this, values);

        // Get and set default data.
        this.data.childs                 = this.data.childs                  || [];
        this.data.tabs                   = this.data.tabs                    || [];
        this.data.animation              = this.data.animation               || '';
        this.data.loop                   = this.data.loop                    || false;
        this.data.onLoads                = this.data.onLoads                 || [];
        this.data.buttons                = this.data.buttons                 || {};
        this.data.buttons.texts          = this.data.buttons.texts           || [];
        this.data.buttons.icons          = this.data.buttons.icons           || [];
        this.data.buttons.iconsAlign     = this.data.buttons.iconsAlign      || 'left';
        this.data.buttons.design         = this.data.buttons.design          || {};
        this.data.buttons.height         = this.data.buttons.height          || 45;
        this.data.buttons.perView        = this.data.buttons.perView ||
                                            Math.max(this.data.buttons.texts.length,this.data.buttons.icons.length);
        this.buttonsIds                  = this.buttonsIds              || [];
        this.tabberButtonsSlider               = null;
        this.tabsSlider                  = null;

        this.prepareFinalButtonDesign();
        this.createButtons();
        this.createButtonsSlider();
        this.createTabsSlider();
    },
    prepareFinalButtonDesign: function () {
        var design              = CUtils.clone(this.data.buttons.design);
        design.width	        = '100%';
        design.height	        = this.data.buttons.height || design.height          ||  'auto';
        design.boxSizing	    = design.boxSizing       ||  'borderBox';
        design.fontSize	        = design.fontSize        || 17;
        design.fontStyle	    = design.fontStyle       ||  ['bold'];
        design.textAlign	    = design.textAlign       ||  this.data.contentAlign;

        this.data.buttons.finalDesign = design;
    },
    createOnLoad: function(tabs){
        return function(index){
            if (index >= tabs.length)
                return;
            var tab         = CObjectsHandler.object(tabs[index]);
            var callback    = tab.data.onLoad || function() {};
            callback();

        };
    },
    createTabsSlider: function () {
        this.tabsSlider = CObjectsHandler.createObject('Slider', {
            data: {
                onSlideLoad:    this.createOnLoad(this.data.tabs),
                childs:         this.data.tabs,
                animation:      this.data.animation,
                loop:           this.data.loop,
                autoPlay:       false,
                tabberButtons:  this.buttonsIds
            },
            design:{
                width: '100%',
                height: null,
                position: 'absolute',
                top: this.data.buttons.height || this.data.buttons.design.height,
                bottom: 0,
                widthSM: null,
                widthXS: null
            }
        });

        this.appendChild(this.tabsSlider);
    },
    createButtonsSlider: function () {
        this.tabberButtonsSlider = CObjectsHandler.createObject('Slider', {
            data: {
                childs:         this.buttonsIds,
                loop:           false,
                autoPlay:       false,
                slidesPerView:  this.data.buttons.perView
            },
            design:{
                width: '100%',
                height: 'auto',
                widthSM: null,
                widthXS: null
            }
        });

        this.appendChild(this.tabberButtonsSlider);
    },
    createButtons: function(){
        var list            = this.data.buttons.texts,
            iconsList       = this.data.buttons.icons,
            iconsAlign      = this.data.buttons.iconsAlign;

        // Allow create icon only list.
        while (list.length < iconsList.length){
            list.push('');
        }

        for (var i=0;i<list.length;i++) {
            var index           = i;
            var text            = list[index] || '';
            var icon            = index < iconsList.length ? iconsList[index] : '';
            var design          = CUtils.clone(this.data.buttons.finalDesign);

            this.createTabButton(icon, text, iconsAlign, design);
        }

    },
    createTabButton: function (icon, text, iconsAlign, design) {
        // Set up icon align
        if (!CUtils.isEmpty(icon)) {
            var iconDesign = 'iconOnly';
            if (!CUtils.isEmpty(text)) {
                if (iconsAlign == 'left')
                    iconDesign = 'iconLeft';
                if (iconsAlign == 'right')
                    iconDesign = 'iconRight';
            }
            design[iconDesign] = icon;
        }

        this.buttonsIds.push(CObjectsHandler.createObject('Button', {
            design: design,
            logic: {
                text: text
            }
        }));
    }


});

