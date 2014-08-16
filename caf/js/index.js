var app =
{
    initialize: function()
    {
        var appContainer = {   uname:  'app-container', type:   'AppContainer',
            data: {  childs: ['side-menu','main-view'] }
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
        var header = {   uname:  'header', type:   'Header'
        };
        var footer = {   uname:  'footer', type:   'Footer'
        };
        var content = {   uname:  'content', type:   'Content',
            data: {  childs: ['main-page'] }
        };
        var mainPage = {   uname:  'main-page', type:   'Page',
            data: {  childs: ['main-label','main-button','form','main-gallery'] }
        };
        var mainViewLabel = {   uname:  'main-label', type:   'Label',
            design: { bgColor:{color:'Blue',level:1},widthSM: 5, widthXS: 10 },
            logic: { text: "Label" }
        };
        var mainViewButton = {   uname:  'main-button', type:   'Button',
            design: { bgColor:{color:'Cyan',level:1},widthSM: 5, widthXS: 10,
                active: { bgColor:{color:'Cyan',level:4} }
            },
            logic: { text: "Button",
                onClick: function(){
                    CLog.log('Button Clicked');
                }
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
                border: {all:1},borderColor:{color:'Gray',level:-2}
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
            design: { bgColor:{color:'Green',level:1}, marginTop:4,widthSM: 7, widthXS: 11,
                active: { bgColor:{color:'Green',level:4} }
            },
            logic: { text: "Submit Form",
                formSubmitButton: 'form'
            }
        };
        var formSendToURLButton = { uname: 'form-sent-to-url-button', type: 'Button',
            design: { bgColor:{color:'Blue',level:1}, marginTop:4,widthSM: 7, widthXS: 11,
                active: { bgColor:{color:'Blue',level:4} }
            },
            logic: { text: "Send to URL",
                formSendToUrlButton: 'form'
            }
        };
        var formSaveToLocalStorageButton = { uname: 'form-save-to-local-storage-button', type: 'Button',
            design: { bgColor:{color:'Purple',level:1}, marginTop:4,widthSM: 7, widthXS: 11,
                active: { bgColor:{color:'Purple',level:4} }
            },
            logic: { text: "Save to Local Storage",
                formSaveToLocalStorageButton: 'form'
            }
        };
        var formClearButton = { uname: 'form-clear-button', type: 'Button',
            design: { bgColor:{color:'Red',level:1}, marginTop:4,widthSM: 7, widthXS: 11,
                active: { bgColor:{color:'Red',level:4} }
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

        var objects = [
            appContainer,
            sideMenu,
            sideMenuLeftContainer,
            sideMenuRightContainer,
            mainView,
            mainViewLabel,
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
            mainPage


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
    }
}