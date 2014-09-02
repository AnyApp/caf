/**
 * Created by dvircn on 22/08/14.
 */
var CDynamics = Class({
    $singleton: true,
    hiddenClass: 'displayNone',
    applyDynamic: function(object,value) {
        if (CUtils.isEmpty(value) || CUtils.isEmpty(value.url))
            return;
        // Do not re-initiate
        if (this.dynamicApplied(object.uid()))
            return;
        // Initialize and set defaults.
        object.dynamic              = CUtils.clone(value);
        object.dynamic.url          = object.dynamic.url        || '';
        object.dynamic.queryData    = object.dynamic.queryData  || {};
        object.dynamic.autoLoad     = object.dynamic.autoLoad   || false;
        object.dynamic.loaded       = object.dynamic.loaded     || false;
        object.dynamic.loadTo       = object.dynamic.loadTo     || 'after'; // self/after
        object.dynamic.duplicates   = object.dynamic.duplicates || [];

        if (object.dynamic.autoLoad === true)
            this.load(object.uid());
    },
    dynamicApplied: function(objectId){
        var object = CObjectsHandler.object(objectId);
        return !CUtils.isEmpty(object.dynamic);
    },
    duplicateWithData: function (object, data, reset) {
        if (!CUtils.isArray(data)) // Convert to Array
            data = [data];

        var parentContainer = CObjectsHandler.object(object.parent);
        // Remove All Previous duplicates.
        if (reset===true){
            CDynamics.removeDuplicates(object.uid(),false);
        }

        // For each row in data.
        _.each(data,function(currentData){
            // For each abstract object in the dynamic object.
            _.each(object.data.abstractObjects,function(abstractObject){
                var duplicateId = CObjectsHandler.createFromDynamicObject(abstractObject,
                    currentData.data,currentData.logic,currentData.design);

                object.dynamic.duplicates.push(duplicateId);
            },this);
        },this);

        // Add duplicates to container after this object.
        parentContainer.appendChildsAfterObject(object.uid(),object.dynamic.duplicates,false);
        parentContainer.rebuild();
    },
    removeDuplicates: function(objectId,rebuild){
        var object          = CObjectsHandler.object(objectId);
        var parentContainer = CObjectsHandler.object(object.parent);
        // Remove All Previous duplicates.
        parentContainer.removeChilds(object.dynamic.duplicates);
        object.dynamic.duplicates = [];
        if (rebuild === true)
            parentContainer.rebuild();
    },
    // Currently Not Used
    loadDataToObject: function (object, data) {
        object.data     = CUtils.mergeJSONs(object.data,data.data);
        object.logic    = CUtils.mergeJSONs(object.logic,data.logic);
        object.design   = CUtils.mergeJSONs(object.design,data.design);
        CTemplator.buildFromObject(object.uid());
    },
    loadObjectWithData: function (objectId, data, reset) {
        var object = CObjectsHandler.object(objectId);
        this.duplicateWithData(object,data, reset);
    },
    load: function(objectId,queryData,reset) {
        var object = CObjectsHandler.object(objectId);

        object.showLoading();

        // Do not rebuild again.
        if (object.dynamic.loaded === true && !CUtils.equals(queryData,object.dynamic.queryData))
            return;

        object.dynamic.queryData = queryData;

        // Request.
        CNetwork.request(object.dynamic.url,object.dynamic.queryData,
            function(retrievedData){
                CDynamics.loadObjectWithData(objectId,retrievedData,reset);
                object.stopLoading();
        });

    }

});


