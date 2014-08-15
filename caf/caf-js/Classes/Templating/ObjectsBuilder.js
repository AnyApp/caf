/**
 * Created by dvircn on 14/08/14.
 */
var COBuilder = Class({
    constructor: function(type,uname,design,logic,data) {
        this.type   = type      || 'Object';
        this.uname  = uname     || '';
        this.design = design    || {};
        this.logic  = logic     || {};
        this.data   = data      || {};
    },
    build: function(){
        return {
            type:   this.type,
            uname:  this.uname,
            design: this.design  || {},
            logic:  this.logic   || {},
            data:   this.data    || {}
        };
    },



});


