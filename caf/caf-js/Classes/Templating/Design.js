/**
 * Created by dvircn on 06/08/14.
 */
var CDesign = Class({
    $singleton: true,
    colors: {
        notLeveled: ['Black', 'White', 'SmokeWhite', 'LightSmokeWhite', 'DarkSmokeWhite'],
        leveled:    ['Green', 'Blue', 'Cyan', 'Brown', 'Red', 'Pink', 'Purple', 'Gray']
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

        }
    },
    prepareDesign: function(object){

    },
    applyDesign: function(object){

    }

});

