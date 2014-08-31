/**
 * Created by dvircn on 09/08/14.
 */
var CTemplator = Class({
    $singleton: true,
    inBuilding: false,
    waitingCount: 0,
    current: '',
    /**
     * Build all objects.
     */
    buildAll: function(){
        CObjectsHandler.object(CObjectsHandler.appContainerId).setParent('body');
        this.buildFromObject(CObjectsHandler.appContainerId);
    },
    /**
     * Build from object.
     * @param id : Object ID.
     */
    buildFromObject: function(id){
        if (CTemplator.inBuilding===true && CTemplator.waitingCount<100){
            CTemplator.waitingCount++;
            CThreads.run(function(){CTemplator.buildFromObject(id);},50);
            return;
        }

        CTemplator.waitingCount = 0;
        CTemplator.inBuilding = true;
        CTemplator.current = id;
        // Clear prepared objects.
        CObjectsHandler.clearPreparedObjects();

        // Prepare for build and get the view (If the objects aren't in the DOM).
        var currentObject   = CObjectsHandler.object(id);
        var view            = new CStringBuilder();

        var viewBuilder     = currentObject.prepareBuild({view:view});

        // Append the view to the parent in the DOM.
        // Note: If the objects are already in the DOM, viewStr will be empty
        //       and the DOM won't change.
        var viewStr = viewBuilder.build(' ');
        CDom.addChild(currentObject.getParent(),viewStr);

        // Restructure before logic is applied.
        _.each(CObjectsHandler.getPreparedObjects(),function(object){
            //Restructure containers children.
            if (object.isContainer())
                object.restructureChildren();
        },CTemplator);

        // Build relevant Objects by the order of their build (Parent->Child).
        _.each(CObjectsHandler.getPreparedObjects(),function(object){
            // Apply Logic and Design on the Object.
            CLogic.applyLogic(object);
            CDesign.applyDesign(object);
        },CTemplator);

        // Clear Whitespaces.
        CUtils.cleanWhitespace();

        CThreads.run(function(){CTemplator.inBuilding = false;;},1000);

    },
    objectJSON: function(type,uname,design,logic,data){
        var object = {};
        object.type     = type;
        object.uname    = uname;
        object.design   = design;
        object.logic    = logic;
        object.data     = data;
    }


});
