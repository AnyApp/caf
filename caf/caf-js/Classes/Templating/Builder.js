/**
 * Created by dvircn on 09/08/14.
 */
var CBuilder = Class({
    $singleton: true,
    inBuilding: false,
    waitingCount: 0,
    current: '',
    /**
     * Build all objects.
     */
    buildAll: function(onFinish){
        CObjectsHandler.object(CObjectsHandler.appContainerId).setParent('body');
        this.buildFromObject(CObjectsHandler.appContainerId,onFinish || function(){});
    },
    /**
     * Build from object.
     * @param id : Object ID.
     */
    buildFromObject: function(id,onFinish){
        if (CBuilder.inBuilding===true && CBuilder.waitingCount<100){
            CBuilder.waitingCount++;
            CThreads.run(function(){CBuilder.buildFromObject(id,onFinish);},50);
            return;
        }

        onFinish = onFinish || function(){};

        CBuilder.waitingCount = 0;
        CBuilder.inBuilding = true;
        CBuilder.current = id;

        // Get root object.
        var currentObject   = CObjectsHandler.object(id);

        // Assign References to all objects to avoid any conflicts.
        currentObject.assignReferences();
        _.each(CObjectsHandler.objectsById,function(object){
            object.assignReferences();
        },CBuilder);

        // Clear prepared objects.
        CObjectsHandler.clearPreparedObjects();

        // Prepare for build and get the view (If the objects aren't in the DOM).
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
        },CBuilder);

        // Build relevant Objects by the order of their build (Parent->Child).
        _.each(CObjectsHandler.getPreparedObjects(),function(object){
            // Apply Logic and Design on the Object.
            CLogic.applyLogic(object);
            CDesigner.applyDesign(object);
        },CBuilder);

        // Clear Whitespaces.
        CUtils.cleanWhitespace();


        CBuilder.inBuilding = false;

        if (!CUtils.isEmpty(onFinish))
            onFinish();

    },
    objectJSON: function(type,uname,design,logic,data){
        var object = {};
        object.type     = type;
        object.uname    = uname;
        object.design   = design;
        object.logic    = logic;
        object.data     = data;
    },
    forceRedraw: function(element){
        //CUtils.element(id).style.display = 'none';
        //CUtils.element(id).style.display = '';
        if (!element) { return; }

        var n = document.createTextNode(' ');
        var disp = element.style.display;  // don't worry about previous display style

        element.appendChild(n);
        element.style.display = 'none';

        setTimeout(function(){
            element.style.display = disp;
            n.parentNode.removeChild(n);
        },0); // you can play with this timeout to make it as short as possible
    }


});
