/**
 * Created by dvircn on 17/09/14.
 */
var CList = Class(CContainer,{
    $statics: {
        DEFAULT_DESIGN: {
            //bgColor:CColor('White'),

        },
        DEFAULT_LOGIC: {
        }

    },

    constructor: function(values) {
        if (CUtils.isEmpty(values)) return;
        // Merge Defaults.
        CObject.mergeWithDefaults(values,CList);

        // Invoke parent's constructor
        CList.$super.call(this, values);

        // Page properties.
        this.data.list                  = this.data.list                || {};
        this.data.list.elements         = this.data.list.elements       || {};
        this.data.list.texts            = this.data.list.texts          || {};
        this.data.list.links            = this.data.list.links          || {};
        this.data.list.icons            = this.data.list.icons          || [];
        this.data.list.iconsSize        = this.data.list.iconsSize      || 35;
        this.data.list.iconsRight       = this.data.list.iconsRight     || [];
        this.data.list.iconsRightSize   = this.data.list.iconsRightSize || 35;
        this.data.list.iconsLeft        = this.data.list.iconsLeft      || [];
        this.data.list.iconsLeftSize    = this.data.list.iconsLeftSize  || 35;
        this.data.list.callbacks        = this.data.list.callbacks      || [];
        this.data.list.chooseCallback   = this.data.list.chooseCallback || function(index,value){};
        this.data.list.borderColor      = this.data.list.borderColor    || CColor('Gray',2);
        this.data.list.mainColor        = this.data.list.mainColor      || CColor('Gray',14);
        this.data.list.height           = this.data.list.height         || 50;
        this.data.list.elementDesign    = this.data.list.elementDesign  || {};

        if (CUtils.isEmpty(this.data.list.elements))
            this.createList();
        else // Elements List
            this.createElementsList();
    },
    createElementsList: function () {
    },
    createList: function () {
        var texts          = this.data.list.texts         ,
            icons          = this.data.list.icons         ,
            links          = this.data.list.links         ,
            iconSize       = this.data.list.iconsSize     ,
            iconsRight     = this.data.list.iconsRight    ,
            iconRightSize  = this.data.list.iconsRightSize,
            iconsLeft      = this.data.list.iconsLeft     ,
            iconLeftSize   = this.data.list.iconsLeftSize ,
            callbacks      = this.data.list.callbacks     ,
            chooseCallback = this.data.list.chooseCallback;

        var length = Math.max(texts.length,icons.length,iconsRight.length,iconsLeft.length);
        // Set up callbacks.
        for (var i=0;i<length;i++) {
            var text        = texts[i] || '';
            var link        = links[i] || '';
            var icon        = icons[i] || '';
            var iconRight   = iconsRight[i] || '';
            var iconLeft    = iconsLeft[i] || '';

            var listCallback = callbacks[i] || function(){};
            var chosenCallback = !CUtils.isEmpty(chooseCallback) ? function(index,text) {
                chooseCallback(index,text);
            } : function(){};

            this.createListElement(i,text,link,icon,iconSize,iconRight,iconRightSize,
                iconLeft,iconLeftSize,listCallback,chosenCallback,this.data.list.height,
                this.data.list.elementDesign);
        }



    },
    createListElement: function (index,text,link,icon,iconSize,iconRight,iconRightSize,
                                 iconLeft,iconLeftSize,listCallback,chosenCallback,height,
                                 elementDesign) {
        var design = {
            color: this.data.contentColor,
            width:'100%',
            height: 'auto',
            boxSizing: 'borderBox',
            fontSize:17,
            fontStyle: ['bold'],
            margin: 'centered',
            //paddingTop:9,
            //paddingBottom:9,
            paddingRight:7,
            paddingLeft:7,
            border: {top:1},
            borderColor: this.data.listBorderColor,
            textAlign: this.data.contentAlign,
            active: { bgColor: this.data.dialogColor, color: {color:'White'}}
        };

        var design = CUtils.mergeJSONs(design,elementDesign);
        if (index === 0)
            design.border = {};

        // Set icon design
        if (!CUtils.isEmpty(icon)) {
            var iconDesign = 'iconOnly';
            if (!CUtils.isEmpty(text)){
                if (this.data.iconsAlign=='left')
                    iconDesign = 'iconLeft';
                if (this.data.iconsAlign=='right')
                    iconDesign = 'iconRight';
            }
            design[iconDesign] = icon;
        }


        var contentId = CObjectsHandler.createObject('Button',{
            design: design,
            logic: {
                text: text,
                onClick: function(){
                    listCallback();
                    chosenCallback(index,text);
                    hideOnChoose();
                }
            }
        });

        this.appendChild(contentId);
    }



});

