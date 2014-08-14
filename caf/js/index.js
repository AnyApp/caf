var app =
{
    initialize: function()
    {
        var objects = [
            {   uname:  'app-container', type:   'AppContainer',
                data: {  childs: ['side-menu','main-view'] }
            },
            {   uname:  'side-menu', type:   'SideMenu',
                data: {
                    leftContainer: 'side-menu-left-container',
                    rightContainer:'side-menu-right-container'
                }
            },
            {   uname:  'side-menu-left-container', type:   'Container',
                data: {  childs: [] }
            },
            {   uname:  'side-menu-right-container', type:  'Container',
                data: {  childs: [] }
            },

            {   uname:  'main-view', type:   'MainView',
                data: {  childs: ['label','button'] },
                design: {
                    textAlign: 'center'
                }
            },
            {   uname:  'label', type:   'Label',
                design: {
                    height: 100, textAlign: 'center',
                    color:{color:'White'},
                    bgColor:{color:'Blue',level:1},
                    font: { size:18, style:['bold']},
                    margin: { right:1, left:1, top:3, direction: 'centered' },
                },
                logic: { text: "Label" }
            },
            {   uname:  'button', type:   'Button',
                design: {
                    height: 100, textAlign: 'center',
                    color:{color:'White'},
                    bgColor:{color:'Cyan',level:1},
                    font: { size:18, style:['bold']},
                    margin: { right:1, left:1, top:3, direction: 'centered' },
                    active: {
                        bgColor:{color:'Cyan',level:4}
                    }
                },
                logic: {
                    text: "Button",
                    onClick: function(){
                        CLog.log('Button Clicked');
                    }
                }
            }


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