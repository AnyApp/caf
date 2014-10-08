/**
 * Created by dvircn on 06/08/14.
 */

var CContainer = Class(CObject,{
    $statics: {
        DEFAULT_DESIGN: {
        },
        DEFAULT_LOGIC: {
        }
    },

    constructor: function(values) {
        if (CUtils.isEmpty(values)) return;
        // Merge Defaults.
        CObject.mergeWithDefaults(values,CContainer);

        // Invoke parent's constructor
        CContainer.$super.call(this, values);
        this.data.childs        = this.data.childs || [];
        this.data.lastChilds    = this.data.lastChilds || [];
        this.data.toRemoveChilds= [];
    },
    /**
     *  Build Object.
     */
    prepareBuild: function(data){
        // Remove to-remove childs.
        _.each(this.data.toRemoveChilds,function(childID){
            CDom.removeFromDOM(childID);
        },this);
        //Clear.
        this.data.toRemoveChilds = [];
        // insert new elements.
        var content = new CStringBuilder();
        _.each(this.data.childs,function(childID){
            // Check if already exist.
            /*if (!CUtils.isEmpty(CUtils.element(childID)))
             return;*/
            var object = CObjectsHandler.object(childID);
            // Case object doesn't exist.
            if (CUtils.isEmpty(object)){
                CLog.error("CContainer.prepareBuild error: Could not find element with ID: "+childID);
                return;
            }
            //Set parent to this Object.
            object.setParent(this.uid());
            // Force Design.
            this.applyForceDesign(object);
            // Prepare Build Object and merge with the content.
            content.merge(object.prepareBuild({}));
        },this);


        // Prepare this element - wrap it's children.
        data.view = content;
        CContainer.$superp.prepareBuild.call(this,CUtils.mergeJSONs(data));

        /**
         * If Container already in the DOM -> append the view.
         * Notice: If the Container already in the DOM the
         * view will contain children elements only.
         */
        if (CDom.exists(this.uid())) {
            //.length()>0
            CDom.addChild(this.uid(),content.build(' '));
            content = new CStringBuilder(); // Clear content.
        }

        return content;
    },
    getChilds: function(){
        return this.data.childs;
    },
    assignReferences: function(){
        _.each(this.data.childs,function(childID){
            var object = CObjectsHandler.object(childID);
            //Set parent to this Object.
            object.setParent(this.uid());
            object.assignReferences();
        },this);

        CContainer.$superp.assignReferences.call(this);
    },
    applyForceDesign: function(object){
        if (!CUtils.isEmpty(this.forceDesign))
            object.setDesign(CUtils.mergeJSONs(this.forceDesign,object.getDesign()));
    },
    setChildInPosition: function(childId,position){
        this.data.childs[position] = childId;
    },
    appendChild: function(objectId){
        this.data.childs.push(objectId);
    },
    appendChilds: function(objectsIds){
        objectsIds = objectsIds || [];
        this.data.childs.push.apply(this.data.childs,objectsIds);
    },
    addChildToStart: function(objectId){
        this.data.childs.push(objectId);
        this.moveChild(objectId,0);
    },
    addChildInPosition: function(objectId,index){
        this.data.childs.push(objectId);
        this.moveChild(objectId,index);
    },
    appendChildAfterObject: function(afterObjectId,objectId){
        var afterIndex = this.data.childs.indexOf(afterObjectId)+1;
        var afterChilds = this.data.childs.splice(afterIndex);
        this.data.childs.push(objectId);
        this.data.childs.push.apply(this.data.childs,afterChilds);
    },
    appendChildsAfterObject: function(afterObjectId,objectsIds){
        // Remove all duplicates before re-insert.
        _.each(objectsIds,function(objId){
            CUtils.arrayRemove(this.data.childs,objId);
        },this);

        var afterIndex = this.data.childs.indexOf(afterObjectId)+1;
        var afterChilds = this.data.childs.splice(afterIndex);
        this.data.childs.push.apply(this.data.childs,objectsIds);
        this.data.childs.push.apply(this.data.childs,afterChilds);
    },
    removeChild: function(objectId){
        CUtils.arrayRemove(this.data.childs,objectId);
        this.data.toRemoveChilds.push(objectId);
    },
    removeChilds: function(objectsIds,rebuild){
        _.each(objectsIds,function(objectId){
            CUtils.arrayRemove(this.data.childs,objectId);
            this.data.toRemoveChilds.push(objectId);
        },this);
    },
    moveChildFromIndex: function(fromIndex,toIndex){
         CUtils.arrayMove(this.data.childs,fromIndex,toIndex);
    },
    moveChild: function(objectId,toIndex){
        this.moveChildFromIndex(this.data.childs.indexOf(objectId),toIndex);
    },
    rebuild: function(onFinish){
        CBuilder.buildFromObject(this.uid(),onFinish);
    },
    restructureChildren: function(){
        if (CUtils.equals(this.data.lastChilds,this.data.childs))
            return;

        // Get All Nodes.
        var childrenIds = this.data.childs || [];
        var childrenNodes = [];
        _.each(childrenIds,function(childId){
/*
            CLog.dlog('------');
            CLog.dlog(childId);
            CLog.dlog(CUtils.element(childId));
            CLog.dlog('------');
*/
            childrenNodes.push(CUtils.element(childId));
        },this);

        // Remove All.
        CDom.removeAllChildren(this.uid());

        var container = CUtils.element(this.uid());
        _.each(childrenNodes,function(child){
            container.appendChild(child)
        },this);

        this.data.lastChilds = CUtils.clone(childrenIds);
    },
    isContainer: function(){
        return true;
    }


});


