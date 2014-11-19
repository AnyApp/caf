/**
 * Created by dvircn on 18/11/14.
 */
var CMail = Class({
    $singleton: true,
    open: function(options){
        options = options || {};
        options.to = options.to || [''];
        if (window && window.plugin && window.plugin.email && window.plugin.email.isServiceAvailable){
            window.plugin.email.isServiceAvailable(function(isAvailable){
                if (isAvailable){
                    window.plugin.email.open({
                        to: options.to
                    });
                }
            });
        }
        else
            CUtils.openURL("mailto:" + options.to[0], "_system");

    }


});


