/**
 * Created by dvircn on 06/08/14.
 */
var CThreads = Class({
    $singleton: true,
    start: function(task){
        window.setTimeout(task,0);
    },
    run: function(task,time){
        window.setTimeout(task,time);
    }

});

