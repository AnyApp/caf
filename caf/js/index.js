var app =
{
    initialize: function()
    {
        caf.init('');
        //caf.pager.init('page-main','back');
        caf.ui.rebuildAll();
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