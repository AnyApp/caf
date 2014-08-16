/**
 * Created by dvircn on 06/08/14.
 */
var CUI = Class({
    $singleton: true,
    titleId: '',
    setTitleObject: function(id){
        this.titleId = id;
    },
    setTitle: function(text){
        var titleObject = CObjectsHandler.object(this.titleId);
        if (!CUtils.isEmpty(titleObject))
            titleObject.setText(text);
    }

});


