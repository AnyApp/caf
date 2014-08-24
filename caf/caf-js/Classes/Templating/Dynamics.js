/**
 * Created by dvircn on 22/08/14.
 */
var CDynamics = Class({
    $singleton: true,
    applyDynamic: function(object,value) {
        if (CUtils.isEmpty(value) || CUtils.isEmpty(value.url))
            return;
        // Do not re-initiate
        if (this.dynamicApplied(object.uid()))
            return;
        // Initialize and set defaults.
        object.dynamic              = CUtils.clone(value);
        object.dynamic.url          = object.dynamic.url        || '';
        object.dynamic.data         = object.dynamic.data       || {};
        object.dynamic.autoLoad     = object.dynamic.autoLoad   || false;
        object.dynamic.loaded       = object.dynamic.loaded     || false;
        object.dynamic.loadTo       = object.dynamic.loadTo     || 'after'; // self/after
        object.dynamic.duplicates   = object.dynamic.duplicates || [];

        if (object.dynamic.autoLoad === true)
            this.load();
    },
    dynamicApplied: function(objectId){
        var object = CObjectsHandler.object(objectId);
        return !CUtils.isEmpty(object.dynamic);
    },
    duplicateWithData: function (object, data) {
        if (!CUtils.isArray(data)) // Convert to Array
            data = [data];

        var parentContainer = CObjectsHandler.object(object.parent);
        // Remove All Previous duplicates.
        parentContainer.removeChilds(object.dynamic.duplicates);

        object.dynamic.duplicates = [];
        _.each(data,function(currentData){
            var duplicate = CObjectsHandler.createFromObject(object,
                                currentData.data,currentData.logic,currentData.design);
            object.dynamic.duplicates.push(duplicate.uid());
        },this);

        // Add duplicates to container after this object.
        parentContainer.appendChildsAfterObject(object.dynamic.duplicates);
    },
    loadDataToObject: function (object, data) {
        object.data     = CUtils.mergeJSONs(object.data,data.data);
        object.logic    = CUtils.mergeJSONs(object.logic,data.logic);
        object.design   = CUtils.mergeJSONs(object.design,data.design);
        CTemplator.buildFromObject(object.uid());
    },
    loadObjectWithData: function (objectId, data) {
        var object = CObjectsHandler.object(objectId);
        if (object.dynamic.loadTo === 'after')
            this.duplicateWithData(object,data);
        else if (object.dynamic.loadTo === 'self')
            this.loadDataToObject(object,data);

    },
    load: function(objectId,queryData) {
        var object = CObjectsHandler.object(objectId);
        // Do not rebuild again.
        if (object.dynamic.loaded === true && !CUtils.equals(queryData,object.dynamic.data))
            return;

        object.dynamic.data = queryData;

        // Request.
        CNetwork.request(object.dynamic.url,object.dynamic.data,
        function(retrievedData){
            CDynamics.loadObjectWithData(objectId,retrievedData);
        });
    }

});


