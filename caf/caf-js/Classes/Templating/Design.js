/**
 * Created by dvircn on 06/08/14.
 */
var CDesign = Class({
    $singleton: true,
    colors: {
        notLeveled: ['Black', 'White', 'SmokeWhite', 'LightSmokeWhite', 'DarkSmokeWhite'],
        leveled:    ['Green', 'Blue', 'Cyan', 'Brown', 'Red', 'Pink', 'Purple', 'Gray'],
        levels: {
            '-4':   'XXXLight',
            '-3':   'XXLight',
            '-2':   'XLight',
            '-1':   'Light',
            '0':    '',
            '1':    'Dark',
            '2':    'XDark',
            '3':    'XXDark',
            '4':    'XXXDark'
        },
        getColor: function(color,level){
            // Not Leveled Color.
            if (this.colors.notLeveled.indexOf(color)>=0){
                return color;
            }
            if (CUtils.isEmpty(level))  level = 0;

            return this.colors.levels[""+level]+color;
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
            return "bg"+this.colors.getColor(data.color,data.level || null);
        },
        color: function(data){
            return "c"+this.colors.getColor(data.color,data.level || null);
        },
        borderColor: function(data){
            return "bc"+this.colors.getColor(data.color,data.level || null);
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
        font: function(data){
            var classes = "";
            var style = data.style || [];
            if (style.indexOf('bold')>=0)       classes+="bold ";
            if (style.indexOf('italic')>=0)     classes+="italic ";

            // Font Size
            if (!CUtils.isEmpty(data.size))     classes += data.size+"FontSize";

            return classes;
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
        overflow: function(data){
            if (data==="hidden")        return "hidden";
            if (data==="scrollable")    return "overthrow";
            return "";
        },
        boxSizing: function(data){
            var values = ['borderBox'];
            if (!CUtils.isEmpty(data) && (values.indexOf(data)>=0) ) {
                return data;
            }
            return "";
        },
        boxSizing: function(data){
            if (data==="circle")    return "circle";

            return (data || "s")+"Rounded";
        },
        width: function(data){
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
            return "hp"+data;
        },
        margin: function(data){
            if (data==="none")  return "noMargin";
            var classes = "";
            if (!CUtils.isEmpty(data['bottom']))    classes+="mb"+data['bottom']+" ";
            if (!CUtils.isEmpty(data['top']))       classes+="mt"+data['top']+" ";
            // If direction mentioned, right-left margin is ignored.
            if (!CUtils.isEmpty(data['direction'])){
                if (data['direction']==="centered") classes+"marginCentered ";
                if (data['direction']==="toright")  classes+"marginRighted ";
                if (data['direction']==="toleft")   classes+"marginLefted ";
                return classes;
            }

            if (!CUtils.isEmpty(data['right']))     classes+="mr"+data['right']+" ";
            if (!CUtils.isEmpty(data['left']))      classes+="ml"+data['left'];

            return classes;
        },
        padding: function(data){
            if (data==="none")  return "noPadding";
            var classes = "";
            if (!CUtils.isEmpty(data['bottom']))    classes+="pb"+data['bottom']+" ";
            if (!CUtils.isEmpty(data['top']))       classes+="pt"+data['top']+" ";
            if (!CUtils.isEmpty(data['right']))     classes+="pr"+data['right']+" ";
            if (!CUtils.isEmpty(data['left']))      classes+="pl"+data['left'];

            return classes;
        },
        absolutes: function(data){
            var classes = "";
            if (!CUtils.isEmpty(data['bottom']))    classes+="bottom"+data['bottom']+" ";
            if (!CUtils.isEmpty(data['top']))       classes+="top"+data['top']+" ";
            if (!CUtils.isEmpty(data['right']))     classes+="right"+data['right']+" ";
            if (!CUtils.isEmpty(data['left']))      classes+="left"+data['left'];

            return classes;
        }

    },
    prepareDesign: function(object){
        var classesBuilder = new CStringBuilder();
        var design = object.design;
        // Scan the designs and generate classes.
        _.each(design,function(value,attribute){
            if (CUtils.isEmpty(value))  return;
            classesBuilder.append( this.designs[attribute](value) );
        });
        // Save the classes in the object.
        object.setClasses(classesBuilder.build(" "));
    },
    applyDesign: function(object){
        CUtils.element(object.uid()).className = object.classes;
    }

});

