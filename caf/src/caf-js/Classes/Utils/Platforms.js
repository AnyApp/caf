/**
 * Created by dvircn on 12/08/14.
 */
var CPlatforms = Class({
    $singleton: true,
    /**
     * Return whether or not the device platform is ios.
     * @returns {boolean}
     */
    isWeb: function() {
        return CUtils.isEmpty(navigator.app) && window.device===undefined;
    },
    /**
     * Return whether or not the device platform is ios.
     * @returns {boolean}
     */
    isIOS: function() {
        if (window.device===undefined || CUtils.isEmpty(window.device || null) || CUtils.isEmpty(window.device.platform || null))      return false;
        return window.device.platform.toLowerCase() == 'ios';
    },
    /**
     * Return whether or not the device platform is android.
     * @returns {boolean}
     */
    isAndroid: function() {
        if (window.device===undefined || CUtils.isEmpty(window.device || null) || CUtils.isEmpty(window.device.platform || null))      return false;
        return window.device.platform.toLowerCase() == 'android';
    },
    /**
     * Return the android series.
     * Examples: 4.4 => 4, 4.1 => 4, 2.3.3 => 2, 2.2 => 2, 3.2 => 3
     * @returns {number}
     */
    androidSeries: function() {
        if (!this.isAndroid()) return -1;

        var deviceOSVersion = device.version;  //fetch the device OS version
        return Number(deviceOSVersion.substring(0,deviceOSVersion.indexOf(".")));
    }

});



