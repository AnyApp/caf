/**
 * Created by dvircn on 22/08/14.
 */
var CTemplator = Class({
    $singleton: true,
    hiddenClass: 'displayNone',
    applyDynamic: function(object) {
        // Do not re-initiate
        if (this.dynamicApplied(object.uid()))
            return;

        object.data.template = object.data.template || {};

        if (object.data.template.autoLoad === true)
            this.load(object.uid(), object.data.template.queryData || {});

        object.data.template.applied = true;
    },
    dynamicApplied: function(objectId){
        return CObjectsHandler.object(objectId).data.template.applied===true;
    },
    objectHasDynamic: function(objectId) {
        var object = CObjectsHandler.object(objectId);
        return !CUtils.isEmpty(object.logic.template) && object.logic.template===true;
    },
    duplicateWithData: function (object, data, onFinish, reset, preventRebuild) {
        if (!CUtils.isArray(data)) // Convert to Array
            data = [data];

        // Remove All Previous duplicates.
        if (reset===true){
            CTemplator.removeDuplicates(object.uid(),false);
            object.data.template.containerToData = {};
        }

        // For each row in data.
        _.each(data,function(currentData){
            if (object.data.template.prepareRowFunction)
                currentData = object.data.template.prepareRowFunction(CUtils.clone(currentData));

            currentData = CTemplator.fixRetreivedData(currentData);
            // Create container.
            var templateData = object.data.template;

            var containerData   = CUtils.clone(templateData.container);
            containerData.data  = CUtils.mergeJSONs(containerData.data,currentData.data||currentData);

            // On item click listener.
            var position = templateData.duplicates.length;
            var onItemClick = CTemplator.createItemOnClick(position,currentData,
                templateData.callback,templateData.callbacks[position] || function(){});
            // Clear border from first item.
            containerData.design = containerData.design || {};
            containerData.design.border      = position!==0?containerData.design.border:null;
            containerData.design.borderColor = position!==0?containerData.design.borderColor:null;

            var containerId = CObjectsHandler.createObject(containerData.type,containerData);
            templateData.duplicates.push(containerId);
            var container   = CObjectsHandler.object(containerId);

            var rootObjects = templateData.rootObjects;
            // For each abstract object in the template object.
            var appended = false;
            _.each(templateData.objects,function(abstractObject){
                var logic = currentData.logic||{};
                logic.onTemplateElementClick = onItemClick;
                var duplicateId = CObjectsHandler.createFromTemplateObject(abstractObject,
                    currentData.data||{},logic,currentData.design||{});
                // Set relative parent.
                var duplicatedObject   = CObjectsHandler.object(duplicateId);
                duplicatedObject.relativeParent = containerId;
                // Add Template Childs.
                CTemplator.addTemplateChildsToRow(containerId,duplicatedObject,currentData);
                // If root object or there is only one object, add to the top container.
                if ( rootObjects.indexOf(abstractObject.uname || '') >=0 || templateData.objects.length === 1
                        || rootObjects.length === 0)
                    container.appendChild(duplicateId);
            },this);


            // Map container to data.
            object.data.template.containerToData[containerId] = currentData;
        },this);
        object.appendChilds(object.data.template.duplicates);


        // Append reshow call.
        var onFinishWithEventCall = function(){
            if (onFinish)
                onFinish();
            // Fire prepare-reshow.
            object.firePrepareReshowEvent();
            // Fire reshow.
            object.fireReshowEvent();
        };

        if (preventRebuild !== true)
            object.rebuild(onFinishWithEventCall);


    },
    addTemplateChildsToRow: function(containerId,duplicatedObject,currentData){
        if (!CUtils.isEmpty(duplicatedObject.data.templateChilds)){
            duplicatedObject.data.childs = duplicatedObject.data.childs || [];
            _.each(duplicatedObject.data.templateChilds,function(templateChild){
                var duplicateChildId = CObjectsHandler.createFromTemplateObject(templateChild.properties,
                    currentData.data||{},currentData.logic||{},currentData.design||{});
                // Set relative parent.
                var duplicatedChildObject   = CObjectsHandler.object(duplicateChildId);
                duplicatedChildObject.relativeParent = containerId;
                // Not using the uid() because it drops '#/..' unames. But here, it's important.
                duplicatedObject.data.childs.push(duplicatedChildObject.uname || duplicatedChildObject.id);
                CTemplator.addTemplateChildsToRow(containerId,duplicatedChildObject,currentData);
            });
        }
    },
    fixRetreivedData: function(retreived){
        // DO NOT MAKE any changes to the source data.
        retreived = CUtils.clone(retreived);
        if (CUtils.isEmpty(retreived))
            retreived = {};
        var fixed = {
            data: retreived.data || {},
            design: retreived.design || {},
            logic: retreived.logic || {}
        }
        delete retreived.data;
        delete retreived.design;
        delete retreived.logic;
        // Merge left data in retrieved into fixed.data
        fixed.data = CUtils.mergeJSONs(fixed.data,retreived);
        return fixed;
    },
    createItemOnClick: function(index,data,callback,callbacksCallback){
        return function() {
            callbacksCallback(data);
            callback(index,data);
        };
    },
    removeDuplicates: function(objectId,rebuild){
        var object          = CObjectsHandler.object(objectId);
        // Remove All Previous duplicates.
        object.removeChilds(object.data.template.duplicates);
        object.data.template.duplicates = [];
        if (rebuild === true)
            object.rebuild();
    },
    loadObjectWithData: function (objectId, data, onFinish, reset, preventRebuild) {
        var object = CObjectsHandler.object(objectId);
        if (CUtils.isEmpty(object)) // Case that objectId is actually object.
            object = objectId;

        // Allow data to be or to contain DynamicData.
        data = CData.value(data,true);

        object.data.template.data = data;
        // Parse References
        if (typeof object.data.template.data == "object")
            object.parseReferences(object.data.template.data);
        else{
            object.data.template.data = [object.data.template.data]
            object.parseReferences(object.data.template.data);
            object.data.template.data = object.data.template.data[0];
        }
        data = object.data.template.data;
        // Prepare the data before using it.
        data = object.data.template.prepareFunction(data);

        this.duplicateWithData(object,data, onFinish, reset, preventRebuild);
    },
    loadObjectWithDataNoRebuild: function (objectId, data, reset) {
        this.loadObjectWithData(objectId,data, null, reset, true);
    },
    getDuplicates: function (objectId) {
        if (CTemplator.dynamicApplied(objectId))
            return CObjectsHandler.object(objectId).data.template.duplicates||[];
    },
    lastDuplicate: function (objectId) {
        if (!CTemplator.dynamicApplied(objectId))
            return null;
        var duplicates = CTemplator.getDuplicates(objectId);
        return duplicates[duplicates.length-1];

    },
    duplicateAtPosition: function (objectId,position) {
        if (!CTemplator.dynamicApplied(objectId))
            return null;
        var duplicates = CTemplator.getDuplicates(objectId);
        return duplicates[position];

    },
    load: function(objectId, queryData, onFinish, reset) {
        onFinish = onFinish || function(){};

        var object = CObjectsHandler.object(objectId);
        if (CUtils.isEmpty(object.data.template.url) ||
            (object.data.template.loaded === true && !CUtils.equals(queryData,object.data.template.queryData) )){
            onFinish();
            return;
        }

        object.showLoading();

        object.data.template.queryData = queryData;

        // Request.
        CNetwork.request(object.data.template.url,object.data.template.queryData,
            function(retrievedData){
                CTemplator.loadObjectWithData(objectId, retrievedData, onFinish, reset);
                object.stopLoading();
            },
            function(error){
                CLog.error('Template Request Error.');
                if (!CUtils.isEmpty(object.data.template.remoteLoadErrorHandler))
                    object.data.template.remoteLoadErrorHandler(error);
                object.stopLoading();
            },
            object.data.template.requestOptions || {}
        );

    }

});


