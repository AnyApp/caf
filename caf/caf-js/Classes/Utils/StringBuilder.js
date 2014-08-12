/**
 * Created by dvircn on 09/08/14.
 */
var CStringBuilder = Class({
    constructor: function() {
        this.array = Array();
    },
    /**
     *
     * @param value - Array of Strings or String.
     * @param toStart - if true - will append to start of string. Else - end.
     */
    append: function(value,inStart){
        var operation = toStart===true? this.array.unshift : this.array.push;
        // String Case.
        if( typeof value === 'string' ) value = [value];

        operation.apply(this.array, value);
    },
    merge: function(stringBuilder){
        this.append(stringBuilder.array,false);
    },

    /**
     *  Build String.
     */
    build: function(separator){
        separator = separator || "";
        return this.array.join(separator);
    }


});




