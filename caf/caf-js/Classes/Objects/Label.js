/**
 * Created by dvircn on 06/08/14.
 */

var CLabel = Class(CObject,{
    $statics: {
        DEFAULT_DESIGN: {
            height: 40,
            color: {color:'White'},
            fontSize:16,
            fontStyle:['bold'],
            marginRight:1,
            marginLeft:1,
            marginTop:1,
            textAlign: 'center',
            round: 2
        },
        DEFAULT_LOGIC: {
        }

    },

    constructor: function(values) {
        if (CUtils.isEmpty(values)) return;
        // Merge Defaults.
        CObject.mergeWithDefaults(values,CLabel);

        // Invoke parent's constructor
        CLabel.$super.call(this, values);
    },
    setText: function(text){
        CUtils.element(this.uid()).innerHTML = text;
    }


});

