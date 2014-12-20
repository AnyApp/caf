/**
 * Created by dvircn on 11/12/14.
 */
var CBarcodeScanner = Class({
    $singleton: true,
    scan: function(success,failure){
        if (window.cordova && window.cordova.plugins && window.cordova.plugins.barcodeScanner && window.cordova.plugins.barcodeScanner.scan)
            window.cordova.plugins.barcodeScanner.scan(
                function (result) {
                    if (success)
                        success(result);
                },
                function (error) {
                    CLog.log(error);
                    CLog.error('Scanning failed');
                    if (failure)
                        failure(error);
                }
            );
        else
            CLog.error('Barcode Scanner is not supported.');
    }
});


