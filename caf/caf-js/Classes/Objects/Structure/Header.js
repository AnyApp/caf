/**
 * Created by dvircn on 15/08/14.
 */
var CHeader = Class(CContainer,{
    $statics: {
        DEFAULT_DESIGN: {
            classes: 'header',
            bgColor:{
                color: 'Blue',
                level: 4
            }
        },
        DEFAULT_LOGIC: {
        }

    },

    constructor: function(values) {
        if (CUtils.isEmpty(values)) return;
        // Merge Defaults.
        CObject.mergeWithDefaults(values,CHeader);

        // Invoke parent's constructor
        CHeader.$super.call(this, values);

        this.design.height = CAppConfig.get('headerSize');

        this.data.itemSize = this.design.height;

        // Declare Left & Right Buttons
        this.data.left  = this.data.left  || [];
        this.data.right = this.data.right || [];

        this.data.titleDesign = this.data.titleDesign || {};
        this.data.titleDesign = CUtils.mergeJSONs(this.data.titleDesign,{
            position: 'absolute',
            left: this.data.itemSize * this.data.left.length,
            right: this.data.itemSize * this.data.right.length,
            top: 0, bottom:0, margin: 'none', height:'auto'
        });
        // Create Title.
        this.data.title = CObjectsHandler.createObject('Label',{
            design: this.data.titleDesign
        });
        CUI.setTitleObject(this.data.title);

        // Set up childs array.
        this.appendChilds(this.data.left);
        this.appendChilds([this.data.title]);
        this.appendChilds(this.data.right);

        // Set Force Design
        this.forceDesign = {
            position: 'absolute',
            top: 0, bottom: 0,
            width: this.data.itemSize
        }
    },
    applyForceDesign: function(object){
        var id = object.uid();
        var leftPos     = this.data.left.indexOf(id);
        var rightPos    = this.data.right.indexOf(id);
        if (leftPos >= 0){
            this.forceDesign['left']    = this.data.itemSize * leftPos;
            this.forceDesign['right']   = null;
        }
        else if (rightPos >= 0){
            this.forceDesign['left']    = null;
            this.forceDesign['right']   = this.data.itemSize * rightPos;
        }
        else {
            return;
        }
        CHeader.$superp.applyForceDesign.call(this,object);
    }



});

