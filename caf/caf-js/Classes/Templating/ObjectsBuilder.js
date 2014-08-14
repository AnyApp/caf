/**
 * Created by dvircn on 14/08/14.
 */
var COBuilder = Class({
    constructor: function(type) {
    },
    build: function(type,uname,design,logic,data){
        return {
            type:   type,
            uname:  uname,
            design: design || {},
            logic:  logic || {},
            data:   data || {}
        };
    },


});


