/**
 * Created by dvircn on 13/08/14.
 */
var CSideMenu = Class(CContainer,{
    $statics: {
        DEFAULT_DESIGN: {
            classes:'snap-drawers'
        },
        DEFAULT_LOGIC: {
        }
    },

    constructor: function(values) {
        if (CUtils.isEmpty(values)) return;
        // Merge Defaults.
        CObject.setObjectDefaults(values,CSideMenu);
        // Invoke parent's constructor
        CSideMenu.$super.call(this, values);
        this.leftContainer  = values.data.leftContainer  || null;
        this.rightContainer = values.data.rightContainer || null;
        var leftMenuChilds = [];
        if (!CUtils.isEmpty(this.leftContainer))
            leftMenuChilds.push(this.leftContainer);
        var rightMenuChilds = [];
        if (!CUtils.isEmpty(this.rightContainer))
            rightMenuChilds.push(this.rightContainer);
        // Create left and right menus.
        this.leftMenu   = CObjectsHandler.createObject('SideMenuLeft',{
            data: {  childs: leftMenuChilds }
        });
        this.rightMenu  = CObjectsHandler.createObject('SideMenuRight',{
            data: {  childs: rightMenuChilds }
        });

        // Set Children.
        this.data.childs = [this.leftMenu,this.rightMenu];
        var positions = [];
        if (this.leftContainer != null)
            positions.push('left');
        if (this.rightContainer != null)
            positions.push('right');

        this.logic.sideMenu = {
            positions: positions
        };

    }

});


