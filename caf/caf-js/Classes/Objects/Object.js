/**
 * Created by dvircn on 06/08/14.
 */
var CObject = Class({
    $statics: {
        CURRENT_ID:   0,

        generateID: function() {
            this.CURRENT_ID += 1;
            return "CObjectId_"+this.CURRENT_ID;
        }
    },

    constructor: function(values) {
        if (CUtils.isEmpty(values)) return;

        this.id         = values.id || CObject.generateID();
        this.appId      = values.appId;
        this.uname      = values.uname;
        this.version    = values.version;
        this.platform   = values.platform;
        this.logic      = values.logic;
        this.design     = values.design;
        this.data       = values.data;
    }

});




