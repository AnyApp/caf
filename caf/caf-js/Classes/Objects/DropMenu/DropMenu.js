/**
 * Created by dvircn on 16/08/14.
 */
var CDropMenu = Class(CDialog,{
    $statics: {
        DEFAULT_DESIGN: {
            classes:'dropMenu'
        },
        DEFAULT_LOGIC: {
        }
    },

    constructor: function(values) {
        if (CUtils.isEmpty(values)) return;
        // Merge Defaults.
        CObject.mergeWithDefaults(values,CDropMenu);
        // Set Design.


        // Invoke parent's constructor - the design, childs could not be changed
        // After tha point, because they will be passed to the
        // dialog container.
        CDropMenu.$super.call(this, values);

        // Set position.
        if (values.data.leftMenu === true)
            this.design.left  = 0;
        else
            this.design.right = 0;


        this.leftContainer  = values.data.leftContainer  || null;
        this.rightContainer = values.data.rightContainer || null;

        // Create left and right menus.
        this.leftMenu   = CObjectsHandler.createObject('SideMenuLeft',{
            data: {  childs: [this.leftContainer] }
        });
        this.rightMenu  = CObjectsHandler.createObject('SideMenuRight',{
            data: {  childs: [this.rightContainer] }
        });

        // Set Children.
        this.data.childs = ['side-menu-left','side-menu-right'];
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


