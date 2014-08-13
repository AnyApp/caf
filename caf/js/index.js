var app =
{
    initialize: function()
    {
        var objects = [
            {   uname:  'app-container', type:   'AppContainer',
                data: {  childs: ['label','button','side-menu'] }
            },
            {   uname:  'side-menu', type:   'Label',
                design: {
                    bgColor:{color:'Gray',level:4}
                },
                logic: {
                    sideMenu: { position:'left' }
                }
            },
            {   uname:  'label', type:   'Label',
                design: {
                    height: 100, textAlign: 'center',
                    color:{color:'White'},
                    bgColor:{color:'Cyan',level:3},
                    font: { size:18, style:['bold']},
                    //TODO: active // Fix Active To be active design inner!!
                },
                logic: { text: "Label" }
            },
            {   uname:  'button', type:   'Label',
                design: {
                    height: 100, textAlign: 'center',
                    color:{color:'White'},
                    bgColor:{color:'Cyan',level:3},
                    font: { size:18, style:['bold']}
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