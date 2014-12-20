/**
 * Created by dvircn on 11/12/14.
 */
var CSMS = Class({
    $singleton: true,
    sendBackgroundSMS: function(phones,msg){
        if (sms && sms.send)
            sms.send(phones, msg, '', function(){},function(){
                CDialog.showDialog({
                    title: 'חלה שגיאה',
                    textContent: 'הפעולה נכשלה',
                    dialogColor: CColor('RedC',10),
                    cancelText: 'אישור'
                });
            });
        else
            CLog.dlog('Phone: '+phones[0]+' Message: '+msg);
    },
    sendBackgroundSMSSingle: function(phone,msg){
        CSMS.sendBackgroundSMS([phone],msg);
    }


});


