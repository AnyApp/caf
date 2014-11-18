/**
 * Created by dvircn on 17/11/14.
 */
var CPush = Class({
    $singleton: true,
    googleProjectID: 206306306355,
    initialize: function(pushData){
        var pushToken = pushData.pushToken || '';
        CPush.registerDeviceForPush(pushToken);
    },
    registerDeviceForPush: function(pushToken) {
        if (CUtils.isEmpty(window.PushNotification))
            return;

        var PUSHAPPS_APP_TOKEN = pushToken;

        PushNotification.registerDevice(CPush.googleProjectID, PUSHAPPS_APP_TOKEN, function (pushToken) {
            //no use right now
        }, function (error) {
            //TODO: add error handling
        });

        document.removeEventListener('pushapps.message-received');
        document.addEventListener('pushapps.message-received', function (event) {
            var notification = event.notification;

            var devicePlatform = device.platform;
            if (devicePlatform === 'iOS') {

                //TODO: add handling for IOS notification
            } else {
                //TODO: add handling for Android notification
            }
        });

    }


});


