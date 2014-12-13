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
    },
    runTimes: function(task,start,interval,times){
        for (var i=0;i<times;i++){
            window.setTimeout(task,start+interval*i);
        }
    },
    runIntervaly: function(task,interval){
        window.setInterval(task,interval);
    }

});

