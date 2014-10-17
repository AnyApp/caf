/**
 * Created by dvircn on 06/08/14.
 */
var CDesigner = Class({
    $singleton: true,
    colors: {
        notLeveled: ['Black', 'White'],
        getColor: function(color,level){
            // Not Leveled Color.
            if (CDesigner.colors.notLeveled.indexOf(color)>=0){
                return color;
            }
            if (CUtils.isEmpty(level))  level = 0;
            level = Math.max(level,0);
            level = Math.min(level,17);

            return color+level;
        }
    },
    designs: {
        classes: function(data){
            return data;
        },
        active: function(data){
            // Do Nothing. Just to mention the active class attribute.
        },
        hold: function(data){
            // Do Nothing. Just to mention the hold class attribute.
        },
        activeRemove: function(data){
            // Do Nothing. Just to mention the activeRemove class attribute.
        },
        iconOnly: function(data){
            return 'iconOnly '+CIconsManager.getIcon(data);
        },
        iconRight: function(data){
            return 'IconRight borderBox '+CIconsManager.getIcon(data);
        },
        iconLeft: function(data){
            return 'IconLeft borderBox '+CIconsManager.getIcon(data);
        },
        bgColor: function(data){
            return "bg"+CDesigner.colors.getColor(data.color,data.level || null);
        },
        color: function(data){
            return "c"+CDesigner.colors.getColor(data.color,data.level || null);
        },
        borderColor: function(data){
            return "bc"+CDesigner.colors.getColor(data.color,data.level || null);
        },
        border: function(data){
            var classes = "";
            if (!CUtils.isEmpty(data['all']))       classes+="border"+data['all']+"p ";
            if (!CUtils.isEmpty(data['bottom']))    classes+="borderBottom"+data['bottom']+"p ";
            if (!CUtils.isEmpty(data['right']))     classes+="borderRight"+data['right']+"p ";
            if (!CUtils.isEmpty(data['left']))      classes+="borderLeft"+data['left']+"p ";
            if (!CUtils.isEmpty(data['top']))       classes+="borderTop"+data['top']+"p ";

            return classes;
        },
        fontSize: function(data){
            // Font Size
            return 'fsz'+data;
        },
        fontStyle: function(data){
            var classes = "";
            if (data=='normal')     classes+="fontStyleNormal ";
            if (data=='italic')     classes+="italic ";
            return classes;
        },
        fontWeight: function(data){
            var classes = "";
            if (data=='bold')       classes+="bold ";
            if (data=='normal')     classes+="fontWeightNormal ";
            return classes;
        },
        cursor: function(data){
            var values = ['pointer'];
            if (!CUtils.isEmpty(data) && (values.indexOf(data)>=0) ) {
                return data;
            }
            return "";
        },
        direction: function(data){
            var values = ['rtl','ltr'];
            if (!CUtils.isEmpty(data) && (values.indexOf(data)>=0) ) {
                return data;
            }
            return "";
        },
        textAlign: function(data){
            var values = ['center','right','left'];
            if (!CUtils.isEmpty(data) && (values.indexOf(data)>=0) ) {
                return "text"+CUtils.capitaliseFirstLetter(data);
            }
            return "";
        },
        position: function(data){
            var values = ['absolute','relative'];
            if (!CUtils.isEmpty(data) && (values.indexOf(data)>=0) ) {
                return data;
            }
            return "";
        },
        display: function(data){
            var values = ['inlineBlock','block','inline','hidden','displayNone'];
            if (!CUtils.isEmpty(data) && (values.indexOf(data)>=0) ) {
                return data;
            }
            return "";
        },
        overflow: function(data){
            if (data==="hidden")        return "hidden";
            //if (data==="scrollable")    return "scrollable";
            if (data==="scrollY")       return "yScrollable";
            return "";
        },
        scrollable: function(data){
            if (data===true && CScrolling.isNativeScrolling())
                return CScrolling.scrollableClass();
            return '';
        },
        boxSizing: function(data){
            var values = ['borderBox'];
            if (!CUtils.isEmpty(data) && (values.indexOf(data)>=0) ) {
                return data;
            }
            return "";
        },
        round: function(data){
            if (data==="circle")    return "circle";

            return "Rounded"+data;
        },
        width: function(data){
            data = ""+data;
            if (data.indexOf('%')>=0)   return "w"+data.substring(0,data.length-1);
            return "wp"+data;
        },
        widthXS: function(data){
            return "col-xs-"+data;
        },
        widthSM: function(data){
            return "col-sm-"+data;
        },
        widthMD: function(data){
            return "col-md-"+data;
        },
        widthLG: function(data){
            return "col-lg-"+data;
        },
        height: function(data){
            data = ""+data;
            if (data==='auto') return 'heightAuto';
            if (data.indexOf('%')>=0)   return "h"+data.substring(0,data.length-1);
            return "hp"+data;
        },
        minHeight: function(data){
            return "mhp"+data;
        },
        maxHeight: function(data){
            data = ""+data;
            if (data.indexOf('%')>=0)   return "maxh"+data.substring(0,data.length-1);

            return "maxhp"+data;
        },
        maxWidth: function(data){
            data = ""+data;
            if (data.indexOf('%')>=0)   return "maxw"+data.substring(0,data.length-1);

            return "maxwp"+data;
        },
        margin: function(data){
            if (data==="none")
                return "noMargin";
            if (data==="auto")
                return "autoMargin";
            if (data==="centered")
                return "marginCentered";
            if (data==="to-right")
                return "marginRighted";
            if (data==="to-left")
                return "marginLefted";
            return "mt"+data+" mb"+data+" mr"+data+" ml"+data;
        },
        marginTop: function(data){
            return "mt"+data;
        },
        marginBottom: function(data){
            return "mb"+data;
        },
        marginLeft: function(data){
            return "ml"+data;
        },
        marginRight: function(data){
            return "mr"+data;
        },
        paddingTop: function(data){
            return "pt"+data;
        },
        paddingBottom: function(data){
            return "pb"+data;
        },
        paddingLeft: function(data){
            return "pl"+data;
        },
        paddingRight: function(data){
            return "pr"+data;
        },
        padding: function(data){
            if (data==="none")
                return "noPadding";
            return "pt"+data+" pb"+data+" pr"+data+" pl"+data;
        },
        top: function(data){
            return "top"+data;
        },
        bottom: function(data){
            return "bottom"+data;
        },
        left: function(data){
            return "left"+data;
        },
        right: function(data){
            return "right"+data;
        },
        gpuAccelerated: function(data){
            if (data===true){
                return "gpuAccelerated";
            }
        }

    },
    prepareDesign: function(object){
        var design = object.design;
        // Save the classes in the object.
        object.setClasses(CDesigner.designToClasses(design));
    },
    mergeParents: function(design){
        var parents = design.parents || [];
        _.each(parents,function(parent){
            var parentDesign = {};
            // Design is reference to named design.
            if (CUtils.isString(parent))
                parentDesign = CDesignHandler.get(parent) || {};
            else
                parentDesign = parent;
            // In case it wasn't merged yet, Merge parents of parent.
            CDesigner.mergeParents(parentDesign);
            // Merge parent design into current design - current design is stronger.
            design = CUtils.mergeJSONs(parentDesign,design);
        },this);
        // Remove after merge.
        delete design.parents;

        return design;
    },
    designToClasses: function(design){
        if (CUtils.isEmpty(design))
            return "";

        design = CDesigner.mergeParents(design);

        var classesBuilder = new CStringBuilder();
        // Scan the designs and generate classes.
        _.each(design,function(value,attribute){
            if (CUtils.isEmpty(value))  return;
            if (CUtils.isEmpty(CDesigner.designs[attribute])){
                CLog.error("Design: "+attribute+" doesn't exist.")
                return "";
            }
            classesBuilder.append( CDesigner.designs[attribute](value) );
        },this);
        return classesBuilder.build(' ');
    },
    applyDesign: function(object){
        if (object.lastClasses !== object.classes)
            CUtils.element(object.uid()).className = object.classes;
    }

});

