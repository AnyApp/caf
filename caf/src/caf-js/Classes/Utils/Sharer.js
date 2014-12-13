/**
 * Created by dvircn on 06/08/14.
 */
var CSharer = Class({
    $singleton: true,
    base: '',
    share: function(options){
        if (CUtils.isEmpty(options))
           return;
        var msg     = options.msg       || null;
        var subject = options.subject   || null;
        var image   = options.image     || null;
        var link    = options.link      || null;

        // Empty or Base 64 image.
        if (CUtils.isEmpty(image) || image.indexOf('data:')===0)
            CSharer.shareAction(msg,subject,image,link); // Immidiate share.

        // Link image
        var shareFunction = function(base64Img){
            CSharer.shareAction(msg,subject,base64Img,link); // Immidiate share.
        };
        CUtils.convertImgToBase64(image,shareFunction,'image/png');
    },
    shareAction: function(msg,subject,image,link){
        // Sharing not supported.
        if (!(window.plugins && window.plugins.socialsharing && window.plugins.socialsharing.share))
            return;
        // Share.
        window.plugins.socialsharing.share(msg,subject,image,link);
    }

});


