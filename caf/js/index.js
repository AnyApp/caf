var app =
{
    initialize: function()
    {
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
                left: ['header-button-left-0'],
                right: ['header-button-right-0','header-button-right-1']
            }
        };
        var footer = {   uname:  'footer', type:   'Footer'
        };
        var content = {   uname:  'content', type:   'Content',
            data: {  childs: ['main-page','form-page'] }
        };
        var mainPage = {   uname:  'main-page', type:   'Page',
            data: {  childs: ['main-button','main-reload-dynamic','dynamic-buttons','main-gallery'] },
            logic: {
                page: {
                    name: '',
                    title: 'Main',
                    onLoad: function() {}
                }
            }
        };
        var formPage = {   uname:  'form-page', type:   'Page',
            data: {  childs: ['form'] },
            logic: {
                page: {
                    name: 'form',
                    title: 'Form',
                    onLoad: function() {}
                }
            }
        };
        var mainViewReloadDynamic = {   uname:  'main-reload-dynamic', type:   'Button',
            design: { height:40, bgColor:{color:'Olive',level:4},widthSM: 5, widthXS: 10, marginRight:1, marginLeft:1, marginTop:1, round: 2,
                active: { bgColor:{color:'Olive',level:6} }},
            logic: {
                text: "Reload",
                buttonReloadDynamic: 'dynamic-buttons'
            }
        };
        var mainViewButton = {   uname:  'main-button', type:   'Button',
            design: { height:40, bgColor:{color:'Maroon',level:4},widthSM: 5, widthXS: 10,marginRight:1, marginLeft:1, marginTop:1, round: 2,
                active: { bgColor:{color:'Maroon',level:6} }
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
            design: { bgColor:{color:'Red',level:4},
                active: { bgColor:{color:'Red',level:6} }
            },
            logic: { text: "dm",
                onClick: function(){
                    CLog.log('Button Clicked');
                },
                dialogSwitch: 'drop-down-menu'
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
        var headerButtonRight1 = {   uname:  'header-button-right-1', type:   'Button',
            design: { bgColor:{color:'Orange',level:4},
                active: { bgColor:{color:'Orange',level:6} }
            },
            logic: { text: "X",/*
                onClick: function(){
                    CLog.log('Button Clicked');
                },*/
                link: {
                    path: 'form',
                    data: {}
                }
            }
        };
        var headerButtonLeft0 = {   uname:  'header-button-left-0', type:   'Button',
            design: { bgColor:{color:'Red',level:4},
                active: { bgColor:{color:'Red',level:6} }
            },
            logic: { text: "sm",
                sideMenuSwitch: 'left'
            }
        };
        var form = { uname: 'form', type: 'Form',
            data: { inputs: ['form-input-name','form-input-phone'],
                    childs: ['form-input-name','form-input-phone',
                            'form-submit-button','form-sent-to-url-button',
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
            design: { height:40, bgColor:{color:'Olive',level:4}, marginTop:4,widthSM: 7, widthXS: 11, marginRight:1, marginLeft:1, marginTop:1, round: 2,
                active: { bgColor:{color:'Olive',level:6} }
            },
            logic: { text: "Submit Form",
                formSubmitButton: 'form'
            }
        };
        var formSendToURLButton = { uname: 'form-sent-to-url-button', type: 'Button',
            design: { height:40, bgColor:{color:'Navy',level:4}, marginTop:4,widthSM: 7, widthXS: 11, marginRight:1, marginLeft:1, marginTop:1, round: 2,
                active: { bgColor:{color:'Blue',level:6} }
            },
            logic: { text: "Send to URL",
                formSendToUrlButton: 'form'
            }
        };
        var formSaveToLocalStorageButton = { uname: 'form-save-to-local-storage-button', type: 'Button',
            design: { height:40, bgColor:{color:'Purple',level:4}, marginTop:4,widthSM: 7, widthXS: 11, marginRight:1, marginLeft:1, marginTop:1, round: 2,
                active: { bgColor:{color:'Purple',level:6} }
            },
            logic: { text: "Save to Local Storage",
                formSaveToLocalStorageButton: 'form'
            }
        };
        var formClearButton = { uname: 'form-clear-button', type: 'Button',
            design: { height:40, bgColor:{color:'Red',level:4}, marginTop:4,widthSM: 7, widthXS: 11, marginRight:1, marginLeft:1, marginTop:1, round: 2,
                active: { bgColor:{color:'Red',level:6} }
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

        var dynamicButtons = {   uname:  'dynamic-buttons',type:   'DynamicObject',
            data: {
                object: {
                    type:   'Button',
                    design: { height:40, bgColor:{color:'Aqua',level:4},widthSM: 10, widthXS: 10,marginRight:1, marginLeft:1, marginTop:1, round: 2,
                        active: { bgColor:{color:'Aqua',level:6} },
                        activeRemove: {bgColor:{color:'Aqua',level:4}}
                    },
                    logic: { text: "$this.data.name",
                        showDialog: {
                            data: {
                                title: '$this.data.name',
                                //topView: 'main-button',
                                textContent: '$this.data.message || "default text"',
                                confirmText: 'Confirm',
                                confirmCallback: function() { CLog.dlog('Confirm Callback')}
                            }
                        }
                    }
                }
            },
            logic: {
                dynamic:{
                    url: 'http://codletech.net/CAF/caf.php',
                    autoLoad: true
                }
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
            formPage


        ];


        var caf = new Caf();
        caf.init(objects);
        //caf.init('');
        //caf.pager.init('page-main','back');
        //caf.ui.rebuildAll();
        /*var str = "";
        var i = 0;
        while (i<=100)
        {
            str += ".top"+i+"{\n\t"+"top:"+i+"px;\n}\n"
            str += ".bottom"+i+"{\n\t"+"bottom:"+i+"px;\n}\n"
            str += ".right"+i+"{\n\t"+"right:"+i+"px;\n}\n"
            str += ".left"+i+"{\n\t"+"left:"+i+"px;\n}\n"
            i++;
        }
        caf.log(str);*/
        app.do();
    },
    do: function(){

    }

}