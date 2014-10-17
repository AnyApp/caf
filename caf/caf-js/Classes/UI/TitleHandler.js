/**
 * Created by dvircn on 06/08/14.
 */
var CTitleHandler = Class({
    $singleton: true,
    titleId: '',
    setTitleObject: function(id){
        this.titleId = id;
    },
    setTitle: function(text){
        // Set web-page Title
        document.title = text || '';
        // Set CAF page title.
        var titleObject = CObjectsHandler.object(this.titleId);
        if (!CUtils.isEmpty(titleObject))
            titleObject.setText(text);

    }

});


