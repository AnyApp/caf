var app =
{
    initialize: function()
    {
        var builder = new CBuilderObjects();
        builder.create('AppContainer','app-container').childs(['side-menu','main-view','drop-down-menu']);
        builder.create('SideMenu','side-menu')
            .sideMenuLeftContainer('side-menu-left-container').sideMenuRightContainer('side-menu-right-container');
        builder.addData('navigation',[
            {data: {icon:'large16',        text: 'Buttons', link: 'buttons'} },
            {data: {icon:'text78',         text: 'Forms'  , link: 'forms'  } },
            {data: {icon:'image63',        text: 'Sliders', link: 'sliders'} },
            {data: {icon:'two151',         text: 'Tabs'   , link: 'tabs'   } },
            {data: {icon:'exclamation14',  text: 'Dialogs', link: 'dialogs'} },
            {data: {icon:'smile5',         text: 'Icons'  , link: 'icons'  } },
            {data: {icon:'table34',        text: 'Data'   , link: 'data'   } },
            {data: {icon:'earth31',        text: 'Routing', link: 'routing'} }
        ]);
        builder.create('SideMenuContainer','side-menu-left-container').childs(['left-menu'])
            .design({bgColor: CColor('Indigo',15)});
        builder.addDesign('left-menu-button',{
            paddingLeft:6,boxSizing:'borderBox',textAlign:'left',height:45, widthXS: 12,
            fontSize:16,color: CColor('Gray',2), marginTop:1, round: 0,
            active: { bgColor:CColor('Indigo',17),color: CColor('White') }
        });
        builder.create('Template','left-menu')
            .templateObject(
                co('Button')
                    .iconRight('#this.data.icon',28).sideMenuSwitch('left')
                    .design(builder.getDesign('left-menu-button'))
                    .text('#this.data.text').link('#this.data.link').build()
            )
            .templateData(builder.getData('navigation'));
        builder.create('SideMenuContainer','side-menu-right-container').childs(['right-menu'])
            .design({bgColor: CColor('Purple',15)});;
        builder.addDesign('right-menu-button',{
            paddingRight:6,boxSizing:'borderBox',textAlign:'right',height:45, widthXS: 12,
            fontSize:16,color: CColor('Gray',2), marginTop:1, round: 0,
            active: { bgColor:CColor('Purple',17),color: CColor('White') }
        });
        builder.create('Template','right-menu')
            .templateObject(
                co('Button')
                    .iconLeft('#this.data.icon',28).sideMenuSwitch('right')
                    .design(builder.getDesign('right-menu-button'))
                    .text('#this.data.text').link('#this.data.link').build()
            )
            .templateData(builder.getData('navigation'));

        builder.create('MainView','main-view').childs(['header','content','footer']);
        builder.create('Header','header')
            .headerLeft(['header-button-left-0','header-button-back'])
            .headerRight(['header-button-right-0','header-button-right-1'])
            .design({bgColor:{color:'LightBlue',level:8}});
        //Add Design.
        builder.addDesign('header-button',{active: { bgColor:{color:'LightBlue',level:10} } });
        builder.create('Button','header-button-right-0')
            .design(builder.getDesign('header-button'))
            .icon('ellipsis',38).dialogSwitch('drop-down-menu');
        builder.create('Button','header-button-right-1')
            .design(builder.getDesign('header-button'))
            .icon('pencil52',38).link('form');
        builder.create('Button','header-button-left-0')
            .design(builder.getDesign('header-button'))
            .icon('menu24',38).sideMenuSwitch('left');
        builder.create('Button','header-button-back')
            .design(builder.getDesign('header-button'))
            .icon('left46',34).backButton();
        builder.create('Dialog','drop-down-menu').data({
            topView: 'header-button-right-0',
            //list: CUtils.arrayFromObjectsKey(builder.getData('navigation'),'data','text'),
            //iconsList:CUtils.arrayFromObjectsKey(builder.getData('navigation'),'data','icon'),
            //iconsAlign: 'left',
            dialogWidth: '250',
            list:co('Template')
                .templateObject(
                    co('Button')
                        .iconRight('right65',28).iconLeft('#this.data.icon',28)
                        .design({textAlign:'left'})
                        .text('#this.data.text').link('#this.data.link')
                        .build()
                )
                .templateItemOnClick(function(index){CLog.dlog('onClick item: '+index)})
                .templateData(builder.getData('navigation'))
                .templateBorder(CColor('Red',6),4)
                .templateContainerDesign({})// can change/append item container design.
                .build(),
            chooseCallback: function(index,value){
                CLog.dlog(index+") "+value);
            },
            listCallbacks:[function(){CLog.dlog('Dvir Clicked')},
                function(){CLog.dlog('Cohen Clicked')}],
            dialogColor: {color: 'Teal', level: 15},
            listBorderColor: {color: 'Teal', level: 14},
            listDesign: {textAlign:'left',color:CColor('White')},
            //listItemsLogic: {},
            //listItemsData: builder.getData('navigation'),
            contentColor: {color: 'White'},
            bgColor: {color:'Teal', level: 13},
            destroyOnHide: false
        });
        builder.create('Footer','footer').childs([]);
        builder.create('Content','content').childs(['main-page','form-page','category-page','tabs-page']);
        builder.create('Page','main-page')
            .childs(['main-buttons-template','main-reload-dynamic','dynamic-buttons','main-gallery'])
            .page('','Main',function(){} /* Optional On Page Load */);
        builder.create('Page','form-page').childs(['form'])
            .page('form','Form');
        builder.create('Page','tabs-page').childs(['tabber'])
            .page('tabs','Tabs');
        builder.create('TemplatePage','category-page').childs(['tabber'])
            .page('category','Category Page',function(params) {CLog.dlog(params);})
            .templateObjects([
                // Create object.
                co('Label','#/label').text('Title: #.data.category')
                    .design({ height:40, bgColor:{color:'Red',level:6},widthSM: 10, widthXS: 10,marginRight:1, marginLeft:1, marginTop:1, round: 0})
                    .build()
            ])
        builder.create('Template','dynamic-buttons')
            .template('http://codletech.net/CAF/caf.php',true)
            .templateObjects([
                co('Label').text('Dynamic Load Title #this.data.name')
                    .design({ height:40, color:CColor('Red',6),widthSM: 10, widthXS: 10,marginRight:1, marginLeft:1, marginTop:1, round: 0})
                    .build(),
                co('Button').text('Dynamic Load Button #this.data.name')
                    .design({ height:40, color:CColor('Cyan',6),widthSM: 10, widthXS: 10,marginRight:1, marginLeft:1, marginTop:1, round: 0,
                        active: { color:CColor('Cyan',10) }})
                    .showDialog(/*Data*/{
                        title: 'Hello #.data.name !',
                        //topView: 'main-button',
                        textContent: '#.data.message',
                        confirmText: 'Confirm',
                        confirmCallback: function() { CLog.dlog('Confirm Callback')}
                    },/*Design*/{})
                    .build()
            ])
        builder.create('Button','main-reload-dynamic')
            .design({ height:40, bgColor:{color:'LightGreen',level:6},widthSM: 5, widthXS: 10, marginRight:1, marginLeft:1, marginTop:1, round: 2,
                active: { bgColor:{color:'LightGreen',level:8} }})
            .reloadDynamicButton('dynamic-buttons',true /*QueryData and callback here*/)
            .text('Reload');
        //Add Design.
        builder.addDesign('main-button',{
            paddingLeft:6,boxSizing:'borderBox',textAlign:'left',height:60,widthSM: 6, widthXS: 12,
            fontSize:18,color: CColor('Cyan',8),bgColor:CColor('White',6), marginTop:1, round: 0,
            active: { bgColor:CColor('Cyan',8),color: CColor('White') }
        });
        builder.create('Template','main-buttons-template')
            .templateObject(
                co('Button')
                    .iconRight('right65',40).iconLeft('#this.data.icon',35)
                    .design(builder.getDesign('main-button'))
                    .text('#this.data.text').link('#this.data.link')
                    .build()
            )
            .templateContainerDesign({display:'inline'})
            .templateItemOnClick(function(index){CLog.dlog('onClick item: '+index)})
            .templateData(builder.getData('navigation')
                /*co().iconLeft('table34',35)    .text('Category')   .link('category').build(),
                co().iconLeft('table34',35)    .text('Category Dvir').link('category/dvir').build(),
                co().iconLeft('table34',35)    .text('Show Dialog').showDialog(*//*Data*//*{
                    title: 'Confirmation',
                    //topView: 'main-button',
                    textContent: 'Always do good things. Good things lead to better society, happiness, health and freedom.',
                    list: ['dvir','cohen','tal','levi','cohen','tal','levi','cohen','tal','levi','cohen','tal','levi','cohen','tal','levi','cohen','tal','levi','cohen','tal','levi'],
                    chooseCallback: function(index,value){
                        CLog.dlog(index+") "+value);
                    },
                    listCallbacks:[function(){CLog.dlog('Dvir Clicked')},
                        function(){CLog.dlog('Cohen Clicked')}],
                    hideOnListChoose: false,
                    cancelText: 'Cancel',
                    cancelCallback: function() { CLog.dlog('Cancel Callback')},
                    confirmText: 'Confirm',
                    confirmCallback: function() { CLog.dlog('Confirm Callback')},
                    extraText: 'Extra Button',
                    extraCallback: function() { CLog.dlog('Extra Callback')}
                }).build()*/
            );
        builder.create('Form','form')
            .formInputs(['form-input-name','form-input-phone'])
            .formOnSubmit(function(values) { CLog.log(values); })
            .formSaveToUrl('')
            .formSaveToUrlCallback(function(responseData){})
            .childs(['form-input-name','form-input-phone','form-submit-button',
                'form-send-to-url-button','form-save-to-local-storage-button','form-clear-button'])
            .design({ widthSM: 5,widthXS: 10,padding: 5,round:3,marginTop:10 });
        //Add Design.
        builder.addDesign('text-input',{marginTop:4, margin:'centered',widthSM:7, widthXS:11});
        builder.create('Input','form-input-name')
            .inputName('name').inputRequired().formLoadInputFromStorage()
            .design(builder.getDesign('text-input'));
        builder.create('Input','form-input-phone')
            .inputName('phone').inputRequired().formLoadInputFromStorage()
            .design(builder.getDesign('text-input'));
        //Add Design.
        builder.addDesign('form-button-base',{ height:40, marginTop:4,widthSM: 7,widthXS: 11,marginRight:1, marginLeft:1, marginTop:1});
        builder.create('Button','form-submit-button')
            .design(/*Strong*/{bgColor:{color:'DarkGreen',level:7},
                active: { bgColor:{color:'DarkGreen',level:9}}},/*Base*/builder.getDesign('form-button-base'))
            .text('Submit Form').icon('right43',40,'right')
            .formSubmitButton('form');
        builder.create('Button','form-send-to-url-button')
            .design(/*Strong*/{bgColor:{color:'LightBlue',level:5},
                active: { bgColor:{color:'LightBlue',level:7}}},/*Base*/builder.getDesign('form-button-base'))
            .text('Send to URL').icon('right43',40,'right')
            .formSendToUrlButton('form');
        builder.create('Button','form-save-to-local-storage-button')
            .design(/*Strong*/{bgColor:{color:'Purple',level:5},
                active: { bgColor:{color:'Purple',level:7}}},/*Base*/builder.getDesign('form-button-base'))
            .text('Save to Local Storage').icon('right43',40,'right')
            .formSaveToLocalStorageButton('form');
        builder.create('Button','form-clear-button')
            .design(/*Strong*/{bgColor:{color:'Red',level:5},
                active: { bgColor:{color:'Red',level:7}}},/*Base*/builder.getDesign('form-button-base'))
            .text('Clear Form').icon('right43',40,'right')
            .formClearButton('form');
        builder.create('Gallery','main-gallery')
            .sliderPagination()
            .sliderSlidesPerView(1)// Example that can be more than 1 slide per view.
            .galleryImages([
                'http://ourevent.co.il/wp-content/uploads/2014/04/1-1.jpg',
                'http://ourevent.co.il/wp-content/uploads/2014/04/2-1.jpg',
                'http://ourevent.co.il/wp-content/uploads/2014/04/3-1.jpg',
                'http://ourevent.co.il/wp-content/uploads/2014/04/4-1.jpg'
            ]);
        builder.create('Tabber','tabber').tabberTabs(['tab-1','tab-2','tab-3'])
            .tabberButtonsPerView(2).tabberButtonsHeight(45)
            .tabberButtonsTexts(['Tab 1','Tab 2','Tab 3'])
            .tabberButtonsDesign({bgColor: CColor('Red',5),
                active: {bgColor: CColor('Red',6)},
                hold: { bgColor: CColor('Red',8) } });
        builder.create('Tab','tab-1').childs([])
            .design({bgColor:CColor('White',6),color:CColor('Cyan',8),fontStyle:['bold'],paddingTop:30})
            .text('Tab 1 Content');
        builder.create('Tab','tab-2').childs([])
            .design({bgColor:CColor('White',6),color:CColor('Green',8),fontStyle:['bold'],paddingTop:30})
            .text('Tab 2 Content');
        builder.create('Tab','tab-3').childs([])
            .design({bgColor:CColor('White',6),color:CColor('Brown',8),fontStyle:['bold'],paddingTop:30})
            .text('Tab 3 Content');


        /*
                var appContainer = {   uname:  'app-container', type:   'AppContainer',
                    data: {  childs: ['side-menu','main-view','drop-down-menu'] }
                };
                var sideMenu = {   uname:  'side-menu', type:   'SideMenu',
                    data: { leftContainer: 'side-menu-left-container', rightContainer:'side-menu-right-container' }
                }
                var sideMenuLeftContainer = {uname:'side-menu-left-container',type:'Container',
                    data: {childs: []}
                };
                var sideMenuRightContainer = {uname:'side-menu-right-container',type:'Container',
                    data: {childs: []}
                };
                var mainView = {   uname:  'main-view', type:   'MainView',
                    data: {  childs: ['header','content','footer'] }
                };
                var header = {   uname:  'header', type:   'Header',
                    data: {
                        left: ['header-button-left-0','header-button-back'],
                        right: ['header-button-right-0','header-button-right-1']
                    }
                };
                var footer = {   uname:  'footer', type:   'Footer'
                };
                var content = {   uname:  'content', type:   'Content',
                    data: {  childs: ['main-page','form-page','category-page','tabs-page'] }
                };
                var mainPage = {   uname:  'main-page', type:   'Page',
                    data: {  childs: ['main-to-buttons-button','main-to-forms-button','main-to-sliders-button','main-to-tabs-button','main-to-dialogs-button','main-to-icons-button','main-to-data-button','to-category-button','to-category-dvir-button','main-button','main-reload-template','template-buttons','main-gallery'],
                        page: {
                            name: '',
                            title: 'Main',
                            onLoad: function() {}
                        }
                    },
                    logic: { page: true }
                };
                var formPage = {   uname:  'form-page', type:   'Page',
                    data: {  childs: ['form'],
                        page: {
                            name: 'form',
                            title: 'Form',
                            onLoad: function() {}
                        }
                    },
                    logic: { page: true }
                };
                var tabsPage = {   uname:  'tabs-page', type:   'Page',
                    data: {  childs: ['tabber'],
                        page: {
                            name: 'tabs',
                            title: 'Tabs',
                            onLoad: function() {}
                        }
                    },
                    logic: { page: true }
                };
                var categoryPage = {   uname:  'category-page',type:   'TemplatePage',
                    data: {
                        childs: [],
                        page: {
                            name: 'category',
                            title: 'Category Page',
                            onLoad: function(params) {CLog.dlog(params);}
                        },
                        templateObjects:[
                            {
                                type:   'Label',
                                design: { height:40, bgColor:{color:'Red',level:6},widthSM: 10, widthXS: 10,marginRight:1, marginLeft:1, marginTop:1, round: 2,
                                    active: { bgColor:{color:'Red',level:8} },
                                    activeRemove: {bgColor:{color:'Red',level:6}}
                                },
                                logic: { text: "Title: #.data.category" }
                            }
                        ]
                    },
                    logic: {
                        template:{},
                        page: true
                    }
                };
                var dynamicButtons = {   uname:  'template-buttons',type:   'Template',
                    data: {
                        templateObjects:[
                            {
                                type:   'Label',
                                uname: '#/label',
                                design: { height:40, bgColor:{color:'Red',level:6},widthSM: 10, widthXS: 10,marginRight:1, marginLeft:1, marginTop:1, round: 2,
                                    active: { bgColor:{color:'Red',level:8} },
                                    activeRemove: {bgColor:{color:'Red',level:6}}
                                },
                                logic: { text: "Title: #this.data.name" }
                            },
                            {
                                type:   'Button',
                                design: { height:40, bgColor:{color:'Cyan',level:6},widthSM: 10, widthXS: 10,marginRight:1, marginLeft:1, marginTop:1, round: 2,
                                    active: { bgColor:{color:'Cyan',level:8} },
                                    activeRemove: {bgColor:{color:'Cyan',level:6}}
                                },
                                logic: { text: "Welcome #.data.name",
                                    showDialog: {
                                        data: {
                                            title: 'Hello #.data.name !',
                                            //topView: 'main-button',
                                            textContent: '#.data.message',
                                            confirmText: 'Confirm',
                                            confirmCallback: function() { CLog.dlog('Confirm Callback')}
                                        }
                                    }
                                }
                            }
                        ]
                    },
                    logic: {
                        template:{
                            url: 'http://codletech.net/CAF/caf.php',
                            autoLoad: true
                        }
                    }
                };
                var mainViewReloadDynamic = {   uname:  'main-reload-template', type:   'Button',
                    design: { height:40, bgColor:{color:'DarkGreen',level:6},widthSM: 5, widthXS: 10, marginRight:1, marginLeft:1, marginTop:1, round: 2,
                        active: { bgColor:{color:'DarkGreen',level:8} }},
                    logic: {
                        text: "Reload",
                        buttonReloadDynamic: {object: 'template-buttons', reset: true, queryData: {} }
                    }
                };
                var mainButtonsDesign = {
                    paddingLeft:8,boxSizing:'borderBox',textAlign:'left',height:40,
                        bgColor:{color:'Teal',level:6},widthSM: 5, widthXS: 10,marginRight:1,
                        marginLeft:1, marginTop:1, round: 0,
                        active: { bgColor:{color:'Teal',level:8} }
                };
                var mainToButtonsButton = {   uname:  'main-to-buttons-button', type:   'Button',
                    design: mainButtonsDesign,
                    logic: {
                        text:'Buttons',
                        icon: { name: 'right43', align: 'right', size: 40 },
                        link: { path: 'buttons', data: {} }
                    }
                }
                var mainToFormsButton = {   uname:  'main-to-forms-button', type:   'Button',
                    design: mainButtonsDesign,
                    logic: {
                        text:'Forms',
                        icon: { name: 'right43', align: 'right', size: 40 },
                        link: { path: 'forms', data: {} }
                    }
                }
                var mainToSlidersButton = {   uname:  'main-to-sliders-button', type:   'Button',
                    design: mainButtonsDesign,
                    logic: {
                        text:'Sliders',
                        icon: { name: 'right43', align: 'right', size: 40 },
                        link: { path: 'sliders', data: {} }
                    }
                }
                var mainToTabsButton = {   uname:  'main-to-tabs-button', type:   'Button',
                    design: mainButtonsDesign,
                    logic: {
                        text:'Tabs',
                        icon: { name: 'right43', align: 'right', size: 40 },
                        link: { path: 'tabs', data: {} }
                    }
                }
                var mainToDialogsButton = {   uname:  'main-to-dialogs-button', type:   'Button',
                    design: mainButtonsDesign,
                    logic: {
                        text:'Dialogs',
                        icon: { name: 'right43', align: 'right', size: 40 },
                        link: { path: 'dialogs', data: {} }
                    }
                }
                var mainToIconsButton = {   uname:  'main-to-icons-button', type:   'Button',
                    design: mainButtonsDesign,
                    logic: {
                        text:'Icons',
                        icon: { name: 'right43', align: 'right', size: 40 },
                        link: { path: 'icons', data: {} }
                    }
                }
                var mainToDataButton = {   uname:  'main-to-data-button', type:   'Button',
                    design: mainButtonsDesign,
                    logic: {
                        text:'Data',
                        icon: { name: 'right43', align: 'right', size: 40 },
                        link: { path: 'data', data: {} }
                    }
                }
                var toCategoryButton = {   uname:  'to-category-button', type:   'Button',
                    design: { height:40, bgColor:{color:'Lime',level:6},widthSM: 10, widthXS: 10,marginRight:1, marginLeft:1, marginTop:1, round: 2,
                        active: { bgColor:{color:'Lime',level:8} }
                    },
                    logic: {
                        text:'Category',
                        link: {
                            path: 'category',
                            data: {}
                        }
                    }
                }
                var toCategoryDvirButton = {   uname:  'to-category-dvir-button', type:   'Button',
                    design: { height:40, bgColor:{color:'Lime',level:6},widthSM: 10, widthXS: 10,marginRight:1, marginLeft:1, marginTop:1, round: 2,
                        active: { bgColor:{color:'Lime',level:8} }
                    },
                    logic: {
                        text:'Category Dvir',
                        link: {
                            path: 'category/dvir',
                            data: {}
                        }
                    }
                }
                var mainViewButton = {   uname:  'main-button', type:   'Button',
                    design: { height:40, bgColor:{color:'Maroon',level:6},widthSM: 5, widthXS: 10,marginRight:1, marginLeft:1, marginTop:1, round: 2,
                        active: { bgColor:{color:'Maroon',level:8} }
                    },
                    logic: { text: "Show Dialog",
                        onClick: function(){
                            CDialog.showDialog({
                                title: 'Confirmation',
                                //topView: 'main-button',
                                textContent: 'Always do good things. Good things lead to better society, happiness, health and freedom.',
                                list: ['dvir','cohen','tal','levi','cohen','tal','levi','cohen','tal','levi','cohen','tal','levi','cohen','tal','levi','cohen','tal','levi','cohen','tal','levi'],
                                chooseCallback: function(index,value){
                                    CLog.dlog(index+") "+value);
                                },
                                listCallbacks:[function(){CLog.dlog('Dvir Clicked')},
                                    function(){CLog.dlog('Cohen Clicked')}],
                                hideOnListChoose: false,
                                cancelText: 'Cancel',
                                cancelCallback: function() { CLog.dlog('Cancel Callback')},
                                confirmText: 'Confirm',
                                confirmCallback: function() { CLog.dlog('Confirm Callback')},
                                extraText: 'Extra Button',
                                extraCallback: function() { CLog.dlog('Extra Callback')}
                            });
                        }
                    }
                };
                var headerButtonRight0 = {   uname:  'header-button-right-0', type:   'Button',
                    design: { //bgColor:{color:'Red',level:6},
                        active: { bgColor:{color:'Blue',level:8} }
                    },
                    logic: { text: "dm",
                        onClick: function(){
                            CLog.log('Button Clicked');
                        },
                        dialogSwitch: 'drop-down-menu',
                        icon: {
                            name: 'ellipsis',
                            size: 38
                        }
                    }
                };
                var headerButtonRight1 = {   uname:  'header-button-right-1', type:   'Button',
                    design: { active: { bgColor:{color:'Blue',level:8} } },
                    logic: {
                        link: {
                            path: 'form',
                            data: {}
                        },
                        icon: {
                            name: 'pencil52',
                            size: 38
                        }
                    }
                };
                var headerButtonLeft0 = {   uname:  'header-button-left-0', type:   'Button',
                    design: { active: { bgColor:{color:'Blue',level:8} } },
                    logic: {
                        sideMenuSwitch: 'left',
                        icon: {
                            name: 'menu24',
                            size: 38
                        }
                    }
                };
                var headerBackButton = {   uname:  'header-button-back', type:   'Button',
                    design: { active: { bgColor:{color:'Blue',level:8} } },
                    logic: {
                        backButton: true,
                        icon: {
                            name: 'left46',
                            size: 34
                        }
                    }
                };
                var dropDownMenu = {   uname:  'drop-down-menu', type:   'Dialog',
                    data: {
                        topView: 'header-button-right-0',
                        list: ['dvir','cohen','tal','levi','cohen','tal levi the very very very very very very very very man','levi','cohen'],
                        chooseCallback: function(index,value){
                            CLog.dlog(index+") "+value);
                        },
                        listCallbacks:[function(){CLog.dlog('Dvir Clicked')},
                            function(){CLog.dlog('Cohen Clicked')}],
                        dialogColor: {color: 'Blue', level: 4},
                        listBorderColor: {color: 'Gray', level: 6},
                        contentColor: {color: 'White'},
                        bgColor: {color:'Gray', level: 8},
                        dialogWidth: 250,
                        destroyOnHide: false
                    }
                };
                var form = { uname: 'form', type: 'Form',
                    data: { inputs: ['form-input-name','form-input-phone'],
                            childs: ['form-input-name','form-input-phone',
                                    'form-submit-button','form-send-to-url-button',
                                    'form-save-to-local-storage-button','form-clear-button'],
                            onSubmit: function(values) { CLog.log(values); }
                    },
                    design: { widthSM: 5,widthXS: 10,padding: 5,round:3,marginTop:10,
                        border: {all:1},borderColor:{color:'Gray',level:3}
                    }
                }
                var inputsDesign = {
                    marginTop:4, margin: 'centered',widthSM: 7, widthXS: 11
                };
                var inputName = { uname: 'form-input-name', type: 'Input',
                    data: { name:'name', required: true },
                    design:inputsDesign,
                    logic: {loadInputFromStorage: true}
                }
                var inputPhone = { uname: 'form-input-phone', type: 'Input',
                    data: { name:'phone', required: true,loadInputFromStorage: true },
                    design:inputsDesign,
                    logic: {loadInputFromStorage: true}
                }
                var formSubmitButton = { uname: 'form-submit-button', type: 'Button',
                    design: { height:40, bgColor:{color:'DarkGreen',level:3}, marginTop:4,widthSM: 7, widthXS: 11, marginRight:1, marginLeft:1, marginTop:1, round: 2,
                        active: { bgColor:{color:'DarkGreen',level:5} }
                    },
                    logic: { text: "Submit Form",
                        formSubmitButton: 'form'
                    }
                };
                var formSendToURLButton = { uname: 'form-send-to-url-button', type: 'Button',
                    design: { height:40, bgColor:{color:'LightBlue',level:3}, marginTop:4,widthSM: 7, widthXS: 11, marginRight:1, marginLeft:1, marginTop:1, round: 2,
                        active: { bgColor:{color:'Blue',level:5} }
                    },
                    logic: { text: "Send to URL",
                        formSendToUrlButton: 'form'
                    }
                };
                var formSaveToLocalStorageButton = { uname: 'form-save-to-local-storage-button', type: 'Button',
                    design: { height:40, bgColor:{color:'Purple',level:3}, marginTop:4,widthSM: 7, widthXS: 11, marginRight:1, marginLeft:1, marginTop:1, round: 2,
                        active: { bgColor:{color:'Purple',level:5} }
                    },
                    logic: { text: "Save to Local Storage",
                        formSaveToLocalStorageButton: 'form'
                    }
                };
                var formClearButton = { uname: 'form-clear-button', type: 'Button',
                    design: { height:40, bgColor:{color:'Red',level:3}, marginTop:4,widthSM: 7, widthXS: 11, marginRight:1, marginLeft:1, marginTop:1, round: 2,
                        active: { bgColor:{color:'Red',level:5} }
                    },
                    logic: { text: "Clear Form",
                        formClearButton: 'form'
                    }
                };
                var gallery = { uname: 'main-gallery', type: 'Gallery',
                    data: {
                        images:['http://ourevent.co.il/wp-content/uploads/2014/04/1-1.jpg',
                            'http://ourevent.co.il/wp-content/uploads/2014/04/2-1.jpg',
                            'http://ourevent.co.il/wp-content/uploads/2014/04/3-1.jpg',
                            'http://ourevent.co.il/wp-content/uploads/2014/04/4-1.jpg'],
                        pagination: true
                    }
                };
                var tabber = { uname: 'tabber', type: 'Tabber',
                    data: {
                        tabs: ['tab-Cyan','tab-red','tab-green'],
                        buttons: {
                            perView: 2,
                            texts:['Cyan','Red','Green'],
                            design:{
                                bgColor: {color:'Maroon',level:3},
                                active: {
                                    bgColor: {color:'Maroon',level:6}
                                },
                                hold: {
                                    bgColor: {color:'Maroon',level:8}
                                }
                            }
                        }
                    }
                };
                var tabCyan = { uname: 'tab-Cyan', type: 'Tab',
                    design:{
                        bgColor:{color:'Cyan',level:6}
                    }
                };
                var tabRed = { uname: 'tab-red', type: 'Tab',
                    design: {
                        bgColor:{color:'Red',level:6}
                    }
                };
                var tabGreen = { uname: 'tab-green', type: 'Tab',
                    design: {
                        bgColor:{color:'Green',level:6}
                    }
                };

                var objects = [
                    appContainer,
                    sideMenu,
                    sideMenuLeftContainer,
                    sideMenuRightContainer,
                    mainView,
                    mainViewReloadDynamic,
                    mainViewButton,
                    form,
                    inputPhone,
                    inputName,
                    formSubmitButton,
                    formSendToURLButton,
                    formSaveToLocalStorageButton,
                    formClearButton,
                    gallery,
                    header,
                    footer,
                    content,
                    mainPage,
                    headerButtonRight0,
                    headerButtonRight1,
                    headerButtonLeft0,
                    dropDownMenu,
                    dynamicButtons,
                    formPage,
                    categoryPage,
                    toCategoryButton,
                    toCategoryDvirButton,
                    headerBackButton,
                    tabsPage,
                    tabber,
                    tabCyan,
                    tabRed,
                    tabGreen,
                    mainToButtonsButton,
                    mainToFormsButton,
                    mainToSlidersButton,
                    mainToTabsButton,
                    mainToIconsButton,
                    mainToDataButton,
                    mainToDialogsButton


                ];
        */


        var caf = new Caf();
        caf.init(builder.build());
        //caf.init('');
        //caf.pager.init('page-main','back');
        //caf.ui.rebuildAll();
/*
        var str = "";
        var i = 0;
        while (i<=150)
        {
            str += ".iconSize"+i+"{\n\t"+"font-size:"+i+"px;\n}\n"
            i++;
        }
        CLog.log(str);
*/
    }

}