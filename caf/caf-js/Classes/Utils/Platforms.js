/**
 * Created by dvircn on 12/08/14.
 */
var CLocalStorage = Class({
    $singleton: true,
    /**
     * Return whether or not the device platform is ios.
     * @returns {boolean}
     */
    isWeb: function() {
        return CUtils.isEmpty(navigator) && CUtils.isEmpty(device);
    },
    /**
     * Return whether or not the device platform is ios.
     * @returns {boolean}
     */
    isIOS: function() {
        return navigator.userAgent.match(/(iPad|iPhone|iPod)/g);
    },
    /**
     * Return whether or not the device platform is android.
     * @returns {boolean}
     */
    isAndroid: function() {
        if (caf.utils.isEmpty(device))      return false;
        return device.platform.toLowerCase() == 'android';
    },
    /**
     * Return the android series.
     * Examples: 4.4 => 4, 4.1 => 4, 2.3.3 => 2, 2.2 => 2, 3.2 => 3
     * @returns {number}
     */
    androidSeries: function() {
        if (!this.isAndroid()) return 0;

        var deviceOSVersion = device.version;  //fetch the device OS version
        return Number(deviceOSVersion.substring(0,deviceOSVersion.indexOf(".")));
    }

});



