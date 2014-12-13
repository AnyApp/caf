/**
 * Created by dvircn on 15/11/14.
 */
var CEvents = Class({
    events: {
        reshow: 'reshow',
        prepareReshow: 'prepareReshow',
        pageLoaded: 'pageLoaded'
    },
    $singleton: true,
    eventsRegistrations: {},
    /**
     *
     * @param eventName
     * @param objectId
     * @param func - Can be function or function-path in the object.
     *               In that case, the function will apply from inside the object.
     */
    register: function(eventName,objectId,func){
        // Create event entry
        if (CUtils.isEmpty(CEvents.eventsRegistrations[eventName]))
            CEvents.eventsRegistrations[eventName] = [];
        CEvents.eventsRegistrations[eventName].push({objectId:objectId,func:func});
    },
    fire: function(eventName,caller,data,filter){
        if (CUtils.isEmpty(CEvents.eventsRegistrations[eventName]))
            return;
        filter = filter || function(object,data) {return true;};
        // Create Event.
        var event = {
            name: eventName,
            caller: caller,
            data: data
        };
        _.each(CEvents.eventsRegistrations[eventName],function(subscriber){
            var object = CObjectsHandler.object(subscriber.objectId);
            // Filter the object.
            if (!filter(object,data))
                return;

            // If the subscriber sent a function.
            if (CUtils.isFunction(subscriber.func))
                subscriber.func(event);
            // If the subscriber sent a function reference at the object.
            // Execute the function from the object with the event.
            else {
                try {
                    var func = eval('object.'+subscriber.func+'(event);');
                }
                catch(e){
                    CLog.error('Failed to execute event subscriber function.');
                    CLog.error('Logging subscriber...');
                    CLog.log(subscriber);
                    CLog.error('Logging error...');
                    CLog.log(e);
                }

            }
        });
    }


});


