var app =
{
    initialize: function()
    {
        var builder = new CBuilderObjects();
        builder.create('AppContainer','app-container').childs(['side-menu','main-view','drop-down-menu']);
        builder.create('SideMenu','side-menu')
            .sideMenuLeftContainer('side-menu-left-container').sideMenuRightContainer('side-menu-right-container');
        builder.addData('navigation',[
            {data: {icon:'circle57',       text: 'Main',    link: ''       } },
            {data: {icon:'large16',        text: 'Buttons', link: 'buttons'} },
            {data: {icon:'text78',         text: 'Form'  ,  link: 'form'   } },
            {data: {icon:'image63',        text: 'Sliders', link: 'sliders'} },
            {data: {icon:'video121',       text: 'Videos',  link: 'videos' } },
            {data: {icon:'two151',         text: 'Tabs'   , link: 'tabs'   } },
            {data: {icon:'exclamation14',  text: 'Dialogs', link: 'dialogs'} },
            {data: {icon:'table34',        text: 'Data'   , link: 'data'   } }
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
                    .design('#designs.left-menu-button')
                    .text('#this.data.text').link('#this.data.link').build()
            )
            .templateData('#globals.navigation');
        builder.create('SideMenuContainer','side-menu-right-container').childs(['right-menu'])
            .design({bgColor: CColor('Purple',15)});
        builder.addDesign('right-menu-button',{
            paddingRight:6,boxSizing:'borderBox',textAlign:'right',height:45, widthXS: 12,
            fontSize:16,color: CColor('Gray',2), marginTop:1, round: 0,
            active: { bgColor:CColor('Purple',17),color: CColor('White') }
        });
        builder.create('Template','right-menu')
            .templateObject(
                co('Button')
                    .iconLeft('#this.data.icon',28).sideMenuSwitch('right')
                    .design('#designs.right-menu-button')
                    .text('#this.data.text').link('#this.data.link').build()
            )
            .templateData('#globals.navigation');
        builder.create('MainView','main-view').childs(['header','content','footer']);
        builder.create('Header','header')
            .headerLeft(['header-button-left-0','header-button-back'])
            .headerRight(['header-button-right-0','header-button-right-1'])
            .design({bgColor:{color:'LightBlue',level:8}});
        //Add Design.
        builder.addDesign('header-button',{active: { bgColor:{color:'LightBlue',level:10} } });
        builder.create('Button','header-button-right-0')
            .design('#designs.header-button')
            .icon('ellipsis',38,'',CColor('White')).dialogSwitch('drop-down-menu');
        builder.create('Button','header-button-right-1')
            .design('#designs.header-button')
            .icon('pencil52',38,'',CColor('White')).link('form');
        builder.create('Button','header-button-left-0')
            .design('#designs.header-button')
            .icon('menu24',38,'',CColor('White')).sideMenuSwitch('left');
        builder.create('Button','header-button-back')
            .design('#designs.header-button')
            .icon('left46',34,'',CColor('White')).backButton();
        builder.create('Dialog','drop-down-menu').data({
            topView: 'header-button-right-0',
            //list: CUtils.arrayFromObjectsKey('#globals.navigation','data','text'),
            //iconsList:CUtils.arrayFromObjectsKey('#globals.navigation','data','icon'),
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
                .templateData('#globals.navigation')
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
            //listItemsData: '#globals.navigation',
            contentColor: {color: 'White'},
            bgColor: {color:'Teal', level: 13},
            destroyOnHide: false
        });
        builder.create('Footer','footer').child('footer-message')
            .design({bgColor:{color:'LightBlue',level:8}});
        builder.create('Label','footer-message').text('By Codletech')
            .design({color:CColor('White'),textAlign:'center',fontWeight:'normal'});
        builder.create('Content','content')
            .child('main-page').child('category-page').child('form-page')
            .child('category-page').child('tabs-page').child('sliders-page')
            .child('videos-page').child('dialogs-page').child('data-page');
        builder.create('Page','main-page')
            .child('main-buttons-template')
            .page('','Main',function(){} /* Optional On Page Load */);
        builder.create('Page','form-page').childs(['form'])
            .page('form','Form');
        builder.create('Page','tabs-page').childs(['tabber'])
            .page('tabs','Tabs');
        builder.create('Page','sliders-page')
            .child('basic-gallery')
            .page('sliders','Sliders');
        builder.create('Page','videos-page')
            .child('sample-youtube')
            .child('sample-vimeo')
            .page('videos','Videos');
        builder.create('Page','dialogs-page')
            .child('dialogs-show-dialog')
            .child('dialogs-show-error')
            .child('dialogs-show-success')
            .child('dialogs-show-warning')
            .page('dialogs','Dialogs');
        builder.create('Page','data-page')
            .child('main-reload-dynamic')
            .child('dynamic-buttons')
            .page('data','Data');
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
                    .design({ height:40, color:CColor('DeepOrange',8),widthSM: 8, widthXS: 8,marginRight:1, marginLeft:1, marginTop:1, round: 0
                        ,border:{bottom:1},borderColor: CColor('DeepOrange',8)})
                    .build(),
                co('Button').text('Dynamic Load Button #this.data.name')
                    .design({ height:40 ,widthSM: 8, widthXS: 8, marginRight:1, marginLeft:1, marginTop:1,marginBottom:1,
                        color: CColor('DeepOrange',8),border:{all:1},borderColor: CColor('DeepOrange',8),
                        active: { bgColor:CColor('DeepOrange',12),color: CColor('White') } })
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
            .design({ height:40 ,widthSM: 11, widthXS: 11, marginRight:1, marginLeft:1, marginTop:1,
                color: CColor('Green',8),border:{all:1},borderColor: CColor('DarkGreen',8),
                active: { bgColor:CColor('DarkGreen',8),color: CColor('White') } })
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
                    .design('#designs.main-button')
                    .text('#this.data.text').link('#this.data.link')
                    .build()
            )
            .templatePullToRefresh()
            .templateContainerDesign({display:'inline'})
            .templateItemOnClick(function(index){CLog.dlog('onClick item: '+index)})
            .templateData('#globals.navigation'
                /*co().iconLeft('table34',35)    .text('Category')   .link('category').build(),
                co().iconLeft('table34',35)    .text('Category Dvir').link('category/dvir').build(),
                co().iconLeft('table34',35)    .text('Show Dialog').showDialog(*//*Data*/
                /*{
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
        builder.addDesign('dialogs-button',{
            paddingLeft:6,boxSizing:'borderBox',textAlign:'left',height:60, widthXS: 12,
            fontSize:18,color: CColor('Cyan',8),bgColor:CColor('White',6), marginTop:1, round: 0,
            active: { bgColor:CColor('Cyan',8),color: CColor('White') }
        });
        builder.create('Button','dialogs-show-error')
            .design('#designs.dialogs-button')
            .iconRight('right65',40).iconLeft('cross55',35)
            .text('Show Error')
            .showDialog({
                title: 'Error Occurred',
                textContent: 'Something went wrong, please report to us at: Codletech@gmail.com.',
                confirmText: 'Close',
                dialogColor: CColor('Red',7)
            });
        builder.create('Button','dialogs-show-success')
            .design('#designs.dialogs-button')
            .iconRight('right65',40).iconLeft('check38',35)
            .text('Show Success')
            .showDialog({
                title: 'Success',
                textContent: 'You should be happy.',
                confirmText: 'Great',
                dialogColor: CColor('DarkGreen',8)
            });
        builder.create('Button','dialogs-show-warning')
            .design('#designs.dialogs-button')
            .iconRight('right65',40).iconLeft('warning25',35)
            .text('Show Warning')
            .showDialog({
                title: 'Warning',
                textContent: 'Please don\'t do anything that can cause damage to the environment.',
                confirmText: 'Got it',
                dialogColor: CColor('DeepOrange',7)
            });
        builder.create('Button','dialogs-show-dialog')
            .design('#designs.dialogs-button')
            .iconRight('right65',40).iconLeft('building26',35)
            .text('Show Complex Dialog')
            .showDialog({
                title: 'Confirmation',
                //topView: 'main-button',
                textContent: 'Always do good things. Good things lead to better society, happiness, health and freedom.',
                list:co('Template')
                    .templateObject(
                        co('Button')
                            .iconRight('right65',28).iconLeft('#this.data.icon',28)
                            .design({textAlign:'left',color:CColor('Cyan',9)})
                            .text('#this.data.text').link('#this.data.link')
                            .build()
                    )
                    .templateItemOnClick(function(index){CLog.dlog('onClick item: '+index)})
                    .templateData(builder.getData('navigation'))
                    .templateBorder(CColor('Red',6),4)
                    .templateContainerDesign({})// can change/append item container design.
                    .build(),
                hideOnListChoose: true,
                cancelText: 'Cancel',
                cancelCallback: function() { CLog.dlog('Cancel Callback')},
                confirmText: 'Confirm',
                confirmCallback: function() { CLog.dlog('Confirm Callback')},
                extraText: 'Extra Button',
                extraCallback: function() { CLog.dlog('Extra Callback')}}
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
        builder.addDesign('text-input',{marginBottom:2,marginTop:1, margin:'centered',widthSM:7, widthXS:11});
        builder.create('Input','form-input-name')
            .inputName('name').inputRequired().formLoadInputFromStorage()
            .inputPlaceholder('Enter Your Name')
            .design('#designs.text-input');
        builder.create('Input','form-input-phone')
            .inputName('phone').inputRequired().formLoadInputFromStorage()
            .inputPlaceholder('Enter Your Phone Number')
            .design('#designs.text-input');
        //Add Design.
        builder.addDesign('form-button-base',{ height:40, marginTop:4,widthSM: 7,widthXS: 11,marginRight:1, marginLeft:1, marginTop:1});
        builder.create('Button','form-submit-button')
            .design({parents:['form-button-base'],bgColor:{color:'DarkGreen',level:7},
                active: { bgColor:{color:'DarkGreen',level:9}}})
            .text('Submit Form').icon('right43',40,'right','White')
            .formSubmitButton('form');
        builder.create('Button','form-send-to-url-button')
            .design({parents:['form-button-base'],bgColor:{color:'LightBlue',level:5},
                active: { bgColor:{color:'LightBlue',level:7}}})
            .text('Send to URL').icon('right43',40,'right',CColor('White'))
            .formSendToUrlButton('form');
        builder.create('Button','form-save-to-local-storage-button')
            .design({parents:['form-button-base'],bgColor:{color:'Purple',level:5},
                active: { bgColor:{color:'Purple',level:7}}})
            .text('Save to Local Storage').icon('right43',40,'right',CColor('White'))
            .formSaveToLocalStorageButton('form');
        builder.create('Button','form-clear-button')
            .design({parents:['form-button-base'],bgColor:{color:'Red',level:5},
                active: { bgColor:{color:'Red',level:7}}})
            .text('Clear Form').icon('right43',40,'right',CColor('White'))
            .formClearButton('form');
        builder.create('Gallery','basic-gallery')
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
            .design({bgColor:CColor('White',6),color:CColor('Cyan',8),fontWeight:'bold',paddingTop:30})
            .text('Tab 1 Content');
        builder.create('Tab','tab-2').childs([])
            .design({bgColor:CColor('White',6),color:CColor('Green',8),fontWeight:'bold',paddingTop:30})
            .text('Tab 2 Content');
        builder.create('Tab','tab-3').childs([])
            .design({bgColor:CColor('White',6),color:CColor('Brown',8),fontWeight:'bold',paddingTop:30})
            .text('Tab 3 Content');
        builder.create('Video','sample-youtube')
            .videoSource('http://www.youtube.com/watch?v=I9ix0ECNuyE')
            .design({widthXS:10, height:250, marginTop:4});
        builder.create('Video','sample-vimeo')
            .videoSource('http://vimeo.com/6927295')
            .design({widthXS:10, height:250});


        //CAppUpdater.saveApp(builder.build());
        //CAppHandler.resetApp();
        //Caf.start();


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