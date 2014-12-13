/**
 * Created by dvircn on 19/10/14.
 */
/**
 * Created by dvircn on 06/08/14.
 */
var CThemes = Class({
    $singleton: true,
    mainTheme: '',
    themes: {
        'flat-blue': CThemeFlatBlue
    },
    get: function(name){
        return CThemes[name];
    },
    setMainTheme: function(name) {
        CThemes.mainTheme = name;
    },
    loadTheme: function(name){
        var theme = CThemes.themes[name];
        if (CUtils.isEmpty(theme))
            return;

        _.each(theme.designs, function(design,name){
            CDesignHandler.addDesign(name,design);
        });
    }
});

