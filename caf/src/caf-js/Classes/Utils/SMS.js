/**
 * Created by dvircn on 11/12/14.
 */
var CSMS = Class({
    $singleton: true,
    sendBackgroundSMS: function(phones,msg){
        CLog.dlog('Phone: '+phones[0]+' Message: '+msg);
    },
    sendBackgroundSMSSingle: function(phone,msg){
        CSMS.sendBackgroundSMS([phone],msg);
    }


});


