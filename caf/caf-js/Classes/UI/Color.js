/**
 * Created by dvircn on 11/08/14.
 */
var CColor = function(color,level){
    if (level == undefined || level == null)
        level = 5;
    return {color:color,level:level};
}