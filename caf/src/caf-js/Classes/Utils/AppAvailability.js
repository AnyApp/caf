/**
 * Created by dvircn on 17/11/14.
 */
var CAppAvailability = Class({
    $singleton: true,
    hasFacebook: function(onHas,onHasnt){
        if (CUtils.isEmpty(window.appAvailability))
            onHasnt();
        else if (CPlatforms.isIOS())
            appAvailability.check( 'fb://',onHas,onHasnt );
        else if (CPlatforms.isAndroid())
            appAvailability.check( 'com.facebook.katana',onHas,onHasnt );
        else
            onHasnt();
    },
    hasWhatsapp: function(onHas,onHasnt){
        if (CUtils.isEmpty(window.appAvailability))
            onHasnt();
        else if (CPlatforms.isIOS())
            appAvailability.check( 'whatsapp://',onHas,onHasnt );
        else if (CPlatforms.isAndroid())
            appAvailability.check( 'com.whatsapp',onHas,onHasnt );
        else
            onHasnt();
    }


});


