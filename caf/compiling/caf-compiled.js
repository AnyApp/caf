/*
 * JSFace Object Oriented Programming Library
 * https://github.com/tnhu/jsface
 *
 * Copyright (c) 2009-2013 Tan Nhu
 * Licensed under MIT license (https://github.com/tnhu/jsface/blob/master/LICENSE.txt)
 */
(function(context, OBJECT, NUMBER, LENGTH, toString, undefined, oldClass, jsface) {
    /**
     * Return a map itself or null. A map is a set of { key: value }
     * @param obj object to be checked
     * @return obj itself as a map or false
     */
    function mapOrNil(obj) { return (obj && typeof obj === OBJECT && !(typeof obj.length === NUMBER && !(obj.propertyIsEnumerable(LENGTH))) && obj) || null; }

    /**
     * Return an array itself or null
     * @param obj object to be checked
     * @return obj itself as an array or null
     */
    function arrayOrNil(obj) { return (obj && typeof obj === OBJECT && typeof obj.length === NUMBER && !(obj.propertyIsEnumerable(LENGTH)) && obj) || null; }

    /**
     * Return a function itself or null
     * @param obj object to be checked
     * @return obj itself as a function or null
     */
    function functionOrNil(obj) { return (obj && typeof obj === "function" && obj) || null; }

    /**
     * Return a string itself or null
     * @param obj object to be checked
     * @return obj itself as a string or null
     */
    function stringOrNil(obj) { return (toString.apply(obj) === "[object String]" && obj) || null; }

    /**
     * Return a class itself or null
     * @param obj object to be checked
     * @return obj itself as a class or false
     */
    function classOrNil(obj) { return (functionOrNil(obj) && (obj.prototype && obj === obj.prototype.constructor) && obj) || null; }

    /**
     * Util for extend() to copy a map of { key:value } to an object
     * @param key key
     * @param value value
     * @param ignoredKeys ignored keys
     * @param object object
     * @param iClass true if object is a class
     * @param oPrototype object prototype
     */
    function copier(key, value, ignoredKeys, object, iClass, oPrototype) {
        if ( !ignoredKeys || !ignoredKeys.hasOwnProperty(key)) {
            object[key] = value;
            if (iClass) { oPrototype[key] = value; }                       // class? copy to prototype as well
        }
    }

    /**
     * Extend object from subject, ignore properties in ignoredKeys
     * @param object the child
     * @param subject the parent
     * @param ignoredKeys (optional) keys should not be copied to child
     */
    function extend(object, subject, ignoredKeys) {
        if (arrayOrNil(subject)) {
            for (var len = subject.length; --len >= 0;) { extend(object, subject[len], ignoredKeys); }
        } else {
            ignoredKeys = ignoredKeys || { constructor: 1, $super: 1, prototype: 1, $superp: 1 };

            var iClass     = classOrNil(object),
                isSubClass = classOrNil(subject),
                oPrototype = object.prototype, supez, key, proto;

            // copy static properties and prototype.* to object
            if (mapOrNil(subject)) {
                for (key in subject) {
                    copier(key, subject[key], ignoredKeys, object, iClass, oPrototype);
                }
            }

            if (isSubClass) {
                proto = subject.prototype;
                for (key in proto) {
                    copier(key, proto[key], ignoredKeys, object, iClass, oPrototype);
                }
            }

            // prototype properties
            if (iClass && isSubClass) { extend(oPrototype, subject.prototype, ignoredKeys); }
        }
    }

    /**
     * Create a class.
     * @param parent parent class(es)
     * @param api class api
     * @return class
     */
    function Class(parent, api) {
        if ( !api) {
            parent = (api = parent, 0);                                     // !api means there's no parent
        }

        var clazz, constructor, singleton, statics, key, bindTo, len, i = 0, p,
            ignoredKeys = { constructor: 1, $singleton: 1, $statics: 1, prototype: 1, $super: 1, $superp: 1, main: 1, toString: 0 },
            plugins     = Class.plugins;

        api         = (typeof api === "function" ? api() : api) || {};             // execute api if it's a function
        constructor = api.hasOwnProperty("constructor") ? api.constructor : 0;     // hasOwnProperty is a must, constructor is special
        singleton   = api.$singleton;
        statics     = api.$statics;

        // add plugins' keys into ignoredKeys
        for (key in plugins) { ignoredKeys[key] = 1; }

        // construct constructor
        clazz  = singleton ? {} : (constructor ? constructor : function(){});

        // determine bindTo: where api should be bound
        bindTo = singleton ? clazz : clazz.prototype;

        // make sure parent is always an array
        parent = !parent || arrayOrNil(parent) ? parent : [ parent ];

        // do inherit
        len = parent && parent.length;
        while (i < len) {
            p = parent[i++];
            for (key in p) {
                if ( !ignoredKeys[key]) {
                    bindTo[key] = p[key];
                    if ( !singleton) { clazz[key] = p[key]; }
                }
            }
            for (key in p.prototype) { if ( !ignoredKeys[key]) { bindTo[key] = p.prototype[key]; } }
        }

        // copy properties from api to bindTo
        for (key in api) {
            if ( !ignoredKeys[key]) {
                bindTo[key] = api[key];
            }
        }

        // copy static properties from statics to both clazz and bindTo
        for (key in statics) { clazz[key] = bindTo[key] = statics[key]; }

        // if class is not a singleton, add $super and $superp
        if ( !singleton) {
            p = parent && parent[0] || parent;
            clazz.$super  = p;
            clazz.$superp = p && p.prototype ? p.prototype : p;
            bindTo.$class = clazz;
        }

        for (key in plugins) { plugins[key](clazz, parent, api); }                 // pass control to plugins
        if (functionOrNil(api.main)) { api.main.call(clazz, clazz); }              // execute main()
        return clazz;
    }

    /* Class plugins repository */
    Class.plugins = {};

    /* Initialization */
    jsface = {
        Class        : Class,
        extend       : extend,
        mapOrNil     : mapOrNil,
        arrayOrNil   : arrayOrNil,
        functionOrNil: functionOrNil,
        stringOrNil  : stringOrNil,
        classOrNil   : classOrNil
    };

    if (typeof module !== "undefined" && module.exports) {                       // NodeJS/CommonJS
        module.exports = jsface;
    } else {
        oldClass          = context.Class;                                         // save current Class namespace
        context.Class     = Class;                                                 // bind Class and jsface to global scope
        context.jsface    = jsface;
        jsface.noConflict = function() { context.Class = oldClass; };              // no conflict
    }
})(this, "object", "number", "length", Object.prototype.toString);
/**
 * Created by dvircn on 06/08/14.
 */
var CPrepareFunction = Class({

    constructor: function(func) {
        this.func = func;
    },
    prepare: function(value){
        return this.func(value);
    }

});
/**
 * Created by dvircn on 12/08/14.
 */
var CPrepareFunctions = Class({
    $singleton: true,
    prepares: {
        same: new CPrepareFunction(
            function(value){
                return value;
            }
        ),
        numbersOnly: new CPrepareFunction(
            function(value){
                return value.replace(/\D/g,'');
            }
        ),
        email: new CPrepareFunction(
            function(value){
                var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                return re.test(value);
            }
        )


},

    prepareFunction: function(name){
        return this.prepares[name];
    }


});
/**
 * Created by dvircn on 12/08/14.
 */
var CValidationResult = Class({

    constructor: function(valid,message,title) {
        this.valid      = valid;
        this.message    = message;
        this.title      = title;
    },
    isValid: function(){
        return this.valid;
    },
    getMessage: function(){
        return this.message;
    },
    getTitle: function(){
        return this.title;
    }


});




/**
 * Created by dvircn on 12/08/14.
 */
var CValidator = Class({

    constructor: function(errorTitle,errorMsg,successTitle,successMsg,validator) {
        this.validator      = validator;
        this.errorTitle     = errorTitle;
        this.errorMsg       = errorMsg;
        this.successTitle   = successTitle;
        this.successMsg     = successMsg;
    },
    validate: function(value){
        if (this.validator(value))
            return new CValidationResult(true,this.successMsg,this.successTitle);
        else
            return new CValidationResult(false,this.errorMsg,this.errorTitle);

    }

});




/**
 * Created by dvircn on 12/08/14.
 */
var CValidators = Class({
    $singleton: true,
    validators: {
        passAll: new CValidator('','','','',
            function(value){
                return true;
            }
        ),
        notEmpty: new CValidator('Error','Value is empty','','',
            function(value){
                return !CUtils.isEmpty(value);
            }
        )
    },

    validator: function(name){
        return this.validators[name];
    }


});




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

        // Assign References.
        currentObject.assignReferences();

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
            CDesign.applyDesign(object);
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
/**
 * Created by dvircn on 06/08/14.
 */
var CDesign = Class({
    $singleton: true,
    colors: {
        notLeveled: ['Black', 'White'],
        getColor: function(color,level){
            // Not Leveled Color.
            if (CDesign.colors.notLeveled.indexOf(color)>=0){
                return color;
            }
            if (CUtils.isEmpty(level))  level = 0;
            level = Math.max(level,0);
            level = Math.min(level,17);

            return color+level;
        }
    },
    designs: {
        classes: function(data){
            return data;
        },
        active: function(data){
            // Do Nothing. Just to mention the active class attribute.
        },
        hold: function(data){
            // Do Nothing. Just to mention the hold class attribute.
        },
        activeRemove: function(data){
            // Do Nothing. Just to mention the activeRemove class attribute.
        },
        iconOnly: function(data){
            return 'iconOnly '+CIconsManager.getIcon(data);
        },
        iconRight: function(data){
            return 'IconRight borderBox '+CIconsManager.getIcon(data);
        },
        iconLeft: function(data){
            return 'IconLeft borderBox '+CIconsManager.getIcon(data);
        },
        bgColor: function(data){
            return "bg"+CDesign.colors.getColor(data.color,data.level || null);
        },
        color: function(data){
            return "c"+CDesign.colors.getColor(data.color,data.level || null);
        },
        borderColor: function(data){
            return "bc"+CDesign.colors.getColor(data.color,data.level || null);
        },
        border: function(data){
            var classes = "";
            if (!CUtils.isEmpty(data['all']))       classes+="border"+data['all']+"p ";
            if (!CUtils.isEmpty(data['bottom']))    classes+="borderBottom"+data['bottom']+"p ";
            if (!CUtils.isEmpty(data['right']))     classes+="borderRight"+data['right']+"p ";
            if (!CUtils.isEmpty(data['left']))      classes+="borderLeft"+data['left']+"p ";
            if (!CUtils.isEmpty(data['top']))       classes+="borderTop"+data['top']+"p ";

            return classes;
        },
        fontSize: function(data){
            // Font Size
            return 'fsz'+data;
        },
        fontStyle: function(data){
            var classes = "";
            if (data.indexOf('bold')>=0)       classes+="bold ";
            if (data.indexOf('italic')>=0)     classes+="italic ";
            return classes;
        },
        cursor: function(data){
            var values = ['pointer'];
            if (!CUtils.isEmpty(data) && (values.indexOf(data)>=0) ) {
                return data;
            }
            return "";
        },
        direction: function(data){
            var values = ['rtl','ltr'];
            if (!CUtils.isEmpty(data) && (values.indexOf(data)>=0) ) {
                return data;
            }
            return "";
        },
        textAlign: function(data){
            var values = ['center','right','left'];
            if (!CUtils.isEmpty(data) && (values.indexOf(data)>=0) ) {
                return "text"+CUtils.capitaliseFirstLetter(data);
            }
            return "";
        },
        position: function(data){
            var values = ['absolute','relative'];
            if (!CUtils.isEmpty(data) && (values.indexOf(data)>=0) ) {
                return data;
            }
            return "";
        },
        display: function(data){
            var values = ['inlineBlock','block','inline','hidden'];
            if (!CUtils.isEmpty(data) && (values.indexOf(data)>=0) ) {
                return data;
            }
            return "";
        },
        overflow: function(data){
            if (data==="hidden")        return "hidden";
            if (data==="scrollable")    return "overthrow";
            return "";
        },
        boxSizing: function(data){
            var values = ['borderBox'];
            if (!CUtils.isEmpty(data) && (values.indexOf(data)>=0) ) {
                return data;
            }
            return "";
        },
        round: function(data){
            if (data==="circle")    return "circle";

            return "Rounded"+data;
        },
        width: function(data){
            data = ""+data;
            if (data.indexOf('%')>=0)   return "w"+data.substring(0,data.length-1);
            return "wp"+data;
        },
        widthXS: function(data){
            return "col-xs-"+data;
        },
        widthSM: function(data){
            return "col-sm-"+data;
        },
        widthMD: function(data){
            return "col-md-"+data;
        },
        widthLG: function(data){
            return "col-lg-"+data;
        },
        height: function(data){
            data = ""+data;
            if (data==='auto') return 'heightAuto';
            if (data.indexOf('%')>=0)   return "h"+data.substring(0,data.length-1);
            return "hp"+data;
        },
        minHeight: function(data){
            return "mhp"+data;
        },
        maxHeight: function(data){
            data = ""+data;
            if (data.indexOf('%')>=0)   return "maxh"+data.substring(0,data.length-1);

            return "maxhp"+data;
        },
        maxWidth: function(data){
            data = ""+data;
            if (data.indexOf('%')>=0)   return "maxw"+data.substring(0,data.length-1);

            return "maxwp"+data;
        },
        margin: function(data){
            if (data==="none")
                return "noMargin";
            if (data==="auto")
                return "autoMargin";
            if (data==="centered")
                return "marginCentered";
            if (data==="to-right")
                return "marginRighted";
            if (data==="to-left")
                return "marginLefted";
            return "mt"+data+" mb"+data+" mr"+data+" ml"+data;
        },
        marginTop: function(data){
            return "mt"+data;
        },
        marginBottom: function(data){
            return "mb"+data;
        },
        marginLeft: function(data){
            return "ml"+data;
        },
        marginRight: function(data){
            return "mr"+data;
        },
        paddingTop: function(data){
            return "pt"+data;
        },
        paddingBottom: function(data){
            return "pb"+data;
        },
        paddingLeft: function(data){
            return "pl"+data;
        },
        paddingRight: function(data){
            return "pr"+data;
        },
        padding: function(data){
            if (data==="none")
                return "noPadding";
            return "pt"+data+" pb"+data+" pr"+data+" pl"+data;
        },
        top: function(data){
            return "top"+data;
        },
        bottom: function(data){
            return "bottom"+data;
        },
        left: function(data){
            return "left"+data;
        },
        right: function(data){
            return "right"+data;
        },
        gpuAccelerated: function(data){
            if (data===true){
                return "gpuAccelerated";
            }
        }

    },
    prepareDesign: function(object){
        var design = object.design;
        // Save the classes in the object.
        object.setClasses(CDesign.designToClasses(design));
    },
    designToClasses: function(design){
        if (CUtils.isEmpty(design))
            return "";


        var classesBuilder = new CStringBuilder();
        // Scan the designs and generate classes.
        _.each(design,function(value,attribute){
            if (CUtils.isEmpty(value))  return;
            if (CUtils.isEmpty(CDesign.designs[attribute])){
                CLog.error("Design: "+attribute+" doesn't exist.")
                return "";
            }
            classesBuilder.append( CDesign.designs[attribute](value) );
        },this);
        return classesBuilder.build(' ');
    },
    applyDesign: function(object){
        if (object.lastClasses !== object.classes)
            CUtils.element(object.uid()).className = object.classes;
    }

});

/**
 * Created by dvircn on 06/08/14.
 */
var CLogic = Class({
    $singleton: true,
    logics: {
        onClick: function(object,value){
            CClicker.addOnClick(object,value);
        },
        onTemplateElementClick: function(object,value){
            CClicker.addOnClick(object,value);
        },
        link: function(object,value){
            if (!object.isLinkLocal() && !CPlatforms.isWeb()){
                CClicker.addOnClick(object,function(){
                    CUtils.openURL(value);
                });
            }
            CClicker.addOnClick(object,null);

        },
        showDialog: function(object,value){
            CClicker.addOnClick(object,function(){
                CDialog.showDialog(value.data || {},value.design || {});
            });
        },
        sideMenuSwitch: function(object,value){
            object.logic.doStopPropagation = true;
            CClicker.addOnClick(object,function(){
                CSwiper.openOrCloseSideMenu(value);
            });
        },
        swipePrev: function(object,value){
            CClicker.addOnClick(object,function(){
                CSwiper.previous(value);
            });
        },
        swipeNext: function(object,value){
            CClicker.addOnClick(object,function(){
                CSwiper.next(value);
            });
        },
        text: function(object,value){
            CUtils.element(object.uid()).innerHTML += value;
        },
        icon: function(object,value){
            var size    = CUtils.isEmpty(value.size)? '': ' iconSize'+value.size;
            var align   = CUtils.isEmpty(value.align)?'': ' iconAlign'+value.align;
            var color   = CUtils.isEmpty(value.color)?'': ' '+CDesign.designs.color(value.color);
//            var align   = CUtils.isEmpty(value.align)?'': ' ml'+value.marginLeft;
//            var align   = CUtils.isEmpty(value.align)?'': ' mr'+value.marginRight;
            var iconElmText = '<i class="flaticon-'+value.name+size+align+color+'"></i>';

            var elm = CUtils.element(object.uid());
            elm.innerHTML = iconElmText+elm.innerHTML;
        },
        iconLeft: function(object,value){
            value.align = 'left';
            CLogic.logics.icon(object,value);
        },
        iconRight: function(object,value){
            value.align = 'right';
            CLogic.logics.icon(object,value);
        },
        doStopPropagation: function(object,value){
            if (value==false)
                return;
            object.logic.doStopPropagation = true;
        },
        backButton: function(object,value){
            if (value !== true)
                return;
            CPager.setBackButton(object.uid());
            CClicker.addOnClick(object,function(){
                CPager.moveBack();
            });
        },
        sideMenu: function(object,value){
            CSwiper.initSideMenu(value.positions);
        },
        swipeView: function(object,value){
            //CThreads.start(function(){
                CSwiper.initSwiper(value);
            //});
        },
        dialogSwitch: function(object,value){
            CClicker.addOnClick(object,function(){
                CObjectsHandler.object(value).switchDialog();
            });
        },
        formSubmitButton: function(object,value){
            CClicker.addOnClick(object,function(){
                var form = CObjectsHandler.object(value);
                form.submitForm();
            });
        },
        formSendToUrlButton: function(object,value){
            CClicker.addOnClick(object,function(){
                var form = CObjectsHandler.object(value);
                form.sendFormToUrl();
            });
        },
        formSaveToLocalStorageButton: function(object,value){
            CClicker.addOnClick(object,function(){
                var form = CObjectsHandler.object(value);
                form.saveFormToLocalStorage();
            });
        },
        formClearButton: function(object,value){
            CClicker.addOnClick(object,function(){
                var form = CObjectsHandler.object(value);
                form.clearForm();
            });
        },
        loadInputFromStorage: function(object,value){
            if (value===true){
                CThreads.start(function() {
                    var inputStoredValue = CLocalStorage.get(object.getName());
                    if (!CUtils.isEmpty(inputStoredValue))
                        object.setValue(inputStoredValue);
                });
            }
        },
        init: function(object,value){
            value();
        },
        template: function(object,value){
            if (value ===true)
                CTemplator.applyDynamic(object);
        },
        buttonReloadDynamic:  function(object,value){
            CClicker.addOnClick(object,function(){
                CTemplator.load(value.object,value.queryData || {},value.onFinish || function(){},value.reset || false);
            });
        },
        page: function(object,value){
            //CTemplator.applyDynamic(object,value);
            if (value===true)
                CPager.addPage(object);
        }

    },
    applyLogic: function(object){
        var logic = object.getLogic();
        var lastLogic = object.getLastLogic();
        // Check if need to apply logic.
        if (CUtils.equals(logic,lastLogic))
            return; // Logic hasn't changed from the last build.

        // Run each function.
        _.each(logic,function(value,attribute){
            // Apply only if the logic have changed / never applied before.
            if (CUtils.equals(logic[attribute],lastLogic[attribute]))
                return;
            if (CUtils.isEmpty(this.logics[attribute])){
                CLog.error('Logic does not exist: "'+attribute+'".');
                return;
            }
            // Apply Logic.
            this.logics[attribute](object,value);
        },this);
        // Save last logic build.
        object.saveLastLogic();
    }


});


/**
 * Created by dvircn on 14/08/14.
 */
var COBuilder = Class({
    constructor: function(type,uname,design,logic,data) {
        this.type   = type      || 'Object';
        this.uname  = uname     || '';
        this.design = design    || {};
        this.logic  = logic     || {};
        this.data   = data      || {};
    },
    build: function(){
        return {
            type:   this.type,
            uname:  this.uname,
            design: this.design  || {},
            logic:  this.logic   || {},
            data:   this.data    || {}
        };
    },



});


/**
 * Created by dvircn on 07/08/14.
 */
var CObjectsHandler = Class({
    $singleton: true,
    objectsById: {},
    preparedObjects: Array(),
    appContainerId: "",
    mainViewId: "",

    addObject: function(object){
        this.objectsById[object.uid()] = object;
    },
    /**
     * Remove object from the DOM and the ObjectsHandler.
     * @param objectId
     */
    removeObject: function(objectId){
        //Remove from the DOM.
        var element = CUtils.element(this.object(objectId).uid());
        element.parentNode.removeChild(element);
        // Remove from ObjectsHandler.
        delete this.objectsById[objectId];
    },
    addPreparedObject: function(object){
        this.preparedObjects.push(object);
    },
    object: function(id){
        return this.objectsById[id];
    },
    updateUname: function(last,current){
        if (last === current)
            return;
        var object = this.object(last);
        //delete this.objectsById[last];
        this.objectsById[current] = object;
    },
    getPreparedObjects: function(){
        return this.preparedObjects;
    },
    clearPreparedObjects: function(){
        this.preparedObjects = Array();
    },
    loadObjects: function(objects){
        _.each(objects,function(object){
            var type = object.type; // Get the Object type.
            if (CUtils.isEmpty(type)) return;
            // Try to create object.
            //try {
                this.createObject(type,object);
            //}
            //catch (e){
            //    CLog.log("Failed to create object from type: "+type+". Error: "+e);
            //}

        },this);
    },
    createObject: function(type,data){
        var cObject = eval("new C"+type+"(data)"); // Create the object.
        CObjectsHandler.addObject(cObject);
        if (type=="AppContainer") CObjectsHandler.appContainerId = cObject.uid(); // Identify App Container Object.
        if (type=="MainView") CObjectsHandler.mainViewId = cObject.uid(); // Identify Main Object.
        return cObject.uid();
    },
    createFromTemplateObject: function(abstractObject,data,logic,design){
        var duplicatedObjectBase        = {};
        for (var key in abstractObject){
            duplicatedObjectBase[key] = CUtils.clone(abstractObject[key]);
        }

        duplicatedObjectBase.data   = CUtils.mergeJSONs(duplicatedObjectBase.data,data);
        duplicatedObjectBase.logic  = CUtils.mergeJSONs(duplicatedObjectBase.logic,logic);
        duplicatedObjectBase.design = CUtils.mergeJSONs(duplicatedObjectBase.design,design);

        var duplicateId = this.createObject(duplicatedObjectBase.type,duplicatedObjectBase);

        return duplicateId;
    }


});


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
            this.load(object.uid());

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
            // Create container.
            var templateData = object.data.template;
            var containerData   = CUtils.clone(templateData.container);
            containerData.data  = CUtils.mergeJSONs(containerData.data,currentData.data     ||currentData);
            containerData.design.display = 'inline';
            // On item click listener.
            var position = templateData.duplicates.length;
            var onItemClick = CTemplator.createItemOnClick(position,
                templateData.callback,templateData.callbacks[position] || function(){});

            var containerId = CObjectsHandler.createObject(containerData.type,containerData);
            templateData.duplicates.push(containerId);
            var container   = CObjectsHandler.object(containerId);
            // For each abstract object in the template object.
            _.each(templateData.objects,function(abstractObject){
                var logic = currentData.logic||{};
                logic.onTemplateElementClick = onItemClick;
                var duplicateId = CObjectsHandler.createFromTemplateObject(abstractObject,
                    currentData.data||{},logic,currentData.design||{});
                container.appendChild(duplicateId);
            },this);

            // Map container to data.
            object.data.template.containerToData[containerId] = currentData;
        },this);
        object.appendChilds(object.data.template.duplicates);

        if (preventRebuild !== true)
            object.rebuild(onFinish);
    },
    createItemOnClick: function(index,callback,callbacksCallback){
        return function() {
            callbacksCallback();
            callback(index);
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
    // Currently Not Used
    loadDataToObject: function (object, data) {
        object.data     = CUtils.mergeJSONs(object.data,data.data);
        object.logic    = CUtils.mergeJSONs(object.logic,data.logic);
        object.design   = CUtils.mergeJSONs(object.design,data.design);
        CBuilder.buildFromObject(object.uid());
    },
    loadObjectWithData: function (objectId, data, onFinish, reset, preventRebuild) {
        var object = CObjectsHandler.object(objectId);
        if (CUtils.isEmpty(object)) // Case that objectId is actually object.
            object = objectId;
        this.duplicateWithData(object,data, onFinish, reset, preventRebuild);
    },
    loadObjectWithDataNoRebuild: function (objectId, data, reset) {
        this.loadObjectWithData(objectId,data, null, reset, true);
    },
    getDuplicates: function (objectId) {
        if (CTemplator.dynamicApplied(objectId))
            return CObjectsHandler.object(objectId).template.duplicates||[];
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
        var object = CObjectsHandler.object(objectId);

        object.showLoading();

        // Do not rebuild again.
        if (object.data.template.loaded === true && !CUtils.equals(queryData,object.data.template.queryData))
            return;

        object.data.template.queryData = queryData;

        // Request.
        CNetwork.request(object.data.template.url,object.data.template.queryData,
            function(retrievedData){
                CTemplator.loadObjectWithData(objectId, retrievedData, onFinish, reset);
                object.stopLoading();
        });

    }

});


/**
 * Created by dvircn on 06/08/14.
 */
/**
 * Created by dvircn on 06/08/14.
 */
/**
 * Created by dvircn on 16/08/14.
 */
var CAppConfig = Class({
    $singleton: true,
    loaded: false,
    data: {
        headerSize: 45,
        footerSize: 35
    },

    load: function(){
        var savedData = JSON.parse(CLocalStorage.get('app-config'));
        this.data = CUtils.mergeJSONs(savedData,this.data);
    },
    get: function(key){
        if (!this.loaded)
            this.load();
        return this.data[key];
    },
    saveConfig: function(data){
        if (!this.loaded)
            this.load();
        this.data = CUtils.mergeJSONs(data,this.data);
        CLocalStorage.save('app-config',JSON.stringify(this.data));
    },
    baseUrl: function(){
        return window.location.toString().substring(0,window.location.toString().length-1); //TEMP ..'http://localhost:63342/CAF';//this.get('baseUrl');
    },
    basePath: function(){
        return CUtils.getUrlParts(this.baseUrl()).pathname;//this.get('baseUrl');
    }

});

/**
 * Created by dvircn on 17/08/14.
 */
var CDom = Class({
    $singleton: true,

    exists: function(id){
        return !CUtils.isEmpty(CUtils.element(id));
    },
    children: function(id){
        return CUtils.element(id).children;
    },
    childrenCount: function(id){
        return CUtils.element(id).children.length;
    },
    hasChildren: function(id){
        return CUtils.element(id).children.length > 0;
    },
    removeAllChildren: function(id){
        var container = CUtils.element(id);
        if (container)
            while (container.firstChild) container.removeChild(container.firstChild);
    },
    removeAllObjectsChildren: function(id){
        var container = CUtils.element(id);
        if (!container) return;

        var children = [];
        _.each(container.children,function(childElm){
            children.push(childElm.id);
        },this);

        _.each(children,function(childId){
            if (!CUtils.isEmpty(CObjectsHandler.object(childId)))
                container.removeChild(CUtils.element(childId));
        },this);

    },
    indexInParent: function(id){
        var node = CUtils.element(id);
        return Array.prototype.indexOf.call(node.parentNode.children, node);
    },
    addChild: function(parentId,viewStr){
        var node = CUtils.element(parentId);
        node.insertAdjacentHTML('beforeend',viewStr);
    },
    removeFromDOM: function(nodeId){
        var node = CUtils.element(nodeId);
        if (!CUtils.isEmpty(node) && !CUtils.isEmpty(node.parentElement))
            node.parentElement.removeChild(node);
        //CLog.dlog('Removing: '+nodeId);
    },
    /**
     * Move node to index and push all other nodes forward.
     * @param nodeId
     * @param index
     */
    moveToIndex: function(nodeId, index){
        // Check if already in index
        var currentIndex = this.indexInParent(nodeId);
        if (currentIndex===index)
            return;
        var beforeIndex = index+1;
        var node = CUtils.element(nodeId);
        node.parentNode.insertBefore(node,node.parentNode.children[beforeIndex]);
        //CLog.dlog(currentIndex+" "+index+" "+this.indexInParent(nodeId));
    }

});
/**
 * Created by dvircn on 06/08/14.
 */
var CLocalStorage = Class({
    $singleton: true,
    save: function(key,value){
        window.localStorage.setItem(key,value);
    },
    get: function(key){
        var value = window.localStorage.getItem(key);
        if (CUtils.isEmpty(value)) return null;
        return value;
    },
    empty: function(key){
        return CUtils.isEmpty(window.localStorage.getItem(key));
    }

});


/**
 * Created by dvircn on 07/08/14.
 */
var CLog = Class({
    $singleton: true,
    log: function(data){
        window.console.log(data);
    },
    dlog: function(data){
        window.console.log(data);
    },
    error: function(error){
        window.console.log('%c'+error, 'color: #D20000');
    }


});


/**
 * Created by dvircn on 06/08/14.
 */
var CNetwork = Class({
    $singleton: true,
    requestsStates: {},
    initializeRequest: function(requestId,xmlhttp,url,data,callback){
        CNetwork.requestsStates[requestId] = false;
        xmlhttp.onreadystatechange = function(){
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200){
                var origData = xmlhttp.responseText;
                if (CNetwork.requestsStates[requestId]===true || CUtils.isEmpty(origData))
                    return;
                CNetwork.requestsStates[requestId] = true;

                var data = null;
                // If the response in JSON, Parse it.
                try {
                    data = JSON.parse(origData);
                } catch (e) {
                    data = origData;
                }
                if (!CUtils.isEmpty(callback)){
                    callback(data); // callback
                }

            }
        };
        xmlhttp.open("POST", url);
        xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    },
    send: function(url,data,callback){
        var xmlhttp = new XMLHttpRequest();
        CNetwork.initializeRequest(CNetwork.generateID(),xmlhttp,url,data,callback);
        xmlhttp.send(JSON.stringify(data));
    },
    request: function(url,data,callback){
        this.send(url,data,callback);
    },
    generateID: function() {
        return Math.random().toString(36).substring(2);
    }

});/**
 * Created by dvircn on 12/08/14.
 */
var CPlatforms = Class({
    $singleton: true,
    /**
     * Return whether or not the device platform is ios.
     * @returns {boolean}
     */
    isWeb: function() {
        return CUtils.isEmpty(navigator.app) && window.device===undefined;
    },
    /**
     * Return whether or not the device platform is ios.
     * @returns {boolean}
     */
    isIOS: function() {
        return navigator.userAgent.match(/(iPad|iPhone|iPod)/g);
    },
    /**
     * Return whether or not the device platform is android.
     * @returns {boolean}
     */
    isAndroid: function() {
        if (caf.utils.isEmpty(device))      return false;
        return device.platform.toLowerCase() == 'android';
    },
    /**
     * Return the android series.
     * Examples: 4.4 => 4, 4.1 => 4, 2.3.3 => 2, 2.2 => 2, 3.2 => 3
     * @returns {number}
     */
    androidSeries: function() {
        if (!this.isAndroid()) return 0;

        var deviceOSVersion = device.version;  //fetch the device OS version
        return Number(deviceOSVersion.substring(0,deviceOSVersion.indexOf(".")));
    }

});



/**
 * Created by dvircn on 09/08/14.
 */
var CStringBuilder = Class({
    constructor: function() {
        this.array = Array();
    },
    /**
     *
     * @param value - Array of Strings or String.
     * @param toStart - if true - will append to start of string. Else - end.
     */
    append: function(value,inStart){
        var operation = inStart===true? this.array.unshift : this.array.push;
        // String Case.
        if( typeof value === 'string' ) value = [value];

        operation.apply(this.array, value);
    },
    merge: function(stringBuilder){
        this.append(stringBuilder.array,false);
    },

    /**
     *  Build String.
     */
    build: function(separator){
        if (this.length()<=0)
            return "";
        separator = separator || "";
        return this.array.join(separator);
    },
    length: function(){
        return this.array.length;
    }


});




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

/**
 * Created by dvircn on 06/08/14.
 */

var CUtils = Class({
    $singleton: true,

    cleanWhitespace: function() {
        var element = document.getElementsByTagName('body')[0];
        this.cleanWhitespaceFromElement(element);
    },
    cleanWhitespaceFromElement: function ( parent ) {
        var nodes = parent.childNodes;
        for( var i =0, l = nodes.length; i < l; i++ ){
            if( nodes[i] && nodes[i].nodeType == 3 && !/\S/.test( nodes[i].nodeValue ) ){
                parent.replaceChild( document.createTextNode(''), nodes[i]  );
            }else if( nodes[i] ){
                this.cleanWhitespaceFromElement( nodes[i] );
            }
        }
    },
    hideOrShow: function(id,showClass,outClass,duration)
    {
        var elm = CUtils.element(id);
        if (this.hasClass(elm,'hidden'))
        {
            this.removeClass(elm,'hidden');
            this.removeClass(elm,outClass);
            this.addClass(elm,showClass);
        }
        else
        {
            if (!this.isEmpty(showClass))
            {
                window.setTimeout(function(){CUtils.addClass(elm,'hidden');},duration || 300);
            }
            else
            {
                CUtils.addClass(elm,'hidden');
            }
            this.addClass(elm,outClass);
            this.removeClass(elm,showClass);
        }
    },
    isEmpty: function(obj)
    {
        return obj === undefined || obj === null || obj === '' || obj.toString()==='';
    },
    isString: function(variable)
    {
        return (typeof variable == 'string' || variable instanceof String)
            && variable.trim().indexOf("function")!=0;
    },
    isArray: function(variable){
        return Object.prototype.toString.call( variable ) === '[object Array]';
    },
    isStringFunction: function(variable)
    {
        return variable.trim().indexOf("function")==0;
    },
    getElementDef: function(elm){
        var str = elm.outerHTML;
        return str.substring(0,str.indexOf('>'));
    },
    hasClass: function(el, name)
    {
        return new RegExp('(\\s|^)'+name+'(\\s|$)').test(el.className);
    },
    addClass: function(el, name)
    {
        if (!CUtils.hasClass(el, name)) { el.className += (el.className ? ' ' : '') +name; }
    },
    removeClass: function(el, name)
    {
        if (CUtils.hasClass(el, name)) {
            el.className=el.className.replace(new RegExp('(\\s|^)'+name+'(\\s|$)'),' ').replace(/^\s+|\s+$/g, '');
        }
    },
    removeClassFromClasses: function(classes, removeClass)
    {
        return classes.replace(new RegExp('(\\s|^)'+removeClass+'(\\s|$)'),' ').replace(/^\s+|\s+$/g, '');
    },
    unbindEvent: function(elm,eventName,event)
    {
        if (!CUtils.isEmpty(elm) && !CUtils.isEmpty(event))
        {
            elm.removeEventListener(eventName,event);
        }
    },
    getPointerEvent: function(event) {
        return event.targetTouches ? event.targetTouches[0] : event;
    },
    openURL: function(url)
    {
        if (CPlatforms.isIOS())
        {
            window.open(url,  '_system', 'location=yes');
        }
        else
        {
            try
            {
                navigator.app.loadUrl(url, {openExternal:true});
            }
            catch (e)
            {
                window.open(url,  '_system', 'location=yes');
            }
        }
    },
    mergeJSONs: function(base,strong){
        if (this.isEmpty(base)) return strong || {};
        if (this.isEmpty(strong)) return base;

        var merged = JSONfn.parse(JSONfn.stringify(base));
        for (var key in strong){
            merged[key] = strong[key];
        }
        return merged;
    },
    element: function(id){
        return document.getElementById(id) || null;
    },
    capitaliseFirstLetter: function(string){
        return string.charAt(0).toUpperCase() + string.slice(1);
    },
    clone: function(o) {
        if (o === undefined)
            return undefined;
        return JSONfn.parse(JSONfn.stringify(o));
    },
    equals: function(o1,o2){
        return JSONfn.stringify(o1)===JSONfn.stringify(o2)
    },
    arrayRemove: function(array,item){
        var index = array.indexOf(item);
        if (index >= 0)
            array.splice(index,1);
    },
    arrayMove: function(array,oldIndex, newIndex){
        if (newIndex >= array.length) {
            var k = newIndex - array.length;
            while ((k--) + 1) {
                array.push(undefined);
            }
        }
        array.splice(newIndex, 0, array.splice(oldIndex, 1)[0]);
    },
    wndsize: function(){
        var w = 0;var h = 0;
        //IE
        if(!window.innerWidth){
            if(!(document.documentElement.clientWidth == 0)){
                //strict mode
                w = document.documentElement.clientWidth;h = document.documentElement.clientHeight;
            } else{
                //quirks mode
                w = document.body.clientWidth;h = document.body.clientHeight;
            }
        } else {
            //w3c
            w = window.innerWidth;h = window.innerHeight;
        }
        return {width:w,height:h};
    },
    isUrlAbsolute: function(url){
        return (new RegExp('^(?:[a-z]+:)?//', 'i')).test(url);
    },
    isUrlRelative: function(url){
        return !this.isUrlAbsolute(url);
    },
    getUrlParts: function (url) {
        var a = document.createElement('a');
        a.href = url;

        return {
            href: a.href,
            host: a.host,
            hostname: a.hostname,
            port: a.port,
            pathname: a.pathname,
            protocol: a.protocol,
            hash: a.hash,
            search: a.search
        };
    },
    isTouchDevice: function() {
        try {
            document.createEvent("TouchEvent");
            return true;
        } catch (e) {
            return false;
        }
    }


});



/**
 * Created by dvircn on 12/08/14.
 */
var CAnimations = Class({
    $singleton: true,
    noDisplay: 'displayNone',
    defaultAnim: 'rotateCarouselRight',
    inAnim: false,
    anims: {
        fade: {in:'pt-page-fadeIn',out:'pt-page-fadeOut et-page-ontop',duration:600},
        rotateFall: {in:'pt-page-scaleUp',out:'pt-page-rotateFall et-page-ontop',duration:1000},
        rotateNewspaper: {in:'pt-page-rotateInNewspaper pt-page-delay500',out:'pt-page-rotateOutNewspaper',duration:1000},
        rotateSlide: {in:'pt-page-rotateSlideIn pt-page-delay200',out:'pt-page-rotateSlideOut',duration:1200},
        rotateSlide2: {in:'pt-page-rotateSlideIn',out:'pt-page-rotateSlideOut',duration:1000},
        rotateCarouselBottom: {in:'pt-page-rotateCarouselBottomIn',out:'pt-page-rotateCarouselBottomOut et-page-ontop',duration:800},
        rotateCarouselTop: {in:'pt-page-rotateCarouselTopIn',out:'pt-page-rotateCarouselTopOut et-page-ontop',duration:800},
        rotateCarouselRight: {in:'pt-page-rotateCarouselRightIn',out:'pt-page-rotateCarouselRightOut et-page-ontop',duration:800},
        rotateCarouselLeft: {in:'pt-page-rotateCarouselLeftIn',out:'pt-page-rotateCarouselLeftOut et-page-ontop',duration:800},
        rotateCubeBottom: {in:'pt-page-rotateCubeBottomIn',out:'pt-page-rotateCubeBottomOut et-page-ontop',duration:600},
        rotateCubeTop: {in:'pt-page-rotateCubeTopIn',out:'pt-page-rotateCubeTopOut et-page-ontop',duration:600},
        rotateCubeRight: {in:'pt-page-rotateCubeRightIn',out:'pt-page-rotateCubeRightOut et-page-ontop',duration:600},
        rotateCubeLeft: {in:'pt-page-rotateCubeLeftIn',out:'pt-page-rotateCubeLeftOut et-page-ontop',duration:600},
        rotateRoomBottom: {in:'pt-page-rotateRoomBottomIn',out:'pt-page-rotateRoomBottomOut et-page-ontop',duration:800},
        rotateRoomTop: {in:'pt-page-rotateRoomTopIn',out:'pt-page-rotateRoomTopOut et-page-ontop',duration:800},
        rotateRoomRight: {in:'pt-page-rotateRoomRightIn',out:'pt-page-rotateRoomRightOut et-page-ontop',duration:800},
        rotateRoomLeft: {in:'pt-page-rotateRoomLeftIn',out:'pt-page-rotateRoomLeftOut et-page-ontop',duration:800},
        rotateUnfoldBottom: {in:'pt-page-rotateUnfoldBottom',out:'pt-page-moveToTopFade',duration:700},
        rotateUnfoldTop: {in:'pt-page-rotateUnfoldTop',out:'pt-page-moveToBottomFade',duration:700},
        rotateUnfoldRight: {in:'pt-page-rotateUnfoldRight',out:'pt-page-moveToLeftFade',duration:700},
        rotateUnfoldLeft: {in:'pt-page-rotateUnfoldLeft',out:'pt-page-moveToRightFade',duration:700},
        moveToTopFade: {in:'pt-page-moveFromBottomFade',out:'pt-page-rotateFoldTop',duration:700},
        moveToBottomFade: {in:'pt-page-moveFromTopFade',out:'pt-page-rotateFoldBottom',duration:700},
        moveToRightFade: {in:'pt-page-moveFromLeftFade',out:'pt-page-rotateFoldRight',duration:700},
        moveToLeftFade: {in:'pt-page-moveFromRightFade',out:'pt-page-rotateFoldLeft',duration:700},
        moveToTopFade2: {in:'pt-page-moveFromBottomFade',out:'pt-page-moveToTopFade',duration:700},
        moveToBottomFade2: {in:'pt-page-moveFromTopFade',out:'pt-page-moveToBottomFade',duration:700},
        moveToRightFade2: {in:'pt-page-moveFromLeftFade',out:'pt-page-moveToRightFade',duration:700},
        moveToLeftFade2: {in:'pt-page-moveFromRightFade',out:'pt-page-moveToLeftFade',duration:700},
        moveToTopFade3: {in:'pt-page-moveFromBottom',out:'pt-page-fade',duration:700},
        moveToBottomFade3: {in:'pt-page-moveFromTop',out:'pt-page-fade',duration:700},
        moveToRightFade3: {in:'pt-page-moveFromLeft',out:'pt-page-fade',duration:700},
        moveToLeftFade3: {in:'pt-page-moveFromRight',out:'pt-page-fade',duration:700},
        rotatePullBottom: {in:'pt-page-rotatePullBottom pt-page-delay180',out:'pt-page-rotatePushBottom',duration:800},
        rotatePullTop: {in:'pt-page-rotatePullTop pt-page-delay180',out:'pt-page-rotatePushTop',duration:800},
        rotatePullRight: {in:'pt-page-rotatePullRight pt-page-delay180',out:'pt-page-rotatePushRight',duration:800},
        rotatePullLeft: {in:'pt-page-rotatePullLeft pt-page-delay180',out:'pt-page-rotatePushLeft',duration:800},
        flipBottom: {in:'pt-page-flipInBottom pt-page-delay500',out:'pt-page-flipOutTop',duration:1000},
        flipTop: {in:'pt-page-flipInTop pt-page-delay500',out:'pt-page-flipOutBottom',duration:1000},
        flipLeft: {in:'pt-page-flipInLeft pt-page-delay500',out:'pt-page-flipOutRight',duration:1000},
        flipRight: {in:'pt-page-flipInRight pt-page-delay500',out:'pt-page-flipOutLeft',duration:1000},
        moveToTop: {in:'pt-page-moveFromBottom pt-page-delay20 et-page-ontop',out:'pt-page-rotateBottomSideFirst',duration:800},
        moveToBottom: {in:'pt-page-moveFromTop pt-page-delay20 et-page-ontop',out:'pt-page-rotateTopSideFirst',duration:800},
        moveToRight: {in:'pt-page-moveFromLeft pt-page-delay20 et-page-ontop',out:'pt-page-rotateLeftSideFirst',duration:800},
        moveToLeft: {in:'pt-page-moveFromRight pt-page-delay20 et-page-ontop',out:'pt-page-rotateRightSideFirst',duration:800},
        moveToTop2: {in:'pt-page-moveFromBottom',out:'pt-page-rotatePushTop',duration:800},
        moveToBottom2: {in:'pt-page-moveFromTop',out:'pt-page-rotatePushBottom',duration:800},
        moveToRight2: {in:'pt-page-moveFromLeft',out:'pt-page-rotatePushRight',duration:800},
        moveToLeft2: {in:'pt-page-moveFromRight',out:'pt-page-rotatePushLeft',duration:800},
        moveToTop3: {in:'pt-page-moveFromBottom',out:'pt-page-moveToTop',duration:600},
        moveToBottom3: {in:'pt-page-moveFromTop',out:'pt-page-moveToBottom',duration:600},
        moveToRight3: {in:'pt-page-moveFromLeft',out:'pt-page-moveToRight',duration:600},
        moveToLeft3: {in:'pt-page-moveFromRight',out:'pt-page-moveToLeft',duration:600},
        scaleUpCenter: {in:'pt-page-scaleUpCenter pt-page-delay400',out:'pt-page-scaleDownCenter',duration:800},
        scaleUpToBottom: {in:'pt-page-scaleUp et-page-ontop',out:'pt-page-moveToBottom',duration:700},
        scaleUpToTop: {in:'pt-page-scaleUp et-page-ontop',out:'pt-page-moveToTop',duration:700},
        scaleUpToLeft: {in:'pt-page-scaleUp et-page-ontop',out:'pt-page-moveToLeft',duration:700},
        scaleUpToRight: {in:'pt-page-scaleUp et-page-ontop',out:'pt-page-moveToRight',duration:700},
        scaleDownFromBottom: {in:'pt-page-moveFromBottom et-page-ontop',out:'pt-page-scaleDown',duration:700},
        scaleDownFromTop: {in:'pt-page-moveFromTop et-page-ontop',out:'pt-page-scaleDown',duration:700},
        scaleDownFromLeft: {in:'pt-page-moveFromLeft et-page-ontop',out:'pt-page-scaleDown',duration:700},
        scaleDownFromRight: {in:'pt-page-moveFromRight et-page-ontop',out:'pt-page-scaleDown',duration:700},
        scaleDownUp: {in:'pt-page-scaleUp pt-page-delay300',out:'pt-page-scaleDownUp',duration:1000},
        scaleUpDown: {in:'pt-page-scaleUpDown pt-page-delay300',out:'pt-page-scaleDown',duration:1000},
        easeToBottom: {in:'pt-page-moveFromTop',out:'pt-page-moveToBottomEasing et-page-ontop',duration:700},
        easeToTop: {in:'pt-page-moveFromBottom',out:'pt-page-moveToTopEasing et-page-ontop',duration:700},
        easeToRight: {in:'pt-page-moveFromLeft',out:'pt-page-moveToLeftEasing et-page-ontop',duration:700},
        easeToLeft: {in:'pt-page-moveFromRight',out:'pt-page-moveToRightEasing et-page-ontop',duration:700}

    },
    init: function(object){
        object.data.animation           = object.data.animation             || CAnimations.defaultAnim;
        object.data.onAnimShowComplete  = object.data.onAnimShowComplete    || function(){};
        object.data.onAnimHideComplete  = object.data.onAnimHideComplete    || function(){};
        object.data.inAnim              = true;
        object.data.lastOnEnd           = 0;
        object.data.lastOnStart         = 0;
    },
    cascadeShow: function(objectsIds){
        for (var i in objectsIds){
            var index = Number(i);
            var objectId        = objectsIds[index];
            // Hide all elements.
            CUtils.addClass(CUtils.element(objectId),'hidden');

            if (index+1 == objectsIds.length)
                continue;

            var nextObjectId    = objectsIds[index+1];
            var object          = CObjectsHandler.object(objectId);
            object.data.onAnimShowComplete = CAnimations.createCascadeFunction(nextObjectId);
        }

        CAnimations.show(objectsIds[0]);
    },
    createCascadeFunction: function(nextObjectId){
        return function(){
            CAnimations.show(nextObjectId);
        };
    },
    prepareObjectAnimation: function(caller,objectId,options){
        var object = CObjectsHandler.object(objectId);
        // Wait until current animation is finished.
        if (object.data.inAnim===true){
            CThreads.run(function(){caller(objectId,options);},100);
            return null;
        }

        CAnimations.init(object);
        options                          = options || {};
        var finalOptions                 = {};
        finalOptions.animation           = options.animation             || object.data.animation;
        finalOptions.onAnimShowComplete  = options.onAnimShowComplete    || object.data.onAnimShowComplete;
        finalOptions.onAnimHideComplete  = options.onAnimHideComplete    || object.data.onAnimHideComplete;
        finalOptions.object              = object;
        return finalOptions;
    },
    hideOrShow: function(objectId,options){
        options = options || {};
        var elm = CUtils.element(objectId);
        if (CUtils.hasClass(elm,CAnimations.noDisplay))
            CAnimations.show(objectId,options);
        else
            CAnimations.hide(objectId,options);
    },
    show: function(objectId,options){
        var fOptions = CAnimations.prepareObjectAnimation(CAnimations.show,objectId,options);
        if (!CUtils.isEmpty(fOptions))
            CAnimations.animateIn(fOptions.object,CUtils.element(objectId),fOptions.animation,fOptions.onAnimShowComplete);
    },
    hide: function(objectId,options){
        var fOptions = CAnimations.prepareObjectAnimation(CAnimations.hide,objectId,options);
        if (!CUtils.isEmpty(fOptions))
            CAnimations.animateOut(fOptions.object,CUtils.element(objectId),fOptions.animation,fOptions.onAnimHideComplete);
    },
    quickShow: function(objectId,options){
        var fOptions = CAnimations.prepareObjectAnimation(CAnimations.quickShow,objectId,options);
        if (!CUtils.isEmpty(fOptions)){
            CUtils.removeClass(CUtils.element(objectId),CAnimations.noDisplay);
            fOptions.object.data.inAnim = false;
        }
    },
    quickHide: function(objectId,options){
        var fOptions = CAnimations.prepareObjectAnimation(CAnimations.quickHide,objectId,options);
        if (!CUtils.isEmpty(fOptions)){
            CUtils.addClass(CUtils.element(objectId),CAnimations.noDisplay);
            fOptions.object.data.inAnim = false;
        }
    },
    animateIn: function(object,elm,anim,onFinish){
        CUtils.removeClass(elm,CAnimations.noDisplay);
        CUtils.removeClass(elm,CAnimations.anims[anim].out);

        CUtils.addClass(elm,CAnimations.anims[anim].in);
        //window.setTimeout(,CAnimations.anims[anim].duration);
        var animEnd = function(){
            // Make sure this function called once per event end.
            var time = (new Date()).getTime();
            if (time-object.data.lastOnEnd<30)
                return;
            object.data.lastOnEnd = time;
            object.data.inAnim = false;
            CUtils.removeClass(elm,CAnimations.anims[anim].in);
            onFinish();
            CAnimations.unbindAnimationEnd(object,elm);
        };
        this.bindAnimationEnd(object,elm,animEnd);
    },
    animateOut: function(object,elm,anim,onFinish){
        CUtils.removeClass(elm,CAnimations.anims[anim].in);
        CUtils.addClass(elm,CAnimations.anims[anim].out);

        var animEnd = function(){
            // Make sure this function called once per event end.
            var time = (new Date()).getTime();
            if (time-object.data.lastOnEnd<30)
                return;
            object.data.lastOnEnd = time;
            object.data.inAnim = false;
            CUtils.addClass(elm,CAnimations.noDisplay);
            CUtils.removeClass(elm,CAnimations.anims[anim].out);
            onFinish();
            CAnimations.unbindAnimationEnd(object,elm);
        };
        this.bindAnimationEnd(object,elm,animEnd);
    },
    bindAnimationEnd: function(object,elm,callback){
        elm.addEventListener("animationend", callback, false);
        elm.addEventListener("webkitAnimationEnd", callback, false);
        elm.addEventListener("oanimationend", callback, false);
        elm.addEventListener("MSAnimationEnd", callback, false);
        object.data.animationEndCallback = callback;
    },
    unbindAnimationEnd: function(object,elm){
        var callback = object.data.animationEndCallback || function(){};
        CUtils.unbindEvent(elm,"animationend", callback, false);
        CUtils.unbindEvent(elm,"webkitAnimationEnd", callback, false);
        CUtils.unbindEvent(elm,"oanimationend", callback, false);
        CUtils.unbindEvent(elm,"MSAnimationEnd", callback, false);

        object.data.animationEndCallback = null;
    }

    
});


/**
 * Created by dvircn on 11/08/14.
 */
var CClicker = Class({
    $singleton: true,
    lastClick: 0,
    /**
     * Prevent burst of clicks.
     */
    canClick: function()
    {
        var currentTime = (new Date()).getTime();
        if (currentTime-CClicker.lastClick>400)
        {
            CClicker.lastClick = currentTime;
            return true;
        }
        return false;
    },
    addOnClick: function(object,onClick) {
        // Set on click-able.
        if (CUtils.isEmpty(object.onClicks))
            CClicker.setOnClickable(object);
        // Add onclick.
        if (onClick)
            object.onClicks.push(onClick);
    },
    setOnClickable: function(object){
        // Init
        var design = object.getDesign();
        // Check
        object.clicker = {};
        object.clicker.activeClasses       = CDesign.designToClasses(object.getDesign().active);
        object.clicker.activeRemoveClasses = CDesign.designToClasses(object.getDesign().activeRemove);
        object.doStopPropogation = object.doStopPropogation || false;
        object.touchData = {
            startX:-100000,
            startY:-100000,
            lastX:-200000,
            lastY:-200000,
            startTime: 0
        };
        object.events = {onTouchStartEvent:null,onTouchEndEvent:null,onTouchMoveEvent:null};
        object.onClicks = Array();

        var element = CUtils.element(object.uid());
        //Unbind
        CUtils.unbindEvent(element,'touchstart',object.events.onTouchStartEvent);
        CUtils.unbindEvent(element,'mousedown',object.events.onTouchStartEvent);
        CUtils.unbindEvent(element,'touchend',object.events.onTouchEndEvent);
        CUtils.unbindEvent(element,'mouseup',object.events.onTouchEndEvent);
        CUtils.unbindEvent(element,'mouseout',object.events.onTouchEndEvent);
        CUtils.unbindEvent(element,'touchcancel',object.events.onTouchEndEvent);
        CUtils.unbindEvent(element,'touchmove',object.events.onTouchMoveEvent);
        CUtils.unbindEvent(element,'mousemove',object.events.onTouchMoveEvent);


        // Create events.
        object.events.onTouchStartEvent = function(e)
        {
            //return;
            var isRightClick = ((e.which && e.which == 3) || (e.button && e.button == 2));
            if (isRightClick) return false;

            //e.preventDefault();

            if (object.logic.doStopPropagation===true)
            {
                e.stopPropagation();
            }

            var pointer = CUtils.getPointerEvent(e);
            // caching the start x & y
            object.touchData.startX     = pointer.pageX;
            object.touchData.startY     = pointer.pageY;
            object.touchData.lastX      = pointer.pageX;
            object.touchData.lastY      = pointer.pageY;
            object.touchData.startTime  = (new  Date()).getTime();
            CUtils.addClass(element,object.clicker.activeClasses);
            CUtils.removeClass(element,object.clicker.activeRemoveClasses);
        }
        object.events.onTouchMoveEvent = function(e)
        {
            var currentTime = (new  Date()).getTime();
            if (currentTime - object.touchData.startTime > 100){
                //e.preventDefault();
            }

            var pointer = CUtils.getPointerEvent(e);
            // caching the last x & y
            object.touchData.lastX = pointer.pageX;
            object.touchData.lastY = pointer.pageY;
        }
        object.events.onTouchEndEvent = function(e)
        {
            if (object.onClicks.length>0)
                e.preventDefault();

            var diffX = Math.abs(object.touchData.lastX-object.touchData.startX);
            var diffY = Math.abs(object.touchData.lastY-object.touchData.startY);
            var boxSize = 15;
            if (diffX<boxSize && diffY<boxSize && CClicker.canClick() && e.type!='mouseout')
            {
                // Execute OnClicks.
                _.each(object.onClicks,function(onClick){
                    onClick();
                },this);
            }
            // Reset
            object.touchData.startX = -100000;
            object.touchData.startY = -100000;
            object.touchData.lastX = -200000;
            object.touchData.lastY = -200000;
            CUtils.removeClass(element,object.clicker.activeClasses);
            CUtils.addClass(element,object.clicker.activeRemoveClasses);

        }

        // Set Events Handlers.
        element.addEventListener("touchstart",object.events.onTouchStartEvent);
        element.addEventListener("mousedown",object.events.onTouchStartEvent);
        element.addEventListener("touchend",object.events.onTouchEndEvent);
        element.addEventListener("mouseup",object.events.onTouchEndEvent);
        element.addEventListener("mouseout",object.events.onTouchEndEvent);
        element.addEventListener("touchcancel",object.events.onTouchEndEvent);
        element.addEventListener("touchmove",object.events.onTouchMoveEvent);
        element.addEventListener("mousemove",object.events.onTouchMoveEvent);

    }


});


/**
 * Created by dvircn on 11/08/14.
 */
var CColor = function(color,level){
    return {color:color,level:level || 5};
}/**
 * Created by dvircn on 06/08/14.
 */
/**
 * Created by dvircn on 06/08/14.
 */
/**
 * Created by dvircn on 10/08/14.
 */

var CIconsManager = Class({
    $singleton: true,

    getIcon: function(name) {
        return "";
    }
});
/**
 * Created by dvircn on 11/08/14.
 */
var CPager = Class({
    $singleton: true,
    firstLoad: true,
    historyStack: new Array(),
    currentPageNumber: 0,
    maxPageNumber: 0,
    mainPage: '',
    backButtonId: '',
    pages: {},

    initialize: function(){
        var base = CAppConfig.basePath();
        page.base(base);
        //this.sammy = Sammy();

        // Add all pages names to the router.
        _.each(this.pages,function(pageId,name){
            var currentPage = CObjectsHandler.object(pageId);
            var load = function(context){
                if (CUtils.isEmpty(context.state.pageNumber)) {
                    CPager.maxPageNumber += 1;
                    context.state.pageNumber = CPager.maxPageNumber;
                }
                CPager.currentPageNumber = context.state.pageNumber;
                var params = CPager.fetchParams(context);
                CPager.showPage(name,params);
            }
            if (!CUtils.isEmpty(currentPage.getPageName())){
                // Custom page.
                page('/'+currentPage.getPageName()+'',load);
                page('/'+currentPage.getPageName()+'/*',load);
            }
            else {
                // Main Page.
                page('',load);
            }
        },this);
        page('*', function() { CLog.dlog('page not found')});
        this.resetPages();
        page.start();
    },
    fetchParams: function(context) {
        if (CUtils.isEmpty(context.path))
            return [];

        var params = context.path.split('/');
        if (params.length>0 && params[0]=='')
            params.shift();
        if (params.length>0 && params[params.length-1]=='')
            params.pop();
        return params;
    },
    addPage: function(object){
        this.pages[object.getPageName()] = object.uid();
    },
    setMainPage: function(mainPage) {
        this.mainPage = mainPage;
        this.moveToPage(mainPage);
    },
    setBackButton: function(backButtonId) {
        this.backButtonId = backButtonId;
        this.checkAndChangeBackButtonState();
    },
    moveToTab: function(tabButtonId,toSlide,swiperId) {
        // Get Tabs.
        var tabs = CSwiper.getSwiperButtons(swiperId);
        _.each(tabs,function(buttonId){
            // Remove hold mark.
            this.removeHoldClass(buttonId);
        },this);

        this.addHoldClass(tabButtonId);

        if (!CUtils.isEmpty(toSlide))
            CSwiper.moveSwiperToSlide(swiperId,toSlide);

    },
    addHoldClass: function(tabButtonId) {
        if (CUtils.isEmpty(tabButtonId))    return;

        var holdClass = CDesign.designToClasses(CObjectsHandler.object(tabButtonId).getDesign().hold);
        if (!CUtils.isEmpty(holdClass))
            CUtils.addClass(CUtils.element(tabButtonId),holdClass);
    },
    removeHoldClass: function(tabButtonId) {
        if (CUtils.isEmpty(tabButtonId))    return;

        var holdClass = CDesign.designToClasses(CObjectsHandler.object(tabButtonId).getDesign().hold);
        if (!CUtils.isEmpty(holdClass))
            CUtils.removeClass(CUtils.element(tabButtonId),holdClass);
    },
    dataToPath: function (data) {
        data = data || [];
        var path = '';
        _.each(data,function(value){
            path += '/'+value;
        },CPager);
        return path;
    },
    /**
     * move to page.
     */
    moveToPage: function(path/*toPageId,isRealPage,inAnim,outAnim*/) {
        // convert data to path. Example: {area:'north',side:'r'}=>/area/north/side/r


        // Check if need to move back.
        if (toPageId == 'move-back') {
            this.moveBack();
            return;
        }

        if (this.currentPage == toPageId) {
            return;
        }

        var lastPageId = this.currentPage;

        //Replace current page.
        this.currentPage = toPageId;
        this.insertPageToStack(toPageId);
        this.restructure();
        var toPageDiv = document.getElementById(toPageId);

        if (CUtils.isEmpty(lastPageId)) {
            // on load page.
            CPager.onLoadPage(toPageDiv);
            // Hide back button if needed.
            this.checkAndChangeBackButtonState();
            return;
        }

        CAnimations.fadeIn(toPageDiv,300);

        // on load page.
        CPager.onLoadPage(toPageDiv);
        // Hide back button if needed.
        this.checkAndChangeBackButtonState();


    },
    moveBack: function() {
        history.back();
    },
    onLoadPage: function(pageId) {
        var onPageLoad = CObjectsHandler.object(pageId).getLogic().page.onLoad;
        if (CUtils.isEmpty(onPageLoad))
            return;
        // Execute onPageLoad.
        onPageLoad();
    },
    checkAndChangeBackButtonState:function() {
        if (CUtils.isEmpty(this.backButtonId)) return;

        if (this.currentPageNumber <= 1) {
            CUtils.addClass(CUtils.element(this.backButtonId),'hidden');
        }
        else {
            CUtils.removeClass(CUtils.element(this.backButtonId),'hidden');
        }
    },
    getPagePath: function(name,params){
        return name+CPager.dataToPath(params);
    },
    showPage: function(name,params){
        // Check if the page need to be reloaded with template data
        // or already loaded template page.
        var id                  = CPager.pages[name];
        if (!CUtils.isEmpty(params)) {
            var pagePath = CPager.getPagePath(name,params);
            id = CPager.pages[pagePath];
            if (CUtils.isEmpty(id)) {
                id = CPager.pages[name];
                // Check if template.
                if (CTemplator.objectHasDynamic(id)) {
                    CPager.tempPageId     = id;
                    CPager.tempPagePath   = pagePath;
                    var onFinish = function(){
                        var pageId = CTemplator.lastDuplicate(CPager.tempPageId);
                        if (!CUtils.isEmpty(pageId)) {
                            CPager.pages[CPager.tempPagePath] = pageId;
                            CPager.showPage(name,params); // show page.
                        }

                        CPager.tempPageId     = '';
                        CPager.tempPagePath   = '';
                    };
                    CTemplator.loadObjectWithData(id,CPager.getParamsAsMap(params),onFinish);
                    return; // Return and move when page created callback.
                }
            }
        }

        var lastPage            = CPager.currentPage || '';
        CPager.currentPage      = id;

        // Do not reload the same page over and over again.
        if (CPager.currentPage == lastPage)
            return;

        // Normal page hide.
        if (!CUtils.isEmpty(lastPage))
            CAnimations.hide(lastPage,{});

        var animationOptions    = {};
        // Page Load.
        animationOptions.onAnimShowComplete = function() {
            var page = CObjectsHandler.object(CPager.currentPage);
            page.reload();
        };
        var page = CObjectsHandler.object(CPager.currentPage);
        CUI.setTitle(page.getPageTitle());
        page.setParams(this.getParamsAsMap(params));

        // Showing current page.
        if (CUtils.isEmpty(lastPage))
            CAnimations.quickShow(CPager.currentPage);
        else
            CAnimations.show(CPager.currentPage,animationOptions);

        this.checkAndChangeBackButtonState();

    },
    // Immediate hide to all pages on first load.
    resetPages: function() {
        // Hide All Pages except current.
        _.each(CPager.pages,function(pageId){
                CAnimations.quickHide(pageId);
        },CPager);
    },
    getParamsAsMap: function(params){
        var map = {};
        var cParams = CUtils.clone(params);
        // If there is no argument for the page name -
        if (cParams.length%2 ==1) {
            map[cParams.shift()] = '';
        }
        // Iterate and put.
        for (var i=0; i < cParams.length; i+=2){
            map[cParams[i]] = cParams[i+1];
        }
        return map;
    }


});


/**
 * Created by dvircn on 12/08/14.
 */
var CSwiper = Class({
    $singleton: true,
    mSwipers: {},
    sideMenu: null,
    sideMenuSide: 'left',

    initSwiper: function(data) {
        var swiperId = data.container;
        var options = {
            moveStartThreshold: 50,
            resistance: '100%'
        };
        if (!CUtils.isEmpty(data.pagination)) {
            options.pagination = '#'+data.pagination;
            options.paginationClickable= true;
        }
        if (data.loop === true)
            options.loop = true;
        if (data.autoPlay === true)
            options.autoplay = data.slideTime;
        if (data.centeredSlides === true)
            options.centeredSlides = true;
        if (!CUtils.isEmpty(data.slidesPerView))
            options.slidesPerView = data.slidesPerView;

        options['onSlideChangeStart'] =  this.createSlideChangeStartCallback(swiperId);

        var slidesOnLoads   = data.onLoads      || [];
        var onSlideLoad     = data.onSlideLoad  || function(){};

        // Fix Pagination disappear.
        options['onSlideChangeEnd']   = this.createSlideChangeEndCallback(swiperId,onSlideLoad,slidesOnLoads);

        this.mSwipers[swiperId] = new Swiper('#'+swiperId,options);

        this.mSwipers[swiperId].swiperTabButtons = Array();
        // Add buttons.
        _.each(data.tabberButtons,function(buttonId){
            this.addButtonToTabSwiper(buttonId,swiperId);
        },this);
    },
    createSlideChangeStartCallback: function(swiperId){
        return function(swiper){
            var toSlide         = swiper.activeIndex;
            var swiperButtons   = CSwiper.mSwipers[swiperId].swiperTabButtons;
            var tabRelatedButton= swiperButtons[toSlide];
            if (!CUtils.isEmpty(tabRelatedButton)){
                CTabber.moveToTab(tabRelatedButton,null,swiperId);
            }

/*
            window.setTimeout(function() {
                var height = CUtils.element(swiperId).style.height;
                CUtils.element(swiperId).style.height = '0px';
                CUtils.element(swiperId).clientHeight;
                CUtils.element(swiperId).style.height = height;
            },1000);
*/
        };
    },
    createSlideChangeEndCallback: function(swiperId,onSlideLoad,slidesOnLoads){
        return function(swiper){

            // On load callbacks.
            onSlideLoad(swiper.activeIndex);
            if (swiper.activeIndex < slidesOnLoads.length)
                slidesOnLoads[swiper.activeIndex]();
        };
    },
    /**
     * Add button to tab container.
     * @param object
     * @param swiperId
     */
    addButtonToTabSwiper: function(objectId,swiperId){
        var swiperButtons       = this.mSwipers[swiperId].swiperTabButtons;
        var currentSlideNumber  = swiperButtons.length;
        this.mSwipers[swiperId].swiperTabButtons.push(objectId);

        CClicker.addOnClick(CObjectsHandler.object(objectId),function(){
            CTabber.moveToTab(objectId,currentSlideNumber,swiperId);
        });

        if (currentSlideNumber == 0){
            CTabber.addHoldClass(objectId);
        }
    },
    resizeFix: function(){
        window.setTimeout(function(){
            _.each(CSwiper.mSwipers,function(swiper){
                swiper.resizeFix();
            },CSwiper);
        },0);

    },
    getSwiperButtons: function(swiperId){
        return this.mSwipers[swiperId].swiperTabButtons;
    },
    getSwiperCurrentSlide: function(swiperId){
        return this.mSwipers[swiperId].activeIndex;
    },
    getSwiperPreviousSlide: function(swiperId){
        return this.mSwipers[swiperId].previousIndex;
    },
    next: function(swiperName) {
        this.mSwipers[swiperName].swipeNext();
    },
    previous: function(swiperName) {
        this.mSwipers[swiperName].swipePrev();
    },
    moveSwiperToSlide: function(swiperContainerId,slide) {
        this.mSwipers[swiperContainerId].swipeTo(slide);
    },
    initSideMenu: function(positions) {
        var hasLeft     = positions.indexOf('left')>=0;
        var hasRight    = positions.indexOf('right')>=0;
        var disable     = 'none';
        if (!hasLeft && !hasRight)   return;
        if (!hasLeft)
            disable  = 'left';
        if (!hasRight)
            disable  = 'right';
        //disable = 'right';
        this.sideMenu = new Snap({
            element: CUtils.element(CObjectsHandler.mainViewId),
            disable: disable
        });
    },
    openOrCloseSideMenu: function(name) {
        if (CUtils.isEmpty(CSwiper.sideMenu)) return;
        var state = CSwiper.sideMenu.state().state;

        if (state=="closed")
            CSwiper.sideMenu.open(name);
        else
            CSwiper.sideMenu.close();
    },
    isSideMenuOpen: function() {
        if (CUtils.isEmpty(this.sideMenu))
            return false;/**/
        return this.sideMenu.state().state!="closed";
    }


});


/**
 * Created by dvircn on 06/08/14.
 */
var CUI = Class({
    $singleton: true,
    titleId: '',
    setTitleObject: function(id){
        this.titleId = id;
    },
    setTitle: function(text){
        var titleObject = CObjectsHandler.object(this.titleId);
        if (!CUtils.isEmpty(titleObject))
            titleObject.setText(text);
    }

});


/**
 * Created by dvircn on 06/08/14.
 */
var CObject = Class({
    $statics: {
        DEFAULT_DESIGN: {
            gpuAccelerated: true
        },
        DEFAULT_LOGIC: {
        },

        generateID: function() {
            return "c_"+Math.random().toString(36).substring(2);
        },
        mergeWithDefaults: function(values,useClass){
            values.design = CUtils.mergeJSONs(useClass.DEFAULT_DESIGN,values.design);
            values.logic = CUtils.mergeJSONs(useClass.DEFAULT_LOGIC,values.logic);
        }
    },

    constructor: function(values) {
        if (CUtils.isEmpty(values)) return;
        // Merge Defaults.
        CObject.mergeWithDefaults(values,CObject);

        this.id             = values.id         || CObject.generateID();
        this.appId          = values.appId;
        this.uname          = values.uname;
        this.version        = values.version;
        this.platform       = values.platform   || ['All'];
        this.logic          = values.logic      || {};
        this.design         = values.design     || {};
        this.data           = values.data       || {};
        this.classes        = "";
        this.lastClasses    = "";
        this.lastLogic      = {};
        this.parent         = -1; // Object's Container Parent
        this.relativeParent = -1; // This object relative parent.
        this.relative       = values.relative || false; // Is this object relative.
        this.logic.doStopPropagation = values.logic.doStopPropagation || false;

        // Replace all references.
        //this.applyDynamicVariables(this.logic);
        // don't apply dynamic variables on dynamic data.

/*
        if (!CUtils.isEmpty(this.data.templateObjects)) {
            var dynamicData = this.data.templateObjects;
            this.data.templateObjects = null;
            this.applyDynamicVariables(this.data);
            this.data.templateObjects = dynamicData;
        }
        else{
            this.applyDynamicVariables(this.data);
        }
*/

    },
    /**
     * Return Unique identifier.
     * Enabling giving readable unique name to object.
     * @returns unique identifier.
     */
    uid: function(){
        if (CUtils.isEmpty(this.uname) || this.uname.indexOf('#/')>=0)
            return this.id;
        return this.uname;
    },
    setParent: function(parentID) {
        this.parent = parentID;
    },
    getParent: function() {
        return this.parent;
    },
    getRelativeParent: function() {
        if (this.relativeParent !== -1)
            return this.relativeParent;
        var parentObject     = CObjectsHandler.object(this.parent);
        this.relativeParent  = null;
        while (!CUtils.isEmpty(parentObject)){
            if (parentObject.isRelative()){
                this.relativeParent = parentObject.uid();
                break;
            }
            else {
                parentObject = CObjectsHandler.object(parentObject.parent);
            }
        }
        return this.relativeParent;
    },
    isRelative: function() {
        return this.relative;
    },
    setRelative: function(relative) {
        this.relative = relative;
    },
    setLink: function(link) {
        if (CUtils.isUrlRelative(link)) {
            this.data.link = CAppConfig.baseUrl()+'/'+link;
        }
        else {
            this.data.link = link;
        }

    },
    getLink: function() {
        return this.data.link || '';
    },
    hasLink: function(){
        return !CUtils.isEmpty(this.logic.link);
    },
    isLink: function(){
        return !CUtils.isEmpty(this.logic.link);
    },
    isLinkLocal: function(){
        return this.data.link.indexOf(CAppConfig.baseUrl())>=0;
    },
    getParentObject: function() {
        return CObjectsHandler.object(this.parent);
    },
    getDesign: function() {
        return this.design;
    },
    setDesign: function(design) {
        this.design = design;
    },
    saveLastLogic: function () {
        // Change cache only if logic was updated.
        if (!CUtils.equals(this.logic,this.lastLogic)){
            this.lastLogic = CUtils.clone(this.logic); // Clone JSON.
        }
    },
    setClasses: function(classes){
        this.classes = classes;
    },
    getClasses: function(){
        return this.classes;
    },
    getLastLogic: function(){
        return this.lastLogic;
    },
    getLogic: function(){
        return this.logic;
    },
    clearLastBuild: function(){
        this.lastClasses = '';
        this.lastLogic = {};
    },
    parseReferences: function(obj) {
        for (var property in obj) {
            if (obj.hasOwnProperty(property)) {
                if (typeof obj[property] == "object")
                    this.parseReferences(obj[property]);
                else if (typeof obj[property] == 'string' || obj[property] instanceof String){
                    // Evaluate dynamic data.
                    var evaluated   = this.replaceReferencesInString(obj[property]);
                    obj[property] = evaluated;
                }

            }
        }
    },
    parseLocalReference: function(str){
        return eval(str);
    },
    parseRelativeReference: function(str){
        var relativeParentId = this.getRelativeParent();
        if (!CUtils.isEmpty(relativeParentId)){
            var relativeParent = CObjectsHandler.object(relativeParentId);
            return eval('relativeParent'+str);
        }
        return null;
    },
    parseRelativeObjectId: function(str){
        var relativeParentId = this.getRelativeParent();
        if (!CUtils.isEmpty(relativeParentId))
            return relativeParentId+str;
        return str.substr(1);
    },
    replaceReferencesInString: function(str) {
        if (CUtils.isEmpty(str))
            return '';
        if (str.indexOf('#') < 0)
            return str;
        // Multiple reference.
        var parts = str.split(' ');
        for (var i=0; i<parts.length; i++){
            var part = parts[i];
            // not a reference.
            if (part.length<=0 || part[0]!='#')
                continue;
            if (part.length>6 && part.substr(0,6) == '#this.')
                parts[i] = this.parseLocalReference(part.substr(1))       || null;
            else if (part.length>2 && part.substr(0,2) == '#.')
                parts[i] = this.parseRelativeReference(part.substr(1))    || null;
            else if (part.length>2 && part.substr(0,2) == '#/')
                parts[i] = this.parseRelativeObjectId(part.substr(1))     || null;
        }
        // Filter out empty elements.
        parts = parts.filter(function(n){ return n != undefined && n!='' && n!=null });
        // Case of single variable - could be an object reference. Otherwise, String.
        if (parts.length==1)
            return parts[0];

        return parts.join(' ');
    },
    /**
     *  Build Object.
     */
    prepareBuild: function(data){
        var view        = data['view'] || new CStringBuilder(),
            tag         = data['tag'],
            attributes  = data['attributes'],
            forceDesign = data['forceDesign'] || {},
            tagHasInner = data['tagHasInner'];

        // Check if this element is already in the DOM.
        var isCreated = !CUtils.isEmpty(CUtils.element(this.uid()));

        // Add to prepared Objects.
        CObjectsHandler.addPreparedObject(this);

        // Save old classes - previous build.
        // This will prevent unnecessary build operations - better performance.
        this.lastClasses    = this.classes;

        // Prepare Design.
        // Save original classes - append them.
        CDesign.prepareDesign(this);

        // If already created, don't need to recreate the DOM element.
        // Notice: If parent element isn't created, neither its children.
        if (isCreated) return view;

        // If not created, set classes last build to this build
        // Because we will insert them directly to the DOM.
        this.lastClasses = this.classes;

        // Create element and add to the dom array.
        // Extra tag attributes. For example: 'href="http://www.web.com"'
        attributes  = CUtils.isEmpty(attributes)? Array() : attributes;
        // Add class attribute.
        attributes.push('id="'+this.uid()+'"');
        attributes.push('class="'+this.classes+'"');

        // Custom tag - can be used to insert a,input..
        if (this.hasLink()){
            this.setLink(this.logic.link.path+ CPager.dataToPath(this.logic.link.data));
            tag = 'a';
            // Allow outer links only in browser. Avoid links opening inside app.
            if (this.isLinkLocal() || CPlatforms.isWeb())
                attributes.push('href="'+this.data.link+'"');
        }
        tag         = CUtils.isEmpty(tag)? 'div' : tag;
        var tagOpen = '<'+tag;

        // If tag has inner or not.
        tagHasInner = CUtils.isEmpty(tagHasInner)? true:tagHasInner;

        if (tagHasInner ===false) {
            view.append('/>',true);
            view.append(attributes,true);
            view.append(tagOpen,true);
        }
        else {
            // Has Inner - Wrap it.
            view.append('>',true);
            view.append(attributes,true);
            view.append(tagOpen,true);
            view.append('</'+tag+'>');      // Add to end.
        }
        return view;



    },
    assignReferences: function(){
        // Leave out the dynamic data references as they need to evaluate only on object creation.
        var abstractObjects         = this.data.templateObjects     || null;
        var abstractContainer       = this.data.templateContainer   || null;
        this.data.templateObjects   = null;
        this.data.templateContainer = null;
        // Retrieve relative and local references.
        this.parseReferences(this.data);
        this.parseReferences(this.logic);
        // Parse relative uname.
        var prevUID = this.uid();
        this.uname = this.replaceReferencesInString(this.uname);
        CObjectsHandler.updateUname(prevUID,this.uname);
        // Update reference in parent.
        if (!CUtils.isEmpty(this.getRelativeParent())){
            var parentObject = CObjectsHandler.object(this.getRelativeParent());
            var thisIndex = parentObject.data.childs.indexOf(prevUID);
            parentObject.data.childs[thisIndex] = this.uid();
        }
        // Return the dynamic data.
        this.data.templateObjects   = abstractObjects;
        this.data.templateContainer = abstractContainer;
    },
    isContainer: function(){
        return false;
    },
    removeSelf: function(){
        var parentContainer = CObjectsHandler.object(this.parent);
        parentContainer.removeChild(this.uid());
        parentContainer.rebuild();
    }



});




/**
 * Created by dvircn on 06/08/14.
 */

var CLabel = Class(CObject,{
    $statics: {
        DEFAULT_DESIGN: {
            color: {color:'White'},
            fontSize:16,
            fontStyle:['bold'],
            textAlign: 'center'
        },
        DEFAULT_LOGIC: {
        }

    },

    constructor: function(values) {
        if (CUtils.isEmpty(values)) return;
        // Merge Defaults.
        CObject.mergeWithDefaults(values,CLabel);

        // Invoke parent's constructor
        CLabel.$super.call(this, values);
    },
    setText: function(text){
        CUtils.element(this.uid()).innerHTML = text;
    }


});

/**
 * Created by dvircn on 13/08/14.
 */
var CButton = Class(CLabel,{
    $statics: {
        DEFAULT_DESIGN: {
            cursor: 'pointer',
            active:{
                bgColor:{color:'Gray',level:10}
            }
        },
        DEFAULT_LOGIC: {
        }

    },

    constructor: function(values) {
        if (CUtils.isEmpty(values)) return;
        // Merge Defaults.
        CObject.mergeWithDefaults(values,CButton);

        // Invoke parent's constructor
        CButton.$super.call(this, values);

    }


});

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
    appendChild: function(objectId){
        this.data.childs.push(objectId);
    },
    appendChilds: function(objectsIds){
        objectsIds = objectsIds || [];
        this.data.childs.push.apply(this.data.childs,objectsIds);
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


/**
 * Created by dvircn on 25/08/14.
 */
var CTemplate = Class(CContainer,{
    $statics: {
        gifLoaders:{
            default: 'loaderDefault'
        },
        DEFAULT_DESIGN: {
            //classes: CTemplator.hiddenClass,
            //height: 50
        },
        DEFAULT_LOGIC: {
        }

    },

    constructor: function(values) {
        if (CUtils.isEmpty(values)) return;
        // Merge Defaults.
        CObject.mergeWithDefaults(values,CTemplate);

        // Invoke parent's constructor
        CTemplate.$super.call(this, values);

        this.design.classes             = this.design.classes           || '';
        //this.design.classes             += ' ' +CTemplate.gifLoaders.default+ ' ';
        this.logic.template             = true;
        this.data.template              = this.data.template            || {};
        this.data.template.url          = this.data.template.url        || '';
        this.data.template.callback     = this.data.template.callback   || function(){};
        this.data.template.callbacks    = this.data.template.callbacks  || [];
        this.data.template.queryData    = this.data.template.queryData  || {};
        this.data.template.data         = this.data.template.data       || null;
        this.data.template.applied      = this.data.template.applied    || false;
        this.data.template.autoLoad     = this.data.template.autoLoad   === false ? false : true;
        this.data.template.loaded       = this.data.template.loaded     || false;
        this.data.template.duplicates   = this.data.template.duplicates || [];
        this.data.template.objects      = this.data.template.objects    || [];
        this.data.template.object       = this.data.template.object     || null;
        if (this.data.template.object !== null) // Allow syntactic sugar.
            this.data.template.objects.push(this.data.template.object);

        this.data.template.container    = this.data.template.container  || {type:'Container'};
        this.data.template.container.relative    = true;
        this.data.template.container.data        = this.data.template.container.data  || {};
        this.data.template.container.logic       = this.data.template.container.logic || {};
        this.data.template.container.design      = this.data.template.container.design|| {};

        this.data.template.containerToData       = this.data.template.containerToData || {};

        if (!CUtils.isEmpty(this.data.template.data)){
            this.data.template.applied = true;
            CTemplator.loadObjectWithDataNoRebuild(this,this.data.template.data);
        }

    },
    setTemplateData: function(data){
        CTemplator.loadObjectWithData(this,data,null,true);
    },
    filter: function(filterFunction){
        filterFunction = filterFunction || function(data) { return true; };
        _.each(this.data.template.containerToData,function(data,id){
            data = data || {};
            CLog.dlog(data);
            if (filterFunction(data)===true){
                CUtils.element(id).style.display = '';
            }
            else{
                CUtils.element(id).style.display = 'none';
            }
        },this);
    },
    clearFilter: function(){
      this.filter();
    },
    showLoading: function(){
        //CUtils.removeClass(CUtils.element(this.uid()),CTemplator.hiddenClass);
    },
    stopLoading: function(){
        //CUtils.addClass(CUtils.element(this.uid()),CTemplator.hiddenClass);
    }


});

/**
 * Created by dvircn on 17/08/14.
 */
var  CDialogContainer = Class(CContainer,{
    $statics: {
        DEFAULT_DESIGN: {
            classes:'cDialogContainer',
            minHeight: 100,
            maxWidth: '90%',
            maxHeight: '80%',
            round:2,
            bgColor:{color:'White'},
            //border: { all: 1},
            borderColor:{color:'Gray',level:2}
        },
        DEFAULT_LOGIC: {
        }
    },

    constructor: function(values) {
        if (CUtils.isEmpty(values)) return;
        // Merge Defaults.
        CObject.mergeWithDefaults(values,CDialogContainer);
        // Invoke parent's constructor
        CDialogContainer.$super.call(this, values);

        this.design.top = CAppConfig.get('headerSize')+20;
    }

});


/**
 * Created by dvircn on 16/08/14.
 */
var CDialog = Class(CContainer,{
    $statics: {
        DEFAULT_DESIGN: {
            classes:'cDialog '+CAnimations.noDisplay,
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            minHeight: 100


        },
        DEFAULT_LOGIC: {
        },
        showDialog: function(data,design){
            data                = data || {
                destroyOnHide: true
            };
            design              = design || {};

            data                = CUtils.clone(data);
            design              = CUtils.clone(design);

            var newDialog = CObjectsHandler.createObject('Dialog',{data: data,design: design });
            CObjectsHandler.object(CObjectsHandler.appContainerId).appendChild(newDialog);
            var onBuildFinish = function() {CObjectsHandler.object(newDialog).show();};
            CObjectsHandler.object(CObjectsHandler.appContainerId).rebuild(onBuildFinish);
        }
    },

    constructor: function(values) {
        if (CUtils.isEmpty(values)) return;

        values.design           = values.design || {};
        values.design.width     = values.design.width || 400;
        values.design.height    = 'auto';

        // Container design.
        var containerDesign = CUtils.clone(values.design);
        values.design = {};
        // Merge Defaults.
        CObject.mergeWithDefaults(values,CDialog);
        // Invoke parent's constructor
        CDialog.$super.call(this, values);

        // Set defaults
        this.data.animation         = this.data.animation           || 'fade';
        this.data.topView           = this.data.topView             || CObjectsHandler.appContainerId;
        this.data.destroyOnHide     = this.data.destroyOnHide===false? false : true;
        this.data.hideOnOutClick    = this.data.hideOnOutClick===false? false : true;
        this.data.title             = this.data.title               || '';
        this.data.textContent       = this.data.textContent         || '';
        this.data.objectContent     = this.data.objectContent       || '';
        this.data.list              = this.data.list                || [];
        this.data.iconsList         = this.data.iconsList           || [];
        this.data.iconsAlign        = this.data.iconsAlign          || CAppConfig.get('textAlign') || 'left';
        this.data.iconsSize         = this.data.iconsSize           || 30;
        this.data.listCallbacks     = this.data.listCallbacks       || [];
        this.data.chooseCallback    = this.data.chooseCallback      || function(index,value){};
        this.data.hideOnListChoose  = this.data.hideOnListChoose===false? false : true;
        this.data.cancelCallOnHide  = this.data.cancelCallOnHide===false? false : true;
        this.data.cancelText        = this.data.cancelText          || '';
        this.data.cancelCallback    = this.data.cancelCallback      || function(){};
        this.data.confirmText       = this.data.confirmText         || '';
        this.data.confirmCallback   = this.data.confirmCallback     || function(){};
        this.data.extraText         = this.data.extraText           || '';
        this.data.extraCallback     = this.data.extraCallback       || function(){};
        // Design
        this.data.dialogColor       = this.data.dialogColor         || {color:'Cyan',level:6};
        this.data.bgColor           = this.data.bgColor             || {color:'Gray',level:0};
        this.data.contentColor      = this.data.contentColor        || {color:'Gray',level:12};
        this.data.listBorderColor   = this.data.listBorderColor     || {color:'Gray',level:2};
        this.data.titleColor        = this.data.titleColor          || this.data.dialogColor;
        this.data.titleAlign        = this.data.titleAlign          || 'center';
        this.data.contentAlign      = this.data.contentAlign        || CAppConfig.get('textAlign') || 'center';
        this.data.dialogWidth       = this.data.dialogWidth         || 400;
        containerDesign.width       = this.data.dialogWidth;
        containerDesign.bgColor     = this.data.bgColor;


        // Init function.
        var dialog = this;

        // Adnimation handling.
        this.data.onAnimShowComplete = function(){dialog.onResize();};

        this.logic.init = function(){ dialog.onResize(); }
        // Set destroy on hide handler.
        this.setDestroyOnHideHandler();
        // Create sub views.
        this.createContainerAndOverlay(containerDesign);
        // Create title view if needed.
        this.createTitle();
        this.createContainer();
        this.createContent();
        this.createList();
        this.createButtons();
        // Set Position.
        this.setPositionHandler();

    },
    hide: function(callback){
        // Check if need to set cancel callback\use the given callback
        // or do not call callback - empty function;
        if (CUtils.isEmpty(callback) && !CUtils.isEmpty(this.data.cancelCallback)
            && this.data.cancelCallOnHide === true) {
            callback = this.data.cancelCallback;
        }
        else if (CUtils.isEmpty(callback)) {
            callback = function(){};
        }

        callback();
        CAnimations.hide(this.uid());
    },
    show: function(){
        CAnimations.show(this.uid());
        this.onResize();
    },
    switchDialog: function(){
        CAnimations.hideOrShow(this.uid());
        this.onResize();
    },
    setDestroyOnHideHandler: function(){
        var object = this;
        if (this.data.destroyOnHide){
            this.data.onAnimHideComplete = function(){
                object.removeSelf();
                CUtils.unbindEvent(window,'resize',object.onResize);
            };
        }
    },
    createContainerAndOverlay: function(containerDesign){
        var dialog = this;
        var overlayOnClick = this.data.hideOnOutClick===true?
            function(){ dialog.hide();} : function(){};

        // Create Overlay.
        this.dialogOverlay = CObjectsHandler.createObject('Object',{
            design: { classes: 'cDialogOverlay' },
            logic: { doStopPropagation: true,
                onClick: overlayOnClick
            }
        });
        // Create Dialog Container.
        this.dialogContainer = CObjectsHandler.createObject('DialogContainer',{
            data: { childs: this.data.childs || []},
            design: containerDesign
        });
        // Add to Childs array.
        this.data.childs = [this.dialogContainer,this.dialogOverlay];

    },
    createTitle: function(){
        if (CUtils.isEmpty(this.data.title))
            return;
        // Create Title.
        this.dialogTitle = CObjectsHandler.createObject('Object',{
            design: {
                color: this.data.titleColor,
                borderColor: this.data.dialogColor,
                border: { bottom: 2},
                width:'100%',
                height: 45,
                fontSize:19,
                fontStyle: ['bold'],
                textAlign: this.data.titleAlign
            },
            logic: {
                text: this.data.title
            }
        });

        CObjectsHandler.object(this.dialogContainer).data.childs.push(this.dialogTitle);
    },
    createContainer: function(){
        // Create container.
        this.contentContainer = CObjectsHandler.createObject('Container',{
            design: {
                width:'100%',
                height: 'auto',
                overflow: 'scrollable',
                boxSizing: 'borderBox'
            }
        });

        CObjectsHandler.object(this.dialogContainer).data.childs.push(this.contentContainer);

    },
    appendContent: function(contentId) {
        CObjectsHandler.object(this.contentContainer).data.childs.push(contentId);
    },
    createContent: function () {
        var contentId = null;
        if (!CUtils.isEmpty(this.data.objectContent))
            contentId = this.data.objectContent;
        else if (!CUtils.isEmpty(this.data.textContent)){
            contentId = CObjectsHandler.createObject('Object',{
                design: {
                    color: this.data.contentColor,
                    width:'95%',
                    height: 'auto',
                    fontSize:17,
                    fontStyle: ['bold'],
                    margin: 'centered',
                    paddingTop: 10,
                    paddingBottom: 10,
                    textAlign: this.data.contentAlign
                },
                logic: {
                    text: this.data.textContent
                }
            });
        }

        if (contentId!=null)
            this.appendContent(contentId);
    },
    createList: function () {
        var list            = this.data.list,
            iconsList       = this.data.iconsList,
            listCallbacks   = this.data.listCallbacks,
            chooseCallback  = this.data.chooseCallback,
            actualCallbacks = [],
            dialog          = this;

        // Allow create icon only list.
        while (list.length < iconsList.length){
            list.push('');
        }

        // Set up callbacks.
        for (var i=0;i<list.length;i++) {
            var index = i;
            var text = list[index] || '';
            var icon = index < iconsList.length ? iconsList[index] : '';

            var listCallback = index < listCallbacks.length ?
                listCallbacks[index] : function(){};
            var chosenCallback = !CUtils.isEmpty(chooseCallback) ? function(index,text) {
                chooseCallback(index,text);
            } : function(){};

            var hideOnChoose = this.data.hideOnListChoose === true ? function(){
                dialog.hide();
            } : function(){};

            this.createListElement(index,text,icon,listCallback,chosenCallback,hideOnChoose);
        }



    },
    createListElement: function (index,text,icon,listCallback,chosenCallback,hideOnChoose) {
        var design = {
            color: this.data.contentColor,
            width:'100%',
            height: '45',
            boxSizing: 'borderBox',
            fontSize:17,
            fontStyle: ['bold'],
            margin: 'centered',
            paddingRight:7,
            paddingLeft:7,
            border: {top:1},
            borderColor: this.data.listBorderColor,
            textAlign: this.data.contentAlign,
            active: { bgColor: this.data.dialogColor, color: {color:'White'}}
        };

        if (index === 0)
            design.border = {};

        var logic = {
            text: text,
                onClick: function(){
                listCallback();
                chosenCallback(index,text);
                hideOnChoose();
            }
        };

        // Set icon design
        if (!CUtils.isEmpty(icon)) {
            var iconAlign = '';
            if (!CUtils.isEmpty(text)){
                if (this.data.iconsAlign=='left')
                    iconAlign = 'left';
                if (this.data.iconsAlign=='right')
                    iconAlign = 'right';
            }
            logic.icon = {
                name:   icon,
                size:   this.data.iconsSize,
                align:  iconAlign || null
            }
        }

        var contentId = CObjectsHandler.createObject('Button',{
                design: design,
                logic: logic
            });

        this.appendContent(contentId);
    },
    createButtons: function () {
        var countButtons = 0;
        if (!CUtils.isEmpty(this.data.cancelText))  countButtons++;
        if (!CUtils.isEmpty(this.data.confirmText)) countButtons++;
        if (!CUtils.isEmpty(this.data.extraText))   countButtons++;

        // Create Buttons container.
        if (countButtons===0)
            return;
         // Create buttons container.
        this.buttonsContainer = CObjectsHandler.createObject('Container',{
            design: {
                borderColor: this.data.dialogColor,
                border: { top: 1},
                marginTop: 1,
                width:'100%',
                height: 'auto'
            }
        });

        CObjectsHandler.object(this.dialogContainer).data.childs.push(this.buttonsContainer);

        // Create all buttons
        var currentButton = 0;
        if (!CUtils.isEmpty(this.data.cancelText)) {
            this.createAndAddButton(this,currentButton,countButtons,this.data.cancelText,  this.data.cancelCallback);
            currentButton++;
        }
        if (!CUtils.isEmpty(this.data.confirmText)) {
            this.createAndAddButton(this,currentButton,countButtons,this.data.confirmText, this.data.confirmCallback);
            currentButton++;
        }
        if (!CUtils.isEmpty(this.data.extraText)) {
            this.createAndAddButton(this,currentButton,countButtons,this.data.extraText,   this.data.extraCallback);
        }

    },
    createAndAddButton: function(dialog,currentButton,countButtons,text,callback){
        var design = {
            color: this.data.dialogColor,
            width:'100%',
            height: 'auto',
            boxSizing: 'borderBox',
            fontSize:18,
            fontStyle: ['bold'],
            margin: 'centered',
            display: 'inlineBlock',
            paddingTop:14,
            paddingBottom:14,
            borderColor: this.data.dialogColor,
            textAlign: 'center',
            active: { bgColor: this.data.dialogColor, color: {color:'White'}}
        };

        // Set Borders.
        if (currentButton===0 && countButtons>1/**/)
            design.border = {right:1}
        if (currentButton===2)
            design.border = {top:1}
        // Change width if needed.
        if (currentButton<2 && countButtons>1)
            design.width = '50%'

        var contentId = CObjectsHandler.createObject('Button',{
            design: design,
            logic: {
                text: text,
                onClick: function(){
                    dialog.hide(callback);
                }
            }
        });

        // Add to container.
        CObjectsHandler.object(this.buttonsContainer).data.childs.push(contentId);

    },
    setPositionHandler: function () {
        var dialog = this;
        this.onResize = function(){
            if (CUtils.isEmpty(CUtils.element(dialog.dialogContainer)))
                return;

            var container           = CUtils.element(dialog.dialogContainer);
            var topView             = CUtils.element(dialog.data.topView);
            var containerRect       = container.getBoundingClientRect();
            var containerWidth      = containerRect.width;
            var topViewRect         = topView.getBoundingClientRect();
            var topViewWidth        = topViewRect.width;
            var topViewLeft         = topViewRect.left;
            var windowSize          = CUtils.wndsize();
            var windowWidth         = windowSize.width;

            var containerMaxHeight = windowSize.height;
            if (dialog.data.topView===CObjectsHandler.appContainerId){
                var top = ((windowSize.height*0.7-containerRect.height)/2);
                if (top<0)  top = CAppConfig.get('headerSize') || 40;
                container.style.top = top+'px';
                containerMaxHeight = (windowSize.height-70);
            }
            else {
                var distanceFromBottom = (windowSize.height-(topViewRect.top+topViewRect.height));
                if (distanceFromBottom < 100 ){
                    container.style.top = topViewRect.top-containerRect.height+'px';
                    containerMaxHeight = (topViewRect.top-10);
                }
                else {
                    containerMaxHeight = (windowSize.height-(topViewRect.top+topViewRect.height)-10);
                    container.style.maxHeight =
                    container.style.top = (topViewRect.top+topViewRect.height)+'px';
                }
            }

            container.style.maxHeight = containerMaxHeight+'px';


            var right = (windowWidth-(topViewLeft+topViewWidth) + (topViewWidth-containerWidth)/2 );

            // Check bounds.
            if (right<1)
                right = 1;

            if (right >= (windowWidth-containerRect.width) )
                right = windowWidth-containerRect.width-1;

            container.style.right = right + 'px';

            // Set Content max height.
            if (CUtils.isEmpty(dialog.contentContainer))
                return;

            var contentContainer    = CUtils.element(dialog.contentContainer);
            var contentMaxHeight = containerMaxHeight;
            var siblings = CUtils.element(dialog.contentContainer).parentNode.children;

            _.each(siblings,function(node){
                if (node.id === dialog.contentContainer)
                    return;
                contentMaxHeight -= node.getBoundingClientRect().height;
            },this);

            contentContainer.style.maxHeight = (contentMaxHeight-5)+'px';

        };
        window.addEventListener('resize',this.onResize);
    }


});


/**
 * Created by dvircn on 07/08/14.
 */
var CAppContainer = Class(CContainer,{
    $statics: {
        DEFAULT_DESIGN: {
            classes: 'app_container',
            direction: 'ltr'
        },
        DEFAULT_LOGIC: {
        }
    },

    constructor: function(values) {
        if (CUtils.isEmpty(values)) return;
        // Merge Defaults.
        CObject.mergeWithDefaults(values,CAppContainer);

        // Invoke parent's constructor
        CAppContainer.$super.call(this, values);
    }

});


/**
 * Created by dvircn on 13/08/14.
 */
var CMainView = Class(CContainer,{
    $statics: {
        DEFAULT_DESIGN: {
            classes:'snap-content',
            bgColor:{color:'White'},
            textAlign: 'center',
            overflow: 'scrollable'

        },
        DEFAULT_LOGIC: {
        }
    },

    constructor: function(values) {
        if (CUtils.isEmpty(values)) return;
        // Merge Defaults.
        CObject.mergeWithDefaults(values,CMainView);
        // Invoke parent's constructor
        CMainView.$super.call(this, values);
    }

});


/**
 * Created by dvircn on 13/08/14.
 */
var CSideMenu = Class(CContainer,{
    $statics: {
        DEFAULT_DESIGN: {
            classes:'snap-drawers'
        },
        DEFAULT_LOGIC: {
        }
    },

    constructor: function(values) {
        if (CUtils.isEmpty(values)) return;
        // Merge Defaults.
        CObject.mergeWithDefaults(values,CSideMenu);
        // Invoke parent's constructor
        CSideMenu.$super.call(this, values);
        this.leftContainer  = values.data.leftContainer  || null;
        this.rightContainer = values.data.rightContainer || null;

        // Create left and right menus.
        this.leftMenu   = CObjectsHandler.createObject('SideMenuLeft',{
            data: {  childs: [this.leftContainer] }
        });
        this.rightMenu  = CObjectsHandler.createObject('SideMenuRight',{
            data: {  childs: [this.rightContainer] }
        });

        // Set Children.
        this.data.childs = [this.leftMenu,this.rightMenu];
        var positions = [];
        if (this.leftContainer != null)
            positions.push('left');
        if (this.rightContainer != null)
            positions.push('right');

        this.logic.sideMenu = {
            positions: positions
        };

    }

});


/**
 * Created by dvircn on 13/08/14.
 */
var CSideMenuContainer = Class(CContainer,{
    $statics: {
        DEFAULT_DESIGN: {
            height:'100%'
        },
        DEFAULT_LOGIC: {
        }
    },

    constructor: function(values) {
        if (CUtils.isEmpty(values)) return;
        // Merge Defaults.
        CObject.mergeWithDefaults(values,CSideMenuContainer);
        // Invoke parent's constructor
        CSideMenuContainer.$super.call(this, values);
        //this.uname = 'side-menu-left';
    }

});


/**
 * Created by dvircn on 13/08/14.
 */
var CSideMenuLeft = Class(CContainer,{
    $statics: {
        DEFAULT_DESIGN: {
            classes:'snap-drawer snap-drawer-left',
            bgColor:{color:'Gray',level:7},
            textAlign: 'center'
        },
        DEFAULT_LOGIC: {
        }
    },

    constructor: function(values) {
        if (CUtils.isEmpty(values)) return;
        // Merge Defaults.
        CObject.mergeWithDefaults(values,CSideMenuLeft);
        // Invoke parent's constructor
        CSideMenuLeft.$super.call(this, values);
        //this.uname = 'side-menu-left';
    }

});


/**
 * Created by dvircn on 13/08/14.
 */
var CSideMenuRight = Class(CContainer,{
    $statics: {
        DEFAULT_DESIGN: {
            classes:'snap-drawer snap-drawer-right',
            bgColor:{color:'Gray',level:7},
            textAlign: 'center'
        },
        DEFAULT_LOGIC: {
        }
    },

    constructor: function(values) {
        if (CUtils.isEmpty(values)) return;
        // Merge Defaults.
        CObject.mergeWithDefaults(values,CSideMenuRight);
        // Invoke parent's constructor
        CSideMenuRight.$super.call(this, values);
        //this.uname = 'side-menu-right';
    }

});


/**
 * Created by dvircn on 17/09/14.
 */
var CList = Class(CContainer,{
    $statics: {
        DEFAULT_DESIGN: {
            //bgColor:CColor('White'),

        },
        DEFAULT_LOGIC: {
        }

    },

    constructor: function(values) {
        if (CUtils.isEmpty(values)) return;
        // Merge Defaults.
        CObject.mergeWithDefaults(values,CList);

        // Invoke parent's constructor
        CList.$super.call(this, values);

        // Page properties.
        this.data.list                  = this.data.list                || {};
        this.data.list.elements         = this.data.list.elements       || {};
        this.data.list.texts            = this.data.list.texts          || {};
        this.data.list.links            = this.data.list.links          || {};
        this.data.list.icons            = this.data.list.icons          || [];
        this.data.list.iconsSize        = this.data.list.iconsSize      || 35;
        this.data.list.iconsRight       = this.data.list.iconsRight     || [];
        this.data.list.iconsRightSize   = this.data.list.iconsRightSize || 35;
        this.data.list.iconsLeft        = this.data.list.iconsLeft      || [];
        this.data.list.iconsLeftSize    = this.data.list.iconsLeftSize  || 35;
        this.data.list.callbacks        = this.data.list.callbacks      || [];
        this.data.list.chooseCallback   = this.data.list.chooseCallback || function(index,value){};
        this.data.list.borderColor      = this.data.list.borderColor    || CColor('Gray',2);
        this.data.list.mainColor        = this.data.list.mainColor      || CColor('Gray',14);
        this.data.list.height           = this.data.list.height         || 50;
        this.data.list.elementDesign    = this.data.list.elementDesign  || {};

        if (CUtils.isEmpty(this.data.list.elements))
            this.createList();
        else // Elements List
            this.createElementsList();
    },
    createElementsList: function () {
    },
    createList: function () {
        var texts          = this.data.list.texts         ,
            icons          = this.data.list.icons         ,
            links          = this.data.list.links         ,
            iconSize       = this.data.list.iconsSize     ,
            iconsRight     = this.data.list.iconsRight    ,
            iconRightSize  = this.data.list.iconsRightSize,
            iconsLeft      = this.data.list.iconsLeft     ,
            iconLeftSize   = this.data.list.iconsLeftSize ,
            callbacks      = this.data.list.callbacks     ,
            chooseCallback = this.data.list.chooseCallback;

        var length = Math.max(texts.length,icons.length,iconsRight.length,iconsLeft.length);
        // Set up callbacks.
        for (var i=0;i<length;i++) {
            var text        = texts[i] || '';
            var link        = links[i] || '';
            var icon        = icons[i] || '';
            var iconRight   = iconsRight[i] || '';
            var iconLeft    = iconsLeft[i] || '';

            var listCallback = callbacks[i] || function(){};
            var chosenCallback = !CUtils.isEmpty(chooseCallback) ? function(index,text) {
                chooseCallback(index,text);
            } : function(){};

            this.createListElement(i,text,link,icon,iconSize,iconRight,iconRightSize,
                iconLeft,iconLeftSize,listCallback,chosenCallback,this.data.list.height,
                this.data.list.elementDesign);
        }



    },
    createListElement: function (index,text,link,icon,iconSize,iconRight,iconRightSize,
                                 iconLeft,iconLeftSize,listCallback,chosenCallback,height,
                                 elementDesign) {
        var design = {
            color: this.data.contentColor,
            width:'100%',
            height: 'auto',
            boxSizing: 'borderBox',
            fontSize:17,
            fontStyle: ['bold'],
            margin: 'centered',
            //paddingTop:9,
            //paddingBottom:9,
            paddingRight:7,
            paddingLeft:7,
            border: {top:1},
            borderColor: this.data.listBorderColor,
            textAlign: this.data.contentAlign,
            active: { bgColor: this.data.dialogColor, color: {color:'White'}}
        };

        var design = CUtils.mergeJSONs(design,elementDesign);
        if (index === 0)
            design.border = {};

        // Set icon design
        if (!CUtils.isEmpty(icon)) {
            var iconDesign = 'iconOnly';
            if (!CUtils.isEmpty(text)){
                if (this.data.iconsAlign=='left')
                    iconDesign = 'iconLeft';
                if (this.data.iconsAlign=='right')
                    iconDesign = 'iconRight';
            }
            design[iconDesign] = icon;
        }


        var contentId = CObjectsHandler.createObject('Button',{
            design: design,
            logic: {
                text: text,
                onClick: function(){
                    listCallback();
                    chosenCallback(index,text);
                    hideOnChoose();
                }
            }
        });

        this.appendChild(contentId);
    }



});

/**
 * Created by dvircn on 15/08/14.
 */
var CFooter = Class(CContainer,{
    $statics: {
        DEFAULT_DESIGN: {
            classes: 'footer',
            bottom:0,
            bgColor:{
                color: 'Blue',
                level: 4
            }
        },
        DEFAULT_LOGIC: {
        }

    },

    constructor: function(values) {
        if (CUtils.isEmpty(values)) return;
        // Merge Defaults.
        CObject.mergeWithDefaults(values,CFooter);

        // Invoke parent's constructor
        CFooter.$super.call(this, values);

        this.design.height = CAppConfig.get('footerSize');

    }


});

/**
 * Created by dvircn on 15/08/14.
 */
var CHeader = Class(CContainer,{
    $statics: {
        DEFAULT_DESIGN: {
            classes: 'header',
            bgColor:{
                color: 'Blue',
                level: 4
            }
        },
        DEFAULT_LOGIC: {
        }

    },

    constructor: function(values) {
        if (CUtils.isEmpty(values)) return;
        // Merge Defaults.
        CObject.mergeWithDefaults(values,CHeader);

        // Invoke parent's constructor
        CHeader.$super.call(this, values);

        this.design.height = CAppConfig.get('headerSize');

        this.data.itemSize = this.design.height;

        // Declare Left & Right Buttons
        this.data.left  = this.data.left  || [];
        this.data.right = this.data.right || [];

        this.data.titleDesign = this.data.titleDesign || {};
        this.data.titleDesign = CUtils.mergeJSONs(this.data.titleDesign,{
            position: 'absolute',
            left: this.data.itemSize * this.data.left.length,
            right: this.data.itemSize * this.data.right.length,
            top: 0, bottom:0, margin: 'none', height:'auto'
        });
        // Create Title.
        this.data.title = CObjectsHandler.createObject('Label',{
            design: this.data.titleDesign
        });
        CUI.setTitleObject(this.data.title);

        // Set up childs array.
        this.data.childs = this.data.childs.concat(this.data.left);
        this.data.childs = this.data.childs.concat([this.data.title]);
        this.data.childs = this.data.childs.concat(this.data.right);

        // Set Force Design
        this.forceDesign = {
            position: 'absolute',
            top: 0, bottom: 0,
            width: this.data.itemSize
        }
    },
    applyForceDesign: function(object){
        var id = object.uid();
        var leftPos     = this.data.left.indexOf(id);
        var rightPos    = this.data.right.indexOf(id);
        if (leftPos >= 0){
            this.forceDesign['left']    = this.data.itemSize * leftPos;
            this.forceDesign['right']   = null;
        }
        else if (rightPos >= 0){
            this.forceDesign['left']    = null;
            this.forceDesign['right']   = this.data.itemSize * rightPos;
        }
        else {
            return;
        }
        CHeader.$superp.applyForceDesign.call(this,object);
    }



});

/**
 * Created by dvircn on 16/08/14.
 */
var CContent = Class(CContainer,{
    $statics: {
        DEFAULT_DESIGN: {
            classes: 'content',
            bgColor:{
                color: 'White'
            },
            overflow: 'scrollable'
        },
        DEFAULT_LOGIC: {
        }

    },

    constructor: function(values) {
        if (CUtils.isEmpty(values)) return;
        // Merge Defaults.
        CObject.mergeWithDefaults(values,CContent);

        // Invoke parent's constructor
        CContent.$super.call(this, values);

        this.design.top     =   CAppConfig.get('headerSize');
        this.design.bottom  =   CAppConfig.get('footerSize');


    }


});

/**
 * Created by dvircn on 16/08/14.
 */
var CPage = Class(CContainer,{
    $statics: {
        DEFAULT_DESIGN: {
            bgColor:{
                color: 'White'
            },
            top: 0,
            right: 0,
            left: 0,
            bottom: 0,
            position: 'absolute'
        },
        DEFAULT_LOGIC: {
        }

    },

    constructor: function(values) {
        if (CUtils.isEmpty(values)) return;
        // Merge Defaults.
        CObject.mergeWithDefaults(values,CPage);

        // Invoke parent's constructor
        CPage.$super.call(this, values);

        // Page properties.
        this.data.page         = this.data.page           || {};
        this.data.page.name    = this.data.page.name      || '';
        this.data.page.title   = this.data.page.title     || '';
        this.data.page.onLoad  = this.data.page.onLoad    || function(){};
        this.data.page.id      = this.uid();
        this.data.page.loaded  = false;
        this.data.page.params  = [];
        this.data.page.paramsChanged  = false;
    },
    setParams: function(params){
        if ( !CUtils.equals(this.data.page.params,params)){
            this.data.page.params = params;
            this.data.page.paramsChanged = true;
        }
    },
    reload: function(force){
        force = force || false;
        if (this.data.page.loaded===false || this.data.page.paramsChanged || force ===true) {
            this.data.page.loaded = true;
            this.data.page.paramsChanged = false;
            this.data.page.onLoad(this.data.page.params);
        }
        CSwiper.resizeFix();
    },
    getPageTitle: function(){
        return this.data.page.title;
    },
    getPageName: function(){
        return this.data.page.name;
    }



});

/**
 * Created by dvircn on 25/08/14.
 */
var CTemplatePage = Class([CPage,CTemplate],{
    $statics: {
        gifLoaders:{
            default: 'loaderDefault'
        },
        DEFAULT_DESIGN: {
            classes: CTemplator.hiddenClass
        },
        DEFAULT_LOGIC: {
        }

    },

    constructor: function(values) {
        if (CUtils.isEmpty(values)) return;
        // Merge Defaults.
        CObject.mergeWithDefaults(values,CTemplatePage);

        // Invoke parent's constructor
        CTemplatePage.$super.call(this, values);
        CTemplate.prototype.constructor.call(this, values);
        // Set that there is a page container for the abstract objects.
        this.data.template.container.data.page   = this.data.template.container.data.page || this.data.page || {};
        //this.data.page                  = null;
        this.data.template.container.type        = 'Page';
        this.data.template.autoLoad = false;

    }


});



/**
 * Created by dvircn on 15/08/14.
 */
var CImage = Class(CObject,{
    $statics: {
        DEFAULT_DESIGN: {
            classes: ""
        },
        DEFAULT_LOGIC: {
        }

    },

    constructor: function(values) {
        if (CUtils.isEmpty(values)) return;
        // Merge Defaults.
        CObject.mergeWithDefaults(values,CImage);

        // Invoke parent's constructor
        CImage.$super.call(this, values);

        this.data.src = values.data.src || '';
    },
    /**
     *  Build Object.
     */
    prepareBuild: function(data){
        // Prepare this element - wrap it's children.
        return CImage.$superp.prepareBuild.call(this,{
            tag: 'img',
            attributes: ['src="'+this.data.src+'"'],
            tagHasInner: false
        });
    }


});

/**
 * Created by dvircn on 15/08/14.
 */
var CZoomedImage = Class(CObject,{
    $statics: {
        DEFAULT_DESIGN: {
            classes: "zoomedImage",
            width: '100%',
            height: '100%'
        },
        DEFAULT_LOGIC: {
        }

    },

    constructor: function(values) {
        if (CUtils.isEmpty(values)) return;
        // Merge Defaults.
        CObject.mergeWithDefaults(values,CZoomedImage);

        // Invoke parent's constructor
        CZoomedImage.$super.call(this, values);

        this.data.src = values.data.src || '';
    },
    /**
     *  Build Object.
     */
    prepareBuild: function(data){
        // Prepare this element - wrap it's children.
        return CImage.$superp.prepareBuild.call(this,{
            attributes: ['style="background-image: url('+this.data.src+');"']
        });
    }


});

/**
 * Created by dvircn on 15/08/14.
 */
var CPagination = Class(CObject,{
    $statics: {
        DEFAULT_DESIGN: {
            classes:'pagination',
            boxSizing: ''
        },
        DEFAULT_LOGIC: {
        }

    },

    constructor: function(values) {
        if (CUtils.isEmpty(values)) return;
        // Merge Defaults.
        CObject.mergeWithDefaults(values,CPagination);

        // Invoke parent's constructor
        CPagination.$super.call(this, values);

    }


});

/**
 * Created by dvircn on 15/08/14.
 */
var CSliderWrapper = Class(CContainer,{
    $statics: {
        DEFAULT_DESIGN: {
            classes:'swiper-wrapper'
        },
        DEFAULT_LOGIC: {
        }

    },

    constructor: function(values) {
        if (CUtils.isEmpty(values)) return;
        // Merge Defaults.
        CObject.mergeWithDefaults(values,CSliderWrapper);

        // Invoke parent's constructor
        CSliderWrapper.$super.call(this, values);


    }


});

/**
 * Created by dvircn SliderSlide on 15/08/14.
 */
var CSliderSlide = Class(CContainer,{
    $statics: {
        DEFAULT_DESIGN: {
            classes:'swiper-slide'
        },
        DEFAULT_LOGIC: {
        }

    },

    constructor: function(values) {
        if (CUtils.isEmpty(values)) return;
        // Merge Defaults.
        CObject.mergeWithDefaults(values,CSliderSlide);

        // Invoke parent's constructor
        CSliderSlide.$super.call(this, values);

    }


});

/**
 * Created by dvircn on 15/08/14.
 */
var CSlider = Class(CContainer,{
    $statics: {
        DEFAULT_DESIGN: {
            height: 300,
            widthSM: 10,
            widthXS: 10,
            classes:'swiper-container'
        },
        DEFAULT_LOGIC: {
        }

    },

    constructor: function(values) {
        if (CUtils.isEmpty(values)) return;
        // Merge Defaults.
        CObject.mergeWithDefaults(values,CSlider);

        // Invoke parent's constructor
        CSlider.$super.call(this, values);

        // Create Pagination
        var paginationDesign = values.data.pagination ===true ? {} :
        {  display: 'hidden' };
        this.pagination = CObjectsHandler.createObject('Pagination',{
            design: paginationDesign
        });

        // Create Slides
        var childs = this.data.childs;
        this.data.childs = [];
        _.each(childs,function(child){
            var sliderId = CObjectsHandler.createObject('SliderSlide',{
                data: {  childs: [child] }
            });
            this.data.childs.push(sliderId);
        },this);

        var wrapperChilds = this.data.childs;
        // Create Wrapper.
        this.sliderWrapper = CObjectsHandler.createObject('SliderWrapper',{
            data: {  childs: wrapperChilds }
        });

        // Set the wrapper to be the only child.
        this.data.childs     = [this.sliderWrapper,this.pagination];

        this.data.loop       = this.data.loop     === false ? false : true;
        this.data.autoPlay   = this.data.autoPlay === false ? false : true;
        this.data.slideTime  = this.data.slideTime      || 3000;
        this.data.onSlideLoad= this.data.onSlideLoad    || function(){};
        this.data.tabberButtons= this.data.tabberButtons    || [];
        this.data.animation= this.data.animation    || null;
        this.data.slidesPerView= this.data.slidesPerView    || null;

        this.logic.swipeView = {
            container:  this.uid(),
            pagination: this.pagination,
            loop:       false,//this.data.loop,
            autoPlay:   this.data.autoPlay,
            slideTime:  this.data.slideTime,
            onSlideLoad: this.data.onSlideLoad,
            tabberButtons: this.data.tabberButtons,
            animation: this.data.animation,
            slidesPerView: this.data.slidesPerView,
            centeredSlides: this.data.centeredSlides
        };


    }


});
/**
 * Created by dvircn on 15/08/14.
 */
var CGallery = Class(CSlider,{
    $statics: {
        DEFAULT_DESIGN: {
        },
        DEFAULT_LOGIC: {
        }

    },

    constructor: function(values) {
        if (CUtils.isEmpty(values)) return;
        // Merge Defaults.
        CObject.mergeWithDefaults(values,CGallery);

        this.data = values.data || {};
        this.data.childs = values.data.childs || [];

        // Create Images.
        _.each(this.data.images,function(imageSrc){
            var imageId = CObjectsHandler.createObject('ZoomedImage',{
                data: {  src: [imageSrc] }
            });
            this.data.childs.push(imageId);
        },this);

        // Invoke parent's constructor
        CGallery.$super.call(this, values);

    }


});

/**
 * Created by dvircn on 06/08/14.
 */
/**
 * Created by dvircn on 06/08/14.
 */
/**
 * Created by dvircn on 06/08/14.
 */
/**
 * Created by dvircn on 16/08/14.
 */
var CTab = Class(CContainer,{
    $statics: {
        DEFAULT_DESIGN: {
            bgColor:{
                color: 'White'
            },
            width: '100%',
            height: '100%'
        },
        DEFAULT_LOGIC: {
        }

    },

    constructor: function(values) {
        if (CUtils.isEmpty(values)) return;
        // Merge Defaults.
        CObject.mergeWithDefaults(values,CTab);

        // Invoke parent's constructor
        CTab.$super.call(this, values);

        // Tab properties.
        this.data.onLoad  = this.data.onLoad  || function(){};
    }


});

/**
 * Created by dvircn on 15/08/14.
 */
var CTabber = Class(CContainer,{
    $statics: {
        DEFAULT_DESIGN: {
            classes: "",
            width: '100%',
            height: '100%',
            position: 'relative'
        },
        DEFAULT_LOGIC: {
        },
        moveToTab: function(tabButtonId,toSlide,swiperId) {
            // Get Tabs.
            var tabs = CSwiper.getSwiperButtons(swiperId);
            _.each(tabs,function(buttonId){
                // Remove hold mark.
                CTabber.removeHoldClass(buttonId);
            },CTabber);

            CTabber.addHoldClass(tabButtonId);

            if (!CUtils.isEmpty(toSlide))
                CSwiper.moveSwiperToSlide(swiperId,toSlide);

            // Move buttons.
            // Get Tabber.
            var tabber = CObjectsHandler.object(CObjectsHandler.object(swiperId).parent);
            var slider = CObjectsHandler.object(CObjectsHandler.object(swiperId).parent);
            // Check if tabber
            if (CUtils.isEmpty(tabber.tabberButtonsSlider))
                return;
            var currentIndex    = CSwiper.getSwiperCurrentSlide(swiperId);
            //var beforeIndex     = CSwiper.getSwiperPreviousSlide(swiperId);
            //var perView         = tabber.data.buttons.perView;

            CSwiper.moveSwiperToSlide(tabber.tabberButtonsSlider,currentIndex);
        },
        addHoldClass: function(tabButtonId) {
            if (CUtils.isEmpty(tabButtonId))    return;

            var holdClass = CDesign.designToClasses(CObjectsHandler.object(tabButtonId).getDesign().hold);
            if (!CUtils.isEmpty(holdClass))
                CUtils.addClass(CUtils.element(tabButtonId),holdClass);
        },
        removeHoldClass: function(tabButtonId) {
            if (CUtils.isEmpty(tabButtonId))    return;

            var holdClass = CDesign.designToClasses(CObjectsHandler.object(tabButtonId).getDesign().hold);
            if (!CUtils.isEmpty(holdClass))
                CUtils.removeClass(CUtils.element(tabButtonId),holdClass);
        }

    },

    constructor: function(values) {
        if (CUtils.isEmpty(values)) return;
        // Merge Defaults.
        CObject.mergeWithDefaults(values,CTabber);

        // Invoke parent's constructor
        CTabber.$super.call(this, values);

        // Get and set default data.
        this.data.childs                 = this.data.childs                  || [];
        this.data.tabs                   = this.data.tabs                    || [];
        // Currently not used.
        this.data.animation              = this.data.animation               || '';
        this.data.loop                   = this.data.loop                    || false;
        this.data.onLoads                = this.data.onLoads                 || [];
        this.data.buttons                = this.data.buttons                 || {};
        this.data.buttons.texts          = this.data.buttons.texts           || [];
        this.data.buttons.icons          = this.data.buttons.icons           || [];
        this.data.buttons.iconsAlign     = this.data.buttons.iconsAlign      || 'left';
        this.data.buttons.design         = this.data.buttons.design          || {};
        this.data.buttons.height         = this.data.buttons.height          || 45;
        this.data.buttons.perView        = this.data.buttons.perView ||
                                            Math.max(this.data.buttons.texts.length,this.data.buttons.icons.length);
        this.buttonsIds                  = this.buttonsIds              || [];
        this.tabberButtonsSlider               = null;
        this.tabsSlider                  = null;

        this.prepareFinalButtonDesign();
        this.createButtons();
        this.createButtonsSlider();
        this.createTabsSlider();
    },
    prepareFinalButtonDesign: function () {
        var design              = CUtils.clone(this.data.buttons.design);
        design.width	        = '100%';
        design.height	        = this.data.buttons.height || design.height          ||  'auto';
        design.boxSizing	    = design.boxSizing       ||  'borderBox';
        design.fontSize	        = design.fontSize        || 17;
        design.fontStyle	    = design.fontStyle       ||  ['bold'];
        design.textAlign	    = design.textAlign       ||  this.data.contentAlign;

        this.data.buttons.finalDesign = design;
    },
    createOnLoad: function(tabs){
        return function(index){
            if (index >= tabs.length)
                return;
            var tab         = CObjectsHandler.object(tabs[index]);
            var callback    = tab.data.onLoad || function() {};
            callback();

        };
    },
    createTabsSlider: function () {
        this.tabsSlider = CObjectsHandler.createObject('Slider', {
            data: {
                onSlideLoad:    this.createOnLoad(this.data.tabs),
                childs:         this.data.tabs,
                animation:      this.data.animation,
                loop:           this.data.loop,
                autoPlay:       false,
                tabberButtons:  this.buttonsIds
            },
            design:{
                width: '100%',
                height: null,
                position: 'absolute',
                top: this.data.buttons.height || this.data.buttons.design.height,
                bottom: 0,
                widthSM: null,
                widthXS: null
            }
        });

        this.appendChild(this.tabsSlider);
    },
    createButtonsSlider: function () {
        this.tabberButtonsSlider = CObjectsHandler.createObject('Slider', {
            data: {
                childs:         this.buttonsIds,
                loop:           false,
                autoPlay:       false,
                slidesPerView:  this.data.buttons.perView
            },
            design:{
                width: '100%',
                height: 'auto',
                widthSM: null,
                widthXS: null
            }
        });

        this.appendChild(this.tabberButtonsSlider);
    },
    createButtons: function(){
        var list            = this.data.buttons.texts,
            iconsList       = this.data.buttons.icons,
            iconsAlign      = this.data.buttons.iconsAlign;

        // Allow create icon only list.
        while (list.length < iconsList.length){
            list.push('');
        }

        for (var i=0;i<list.length;i++) {
            var index           = i;
            var text            = list[index] || '';
            var icon            = index < iconsList.length ? iconsList[index] : '';
            var design          = CUtils.clone(this.data.buttons.finalDesign);

            this.createTabButton(icon, text, iconsAlign, design);
        }

    },
    createTabButton: function (icon, text, iconsAlign, design) {
        // Set up icon align
        if (!CUtils.isEmpty(icon)) {
            var iconDesign = 'iconOnly';
            if (!CUtils.isEmpty(text)) {
                if (iconsAlign == 'left')
                    iconDesign = 'iconLeft';
                if (iconsAlign == 'right')
                    iconDesign = 'iconRight';
            }
            design[iconDesign] = icon;
        }

        this.buttonsIds.push(CObjectsHandler.createObject('Button', {
            design: design,
            logic: {
                text: text
            }
        }));
    }


});

/**
 * Created by dvircn on 12/08/14.
 */
var CForm = Class(CContainer,{
    $statics: {
        DEFAULT_DESIGN: {
            marginRight:1,
            marginLeft:1,
            marginTop:1,
            margin: 'centered',
            textAlign: 'center'
        },
        DEFAULT_LOGIC: {
        }
    },

    constructor: function(values) {
        if (CUtils.isEmpty(values)) return;
        // Merge Defaults.
        CObject.mergeWithDefaults(values,CForm);

        // Invoke parent's constructor
        this.$class.$super.call(this, values);
        this.data.inputs            = values.data.inputs || [];
        this.data.saveToUrl         = values.data.saveToUrl || '';
        this.data.saveToUrlCallback = values.data.saveToUrlCallback || function(){};
        this.data.onSubmit          = values.data.onSubmit ||  function(){};
    },
    formValues: function() {
        var values = {};
        try {
            _.each(this.data.inputs,function(inputId){
                var input = CObjectsHandler.object(inputId);
                var name = input.getName();
                var value = input.value();
                var validators = input.getValidators();

                _.each(validators,function(name){
                    var validationResult = CValidators.validator(name).validate(value);
                    // Validation Failed!
                    if (!validationResult.isValid()){
                        CDialog.showDialog({
                            title: validationResult.getTitle(),
                            textContent: validationResult.getMessage(),
                            cancelText: 'OK',
                            dialogColor: {color:'Red', level: 4}
                        });
                        throw "Error"; // Return empty result.
                    }
                },this);
                // Add value to result values.
                values[name] = value;
            },this);
        } catch (e){
            return null;
        }
        return values;
    },
    clearForm: function() {
        // Clear each input.
        _.each(this.data.inputs,function(inputId){
            CObjectsHandler.object(inputId).clear();
        },this);
    },
    addInput: function(inputId) {
        this.data.inputs.push(inputId);
    },
    submitForm: function() {
        // Retrieve the values from the form.
        var values = this.formValues();
        // Check if the was validation error.
        if (values == null)     return;
        // Run onSubmit with the values.
        this.data.onSubmit(values);
    },
    sendFormToUrl: function() {
        // Retrieve the values from the form.
        var values = this.formValues();
        // Check if the was validation error.
        if (values == null)     return;
        // Run send with the values.
        CNetwork.send(this.data.saveToUrl,values,this.data.saveToUrlCallback);
    },
    saveFormToLocalStorage: function() {
        // Retrieve the values from the form.
        var values = this.formValues();
        // Check if the was validation error.
        if (values == null)     return;
        // save each value to the local storage.
        _.each(values,function(value,key){
            CLocalStorage.save(key,value);
        },this);
    }

});


/**
 * Created by dvircn on 12/08/14.
 */
/**
 * Created by dvircn on 12/08/14.
 */
var CInput = Class(CObject,{
    $statics: {
        DEFAULT_DESIGN: {
            height:35,
            marginRight:1,
            marginLeft:1,
            marginTop:1,
            padding: 2,
            fontSize:16,
            fontStyle:['bold'],
            round: 2
        },
        DEFAULT_LOGIC: {
        }
    },

    constructor: function(values) {
        if (CUtils.isEmpty(values)) return;
        // Merge Defaults.
        CObject.mergeWithDefaults(values,CInput);

        // Invoke parent's constructor
        this.$class.$super.call(this, values);
        this.data.name               = values.data.name          || '';
        this.data.required           = values.data.required      || false;
        this.data.validators         = values.data.validators    || [];
        this.data.prepares           = values.data.prepares      || [];

        if (this.data.required)
            this.data.validators.unshift('notEmpty');
    },
    /**
     *  Build Object.
     */
    prepareBuild: function(data){
        // Prepare this element - wrap it's children.
        return CInput.$superp.prepareBuild.call(this,{
            tag: 'input',
            tagHasInner: false
        });
    },
    value: function() {
        var value = CUtils.element(this.uid()).value;
        _.each(this.data.prepares,function(prepareFunctionId){
            CPrepareFunctions.prepareFunction(prepareFunctionId).prepare(value);
        },this);
        return value;
    },
    setValue: function(value){
        CUtils.element(this.uid()).value = value;
        CUtils.element(this.uid()).setAttribute('value',value);
    },
    clear: function() {
        CUtils.element(this.uid()).value = '';
        CUtils.element(this.uid()).setAttribute('value','');
    },
    getName: function(){
        return this.data.name;
    },
    getValidators: function(){
        return this.data.validators;
    }

});


/**
 * Created by dvircn on 12/08/14.
 */
/**
 * Created by dvircn on 12/08/14.
 */
var CInputEmail = Class(CInput,{
    $statics: {
        DEFAULT_DESIGN: {
        },
        DEFAULT_LOGIC: {
        }
    },

    constructor: function(values) {
        if (CUtils.isEmpty(values)) return;
        // Merge Defaults.
        CObject.mergeWithDefaults(values,CForm);

        values.prepares = values.prepares || [];
        values.prepares.push('email');
        // Invoke parent's constructor
        this.$class.$super.call(this, values);
    }

});


/**
 * Created by dvircn on 06/08/14.
 */
var Caf = Class({
    constructor: function() {
    },
    init: function(objects){
        var startLoadObjects = (new  Date()).getTime();
        CObjectsHandler.loadObjects(objects);
        var endLoadObjects  = (new  Date()).getTime();

        var startBuildAll = (new  Date()).getTime();

        CBuilder.buildAll();
        var endBuildAll = (new  Date()).getTime();
        CLog.dlog('Load Objects Time     : '+(endLoadObjects-startLoadObjects)+' Milliseconds.');
        CLog.dlog('Build Time            : '+(endBuildAll-startBuildAll)+' Milliseconds.');
        CLog.dlog('Total Initialize Time : '+(endBuildAll-startLoadObjects)+' Milliseconds.');

        CPager.initialize();
    }

});

/**
 * Created by dvircn on 13/08/14.
 */
var CBuilderObject = Class({
    $statics: {

    },

    constructor: function(type,uname) {
        this.properties         = {};
        this.properties.type    = type   || 'Object';
        if (!CUtils.isEmpty(uname))
            this.properties.uname   = uname  || '';
        this.properties.data    = {};
        this.properties.design    = {};
        this.properties.logic    = {};
    },
    build: function(){
        return this.properties;
    },
    initTemplate: function(){
        this.properties.data.template   = this.properties.data.template || {};
        this.properties.logic.template  = true;
    },
    childs: function(childs){
        this.properties.data.childs    = childs;
        return this;
    },
    page: function(name,title,onLoad){
        this.properties.data.page =
                { name: name || '', title: title || '', onLoad: onLoad || function() {} };
        this.properties.logic.page = true;
        return this;
    },
    sideMenuLeftContainer: function(leftContainer) {
        this.properties.data.leftContainer = leftContainer;
        return this;
    },
    sideMenuRightContainer: function(rightContainer) {
        this.properties.data.rightContainer = rightContainer;
        return this;
    },
    headerLeft: function(left) {
        this.properties.data.left = left;
        return this;
    },
    headerRight: function(right) {
        this.properties.data.right = right;
        return this;
    },
    text: function(text) {
        this.properties.logic.text = text;
        return this;
    },
    template: function(url,autoLoad,queryData){
        this.initTemplate();
        this.properties.data.template = {
            url:        url         || null,
            autoLoad:   autoLoad    || null,
            queryData:  queryData   || null
        };
        return this;
    },
    templateObjects: function(objects) {
        this.initTemplate();
        this.properties.data.template.objects = objects;
        return this;
    },
    templateObject: function(object) {
        this.initTemplate();
        this.properties.data.template.object = object;
        return this;
    },
    templateData: function(data) {
        this.initTemplate();
        this.properties.data.template.data = data;
        return this;
    },
    templateItemOnClick: function(onClick) {
        this.initTemplate();
        this.properties.data.template.callback = onClick;
        return this;
    },
    templateItemOnClicks: function(onClicks) {
        this.initTemplate();
        this.properties.data.template.callbacks = onClicks;
        return this;
    },
    reloadDynamicButton: function(object,reset,queryData,onFinish){
        this.properties.logic.buttonReloadDynamic = {
            object:     object          || null,
            reset:      reset           || null,
            onFinish:   onFinish        || null,
            queryData:  queryData       || null
        }
        return this;
    },
    formInputs: function(inputsIds) {
        this.properties.data.inputs = inputsIds || null;
        return this;
    },
    formSaveToUrl: function(url) {
        this.properties.data.saveToUrl = url || null;
        return this;
    },
    formSaveToUrlCallback: function(callback) {
        this.properties.data.saveToUrlCallback = callback || null;
        return this;
    },
    formOnSubmit: function(onSubmit) {
        this.properties.data.onSubmit = onSubmit || null;
        return this;
    },
    formInputs: function(inputsIds) {
        this.properties.data.inputs= inputsIds || [];
        return this;
    },
    inputName: function(name) {
        this.properties.data.name = name || null;
        return this;
    },
    inputRequired: function() {
        this.properties.data.required = true;
        return this;
    },
    inputNotRequired: function() {
        this.properties.data.required = false;
        return this;
    },
    formLoadInputFromStorage: function() {
        this.properties.logic.loadInputFromStorage = true;
        return this;
    },
    formNotLoadInputFromStorage: function() {
        this.properties.logic.loadInputFromStorage = false;
        return this;
    },
    formClearButton: function(formName) {
        this.properties.logic.formClearButton = formName;
        return this;
    },
    formSaveToLocalStorageButton: function(formName) {
        this.properties.logic.formSaveToLocalStorageButton = formName;
        return this;
    },
    formSendToUrlButton: function(formName) {
        this.properties.logic.formSendToUrlButton = formName;
        return this;
    },
    formSubmitButton: function(formName) {
        this.properties.logic.formSubmitButton = formName;
        return this;
    },
    dialogSwitch: function(dialogId) {
        this.properties.logic.dialogSwitch = dialogId;
        return this;
    },
    swipeNext: function(swiperId) {
        this.properties.logic.swipeNext = swiperId;
        return this;
    },
    swipePrev: function(swiperId) {
        this.properties.logic.swipePrev = swiperId;
        return this;
    },
    sideMenuSwitch: function(side) {
        this.properties.logic.sideMenuSwitch = side;
        return this;
    },
    backButton: function() {
        this.properties.logic.backButton = true;
        return this;
    },
    galleryImages: function(images) {
        this.properties.data.images = images;
        return this;
    },
    sliderPagination: function() {
        this.properties.data.pagination = true;
        return this;
    },
    sliderAutoPlay: function() {
        this.properties.data.autoPlay = true;
        return this;
    },
    sliderNotAutoPlay: function() {
        this.properties.data.autoPlay = false;
        return this;
    },
    sliderSlideTime: function(slideTime) {
        this.properties.data.slideTime = slideTime || null;
        return this;
    },
    sliderOnSlideLoad: function(onSlideLoad) {
        this.properties.data.slideTime = onSlideLoad || function(slideIndex){};
        return this;
    },
    sliderSlidesPerView: function(slidesPerView) {
        this.properties.data.slidesPerView = slidesPerView || null;
        return this;
    },
    tabberTabs: function(tabs) {
        this.properties.data.tabs = tabs || null;
        return this;
    },
    tabberLoop: function() {
        this.properties.data.loop = true;
        return this;
    },
    tabberOnLoads: function(onLoads) {
        this.properties.data.onLoads = onLoads || null;
        return this;
    },
    tabberButtonsTexts: function(texts) {
        this.properties.data.buttons = this.properties.data.buttons || {};
        this.properties.data.buttons.texts = texts || null;
        return this;
    },
    tabberButtonsIcons: function(icons,align) {
        this.properties.data.buttons    = this.properties.data.buttons || {};
        this.properties.data.buttons.icons      = icons || null;
        this.properties.data.buttons.iconsAlign = align || null;
        return this;
    },
    tabberButtonsDesign: function(design) {
        this.properties.data.buttons = this.properties.data.buttons || {};
        this.properties.data.buttons.design = design || null;
        return this;
    },
    tabberButtonsHeight: function(height) {
        this.properties.data.buttons = this.properties.data.buttons || {};
        this.properties.data.buttons.height = height || null;
        return this;
    },
    tabberButtonsPerView: function(perView) {
        this.properties.data.buttons = this.properties.data.buttons || {};
        this.properties.data.buttons.perView = perView || null;
        return this;
    },
    onClick: function(onClickHandler) {
        this.properties.logic.onClick = onClickHandler;
        return this;
    },
    link: function(path,data) {
        this.properties.logic.link = {
            path:   path || null,
            data:  data || null
        };
        return this;
    },
    icon: function(name,size,align,color) {
        this.properties.logic.icon = {
            name:   name || null,
            size:   size || null,
            align:  align || null,
            color: color || null
        };
        return this;
    },
    iconLeft: function(name,size,color) {
        this.properties.logic.iconLeft = {
            name:   name || null,
            size:   size || null,
            color: color || null
        };
        return this;
    },
    iconRight: function(name,size,color) {
        this.properties.logic.iconRight = {
            name:   name || null,
            size:   size || null,
            color: color || null
        };
        return this;
    },
    showDialog: function(data,design) {
        this.properties.logic.showDialog = {
            data: data || {},
            design: design || {}
        };
        return this;
    },
    data: function(data){
        this.properties.data    = data;
        return this;
    },
    design: function(design,weakerDesign){
        if (!CUtils.isEmpty(weakerDesign))
            design = CUtils.mergeJSONs(weakerDesign,design);

        this.properties.design  = design;
        return this;
    },
    logic: function(logic){
        this.properties.logic   = logic;
        return this;
    }


});


window.co = function(type,uname){
    var objectBuilder = new CBuilderObject(type || '',uname || '');
    return objectBuilder;
};

/**
 * Created by dvircn on 13/08/14.
 */
var CBuilderObjects = Class({
    $statics: {

    },

    constructor: function() {
        this.objects = [];
        this.designs = {};
        this.datas = {};
    },
    addDesign: function(name,design){
        this.designs[name] = design;
    },
    getDesign: function(name){
        return this.designs[name];
    },
    addData: function(name,data){
        this.datas[name] = data;
    },
    getData: function(name){
        return this.datas[name];
    },
    build: function(){
        var builtObjects = [];
        _.each(this.objects,function(objectBuilder){
            builtObjects.push(objectBuilder.build());
        });
        return builtObjects;
    },
    create: function(type,uname){
        var objectBuilder = new CBuilderObject(type || '',uname || '');
        this.objects.push(objectBuilder);
        return objectBuilder;
    }


});

/* Overthrow */
var doc=this.document,docElem=doc.documentElement,enabledClassName="overthrow-enabled",canBeFilledWithPoly="ontouchmove" in doc,nativeOverflow="WebkitOverflowScrolling" in docElem.style||"msOverflowStyle" in docElem.style||(!canBeFilledWithPoly&&this.screen.width>800)||(function(){var b=this.navigator.userAgent,a=b.match(/AppleWebKit\/([0-9]+)/),d=a&&a[1],c=a&&d>=534;return(b.match(/Android ([0-9]+)/)&&RegExp.$1>=3&&c||b.match(/ Version\/([0-9]+)/)&&RegExp.$1>=0&&this.blackberry&&c||b.indexOf("PlayBook")>-1&&c&&!b.indexOf("Android 2")===-1||b.match(/Firefox\/([0-9]+)/)&&RegExp.$1>=4||b.match(/wOSBrowser\/([0-9]+)/)&&RegExp.$1>=233&&c||b.match(/NokiaBrowser\/([0-9\.]+)/)&&parseFloat(RegExp.$1)===7.3&&a&&d>=533)})();window.overthrow={};window.overthrow.enabledClassName=enabledClassName;window.overthrow.addClass=function(){if(docElem.className.indexOf(window.overthrow.enabledClassName)===-1){docElem.className+=" "+window.overthrow.enabledClassName}};window.overthrow.removeClass=function(){docElem.className=docElem.className.replace(window.overthrow.enabledClassName,"")};window.overthrow.set=function(){if(nativeOverflow){window.overthrow.addClass()}};window.overthrow.canBeFilledWithPoly=canBeFilledWithPoly;window.overthrow.forget=function(){window.overthrow.removeClass()};window.overthrow.support=nativeOverflow?"native":"none";window.overthrow.scrollIndicatorClassName="overthrow";var doc=this.document,docElem=doc.documentElement,nativeOverflow=window.overthrow.support==="native",canBeFilledWithPoly=window.overthrow.canBeFilledWithPoly,configure=window.overthrow.configure,set=window.overthrow.set,forget=window.overthrow.forget,scrollIndicatorClassName=window.overthrow.scrollIndicatorClassName;window.overthrow.closest=function(b,a){return !a&&b.className&&b.className.indexOf(scrollIndicatorClassName)>-1&&b||window.overthrow.closest(b.parentNode)};var enabled=false;window.overthrow.set=function(){set();if(enabled||nativeOverflow||!canBeFilledWithPoly){return}window.overthrow.addClass();enabled=true;window.overthrow.support="polyfilled";window.overthrow.forget=function(){forget();enabled=false;if(doc.removeEventListener){doc.removeEventListener("touchstart",b,false)}};var d,h=[],a=[],g,j,i=function(){h=[];g=null},e=function(){a=[];j=null},f,c=function(n){f=d.querySelectorAll("textarea, input");for(var m=0,l=f.length;m<l;m++){f[m].style.pointerEvents=n}},k=function(m,n){if(doc.createEvent){var o=(!n||n===undefined)&&d.parentNode||d.touchchild||d,l;if(o!==d){l=doc.createEvent("HTMLEvents");l.initEvent("touchend",true,true);d.dispatchEvent(l);o.touchchild=d;d=o;o.dispatchEvent(m)}}},b=function(t){if(window.overthrow.intercept){window.overthrow.intercept()}i();e();d=window.overthrow.closest(t.target);if(!d||d===docElem||t.touches.length>1){return}c("none");var u=t,l=d.scrollTop,p=d.scrollLeft,v=d.offsetHeight,m=d.offsetWidth,q=t.touches[0].pageY,s=t.touches[0].pageX,w=d.scrollHeight,r=d.scrollWidth,n=function(A){var x=l+q-A.touches[0].pageY,y=p+s-A.touches[0].pageX,B=x>=(h.length?h[0]:0),z=y>=(a.length?a[0]:0);if((x>0&&x<w-v)||(y>0&&y<r-m)){A.preventDefault()}else{k(u)}if(g&&B!==g){i()}if(j&&z!==j){e()}g=B;j=z;d.scrollTop=x;d.scrollLeft=y;h.unshift(x);a.unshift(y);if(h.length>3){h.pop()}if(a.length>3){a.pop()}},o=function(x){c("auto");setTimeout(function(){c("none")},450);d.removeEventListener("touchmove",n,false);d.removeEventListener("touchend",o,false)};d.addEventListener("touchmove",n,false);d.addEventListener("touchend",o,false)};doc.addEventListener("touchstart",b,false)};window.overthrow.set();
/* Placeholders.js v3.0.2 */
(function(t){"use strict";function e(t,e,r){return t.addEventListener?t.addEventListener(e,r,!1):t.attachEvent?t.attachEvent("on"+e,r):void 0}function r(t,e){var r,n;for(r=0,n=t.length;n>r;r++)if(t[r]===e)return!0;return!1}function n(t,e){var r;t.createTextRange?(r=t.createTextRange(),r.move("character",e),r.select()):t.selectionStart&&(t.focus(),t.setSelectionRange(e,e))}function a(t,e){try{return t.type=e,!0}catch(r){return!1}}t.Placeholders={Utils:{addEventListener:e,inArray:r,moveCaret:n,changeType:a}}})(this),function(t){"use strict";function e(){}function r(){try{return document.activeElement}catch(t){}}function n(t,e){var r,n,a=!!e&&t.value!==e,u=t.value===t.getAttribute(V);return(a||u)&&"true"===t.getAttribute(D)?(t.removeAttribute(D),t.value=t.value.replace(t.getAttribute(V),""),t.className=t.className.replace(R,""),n=t.getAttribute(F),parseInt(n,10)>=0&&(t.setAttribute("maxLength",n),t.removeAttribute(F)),r=t.getAttribute(P),r&&(t.type=r),!0):!1}function a(t){var e,r,n=t.getAttribute(V);return""===t.value&&n?(t.setAttribute(D,"true"),t.value=n,t.className+=" "+I,r=t.getAttribute(F),r||(t.setAttribute(F,t.maxLength),t.removeAttribute("maxLength")),e=t.getAttribute(P),e?t.type="text":"password"===t.type&&M.changeType(t,"text")&&t.setAttribute(P,"password"),!0):!1}function u(t,e){var r,n,a,u,i,l,o;if(t&&t.getAttribute(V))e(t);else for(a=t?t.getElementsByTagName("input"):b,u=t?t.getElementsByTagName("textarea"):f,r=a?a.length:0,n=u?u.length:0,o=0,l=r+n;l>o;o++)i=r>o?a[o]:u[o-r],e(i)}function i(t){u(t,n)}function l(t){u(t,a)}function o(t){return function(){m&&t.value===t.getAttribute(V)&&"true"===t.getAttribute(D)?M.moveCaret(t,0):n(t)}}function c(t){return function(){a(t)}}function s(t){return function(e){return A=t.value,"true"===t.getAttribute(D)&&A===t.getAttribute(V)&&M.inArray(C,e.keyCode)?(e.preventDefault&&e.preventDefault(),!1):void 0}}function d(t){return function(){n(t,A),""===t.value&&(t.blur(),M.moveCaret(t,0))}}function g(t){return function(){t===r()&&t.value===t.getAttribute(V)&&"true"===t.getAttribute(D)&&M.moveCaret(t,0)}}function v(t){return function(){i(t)}}function p(t){t.form&&(T=t.form,"string"==typeof T&&(T=document.getElementById(T)),T.getAttribute(U)||(M.addEventListener(T,"submit",v(T)),T.setAttribute(U,"true"))),M.addEventListener(t,"focus",o(t)),M.addEventListener(t,"blur",c(t)),m&&(M.addEventListener(t,"keydown",s(t)),M.addEventListener(t,"keyup",d(t)),M.addEventListener(t,"click",g(t))),t.setAttribute(j,"true"),t.setAttribute(V,x),(m||t!==r())&&a(t)}var b,f,m,h,A,y,E,x,L,T,N,S,w,B=["text","search","url","tel","email","password","number","textarea"],C=[27,33,34,35,36,37,38,39,40,8,46],k="#ccc",I="placeholdersjs",R=RegExp("(?:^|\\s)"+I+"(?!\\S)"),V="data-placeholder-value",D="data-placeholder-active",P="data-placeholder-type",U="data-placeholder-submit",j="data-placeholder-bound",q="data-placeholder-focus",z="data-placeholder-live",F="data-placeholder-maxlength",G=document.createElement("input"),H=document.getElementsByTagName("head")[0],J=document.documentElement,K=t.Placeholders,M=K.Utils;if(K.nativeSupport=void 0!==G.placeholder,!K.nativeSupport){for(b=document.getElementsByTagName("input"),f=document.getElementsByTagName("textarea"),m="false"===J.getAttribute(q),h="false"!==J.getAttribute(z),y=document.createElement("style"),y.type="text/css",E=document.createTextNode("."+I+" { color:"+k+"; }"),y.styleSheet?y.styleSheet.cssText=E.nodeValue:y.appendChild(E),H.insertBefore(y,H.firstChild),w=0,S=b.length+f.length;S>w;w++)N=b.length>w?b[w]:f[w-b.length],x=N.attributes.placeholder,x&&(x=x.nodeValue,x&&M.inArray(B,N.type)&&p(N));L=setInterval(function(){for(w=0,S=b.length+f.length;S>w;w++)N=b.length>w?b[w]:f[w-b.length],x=N.attributes.placeholder,x?(x=x.nodeValue,x&&M.inArray(B,N.type)&&(N.getAttribute(j)||p(N),(x!==N.getAttribute(V)||"password"===N.type&&!N.getAttribute(P))&&("password"===N.type&&!N.getAttribute(P)&&M.changeType(N,"text")&&N.setAttribute(P,"password"),N.value===N.getAttribute(V)&&(N.value=x),N.setAttribute(V,x)))):N.getAttribute(D)&&(n(N),N.removeAttribute(V));h||clearInterval(L)},100)}M.addEventListener(t,"beforeunload",function(){K.disable()}),K.disable=K.nativeSupport?e:i,K.enable=K.nativeSupport?e:l}(this);
/*
 * Snap.js
 *
 * Copyright 2013, Jacob Kelley - http://jakiestfu.com/
 * Released under the MIT Licence
 * http://opensource.org/licenses/MIT
 *
 * Github:  http://github.com/jakiestfu/Snap.js/
 * Version: 1.9.3
 */
/*jslint browser: true*/
/*global define, module, ender*/
(function(win, doc) {
    'use strict';
    var Snap = Snap || function(userOpts) {
        var settings = {
            element: null,
            dragger: null,
            disable: 'none',
            addBodyClasses: true,
            hyperextensible: true,
            resistance: 0.5,
            flickThreshold: 50,
            transitionSpeed: 0.3,
            easing: 'ease',
            maxPosition: 266,
            minPosition: -266,
            tapToClose: true,
            touchToDrag: true,
            slideIntent: 40, // degrees
            minDragDistance: 5
        },
        cache = {
            simpleStates: {
                opening: null,
                towards: null,
                hyperExtending: null,
                halfway: null,
                flick: null,
                translation: {
                    absolute: 0,
                    relative: 0,
                    sinceDirectionChange: 0,
                    percentage: 0
                }
            }
        },
        eventList = {},
        utils = {
            hasTouch: CUtils.isTouchDevice(),//(window.Modernizr && Modernizr.touch === true),
            eventType: function(action) {
                var eventTypes = {
                        down: (utils.hasTouch ? 'touchstart' : 'mousedown'),
                        move: (utils.hasTouch ? 'touchmove' : 'mousemove'),
                        up: (utils.hasTouch ? 'touchend' : 'mouseup'),
                        out: (utils.hasTouch ? 'touchcancel' : 'mouseout')
                    };
                return eventTypes[action];
            },
            page: function(t, e){
                return (utils.hasTouch && e.touches && e.touches.length && e.touches[0]) ? e.touches[0]['page'+t] : e['page'+t];
            },
            klass: {
                has: function(el, name){
                    return (el.className).indexOf(name) !== -1;
                },
                add: function(el, name){
                    if(!utils.klass.has(el, name) && settings.addBodyClasses){
                        el.className += " "+name;
                    }
                },
                remove: function(el, name){
                    if(settings.addBodyClasses){
                        el.className = (el.className).replace(name, "").replace(/^\s+|\s+$/g, '');
                    }
                }
            },
            dispatchEvent: function(type) {
                if (typeof eventList[type] === 'function') {
                    return eventList[type].call();
                }
            },
            vendor: function(){
                var tmp = doc.createElement("div"),
                    prefixes = 'webkit Moz O ms'.split(' '),
                    i;
                for (i in prefixes) {
                    if (typeof tmp.style[prefixes[i] + 'Transition'] !== 'undefined') {
                        return prefixes[i];
                    }
                }
            },
            transitionCallback: function(){
                return (cache.vendor==='Moz' || cache.vendor==='ms') ? 'transitionend' : cache.vendor+'TransitionEnd';
            },
            canTransform: function(){
                return typeof settings.element.style[cache.vendor+'Transform'] !== 'undefined';
            },
            deepExtend: function(destination, source) {
                var property;
                for (property in source) {
                    if (source[property] && source[property].constructor && source[property].constructor === Object) {
                        destination[property] = destination[property] || {};
                        utils.deepExtend(destination[property], source[property]);
                    } else {
                        destination[property] = source[property];
                    }
                }
                return destination;
            },
            angleOfDrag: function(x, y) {
                var degrees, theta;
                // Calc Theta
                theta = Math.atan2(-(cache.startDragY - y), (cache.startDragX - x));
                if (theta < 0) {
                    theta += 2 * Math.PI;
                }
                // Calc Degrees
                degrees = Math.floor(theta * (180 / Math.PI) - 180);
                if (degrees < 0 && degrees > -180) {
                    degrees = 360 - Math.abs(degrees);
                }
                return Math.abs(degrees);
            },
            events: {
                addEvent: function addEvent(element, eventName, func) {
                    if (element.addEventListener) {
                        return element.addEventListener(eventName, func, false);
                    } else if (element.attachEvent) {
                        return element.attachEvent("on" + eventName, func);
                    }
                },
                removeEvent: function addEvent(element, eventName, func) {
                    if (element.addEventListener) {
                        return element.removeEventListener(eventName, func, false);
                    } else if (element.attachEvent) {
                        return element.detachEvent("on" + eventName, func);
                    }
                },
                prevent: function(e) {
                    if (e.preventDefault) {
                        e.preventDefault();
                    } else {
                        e.returnValue = false;
                    }
                }
            },
            parentUntil: function(el, attr) {
                var isStr = typeof attr === 'string';
                while (el.parentNode) {
                    if (isStr && el.getAttribute && el.getAttribute(attr)){
                        return el;
                    } else if(!isStr && el === attr){
                        return el;
                    }
                    el = el.parentNode;
                }
                return null;
            }
        },
        action = {
            translate: {
                get: {
                    matrix: function(index) {

                        if( !utils.canTransform() ){
                            return parseInt(settings.element.style.left, 10);
                        } else {
                            var matrix = win.getComputedStyle(settings.element)[cache.vendor+'Transform'].match(/\((.*)\)/),
                                ieOffset = 8;
                            if (matrix && matrix!= undefined) {
                                matrix = matrix[1].split(',');
                                if(matrix.length===16){
                                    index+=ieOffset;
                                }
                                return parseInt(matrix[index], 10);
                            }
                            return 0;
                        }
                    }
                },
                easeCallback: function(){
                    settings.element.style[cache.vendor+'Transition'] = '';
                    cache.translation = action.translate.get.matrix(4);
                    cache.easing = false;
                    clearInterval(cache.animatingInterval);

                    if(cache.easingTo===0){
                        utils.klass.remove(doc.body, 'snapjs-right');
                        utils.klass.remove(doc.body, 'snapjs-left');
                    }

                    utils.dispatchEvent('animated');
                    utils.events.removeEvent(settings.element, utils.transitionCallback(), action.translate.easeCallback);
                },
                easeTo: function(n) {

                    if( !utils.canTransform() ){
                        cache.translation = n;
                        action.translate.x(n);
                    } else {
                        cache.easing = true;
                        cache.easingTo = n;

                        settings.element.style[cache.vendor+'Transition'] = 'all ' + settings.transitionSpeed + 's ' + settings.easing;

                        cache.animatingInterval = setInterval(function() {
                            utils.dispatchEvent('animating');
                        }, 1);
                        
                        utils.events.addEvent(settings.element, utils.transitionCallback(), action.translate.easeCallback);
                        action.translate.x(n);
                    }
                    if(n===0){
                           settings.element.style[cache.vendor+'Transform'] = '';
                       }
                },
                x: function(n) {
                    if( (settings.disable==='left' && n>0) ||
                        (settings.disable==='right' && n<0)
                    ){ return; }
                    
                    if( !settings.hyperextensible ){
                        if( n===settings.maxPosition || n>settings.maxPosition ){
                            n=settings.maxPosition;
                        } else if( n===settings.minPosition || n<settings.minPosition ){
                            n=settings.minPosition;
                        }
                    }
                    
                    n = parseInt(n, 10);
                    if(isNaN(n)){
                        n = 0;
                    }

                    if( utils.canTransform() ){
                        var theTranslate = 'translate3d(' + n + 'px, 0,0)';
                        settings.element.style[cache.vendor+'Transform'] = theTranslate;
                    } else {
                        settings.element.style.width = (win.innerWidth || doc.documentElement.clientWidth)+'px';

                        settings.element.style.left = n+'px';
                        settings.element.style.right = '';
                    }
                }
            },
            drag: {
                listen: function() {
                    cache.translation = 0;
                    cache.easing = false;
                    utils.events.addEvent(settings.element, utils.eventType('down'), action.drag.startDrag);
                    utils.events.addEvent(settings.element, utils.eventType('move'), action.drag.dragging);
                    utils.events.addEvent(settings.element, utils.eventType('up'), action.drag.endDrag);
                },
                stopListening: function() {
                    utils.events.removeEvent(settings.element, utils.eventType('down'), action.drag.startDrag);
                    utils.events.removeEvent(settings.element, utils.eventType('move'), action.drag.dragging);
                    utils.events.removeEvent(settings.element, utils.eventType('up'), action.drag.endDrag);
                },
                startDrag: function(e) {
                    // No drag on ignored elements
                    var target = e.target ? e.target : e.srcElement,
                        ignoreParent = utils.parentUntil(target, 'data-snap-ignore');
                    
                    if (ignoreParent) {
                        utils.dispatchEvent('ignore');
                        return;
                    }
                    
                    
                    if(settings.dragger){
                        var dragParent = utils.parentUntil(target, settings.dragger);
                        
                        // Only use dragger if we're in a closed state
                        if( !dragParent && 
                            (cache.translation !== settings.minPosition && 
                            cache.translation !== settings.maxPosition
                        )){
                            return;
                        }
                    }
                    
                    utils.dispatchEvent('start');
                    settings.element.style[cache.vendor+'Transition'] = '';
                    cache.isDragging = true;
                    cache.hasIntent = null;
                    cache.intentChecked = false;
                    cache.startDragX = utils.page('X', e);
                    cache.startDragY = utils.page('Y', e);
                    cache.dragWatchers = {
                        current: 0,
                        last: 0,
                        hold: 0,
                        state: ''
                    };
                    cache.simpleStates = {
                        opening: null,
                        towards: null,
                        hyperExtending: null,
                        halfway: null,
                        flick: null,
                        translation: {
                            absolute: 0,
                            relative: 0,
                            sinceDirectionChange: 0,
                            percentage: 0
                        }
                    };
                },
                dragging: function(e) {
                    if (cache.isDragging && settings.touchToDrag) {

                        var thePageX = utils.page('X', e),
                            thePageY = utils.page('Y', e),
                            translated = cache.translation,
                            absoluteTranslation = action.translate.get.matrix(4),
                            whileDragX = thePageX - cache.startDragX,
                            openingLeft = absoluteTranslation > 0,
                            translateTo = whileDragX,
                            diff;

                        // Shown no intent already
                        if((cache.intentChecked && !cache.hasIntent)){
                            return;
                        }

                        if(settings.addBodyClasses){
                            if((absoluteTranslation)>0){
                                utils.klass.add(doc.body, 'snapjs-left');
                                utils.klass.remove(doc.body, 'snapjs-right');
                            } else if((absoluteTranslation)<0){
                                utils.klass.add(doc.body, 'snapjs-right');
                                utils.klass.remove(doc.body, 'snapjs-left');
                            }
                        }

                        if (cache.hasIntent === false || cache.hasIntent === null) {
                            var deg = utils.angleOfDrag(thePageX, thePageY),
                                inRightRange = (deg >= 0 && deg <= settings.slideIntent) || (deg <= 360 && deg > (360 - settings.slideIntent)),
                                inLeftRange = (deg >= 180 && deg <= (180 + settings.slideIntent)) || (deg <= 180 && deg >= (180 - settings.slideIntent));
                            if (!inLeftRange && !inRightRange) {
                                cache.hasIntent = false;
                            } else {
                                cache.hasIntent = true;
                            }
                            cache.intentChecked = true;
                        }

                        if (
                            (settings.minDragDistance>=Math.abs(thePageX-cache.startDragX)) || // Has user met minimum drag distance?
                            (cache.hasIntent === false)
                        ) {
                            return;
                        }

                        utils.events.prevent(e);
                        utils.dispatchEvent('drag');

                        cache.dragWatchers.current = thePageX;
                        // Determine which direction we are going
                        if (cache.dragWatchers.last > thePageX) {
                            if (cache.dragWatchers.state !== 'left') {
                                cache.dragWatchers.state = 'left';
                                cache.dragWatchers.hold = thePageX;
                            }
                            cache.dragWatchers.last = thePageX;
                        } else if (cache.dragWatchers.last < thePageX) {
                            if (cache.dragWatchers.state !== 'right') {
                                cache.dragWatchers.state = 'right';
                                cache.dragWatchers.hold = thePageX;
                            }
                            cache.dragWatchers.last = thePageX;
                        }
                        if (openingLeft) {
                            // Pulling too far to the right
                            if (settings.maxPosition < absoluteTranslation) {
                                diff = (absoluteTranslation - settings.maxPosition) * settings.resistance;
                                translateTo = whileDragX - diff;
                            }
                            cache.simpleStates = {
                                opening: 'left',
                                towards: cache.dragWatchers.state,
                                hyperExtending: settings.maxPosition < absoluteTranslation,
                                halfway: absoluteTranslation > (settings.maxPosition / 2),
                                flick: Math.abs(cache.dragWatchers.current - cache.dragWatchers.hold) > settings.flickThreshold,
                                translation: {
                                    absolute: absoluteTranslation,
                                    relative: whileDragX,
                                    sinceDirectionChange: (cache.dragWatchers.current - cache.dragWatchers.hold),
                                    percentage: (absoluteTranslation/settings.maxPosition)*100
                                }
                            };
                        } else {
                            // Pulling too far to the left
                            if (settings.minPosition > absoluteTranslation) {
                                diff = (absoluteTranslation - settings.minPosition) * settings.resistance;
                                translateTo = whileDragX - diff;
                            }
                            cache.simpleStates = {
                                opening: 'right',
                                towards: cache.dragWatchers.state,
                                hyperExtending: settings.minPosition > absoluteTranslation,
                                halfway: absoluteTranslation < (settings.minPosition / 2),
                                flick: Math.abs(cache.dragWatchers.current - cache.dragWatchers.hold) > settings.flickThreshold,
                                translation: {
                                    absolute: absoluteTranslation,
                                    relative: whileDragX,
                                    sinceDirectionChange: (cache.dragWatchers.current - cache.dragWatchers.hold),
                                    percentage: (absoluteTranslation/settings.minPosition)*100
                                }
                            };
                        }
                        action.translate.x(translateTo + translated);
                    }
                },
                endDrag: function(e) {
                    if (cache.isDragging) {
                        utils.dispatchEvent('end');
                        var translated = action.translate.get.matrix(4);

                        // Tap Close
                        if (cache.dragWatchers.current === 0 && translated !== 0 && settings.tapToClose) {
                            utils.dispatchEvent('close');
                            utils.events.prevent(e);
                            action.translate.easeTo(0);
                            cache.isDragging = false;
                            cache.startDragX = 0;
                            return;
                        }

                        // Revealing Left
                        if (cache.simpleStates.opening === 'left') {
                            // Halfway, Flicking, or Too Far Out
                            if ((cache.simpleStates.halfway || cache.simpleStates.hyperExtending || cache.simpleStates.flick)) {
                                if (cache.simpleStates.flick && cache.simpleStates.towards === 'left') { // Flicking Closed
                                    action.translate.easeTo(0);
                                } else if (
                                    (cache.simpleStates.flick && cache.simpleStates.towards === 'right') || // Flicking Open OR
                                    (cache.simpleStates.halfway || cache.simpleStates.hyperExtending) // At least halfway open OR hyperextending
                                ) {
                                    action.translate.easeTo(settings.maxPosition); // Open Left
                                }
                            } else {
                                action.translate.easeTo(0); // Close Left
                            }
                            // Revealing Right
                        } else if (cache.simpleStates.opening === 'right') {
                            // Halfway, Flicking, or Too Far Out
                            if ((cache.simpleStates.halfway || cache.simpleStates.hyperExtending || cache.simpleStates.flick)) {
                                if (cache.simpleStates.flick && cache.simpleStates.towards === 'right') { // Flicking Closed
                                    action.translate.easeTo(0);
                                } else if (
                                    (cache.simpleStates.flick && cache.simpleStates.towards === 'left') || // Flicking Open OR
                                    (cache.simpleStates.halfway || cache.simpleStates.hyperExtending) // At least halfway open OR hyperextending
                                ) {
                                    action.translate.easeTo(settings.minPosition); // Open Right
                                }
                            } else {
                                action.translate.easeTo(0); // Close Right
                            }
                        }
                        cache.isDragging = false;
                        cache.startDragX = utils.page('X', e);
                    }
                }
            }
        },
        init = function(opts) {
            if (opts.element) {
                utils.deepExtend(settings, opts);
                cache.vendor = utils.vendor();
                action.drag.listen();
            }
        };
        /*
         * Public
         */
        this.open = function(side) {
            utils.dispatchEvent('open');
            utils.klass.remove(doc.body, 'snapjs-expand-left');
            utils.klass.remove(doc.body, 'snapjs-expand-right');

            if (side === 'left') {
                cache.simpleStates.opening = 'left';
                cache.simpleStates.towards = 'right';
                utils.klass.add(doc.body, 'snapjs-left');
                utils.klass.remove(doc.body, 'snapjs-right');
                action.translate.easeTo(settings.maxPosition);
            } else if (side === 'right') {
                cache.simpleStates.opening = 'right';
                cache.simpleStates.towards = 'left';
                utils.klass.remove(doc.body, 'snapjs-left');
                utils.klass.add(doc.body, 'snapjs-right');
                action.translate.easeTo(settings.minPosition);
            }
        };
        this.close = function() {
            utils.dispatchEvent('close');
            action.translate.easeTo(0);
        };
        this.expand = function(side){
            var to = win.innerWidth || doc.documentElement.clientWidth;

            if(side==='left'){
                utils.dispatchEvent('expandLeft');
                utils.klass.add(doc.body, 'snapjs-expand-left');
                utils.klass.remove(doc.body, 'snapjs-expand-right');
            } else {
                utils.dispatchEvent('expandRight');
                utils.klass.add(doc.body, 'snapjs-expand-right');
                utils.klass.remove(doc.body, 'snapjs-expand-left');
                to *= -1;
            }
            action.translate.easeTo(to);
        };

        this.on = function(evt, fn) {
            eventList[evt] = fn;
            return this;
        };
        this.off = function(evt) {
            if (eventList[evt]) {
                eventList[evt] = false;
            }
        };

        this.enable = function() {
            utils.dispatchEvent('enable');
            action.drag.listen();
        };
        this.disable = function() {
            utils.dispatchEvent('disable');
            action.drag.stopListening();
        };

        this.settings = function(opts){
            utils.deepExtend(settings, opts);
        };

        this.state = function() {
            var state,
                fromLeft = action.translate.get.matrix(4);
            if (fromLeft === settings.maxPosition) {
                state = 'left';
            } else if (fromLeft === settings.minPosition) {
                state = 'right';
            } else {
                state = 'closed';
            }
            return {
                state: state,
                info: cache.simpleStates
            };
        };
        init(userOpts);
    };
    if ((typeof module !== 'undefined') && module.exports) {
        module.exports = Snap;
    }
    if (typeof ender === 'undefined') {
        this.Snap = Snap;
    }
    if ((typeof define === "function") && define.amd) {
        define("snap", [], function() {
            return Snap;
        });
    }
}).call(this, window, document);

;(function(){

    /**
     * Perform initial dispatch.
     */

    var dispatch = true;

    /**
     * Base path.
     */

    var base = '';

    var location = history.location || window.location;

    /**
     * Running flag.
     */

    var running;

    /**
     * Register `path` with callback `fn()`,
     * or route `path`, or `page.start()`.
     *
     *   page(fn);
     *   page('*', fn);
     *   page('/user/:id', load, user);
     *   page('/user/' + user.id, { some: 'thing' });
     *   page('/user/' + user.id);
     *   page();
     *
     * @param {String|Function} path
     * @param {Function} fn...
     * @api public
     */

    function page(path, fn) {
        // <callback>
        if ('function' == typeof path) {
            return page('*', path);
        }

        // route <path> to <callback ...>
        if ('function' == typeof fn) {
            var route = new Route(path);
            for (var i = 1; i < arguments.length; ++i) {
                page.callbacks.push(route.middleware(arguments[i]));
            }
            // show <path> with [state]
        } else if ('string' == typeof path) {
            page.show(path, fn);
            // start [options]
        } else {
            page.start(path);
        }
    }

    /**
     * Callback functions.
     */

    page.callbacks = [];

    /**
     * Get or set basepath to `path`.
     *
     * @param {String} path
     * @api public
     */

    page.base = function(path){
        if (0 == arguments.length) return base;
        base = path;
    };

    /**
     * Bind with the given `options`.
     *
     * Options:
     *
     *    - `click` bind to click events [true]
     *    - `popstate` bind to popstate [true]
     *    - `dispatch` perform initial dispatch [true]
     *
     * @param {Object} options
     * @api public
     */

    page.start = function(options){
        options = options || {};
        if (running) return;
        running = true;
        if (false === options.dispatch) dispatch = false;
//        if (false !== options.popstate) window.addEventListener('popstate', onpopstate, false);
//        if (false !== options.click) window.addEventListener('click', onclick, false);
        if (false !== options.popstate) addEvent(window, 'popstate', onpopstate);
        if (false !== options.click) addEvent(document, 'click', onclick);
        if (!dispatch) return;
        var url = location.pathname + location.search + location.hash;
        page.replace(url, null, true, dispatch);
    };

    /**
     * Unbind click and popstate event handlers.
     *
     * @api public
     */

    page.stop = function(){
        running = false;
//        removeEventListener('click', onclick, false);
//        removeEventListener('popstate', onpopstate, false);
        removeEvent(document, 'click', onclick);
        removeEvent(window, 'popstate', onpopstate);
    };

    /**
     * Show `path` with optional `state` object.
     *
     * @param {String} path
     * @param {Object} state
     * @param {Boolean} dispatch
     * @return {Context}
     * @api public
     */

    page.show = function(path, state, dispatch){
        var ctx = new Context(path, state);
        if (false !== dispatch) page.dispatch(ctx);
        if (!ctx.unhandled) ctx.pushState();
        return ctx;
    };

    /**
     * Replace `path` with optional `state` object.
     *
     * @param {String} path
     * @param {Object} state
     * @return {Context}
     * @api public
     */

    page.replace = function(path, state, init, dispatch){
        var ctx = new Context(path, state);
        ctx.init = init;
        if (null == dispatch) dispatch = true;
        if (dispatch) page.dispatch(ctx);
        ctx.save();
        return ctx;
    };

    /**
     * Dispatch the given `ctx`.
     *
     * @param {Object} ctx
     * @api private
     */

    page.dispatch = function(ctx){
        var i = 0;

        function next() {
            var fn = page.callbacks[i++];
            if (!fn) return unhandled(ctx);
            fn(ctx, next);
        }

        next();
    };

    /**
     * Unhandled `ctx`. When it's not the initial
     * popstate then redirect. If you wish to handle
     * 404s on your own use `page('*', callback)`.
     *
     * @param {Context} ctx
     * @api private
     */

    function unhandled(ctx) {
//        var current = window.location.pathname + window.location.search;
//        if (current == ctx.canonicalPath) return;
        if (location.pathname + location.search == ctx.canonicalPath) return;
        page.stop();
        ctx.unhandled = true;
        window.location = ctx.canonicalPath;
    }

    /**
     * Initialize a new "request" `Context`
     * with the given `path` and optional initial `state`.
     *
     * @param {String} path
     * @param {Object} state
     * @api public
     */

    function Context(path, state) {
        if ('/' == path[0] && 0 != path.indexOf(base)) path = base + path;
        var i = path.indexOf('?');

        this.canonicalPath = path;
        this.path = path.replace(base, '') || '/';

        this.title = document.title;
        this.state = state || {};
        this.state.path = path;
        this.querystring = ~i ? path.slice(i + 1) : '';
        this.pathname = ~i ? path.slice(0, i) : path;
        this.params = [];

        // fragment
        this.hash = '';
        if (!~this.path.indexOf('#')) return;
        var parts = this.path.split('#');
        this.path = parts[0];
        this.hash = parts[1] || '';
        this.querystring = this.querystring.split('#')[0];
    }

    /**
     * Expose `Context`.
     */

    page.Context = Context;

    /**
     * Push state.
     *
     * @api private
     */

    Context.prototype.pushState = function(){
        history.pushState(this.state, this.title, this.canonicalPath);
    };

    /**
     * Save the context state.
     *
     * @api public
     */

    Context.prototype.save = function(){
        history.replaceState(this.state, this.title, this.canonicalPath);
    };

    /**
     * Initialize `Route` with the given HTTP `path`,
     * and an array of `callbacks` and `options`.
     *
     * Options:
     *
     *   - `sensitive`    enable case-sensitive routes
     *   - `strict`       enable strict matching for trailing slashes
     *
     * @param {String} path
     * @param {Object} options.
     * @api private
     */

    function Route(path, options) {
        options = options || {};
        this.path = path;
        this.method = 'GET';
        this.regexp = pathtoRegexp(path
            , this.keys = []
            , options.sensitive
            , options.strict);
    }

    /**
     * Expose `Route`.
     */

    page.Route = Route;

    /**
     * Return route middleware with
     * the given callback `fn()`.
     *
     * @param {Function} fn
     * @return {Function}
     * @api public
     */

    Route.prototype.middleware = function(fn){
        var self = this;
        return function(ctx, next){
            if (self.match(ctx.path, ctx.params)) return fn(ctx, next);
            next();
        };
    };

    /**
     * Check if this route matches `path`, if so
     * populate `params`.
     *
     * @param {String} path
     * @param {Array} params
     * @return {Boolean}
     * @api private
     */

    Route.prototype.match = function(path, params){
        var keys = this.keys
            , qsIndex = path.indexOf('?')
            , pathname = ~qsIndex ? path.slice(0, qsIndex) : path
            , m = this.regexp.exec(pathname);

        if (!m) return false;

        for (var i = 1, len = m.length; i < len; ++i) {
            var key = keys[i - 1];

            var val = 'string' == typeof m[i]
                ? decodeURIComponent(m[i])
                : m[i];

            if (key) {
                params[key.name] = undefined !== params[key.name]
                    ? params[key.name]
                    : val;
            }
            else if (val.indexOf('/')>=0){
                params.push.apply(params,val.split('/'));
            }
            else {
                params.push(val);
            }
        }

        return true;
    };

    /**
     * Normalize the given path string,
     * returning a regular expression.
     *
     * An empty array should be passed,
     * which will contain the placeholder
     * key names. For example "/user/:id" will
     * then contain ["id"].
     *
     * @param  {String|RegExp|Array} path
     * @param  {Array} keys
     * @param  {Boolean} sensitive
     * @param  {Boolean} strict
     * @return {RegExp}
     * @api private
     */

    function pathtoRegexp(path, keys, sensitive, strict) {
        if (path instanceof RegExp) return path;
        if (path instanceof Array) path = '(' + path.join('|') + ')';
        path = path
            .concat(strict ? '' : '/?')
            .replace(/\/\(/g, '(?:/')
            .replace(/(\/)?(\.)?:(\w+)(?:(\(.*?\)))?(\?)?/g, function(_, slash, format, key, capture, optional){
                keys.push({ name: key, optional: !! optional });
                slash = slash || '';
                return ''
                    + (optional ? '' : slash)
                    + '(?:'
                    + (optional ? slash : '')
                    + (format || '') + (capture || (format && '([^/.]+?)' || '([^/]+?)')) + ')'
                    + (optional || '');
            })
            .replace(/([\/.])/g, '\\$1')
            .replace(/\*/g, '(.*)');
        return new RegExp('^' + path + '$', sensitive ? '' : 'i');
    }

    /**
     * Handle "populate" events.
     */

    function onpopstate(e) {
        if (e.state) {
            var path = e.state.path;
            page.replace(path, e.state);
        }
    }

    /**
     * Handle "click" events.
     */

    function onclick(e) {
        //if (1 != which(e)) return;
        if (!which(e)) return;
        if (e.metaKey || e.ctrlKey || e.shiftKey) return;
        if (e.defaultPrevented) return;

        // ensure link
        //var el = e.target;
        var el = e.target || e.srcElement;
        while (el && 'A' != el.nodeName) el = el.parentNode;
        if (!el || 'A' != el.nodeName) return;

        // ensure non-hash for the same path
        var link = el.getAttribute('href');
        if (el.pathname == location.pathname && (el.hash || '#' == link)) return;

        // check target
        if (el.target) return;

        // x-origin
        if (!sameOrigin(el.href)) return;

        // rebuild path
        var path = el.pathname + el.search + (el.hash || '');

        // on non-html5 browsers (IE9-), `el.pathname` doesn't include leading '/'
        if (path[0] !== '/') path = '/' + path;

        // same page
        var orig = path + el.hash;

        path = path.replace(base, '');
        if (base && orig == path) return;

        //e.preventDefault();
        e.preventDefault ? e.preventDefault() : e.returnValue = false;
        page.show(orig);
    }

    /**
     * Event button.
     */

    function which(e) {
        e = e || window.event;
        return null == e.which
            //? e.button
            //: e.which;
            ? e.button == 0
            : e.which == 1;
    }

    /**
     * Check if `href` is the same origin.
     */

    function sameOrigin(href) {
        var origin = location.protocol + '//' + location.hostname;
        if (location.port) origin += ':' + location.port;
        return 0 == href.indexOf(origin);
    }

    /**
     * Basic cross browser event code
     */

    function addEvent(obj, type, fn) {
        if (obj.addEventListener) {
            obj.addEventListener(type, fn, false);
        } else {
            obj.attachEvent('on' + type, fn);
        }
    }

    function removeEvent(obj, type, fn) {
        if (obj.removeEventListener) {
            obj.removeEventListener(type, fn, false);
        } else {
            obj.detachEvent('on' + type, fn);
        }
    }

    /**
     * Expose `page`.
     */

    if ('undefined' == typeof module) {
        window.page = page;
    } else {
        module.exports = page;
    }

})();
var Swiper = function (selector, params) {
    'use strict';

    /*=========================
      A little bit dirty but required part for IE8 and old FF support
      ===========================*/
    if (!document.body.outerHTML && document.body.__defineGetter__) {
        if (HTMLElement) {
            var element = HTMLElement.prototype;
            if (element.__defineGetter__) {
                element.__defineGetter__('outerHTML', function () { return new XMLSerializer().serializeToString(this); });
            }
        }
    }

    if (!window.getComputedStyle) {
        window.getComputedStyle = function (el, pseudo) {
            this.el = el;
            this.getPropertyValue = function (prop) {
                var re = /(\-([a-z]){1})/g;
                if (prop === 'float') prop = 'styleFloat';
                if (re.test(prop)) {
                    prop = prop.replace(re, function () {
                        return arguments[2].toUpperCase();
                    });
                }
                return el.currentStyle[prop] ? el.currentStyle[prop] : null;
            };
            return this;
        };
    }
    if (!Array.prototype.indexOf) {
        Array.prototype.indexOf = function (obj, start) {
            for (var i = (start || 0), j = this.length; i < j; i++) {
                if (this[i] === obj) { return i; }
            }
            return -1;
        };
    }
    if (!document.querySelectorAll) {
        if (!window.jQuery) return;
    }
    function $$(selector, context) {
        if (document.querySelectorAll)
            return (context || document).querySelectorAll(selector);
        else
            return jQuery(selector, context);
    }

    /*=========================
      Check for correct selector
      ===========================*/
    if (typeof selector === 'undefined') return;

    if (!(selector.nodeType)) {
        if ($$(selector).length === 0) return;
    }

     /*=========================
      _this
      ===========================*/
    var _this = this;

     /*=========================
      Default Flags and vars
      ===========================*/
    _this.touches = {
        start: 0,
        startX: 0,
        startY: 0,
        current: 0,
        currentX: 0,
        currentY: 0,
        diff: 0,
        abs: 0
    };
    _this.positions = {
        start: 0,
        abs: 0,
        diff: 0,
        current: 0
    };
    _this.times = {
        start: 0,
        end: 0
    };

    _this.id = (new Date()).getTime();
    _this.container = (selector.nodeType) ? selector : $$(selector)[0];
    _this.isTouched = false;
    _this.isMoved = false;
    _this.activeIndex = 0;
    _this.centerIndex = 0;
    _this.activeLoaderIndex = 0;
    _this.activeLoopIndex = 0;
    _this.previousIndex = null;
    _this.velocity = 0;
    _this.snapGrid = [];
    _this.slidesGrid = [];
    _this.imagesToLoad = [];
    _this.imagesLoaded = 0;
    _this.wrapperLeft = 0;
    _this.wrapperRight = 0;
    _this.wrapperTop = 0;
    _this.wrapperBottom = 0;
    _this.isAndroid = navigator.userAgent.toLowerCase().indexOf('android') >= 0;
    var wrapper, slideSize, wrapperSize, direction, isScrolling, containerSize;

    /*=========================
      Default Parameters
      ===========================*/
    var defaults = {
        eventTarget: 'wrapper', // or 'container'
        mode : 'horizontal', // or 'vertical'
        touchRatio : 1,
        speed : 300,
        freeMode : false,
        freeModeFluid : false,
        momentumRatio: 1,
        momentumBounce: true,
        momentumBounceRatio: 1,
        slidesPerView : 1,
        slidesPerGroup : 1,
        slidesPerViewFit: true, //Fit to slide when spv "auto" and slides larger than container
        simulateTouch : true,
        followFinger : true,
        shortSwipes : true,
        longSwipesRatio: 0.5,
        moveStartThreshold: false,
        onlyExternal : false,
        createPagination : true,
        pagination : false,
        paginationElement: 'span',
        paginationClickable: false,
        paginationAsRange: true,
        resistance : true, // or false or 100%
        scrollContainer : false,
        preventLinks : true,
        preventLinksPropagation: false,
        noSwiping : false, // or class
        noSwipingClass : 'swiper-no-swiping', //:)
        initialSlide: 0,
        keyboardControl: false,
        mousewheelControl : false,
        mousewheelControlForceToAxis : false,
        useCSS3Transforms : true,
        // Autoplay
        autoplay: false,
        autoplayDisableOnInteraction: true,
        autoplayStopOnLast: false,
        //Loop mode
        loop: false,
        loopAdditionalSlides: 0,
        // Round length values
        roundLengths: false,
        //Auto Height
        calculateHeight: false,
        //Apply CSS for width and/or height
        cssWidthAndHeight: false, // or true or 'width' or 'height'
        //Images Preloader
        updateOnImagesReady : true,
        //Form elements
        releaseFormElements : true,
        //Watch for active slide, useful when use effects on different slide states
        watchActiveIndex: false,
        //Slides Visibility Fit
        visibilityFullFit : false,
        //Slides Offset
        offsetPxBefore : 0,
        offsetPxAfter : 0,
        offsetSlidesBefore : 0,
        offsetSlidesAfter : 0,
        centeredSlides: false,
        //Queue callbacks
        queueStartCallbacks : false,
        queueEndCallbacks : false,
        //Auto Resize
        autoResize : true,
        resizeReInit : false,
        //DOMAnimation
        DOMAnimation : true,
        //Slides Loader
        loader: {
            slides: [], //array with slides
            slidesHTMLType: 'inner', // or 'outer'
            surroundGroups: 1, //keep preloaded slides groups around view
            logic: 'reload', //or 'change'
            loadAllSlides: false
        },
        // One way swipes
        swipeToPrev: true,
        swipeToNext: true,
        //Namespace
        slideElement: 'div',
        slideClass: 'swiper-slide',
        slideActiveClass: 'swiper-slide-active',
        slideVisibleClass: 'swiper-slide-visible',
        slideDuplicateClass: 'swiper-slide-duplicate',
        wrapperClass: 'swiper-wrapper',
        paginationElementClass: 'swiper-pagination-switch',
        paginationActiveClass: 'swiper-active-switch',
        paginationVisibleClass: 'swiper-visible-switch'
    };
    params = params || {};
    for (var prop in defaults) {
        if (prop in params && typeof params[prop] === 'object') {
            for (var subProp in defaults[prop]) {
                if (! (subProp in params[prop])) {
                    params[prop][subProp] = defaults[prop][subProp];
                }
            }
        }
        else if (! (prop in params)) {
            params[prop] = defaults[prop];
        }
    }
    _this.params = params;
    if (params.scrollContainer) {
        params.freeMode = true;
        params.freeModeFluid = true;
    }
    if (params.loop) {
        params.resistance = '100%';
    }
    var isH = params.mode === 'horizontal';

    /*=========================
      Define Touch Events
      ===========================*/
    var desktopEvents = ['mousedown', 'mousemove', 'mouseup'];
    if (_this.browser.ie10) desktopEvents = ['MSPointerDown', 'MSPointerMove', 'MSPointerUp'];
    if (_this.browser.ie11) desktopEvents = ['pointerdown', 'pointermove', 'pointerup'];
    _this.touchEvents = {
        touchStart : _this.support.touch || !params.simulateTouch  ? 'touchstart' : desktopEvents[0],
        touchMove : _this.support.touch || !params.simulateTouch ? 'touchmove' : desktopEvents[1],
        touchEnd : _this.support.touch || !params.simulateTouch ? 'touchend' : desktopEvents[2]
    };

    /*=========================
      Wrapper
      ===========================*/
    for (var i = _this.container.childNodes.length - 1; i >= 0; i--) {
        if (_this.container.childNodes[i].className) {
            var _wrapperClasses = _this.container.childNodes[i].className.split(/\s+/);
            for (var j = 0; j < _wrapperClasses.length; j++) {
                if (_wrapperClasses[j] === params.wrapperClass) {
                    wrapper = _this.container.childNodes[i];
                }
            }
        }
    }

    _this.wrapper = wrapper;
    /*=========================
      Slide API
      ===========================*/
    _this._extendSwiperSlide = function  (el) {
        el.append = function () {
            if (params.loop) {
                el.insertAfter(_this.slides.length - _this.loopedSlides);
            }
            else {
                _this.wrapper.appendChild(el);
                _this.reInit();
            }

            return el;
        };
        el.prepend = function () {
            if (params.loop) {
                _this.wrapper.insertBefore(el, _this.slides[_this.loopedSlides]);
                _this.removeLoopedSlides();
                _this.calcSlides();
                _this.createLoop();
            }
            else {
                _this.wrapper.insertBefore(el, _this.wrapper.firstChild);
            }
            _this.reInit();
            return el;
        };
        el.insertAfter = function (index) {
            if (typeof index === 'undefined') return false;
            var beforeSlide;

            if (params.loop) {
                beforeSlide = _this.slides[index + 1 + _this.loopedSlides];
                if (beforeSlide) {
                    _this.wrapper.insertBefore(el, beforeSlide);
                }
                else {
                    _this.wrapper.appendChild(el);
                }
                _this.removeLoopedSlides();
                _this.calcSlides();
                _this.createLoop();
            }
            else {
                beforeSlide = _this.slides[index + 1];
                _this.wrapper.insertBefore(el, beforeSlide);
            }
            _this.reInit();
            return el;
        };
        el.clone = function () {
            return _this._extendSwiperSlide(el.cloneNode(true));
        };
        el.remove = function () {
            _this.wrapper.removeChild(el);
            _this.reInit();
        };
        el.html = function (html) {
            if (typeof html === 'undefined') {
                return el.innerHTML;
            }
            else {
                el.innerHTML = html;
                return el;
            }
        };
        el.index = function () {
            var index;
            for (var i = _this.slides.length - 1; i >= 0; i--) {
                if (el === _this.slides[i]) index = i;
            }
            return index;
        };
        el.isActive = function () {
            if (el.index() === _this.activeIndex) return true;
            else return false;
        };
        if (!el.swiperSlideDataStorage) el.swiperSlideDataStorage = {};
        el.getData = function (name) {
            return el.swiperSlideDataStorage[name];
        };
        el.setData = function (name, value) {
            el.swiperSlideDataStorage[name] = value;
            return el;
        };
        el.data = function (name, value) {
            if (typeof value === 'undefined') {
                return el.getAttribute('data-' + name);
            }
            else {
                el.setAttribute('data-' + name, value);
                return el;
            }
        };
        el.getWidth = function (outer, round) {
            return _this.h.getWidth(el, outer, round);
        };
        el.getHeight = function (outer, round) {
            return _this.h.getHeight(el, outer, round);
        };
        el.getOffset = function () {
            return _this.h.getOffset(el);
        };
        return el;
    };

    //Calculate information about number of slides
    _this.calcSlides = function (forceCalcSlides) {
        var oldNumber = _this.slides ? _this.slides.length : false;
        _this.slides = [];
        _this.displaySlides = [];
        for (var i = 0; i < _this.wrapper.childNodes.length; i++) {
            if (_this.wrapper.childNodes[i].className) {
                var _className = _this.wrapper.childNodes[i].className;
                var _slideClasses = _className.split(/\s+/);
                for (var j = 0; j < _slideClasses.length; j++) {
                    if (_slideClasses[j] === params.slideClass) {
                        _this.slides.push(_this.wrapper.childNodes[i]);
                    }
                }
            }
        }
        for (i = _this.slides.length - 1; i >= 0; i--) {
            _this._extendSwiperSlide(_this.slides[i]);
        }
        if (oldNumber === false) return;
        if (oldNumber !== _this.slides.length || forceCalcSlides) {

            // Number of slides has been changed
            removeSlideEvents();
            addSlideEvents();
            _this.updateActiveSlide();
            if (_this.params.pagination) _this.createPagination();
            _this.callPlugins('numberOfSlidesChanged');
        }
    };

    //Create Slide
    _this.createSlide = function (html, slideClassList, el) {
        slideClassList = slideClassList || _this.params.slideClass;
        el = el || params.slideElement;
        var newSlide = document.createElement(el);
        newSlide.innerHTML = html || '';
        newSlide.className = slideClassList;
        return _this._extendSwiperSlide(newSlide);
    };

    //Append Slide
    _this.appendSlide = function (html, slideClassList, el) {
        if (!html) return;
        if (html.nodeType) {
            return _this._extendSwiperSlide(html).append();
        }
        else {
            return _this.createSlide(html, slideClassList, el).append();
        }
    };
    _this.prependSlide = function (html, slideClassList, el) {
        if (!html) return;
        if (html.nodeType) {
            return _this._extendSwiperSlide(html).prepend();
        }
        else {
            return _this.createSlide(html, slideClassList, el).prepend();
        }
    };
    _this.insertSlideAfter = function (index, html, slideClassList, el) {
        if (typeof index === 'undefined') return false;
        if (html.nodeType) {
            return _this._extendSwiperSlide(html).insertAfter(index);
        }
        else {
            return _this.createSlide(html, slideClassList, el).insertAfter(index);
        }
    };
    _this.removeSlide = function (index) {
        if (_this.slides[index]) {
            if (params.loop) {
                if (!_this.slides[index + _this.loopedSlides]) return false;
                _this.slides[index + _this.loopedSlides].remove();
                _this.removeLoopedSlides();
                _this.calcSlides();
                _this.createLoop();
            }
            else _this.slides[index].remove();
            return true;
        }
        else return false;
    };
    _this.removeLastSlide = function () {
        if (_this.slides.length > 0) {
            if (params.loop) {
                _this.slides[_this.slides.length - 1 - _this.loopedSlides].remove();
                _this.removeLoopedSlides();
                _this.calcSlides();
                _this.createLoop();
            }
            else _this.slides[_this.slides.length - 1].remove();
            return true;
        }
        else {
            return false;
        }
    };
    _this.removeAllSlides = function () {
        for (var i = _this.slides.length - 1; i >= 0; i--) {
            _this.slides[i].remove();
        }
    };
    _this.getSlide = function (index) {
        return _this.slides[index];
    };
    _this.getLastSlide = function () {
        return _this.slides[_this.slides.length - 1];
    };
    _this.getFirstSlide = function () {
        return _this.slides[0];
    };

    //Currently Active Slide
    _this.activeSlide = function () {
        return _this.slides[_this.activeIndex];
    };

    /*=========================
     Wrapper for Callbacks : Allows additive callbacks via function arrays
     ===========================*/
    _this.fireCallback = function () {
        var callback = arguments[0];
        if (Object.prototype.toString.call(callback) === '[object Array]') {
            for (var i = 0; i < callback.length; i++) {
                if (typeof callback[i] === 'function') {
                    callback[i](arguments[1], arguments[2], arguments[3], arguments[4], arguments[5]);
                }
            }
        } else if (Object.prototype.toString.call(callback) === '[object String]') {
            if (params['on' + callback]) _this.fireCallback(params['on' + callback], arguments[1], arguments[2], arguments[3], arguments[4], arguments[5]);
        } else {
            callback(arguments[1], arguments[2], arguments[3], arguments[4], arguments[5]);
        }
    };
    function isArray(obj) {
        if (Object.prototype.toString.apply(obj) === '[object Array]') return true;
        return false;
    }

    /**
     * Allows user to add callbacks, rather than replace them
     * @param callback
     * @param func
     * @return {*}
     */
    _this.addCallback = function (callback, func) {
        var _this = this, tempFunc;
        if (_this.params['on' + callback]) {
            if (isArray(this.params['on' + callback])) {
                return this.params['on' + callback].push(func);
            } else if (typeof this.params['on' + callback] === 'function') {
                tempFunc = this.params['on' + callback];
                this.params['on' + callback] = [];
                this.params['on' + callback].push(tempFunc);
                return this.params['on' + callback].push(func);
            }
        } else {
            this.params['on' + callback] = [];
            return this.params['on' + callback].push(func);
        }
    };
    _this.removeCallbacks = function (callback) {
        if (_this.params['on' + callback]) {
            _this.params['on' + callback] = null;
        }
    };

    /*=========================
      Plugins API
      ===========================*/
    var _plugins = [];
    for (var plugin in _this.plugins) {
        if (params[plugin]) {
            var p = _this.plugins[plugin](_this, params[plugin]);
            if (p) _plugins.push(p);
        }
    }
    _this.callPlugins = function (method, args) {
        if (!args) args = {};
        for (var i = 0; i < _plugins.length; i++) {
            if (method in _plugins[i]) {
                _plugins[i][method](args);
            }
        }
    };

    /*=========================
      Windows Phone 8 Fix
      ===========================*/
    if ((_this.browser.ie10 || _this.browser.ie11) && !params.onlyExternal) {
        _this.wrapper.classList.add('swiper-wp8-' + (isH ? 'horizontal' : 'vertical'));
    }

    /*=========================
      Free Mode Class
      ===========================*/
    if (params.freeMode) {
        _this.container.className += ' swiper-free-mode';
    }

    /*==================================================
        Init/Re-init/Resize Fix
    ====================================================*/
    _this.initialized = false;
    _this.init = function (force, forceCalcSlides) {
        var _width = _this.h.getWidth(_this.container, false, params.roundLengths);
        var _height = _this.h.getHeight(_this.container, false, params.roundLengths);
        if (_width === _this.width && _height === _this.height && !force) return;
        
        _this.width = _width;
        _this.height = _height;

        var slideWidth, slideHeight, slideMaxHeight, wrapperWidth, wrapperHeight, slideLeft;
        var i; // loop index variable to avoid JSHint W004 / W038
        containerSize = isH ? _width : _height;
        var wrapper = _this.wrapper;

        if (force) {
            _this.calcSlides(forceCalcSlides);
        }

        if (params.slidesPerView === 'auto') {
            //Auto mode
            var slidesWidth = 0;
            var slidesHeight = 0;

            //Unset Styles
            if (params.slidesOffset > 0) {
                wrapper.style.paddingLeft = '';
                wrapper.style.paddingRight = '';
                wrapper.style.paddingTop = '';
                wrapper.style.paddingBottom = '';
            }
            wrapper.style.width = '';
            wrapper.style.height = '';
            if (params.offsetPxBefore > 0) {
                if (isH) _this.wrapperLeft = params.offsetPxBefore;
                else _this.wrapperTop = params.offsetPxBefore;
            }
            if (params.offsetPxAfter > 0) {
                if (isH) _this.wrapperRight = params.offsetPxAfter;
                else _this.wrapperBottom = params.offsetPxAfter;
            }

            if (params.centeredSlides) {
                if (isH) {
                    _this.wrapperLeft = (containerSize - this.slides[0].getWidth(true, params.roundLengths)) / 2;
                    _this.wrapperRight = (containerSize - _this.slides[_this.slides.length - 1].getWidth(true, params.roundLengths)) / 2;
                }
                else {
                    _this.wrapperTop = (containerSize - _this.slides[0].getHeight(true, params.roundLengths)) / 2;
                    _this.wrapperBottom = (containerSize - _this.slides[_this.slides.length - 1].getHeight(true, params.roundLengths)) / 2;
                }
            }

            if (isH) {
                if (_this.wrapperLeft >= 0) wrapper.style.paddingLeft = _this.wrapperLeft + 'px';
                if (_this.wrapperRight >= 0) wrapper.style.paddingRight = _this.wrapperRight + 'px';
            }
            else {
                if (_this.wrapperTop >= 0) wrapper.style.paddingTop = _this.wrapperTop + 'px';
                if (_this.wrapperBottom >= 0) wrapper.style.paddingBottom = _this.wrapperBottom + 'px';
            }
            slideLeft = 0;
            var centeredSlideLeft = 0;
            _this.snapGrid = [];
            _this.slidesGrid = [];

            slideMaxHeight = 0;
            for (i = 0; i < _this.slides.length; i++) {
                slideWidth = _this.slides[i].getWidth(true, params.roundLengths);
                slideHeight = _this.slides[i].getHeight(true, params.roundLengths);
                if (params.calculateHeight) {
                    slideMaxHeight = Math.max(slideMaxHeight, slideHeight);
                }
                var _slideSize = isH ? slideWidth : slideHeight;
                if (params.centeredSlides) {
                    var nextSlideWidth = i === _this.slides.length - 1 ? 0 : _this.slides[i + 1].getWidth(true, params.roundLengths);
                    var nextSlideHeight = i === _this.slides.length - 1 ? 0 : _this.slides[i + 1].getHeight(true, params.roundLengths);
                    var nextSlideSize = isH ? nextSlideWidth : nextSlideHeight;
                    if (_slideSize > containerSize) {
                        if (params.slidesPerViewFit) {
                            _this.snapGrid.push(slideLeft + _this.wrapperLeft);
                            _this.snapGrid.push(slideLeft + _slideSize - containerSize + _this.wrapperLeft);
                        }
                        else {
                            for (var j = 0; j <= Math.floor(_slideSize / (containerSize + _this.wrapperLeft)); j++) {
                                if (j === 0) _this.snapGrid.push(slideLeft + _this.wrapperLeft);
                                else _this.snapGrid.push(slideLeft + _this.wrapperLeft + containerSize * j);
                            }
                        }
                        _this.slidesGrid.push(slideLeft + _this.wrapperLeft);
                    }
                    else {
                        _this.snapGrid.push(centeredSlideLeft);
                        _this.slidesGrid.push(centeredSlideLeft);
                    }
                    centeredSlideLeft += _slideSize / 2 + nextSlideSize / 2;
                }
                else {
                    if (_slideSize > containerSize) {
                        if (params.slidesPerViewFit) {
                            _this.snapGrid.push(slideLeft);
                            _this.snapGrid.push(slideLeft + _slideSize - containerSize);
                        }
                        else {
                            if (containerSize !== 0) {
                                for (var k = 0; k <= Math.floor(_slideSize / containerSize); k++) {
                                    _this.snapGrid.push(slideLeft + containerSize * k);
                                }
                            }
                            else {
                                _this.snapGrid.push(slideLeft);
                            }
                        }
                            
                    }
                    else {
                        _this.snapGrid.push(slideLeft);
                    }
                    _this.slidesGrid.push(slideLeft);
                }

                slideLeft += _slideSize;

                slidesWidth += slideWidth;
                slidesHeight += slideHeight;
            }
            if (params.calculateHeight) _this.height = slideMaxHeight;
            if (isH) {
                wrapperSize = slidesWidth + _this.wrapperRight + _this.wrapperLeft;
                wrapper.style.width = (slidesWidth) + 'px';
                wrapper.style.height = (_this.height) + 'px';
            }
            else {
                wrapperSize = slidesHeight + _this.wrapperTop + _this.wrapperBottom;
                wrapper.style.width = (_this.width) + 'px';
                wrapper.style.height = (slidesHeight) + 'px';
            }

        }
        else if (params.scrollContainer) {
            //Scroll Container
            wrapper.style.width = '';
            wrapper.style.height = '';
            wrapperWidth = _this.slides[0].getWidth(true, params.roundLengths);
            wrapperHeight = _this.slides[0].getHeight(true, params.roundLengths);
            wrapperSize = isH ? wrapperWidth : wrapperHeight;
            wrapper.style.width = wrapperWidth + 'px';
            wrapper.style.height = wrapperHeight + 'px';
            slideSize = isH ? wrapperWidth : wrapperHeight;

        }
        else {
            //For usual slides
            if (params.calculateHeight) {
                slideMaxHeight = 0;
                wrapperHeight = 0;
                //ResetWrapperSize
                if (!isH) _this.container.style.height = '';
                wrapper.style.height = '';

                for (i = 0; i < _this.slides.length; i++) {
                    //ResetSlideSize
                    _this.slides[i].style.height = '';
                    slideMaxHeight = Math.max(_this.slides[i].getHeight(true), slideMaxHeight);
                    if (!isH) wrapperHeight += _this.slides[i].getHeight(true);
                }
                slideHeight = slideMaxHeight;
                _this.height = slideHeight;

                if (isH) wrapperHeight = slideHeight;
                else {
                    containerSize = slideHeight;
                    _this.container.style.height = containerSize + 'px';
                }
            }
            else {
                slideHeight = isH ? _this.height : _this.height / params.slidesPerView;
                if (params.roundLengths) slideHeight = Math.ceil(slideHeight);
                wrapperHeight = isH ? _this.height : _this.slides.length * slideHeight;
            }
            slideWidth = isH ? _this.width / params.slidesPerView : _this.width;
            if (params.roundLengths) slideWidth = Math.ceil(slideWidth);
            wrapperWidth = isH ? _this.slides.length * slideWidth : _this.width;
            slideSize = isH ? slideWidth : slideHeight;

            if (params.offsetSlidesBefore > 0) {
                if (isH) _this.wrapperLeft = slideSize * params.offsetSlidesBefore;
                else _this.wrapperTop = slideSize * params.offsetSlidesBefore;
            }
            if (params.offsetSlidesAfter > 0) {
                if (isH) _this.wrapperRight = slideSize * params.offsetSlidesAfter;
                else _this.wrapperBottom = slideSize * params.offsetSlidesAfter;
            }
            if (params.offsetPxBefore > 0) {
                if (isH) _this.wrapperLeft = params.offsetPxBefore;
                else _this.wrapperTop = params.offsetPxBefore;
            }
            if (params.offsetPxAfter > 0) {
                if (isH) _this.wrapperRight = params.offsetPxAfter;
                else _this.wrapperBottom = params.offsetPxAfter;
            }
            if (params.centeredSlides) {
                if (isH) {
                    _this.wrapperLeft = (containerSize - slideSize) / 2;
                    _this.wrapperRight = (containerSize - slideSize) / 2;
                }
                else {
                    _this.wrapperTop = (containerSize - slideSize) / 2;
                    _this.wrapperBottom = (containerSize - slideSize) / 2;
                }
            }
            if (isH) {
                if (_this.wrapperLeft > 0) wrapper.style.paddingLeft = _this.wrapperLeft + 'px';
                if (_this.wrapperRight > 0) wrapper.style.paddingRight = _this.wrapperRight + 'px';
            }
            else {
                if (_this.wrapperTop > 0) wrapper.style.paddingTop = _this.wrapperTop + 'px';
                if (_this.wrapperBottom > 0) wrapper.style.paddingBottom = _this.wrapperBottom + 'px';
            }

            wrapperSize = isH ? wrapperWidth + _this.wrapperRight + _this.wrapperLeft : wrapperHeight + _this.wrapperTop + _this.wrapperBottom;
            if (parseFloat(wrapperWidth) > 0 && (!params.cssWidthAndHeight || params.cssWidthAndHeight === 'height')) {
                wrapper.style.width = wrapperWidth + 'px';
            }
            if (parseFloat(wrapperHeight) > 0 && (!params.cssWidthAndHeight || params.cssWidthAndHeight === 'width')) {
                wrapper.style.height = wrapperHeight + 'px';
            }
            slideLeft = 0;
            _this.snapGrid = [];
            _this.slidesGrid = [];
            for (i = 0; i < _this.slides.length; i++) {
                _this.snapGrid.push(slideLeft);
                _this.slidesGrid.push(slideLeft);
                slideLeft += slideSize;
                if (parseFloat(slideWidth) > 0 && (!params.cssWidthAndHeight || params.cssWidthAndHeight === 'height')) {
                    _this.slides[i].style.width = slideWidth + 'px';
                }
                if (parseFloat(slideHeight) > 0 && (!params.cssWidthAndHeight || params.cssWidthAndHeight === 'width')) {
                    _this.slides[i].style.height = slideHeight + 'px';
                }
            }

        }

        if (!_this.initialized) {
            _this.callPlugins('onFirstInit');
            if (params.onFirstInit) _this.fireCallback(params.onFirstInit, _this);
        }
        else {
            _this.callPlugins('onInit');
            if (params.onInit) _this.fireCallback(params.onInit, _this);
        }
        _this.initialized = true;
    };

    _this.reInit = function (forceCalcSlides) {
        _this.init(true, forceCalcSlides);
    };

    _this.resizeFix = function (reInit) {
        _this.callPlugins('beforeResizeFix');

        _this.init(params.resizeReInit || reInit);

        // swipe to active slide in fixed mode
        if (!params.freeMode) {
            _this.swipeTo((params.loop ? _this.activeLoopIndex : _this.activeIndex), 0, false);
            // Fix autoplay
            if (params.autoplay) {
                if (_this.support.transitions && typeof autoplayTimeoutId !== 'undefined') {
                    if (typeof autoplayTimeoutId !== 'undefined') {
                        clearTimeout(autoplayTimeoutId);
                        autoplayTimeoutId = undefined;
                        _this.startAutoplay();
                    }
                }
                else {
                    if (typeof autoplayIntervalId !== 'undefined') {
                        clearInterval(autoplayIntervalId);
                        autoplayIntervalId = undefined;
                        _this.startAutoplay();
                    }
                }
            }
        }
        // move wrapper to the beginning in free mode
        else if (_this.getWrapperTranslate() < -maxWrapperPosition()) {
            _this.setWrapperTransition(0);
            _this.setWrapperTranslate(-maxWrapperPosition());
        }

        _this.callPlugins('afterResizeFix');
    };

    /*==========================================
        Max and Min Positions
    ============================================*/
    function maxWrapperPosition() {
        var a = (wrapperSize - containerSize);
        if (params.freeMode) {
            a = wrapperSize - containerSize;
        }
        // if (params.loop) a -= containerSize;
        if (params.slidesPerView > _this.slides.length && !params.centeredSlides) {
            a = 0;
        }
        if (a < 0) a = 0;
        return a;
    }

    /*==========================================
        Event Listeners
    ============================================*/
    function initEvents() {
        var bind = _this.h.addEventListener;
        var eventTarget = params.eventTarget === 'wrapper' ? _this.wrapper : _this.container;
        //Touch Events
        if (! (_this.browser.ie10 || _this.browser.ie11)) {
            if (_this.support.touch) {
                bind(eventTarget, 'touchstart', onTouchStart);
                bind(eventTarget, 'touchmove', onTouchMove);
                bind(eventTarget, 'touchend', onTouchEnd);
            }
            if (params.simulateTouch) {
                bind(eventTarget, 'mousedown', onTouchStart);
                bind(eventTarget, 'mousemove', onTouchMove);
                bind(eventTarget, 'mouseup', onTouchEnd);
            }
        }
        else {
            bind(eventTarget, _this.touchEvents.touchStart, onTouchStart);
            bind(document, _this.touchEvents.touchMove, onTouchMove);
            bind(document, _this.touchEvents.touchEnd, onTouchEnd);
        }

        //Resize Event
        if (params.autoResize) {
            bind(window, 'resize', _this.resizeFix);
        }
        //Slide Events
        addSlideEvents();
        //Mousewheel
        _this._wheelEvent = false;
        if (params.mousewheelControl) {
            if (document.onmousewheel !== undefined) {
                _this._wheelEvent = 'mousewheel';
            }
            if (!_this._wheelEvent) {
                try {
                    new WheelEvent('wheel');
                    _this._wheelEvent = 'wheel';
                } catch (e) {}
            }
            if (!_this._wheelEvent) {
                _this._wheelEvent = 'DOMMouseScroll';
            }
            if (_this._wheelEvent) {
                bind(_this.container, _this._wheelEvent, handleMousewheel);
            }
        }

        //Keyboard
        function _loadImage(src) {
            var image = new Image();
            image.onload = function () {
                if (typeof _this === 'undefined' || _this === null) return;
                if (_this.imagesLoaded !== undefined) _this.imagesLoaded++;
                if (_this.imagesLoaded === _this.imagesToLoad.length) {
                    _this.reInit();
                    if (params.onImagesReady) _this.fireCallback(params.onImagesReady, _this);
                }
            };
            image.src = src;
        }

        if (params.keyboardControl) {
            bind(document, 'keydown', handleKeyboardKeys);
        }
        if (params.updateOnImagesReady) {
            _this.imagesToLoad = $$('img', _this.container);

            for (var i = 0; i < _this.imagesToLoad.length; i++) {
                _loadImage(_this.imagesToLoad[i].getAttribute('src'));
            }
        }
    }

    //Remove Event Listeners
    _this.destroy = function () {
        var unbind = _this.h.removeEventListener;
        var eventTarget = params.eventTarget === 'wrapper' ? _this.wrapper : _this.container;
        //Touch Events
        if (! (_this.browser.ie10 || _this.browser.ie11)) {
            if (_this.support.touch) {
                unbind(eventTarget, 'touchstart', onTouchStart);
                unbind(eventTarget, 'touchmove', onTouchMove);
                unbind(eventTarget, 'touchend', onTouchEnd);
            }
            if (params.simulateTouch) {
                unbind(eventTarget, 'mousedown', onTouchStart);
                unbind(document, 'mousemove', onTouchMove);
                unbind(document, 'mouseup', onTouchEnd);
            }
        }
        else {
            unbind(eventTarget, _this.touchEvents.touchStart, onTouchStart);
            unbind(document, _this.touchEvents.touchMove, onTouchMove);
            unbind(document, _this.touchEvents.touchEnd, onTouchEnd);
        }

        //Resize Event
        if (params.autoResize) {
            unbind(window, 'resize', _this.resizeFix);
        }

        //Init Slide Events
        removeSlideEvents();

        //Pagination
        if (params.paginationClickable) {
            removePaginationEvents();
        }

        //Mousewheel
        if (params.mousewheelControl && _this._wheelEvent) {
            unbind(_this.container, _this._wheelEvent, handleMousewheel);
        }

        //Keyboard
        if (params.keyboardControl) {
            unbind(document, 'keydown', handleKeyboardKeys);
        }

        //Stop autoplay
        if (params.autoplay) {
            _this.stopAutoplay();
        }
        _this.callPlugins('onDestroy');

        //Destroy variable
        _this = null;
    };

    function addSlideEvents() {
        var bind = _this.h.addEventListener,
            i;

        //Prevent Links Events
        if (params.preventLinks) {
            var links = $$('a', _this.container);
            for (i = 0; i < links.length; i++) {
                bind(links[i], 'click', preventClick);
            }
        }
        //Release Form Elements
        if (params.releaseFormElements) {
            var formElements = $$('input, textarea, select', _this.container);
            for (i = 0; i < formElements.length; i++) {
                bind(formElements[i], _this.touchEvents.touchStart, releaseForms, true);
            }
        }

        //Slide Clicks & Touches
        if (params.onSlideClick) {
            for (i = 0; i < _this.slides.length; i++) {
                bind(_this.slides[i], 'click', slideClick);
            }
        }
        if (params.onSlideTouch) {
            for (i = 0; i < _this.slides.length; i++) {
                bind(_this.slides[i], _this.touchEvents.touchStart, slideTouch);
            }
        }
    }
    function removeSlideEvents() {
        var unbind = _this.h.removeEventListener,
            i;

        //Slide Clicks & Touches
        if (params.onSlideClick) {
            for (i = 0; i < _this.slides.length; i++) {
                unbind(_this.slides[i], 'click', slideClick);
            }
        }
        if (params.onSlideTouch) {
            for (i = 0; i < _this.slides.length; i++) {
                unbind(_this.slides[i], _this.touchEvents.touchStart, slideTouch);
            }
        }
        //Release Form Elements
        if (params.releaseFormElements) {
            var formElements = $$('input, textarea, select', _this.container);
            for (i = 0; i < formElements.length; i++) {
                unbind(formElements[i], _this.touchEvents.touchStart, releaseForms, true);
            }
        }
        //Prevent Links Events
        if (params.preventLinks) {
            var links = $$('a', _this.container);
            for (i = 0; i < links.length; i++) {
                unbind(links[i], 'click', preventClick);
            }
        }
    }
    /*==========================================
        Keyboard Control
    ============================================*/
    function handleKeyboardKeys(e) {
        var kc = e.keyCode || e.charCode;
        if (e.shiftKey || e.altKey || e.ctrlKey || e.metaKey) return;
        if (kc === 37 || kc === 39 || kc === 38 || kc === 40) {
            var inView = false;
            //Check that swiper should be inside of visible area of window
            var swiperOffset = _this.h.getOffset(_this.container);
            var scrollLeft = _this.h.windowScroll().left;
            var scrollTop = _this.h.windowScroll().top;
            var windowWidth = _this.h.windowWidth();
            var windowHeight = _this.h.windowHeight();
            var swiperCoord = [
                [swiperOffset.left, swiperOffset.top],
                [swiperOffset.left + _this.width, swiperOffset.top],
                [swiperOffset.left, swiperOffset.top + _this.height],
                [swiperOffset.left + _this.width, swiperOffset.top + _this.height]
            ];
            for (var i = 0; i < swiperCoord.length; i++) {
                var point = swiperCoord[i];
                if (
                    point[0] >= scrollLeft && point[0] <= scrollLeft + windowWidth &&
                    point[1] >= scrollTop && point[1] <= scrollTop + windowHeight
                ) {
                    inView = true;
                }

            }
            if (!inView) return;
        }
        if (isH) {
            if (kc === 37 || kc === 39) {
                if (e.preventDefault) e.preventDefault();
                else e.returnValue = false;
            }
            if (kc === 39) _this.swipeNext();
            if (kc === 37) _this.swipePrev();
        }
        else {
            if (kc === 38 || kc === 40) {
                if (e.preventDefault) e.preventDefault();
                else e.returnValue = false;
            }
            if (kc === 40) _this.swipeNext();
            if (kc === 38) _this.swipePrev();
        }
    }

    _this.disableKeyboardControl = function () {
        params.keyboardControl = false;
        _this.h.removeEventListener(document, 'keydown', handleKeyboardKeys);
    };

    _this.enableKeyboardControl = function () {
        params.keyboardControl = true;
        _this.h.addEventListener(document, 'keydown', handleKeyboardKeys);
    };

    /*==========================================
        Mousewheel Control
    ============================================*/
    var lastScrollTime = (new Date()).getTime();
    function handleMousewheel(e) {
        var we = _this._wheelEvent;
        var delta = 0;

        //Opera & IE
        if (e.detail) delta = -e.detail;
        //WebKits
        else if (we === 'mousewheel') {
            if (params.mousewheelControlForceToAxis) {
                if (isH) {
                    if (Math.abs(e.wheelDeltaX) > Math.abs(e.wheelDeltaY)) delta = e.wheelDeltaX;
                    else return;
                }
                else {
                    if (Math.abs(e.wheelDeltaY) > Math.abs(e.wheelDeltaX)) delta = e.wheelDeltaY;
                    else return;
                }
            }
            else {
                delta = e.wheelDelta;
            }
        }
        //Old FireFox
        else if (we === 'DOMMouseScroll') delta = -e.detail;
        //New FireFox
        else if (we === 'wheel') {
            if (params.mousewheelControlForceToAxis) {
                if (isH) {
                    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) delta = -e.deltaX;
                    else return;
                }
                else {
                    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) delta = -e.deltaY;
                    else return;
                }
            }
            else {
                delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? - e.deltaX : - e.deltaY;
            }
        }

        function normalizeWheelSpeed(event) {
            var normalized;
            if (event.wheelDelta) {
                normalized = (event.wheelDelta % 120 - 0) === -0 ? event.wheelDelta / 120 : event.wheelDelta / 12;
            } else {
                var rawAmmount = event.deltaY ? event.deltaY : event.detail;
                normalized = rawAmmount % 3 ? (rawAmmount % 1 ? rawAmmount * 10 : rawAmmount) : rawAmmount / 3;
            }
            return normalized;
        }

        // console.log(we, delta, normalizeWheelSpeed(e));
        if (!params.freeMode) {
            if ((new Date()).getTime() - lastScrollTime > 60) {
                if (delta < 0) _this.swipeNext();
                else _this.swipePrev();
            }
            lastScrollTime = (new Date()).getTime();

        }
        else {
            //Freemode or scrollContainer:
            var position = _this.getWrapperTranslate() + delta;

            if (position > 0) position = 0;
            if (position < -maxWrapperPosition()) position = -maxWrapperPosition();

            _this.setWrapperTransition(0);
            _this.setWrapperTranslate(position);
            _this.updateActiveSlide(position);

            // Return page scroll on edge positions
            if (position === 0 || position === -maxWrapperPosition()) return;
        }
        if (params.autoplay) _this.stopAutoplay(true);

        if (e.preventDefault) e.preventDefault();
        else e.returnValue = false;
        return false;
    }
    _this.disableMousewheelControl = function () {
        if (!_this._wheelEvent) return false;
        params.mousewheelControl = false;
        _this.h.removeEventListener(_this.container, _this._wheelEvent, handleMousewheel);
        return true;
    };

    _this.enableMousewheelControl = function () {
        if (!_this._wheelEvent) return false;
        params.mousewheelControl = true;
        _this.h.addEventListener(_this.container, _this._wheelEvent, handleMousewheel);
        return true;
    };

    /*=========================
      Grab Cursor
      ===========================*/
    if (params.grabCursor) {
        var containerStyle = _this.container.style;
        containerStyle.cursor = 'move';
        containerStyle.cursor = 'grab';
        containerStyle.cursor = '-moz-grab';
        containerStyle.cursor = '-webkit-grab';
    }

    /*=========================
      Slides Events Handlers
      ===========================*/

    _this.allowSlideClick = true;
    function slideClick(event) {
        if (_this.allowSlideClick) {
            setClickedSlide(event);
            _this.fireCallback(params.onSlideClick, _this, event);
        }
    }

    function slideTouch(event) {
        setClickedSlide(event);
        _this.fireCallback(params.onSlideTouch, _this, event);
    }

    function setClickedSlide(event) {

        // IE 6-8 support
        if (!event.currentTarget) {
            var element = event.srcElement;
            do {
                if (element.className.indexOf(params.slideClass) > -1) {
                    break;
                }
                element = element.parentNode;
            } while (element);
            _this.clickedSlide = element;
        }
        else {
            _this.clickedSlide = event.currentTarget;
        }

        _this.clickedSlideIndex     = _this.slides.indexOf(_this.clickedSlide);
        _this.clickedSlideLoopIndex = _this.clickedSlideIndex - (_this.loopedSlides || 0);
    }

    _this.allowLinks = true;
    function preventClick(e) {
        if (!_this.allowLinks) {
            if (e.preventDefault) e.preventDefault();
            else e.returnValue = false;
            if (params.preventLinksPropagation && 'stopPropagation' in e) {
                e.stopPropagation();
            }
            return false;
        }
    }
    function releaseForms(e) {
        if (e.stopPropagation) e.stopPropagation();
        else e.returnValue = false;
        return false;

    }

    /*==================================================
        Event Handlers
    ====================================================*/
    var isTouchEvent = false;
    var allowThresholdMove;
    var allowMomentumBounce = true;
    function onTouchStart(event) {
        if (CSwiper.isSideMenuOpen()) return false;
        //event.stopPropagation();

        if (params.preventLinks) _this.allowLinks = true;
        //Exit if slider is already was touched
        if (_this.isTouched || params.onlyExternal) {
            return false;
        }
        // Blur active elements
        var eventTarget = event.target || event.srcElement;
        if (document.activeElement) {
            if (document.activeElement !== eventTarget) document.activeElement.blur();
        }

        // Form tag names
        var formTagNames = ('input select textarea').split(' ');

        // Check for no swiping
        if (params.noSwiping && (eventTarget) && noSwipingSlide(eventTarget)) return false;
        allowMomentumBounce = false;
        //Check For Nested Swipers
        _this.isTouched = true;
        isTouchEvent = event.type === 'touchstart';// || event.type === 'mousedown';

        // prevent user enter with right and the swiper move (needs isTouchEvent)
        if (!isTouchEvent && 'which' in event && event.which === 3) return false;

        if (!isTouchEvent || event.targetTouches.length === 1) {
            _this.callPlugins('onTouchStartBegin');
            if (!isTouchEvent && !_this.isAndroid && formTagNames.indexOf(eventTarget.tagName.toLowerCase()) < 0) {

                if (event.preventDefault) event.preventDefault();
                else event.returnValue = false;
            }

            var pageX = isTouchEvent ? event.targetTouches[0].pageX : (event.pageX || event.clientX);
            var pageY = isTouchEvent ? event.targetTouches[0].pageY : (event.pageY || event.clientY);

            //Start Touches to check the scrolling
            _this.touches.startX = _this.touches.currentX = pageX;
            _this.touches.startY = _this.touches.currentY = pageY;

            _this.touches.start = _this.touches.current = isH ? pageX : pageY;

            //Set Transition Time to 0
            _this.setWrapperTransition(0);

            //Get Start Translate Position
            _this.positions.start = _this.positions.current = _this.getWrapperTranslate();

            //Set Transform
            _this.setWrapperTranslate(_this.positions.start);

            //TouchStartTime
            _this.times.start = (new Date()).getTime();

            //Unset Scrolling
            isScrolling = undefined;

            //Set Treshold
            if (params.moveStartThreshold > 0) {
                allowThresholdMove = false;
            }

            //CallBack
            if (params.onTouchStart) _this.fireCallback(params.onTouchStart, _this, event);
            _this.callPlugins('onTouchStartEnd');

        }
    }
    var velocityPrevPosition, velocityPrevTime;
    function onTouchMove(event) {
        //event.stopPropagation();
        //if (CSwiper.isSideMenuOpen()) return;
        // If slider is not touched - exit
        if (!_this.isTouched || params.onlyExternal) return;
        //if (isTouchEvent && event.type === 'mousemove') return;
        //if (isTouchEvent && event.type === 'touchmove') return;

        var pageX = isTouchEvent ? event.targetTouches[0].pageX : (event.pageX || event.clientX);
        var pageY = isTouchEvent ? event.targetTouches[0].pageY : (event.pageY || event.clientY);

        //check for scrolling
        if (typeof isScrolling === 'undefined' && isH) {
            isScrolling = !!(isScrolling || Math.abs(pageY - _this.touches.startY) > Math.abs(pageX - _this.touches.startX));
        }
        if (typeof isScrolling === 'undefined' && !isH) {
            isScrolling = !!(isScrolling || Math.abs(pageY - _this.touches.startY) < Math.abs(pageX - _this.touches.startX));
        }
        if (isScrolling) {
            _this.isTouched = false;
            return;
        }

        // One way swipes
        if (isH) {
            if ((!params.swipeToNext && pageX < _this.touches.startX) || ((!params.swipeToPrev && pageX > _this.touches.startX))) {
                return;
            }
        }
        else {
            if ((!params.swipeToNext && pageY < _this.touches.startY) || ((!params.swipeToPrev && pageY > _this.touches.startY))) {
                return;
            }
        }

        //Check For Nested Swipers
        if (event.assignedToSwiper) {
            _this.isTouched = false;
            return;
        }
        event.assignedToSwiper = true;

        //Block inner links
        if (params.preventLinks) {
            _this.allowLinks = false;
        }
        if (params.onSlideClick) {
            _this.allowSlideClick = false;
        }

        //Stop AutoPlay if exist
        if (params.autoplay) {
            _this.stopAutoplay(true);
        }
        if (!isTouchEvent || event.touches.length === 1) {

            //Moved Flag
            if (!_this.isMoved) {
                _this.callPlugins('onTouchMoveStart');

                if (params.loop) {
                    _this.fixLoop();
                    _this.positions.start = _this.getWrapperTranslate();
                }
                if (params.onTouchMoveStart) _this.fireCallback(params.onTouchMoveStart, _this);
            }
            _this.isMoved = true;

            // cancel event
            if (event.preventDefault) event.preventDefault();
            else event.returnValue = false;

            _this.touches.current = isH ? pageX : pageY;

            _this.positions.current = (_this.touches.current - _this.touches.start) * params.touchRatio + _this.positions.start;

            //Resistance Callbacks
            if (_this.positions.current > 0 && params.onResistanceBefore) {
                _this.fireCallback(params.onResistanceBefore, _this, _this.positions.current);
            }
            if (_this.positions.current < -maxWrapperPosition() && params.onResistanceAfter) {
                _this.fireCallback(params.onResistanceAfter, _this, Math.abs(_this.positions.current + maxWrapperPosition()));
            }
            //Resistance
            if (params.resistance && params.resistance !== '100%') {
                var resistance;
                //Resistance for Negative-Back sliding
                if (_this.positions.current > 0) {
                    resistance = 1 - _this.positions.current / containerSize / 2;
                    if (resistance < 0.5)
                        _this.positions.current = (containerSize / 2);
                    else
                        _this.positions.current = _this.positions.current * resistance;
                }
                //Resistance for After-End Sliding
                if (_this.positions.current < -maxWrapperPosition()) {

                    var diff = (_this.touches.current - _this.touches.start) * params.touchRatio + (maxWrapperPosition() + _this.positions.start);
                    resistance = (containerSize + diff) / (containerSize);
                    var newPos = _this.positions.current - diff * (1 - resistance) / 2;
                    var stopPos = -maxWrapperPosition() - containerSize / 2;

                    if (newPos < stopPos || resistance <= 0)
                        _this.positions.current = stopPos;
                    else
                        _this.positions.current = newPos;
                }
            }
            if (params.resistance && params.resistance === '100%') {
                var toStopPropogation = true;
                //Resistance for Negative-Back sliding
                if (_this.positions.current > 0 && !(params.freeMode && !params.freeModeFluid)) {
                    _this.positions.current = 0;
                    toStopPropogation = false;
                }
                //Resistance for After-End Sliding
                if (_this.positions.current < -maxWrapperPosition() && !(params.freeMode && !params.freeModeFluid)) {
                    _this.positions.current = -maxWrapperPosition();
                    toStopPropogation = false;
                }
                if (toStopPropogation) event.stopPropagation();
            }
            //Move Slides
            if (!params.followFinger) return;

            if (!params.moveStartThreshold) {
                _this.setWrapperTranslate(_this.positions.current);
            }
            else {
                if (Math.abs(_this.touches.current - _this.touches.start) > params.moveStartThreshold || allowThresholdMove) {
                    if (!allowThresholdMove) {
                        allowThresholdMove = true;
                        _this.touches.start = _this.touches.current;
                        return;
                    }
                    _this.setWrapperTranslate(_this.positions.current);
                }
                else {
                    _this.positions.current = _this.positions.start;
                }
            }

            if (params.freeMode || params.watchActiveIndex) {
                _this.updateActiveSlide(_this.positions.current);
            }

            //Grab Cursor
            if (params.grabCursor) {
                _this.container.style.cursor = 'move';
                _this.container.style.cursor = 'grabbing';
                _this.container.style.cursor = '-moz-grabbin';
                _this.container.style.cursor = '-webkit-grabbing';
            }
            //Velocity
            if (!velocityPrevPosition) velocityPrevPosition = _this.touches.current;
            if (!velocityPrevTime) velocityPrevTime = (new Date()).getTime();
            _this.velocity = (_this.touches.current - velocityPrevPosition) / ((new Date()).getTime() - velocityPrevTime) / 2;
            if (Math.abs(_this.touches.current - velocityPrevPosition) < 2) _this.velocity = 0;
            velocityPrevPosition = _this.touches.current;
            velocityPrevTime = (new Date()).getTime();
            //Callbacks
            _this.callPlugins('onTouchMoveEnd');
            if (params.onTouchMove) _this.fireCallback(params.onTouchMove, _this, event);

            return false;
        }

    }
    function onTouchEnd(event) {
        //Check For scrolling
        if (isScrolling) {
            _this.swipeReset();
        }
        // If slider is not touched exit
        if (params.onlyExternal || !_this.isTouched) return;
        _this.isTouched = false;

        //Return Grab Cursor
        if (params.grabCursor) {
            _this.container.style.cursor = 'move';
            _this.container.style.cursor = 'grab';
            _this.container.style.cursor = '-moz-grab';
            _this.container.style.cursor = '-webkit-grab';
        }

        //Check for Current Position
        if (!_this.positions.current && _this.positions.current !== 0) {
            _this.positions.current = _this.positions.start;
        }

        //For case if slider touched but not moved
        if (params.followFinger && _this.positions.start!=_this.positions.current) {
            _this.setWrapperTranslate(_this.positions.current);
        }

        // TouchEndTime
        _this.times.end = (new Date()).getTime();

        //Difference
        _this.touches.diff = _this.touches.current - _this.touches.start;
        _this.touches.abs = Math.abs(_this.touches.diff);

        _this.positions.diff = _this.positions.current - _this.positions.start;
        _this.positions.abs = Math.abs(_this.positions.diff);

        var diff = _this.positions.diff;
        var diffAbs = _this.positions.abs;
        var timeDiff = _this.times.end - _this.times.start;

        if (diffAbs < 5 && (timeDiff) < 300 && _this.allowLinks === false) {
            if (!params.freeMode && diffAbs !== 0) _this.swipeReset();
            //Release inner links
            if (params.preventLinks) {
                _this.allowLinks = true;
            }
            if (params.onSlideClick) {
                _this.allowSlideClick = true;
            }
        }

        setTimeout(function () {
            //Release inner links
            if (typeof _this === 'undefined' || _this === null) return;
            if (params.preventLinks) {
                _this.allowLinks = true;
            }
            if (params.onSlideClick) {
                _this.allowSlideClick = true;
            }
        }, 100);

        var maxPosition = maxWrapperPosition();

        //Not moved or Prevent Negative Back Sliding/After-End Sliding
        if (!_this.isMoved && params.freeMode) {
            _this.isMoved = false;
            if (params.onTouchEnd) _this.fireCallback(params.onTouchEnd, _this, event);
            _this.callPlugins('onTouchEnd');
            return;
        }
        if (!_this.isMoved || _this.positions.current > 0 || _this.positions.current < -maxPosition) {
            _this.swipeReset();
            if (params.onTouchEnd) _this.fireCallback(params.onTouchEnd, _this, event);
            _this.callPlugins('onTouchEnd');
            return;
        }

        _this.isMoved = false;

        //Free Mode
        if (params.freeMode) {
            if (params.freeModeFluid) {
                var momentumDuration = 1000 * params.momentumRatio;
                var momentumDistance = _this.velocity * momentumDuration;
                var newPosition = _this.positions.current + momentumDistance;
                var doBounce = false;
                var afterBouncePosition;
                var bounceAmount = Math.abs(_this.velocity) * 20 * params.momentumBounceRatio;
                if (newPosition < -maxPosition) {
                    if (params.momentumBounce && _this.support.transitions) {
                        if (newPosition + maxPosition < -bounceAmount) newPosition = -maxPosition - bounceAmount;
                        afterBouncePosition = -maxPosition;
                        doBounce = true;
                        allowMomentumBounce = true;
                    }
                    else newPosition = -maxPosition;
                }
                if (newPosition > 0) {
                    if (params.momentumBounce && _this.support.transitions) {
                        if (newPosition > bounceAmount) newPosition = bounceAmount;
                        afterBouncePosition = 0;
                        doBounce = true;
                        allowMomentumBounce = true;
                    }
                    else newPosition = 0;
                }
                //Fix duration
                if (_this.velocity !== 0) momentumDuration = Math.abs((newPosition - _this.positions.current) / _this.velocity);

                _this.setWrapperTranslate(newPosition);

                _this.setWrapperTransition(momentumDuration);

                if (params.momentumBounce && doBounce) {
                    _this.wrapperTransitionEnd(function () {
                        if (!allowMomentumBounce) return;
                        if (params.onMomentumBounce) _this.fireCallback(params.onMomentumBounce, _this);
                        _this.callPlugins('onMomentumBounce');

                        _this.setWrapperTranslate(afterBouncePosition);
                        _this.setWrapperTransition(300);
                    });
                }

                _this.updateActiveSlide(newPosition);
            }
            if (!params.freeModeFluid || timeDiff >= 300) _this.updateActiveSlide(_this.positions.current);

            if (params.onTouchEnd) _this.fireCallback(params.onTouchEnd, _this, event);
            _this.callPlugins('onTouchEnd');
            return;
        }

        //Direction
        direction = diff < 0 ? 'toNext' : 'toPrev';

        //Short Touches
        if (direction === 'toNext' && (timeDiff <= 300)) {
            if (diffAbs < 30 || !params.shortSwipes) _this.swipeReset();
            else _this.swipeNext(true);
        }

        if (direction === 'toPrev' && (timeDiff <= 300)) {
            if (diffAbs < 30 || !params.shortSwipes) _this.swipeReset();
            else _this.swipePrev(true);
        }

        //Long Touches
        var targetSlideSize = 0;
        if (params.slidesPerView === 'auto') {
            //Define current slide's width
            var currentPosition = Math.abs(_this.getWrapperTranslate());
            var slidesOffset = 0;
            var _slideSize;
            for (var i = 0; i < _this.slides.length; i++) {
                _slideSize = isH ? _this.slides[i].getWidth(true, params.roundLengths) : _this.slides[i].getHeight(true, params.roundLengths);
                slidesOffset += _slideSize;
                if (slidesOffset > currentPosition) {
                    targetSlideSize = _slideSize;
                    break;
                }
            }
            if (targetSlideSize > containerSize) targetSlideSize = containerSize;
        }
        else {
            targetSlideSize = slideSize * params.slidesPerView;
        }
        if (direction === 'toNext' && (timeDiff > 300)) {
            if (diffAbs >= targetSlideSize * params.longSwipesRatio) {
                _this.swipeNext(true);
            }
            else {
                _this.swipeReset();
            }
        }
        if (direction === 'toPrev' && (timeDiff > 300)) {
            if (diffAbs >= targetSlideSize * params.longSwipesRatio) {
                _this.swipePrev(true);
            }
            else {
                _this.swipeReset();
            }
        }
        if (params.onTouchEnd) _this.fireCallback(params.onTouchEnd, _this, event);
        _this.callPlugins('onTouchEnd');
    }


    /*==================================================
        noSwiping Bubble Check by Isaac Strack
    ====================================================*/
    function noSwipingSlide(el) {
        /*This function is specifically designed to check the parent elements for the noSwiping class, up to the wrapper.
        We need to check parents because while onTouchStart bubbles, _this.isTouched is checked in onTouchStart, which stops the bubbling.
        So, if a text box, for example, is the initial target, and the parent slide container has the noSwiping class, the _this.isTouched
        check will never find it, and what was supposed to be noSwiping is able to be swiped.
        This function will iterate up and check for the noSwiping class in parents, up through the wrapperClass.*/

        // First we create a truthy variable, which is that swiping is allowd (noSwiping = false)
        var noSwiping = false;

        // Now we iterate up (parentElements) until we reach the node with the wrapperClass.
        do {

            // Each time, we check to see if there's a 'swiper-no-swiping' class (noSwipingClass).
            if (el.className.indexOf(params.noSwipingClass) > -1)
            {
                noSwiping = true; // If there is, we set noSwiping = true;
            }

            el = el.parentElement;  // now we iterate up (parent node)

        } while (!noSwiping && el.parentElement && el.className.indexOf(params.wrapperClass) === -1); // also include el.parentElement truthy, just in case.

        // because we didn't check the wrapper itself, we do so now, if noSwiping is false:
        if (!noSwiping && el.className.indexOf(params.wrapperClass) > -1 && el.className.indexOf(params.noSwipingClass) > -1)
            noSwiping = true; // if the wrapper has the noSwipingClass, we set noSwiping = true;

        return noSwiping;
    }

    function addClassToHtmlString(klass, outerHtml) {
        var par = document.createElement('div');
        var child;

        par.innerHTML = outerHtml;
        child = par.firstChild;
        child.className += ' ' + klass;

        return child.outerHTML;
    }


    /*==================================================
        Swipe Functions
    ====================================================*/
    _this.swipeNext = function (internal) {
        if (!internal && params.loop) _this.fixLoop();
        if (!internal && params.autoplay) _this.stopAutoplay(true);
        _this.callPlugins('onSwipeNext');
        var currentPosition = _this.getWrapperTranslate();
        var newPosition = currentPosition;
        if (params.slidesPerView === 'auto') {
            for (var i = 0; i < _this.snapGrid.length; i++) {
                if (-currentPosition >= _this.snapGrid[i] && -currentPosition < _this.snapGrid[i + 1]) {
                    newPosition = -_this.snapGrid[i + 1];
                    break;
                }
            }
        }
        else {
            var groupSize = slideSize * params.slidesPerGroup;
            newPosition = -(Math.floor(Math.abs(currentPosition) / Math.floor(groupSize)) * groupSize + groupSize);
        }
        if (newPosition < -maxWrapperPosition()) {
            newPosition = -maxWrapperPosition();
        }
        if (newPosition === currentPosition) return false;
        swipeToPosition(newPosition, 'next');
        return true;
    };
    _this.swipePrev = function (internal) {
        if (!internal && params.loop) _this.fixLoop();
        if (!internal && params.autoplay) _this.stopAutoplay(true);
        _this.callPlugins('onSwipePrev');

        var currentPosition = Math.ceil(_this.getWrapperTranslate());
        var newPosition;
        if (params.slidesPerView === 'auto') {
            newPosition = 0;
            for (var i = 1; i < _this.snapGrid.length; i++) {
                if (-currentPosition === _this.snapGrid[i]) {
                    newPosition = -_this.snapGrid[i - 1];
                    break;
                }
                if (-currentPosition > _this.snapGrid[i] && -currentPosition < _this.snapGrid[i + 1]) {
                    newPosition = -_this.snapGrid[i];
                    break;
                }
            }
        }
        else {
            var groupSize = slideSize * params.slidesPerGroup;
            newPosition = -(Math.ceil(-currentPosition / groupSize) - 1) * groupSize;
        }

        if (newPosition > 0) newPosition = 0;

        if (newPosition === currentPosition) return false;
        swipeToPosition(newPosition, 'prev');
        return true;

    };
    _this.swipeReset = function () {
        _this.callPlugins('onSwipeReset');
        var currentPosition = _this.getWrapperTranslate();
        var groupSize = slideSize * params.slidesPerGroup;
        var newPosition;
        var maxPosition = -maxWrapperPosition();
        if (params.slidesPerView === 'auto') {
            newPosition = 0;
            for (var i = 0; i < _this.snapGrid.length; i++) {
                if (-currentPosition === _this.snapGrid[i]) return;
                if (-currentPosition >= _this.snapGrid[i] && -currentPosition < _this.snapGrid[i + 1]) {
                    if (_this.positions.diff > 0) newPosition = -_this.snapGrid[i + 1];
                    else newPosition = -_this.snapGrid[i];
                    break;
                }
            }
            if (-currentPosition >= _this.snapGrid[_this.snapGrid.length - 1]) newPosition = -_this.snapGrid[_this.snapGrid.length - 1];
            if (currentPosition <= -maxWrapperPosition()) newPosition = -maxWrapperPosition();
        }
        else {
            newPosition = currentPosition < 0 ? Math.round(currentPosition / groupSize) * groupSize : 0;
            if (currentPosition <= -maxWrapperPosition()) newPosition = -maxWrapperPosition();
        }
        if (params.scrollContainer)  {
            newPosition = currentPosition < 0 ? currentPosition : 0;
        }
        if (newPosition < -maxWrapperPosition()) {
            newPosition = -maxWrapperPosition();
        }
        if (params.scrollContainer && (containerSize > slideSize)) {
            newPosition = 0;
        }

        if (newPosition === currentPosition) return false;

        swipeToPosition(newPosition, 'reset');
        return true;
    };

    _this.swipeTo = function (index, speed, runCallbacks) {
        index = parseInt(index, 10);
        _this.callPlugins('onSwipeTo', {index: index, speed: speed});
        if (params.loop) index = index + _this.loopedSlides;

        var currentPosition = _this.getWrapperTranslate();
        if (index > (_this.slides.length - 1) || index < 0) return;
        var newPosition;
        if (params.slidesPerView === 'auto') {
            newPosition = -_this.slidesGrid[index];
        }
        else {
            newPosition = -index * slideSize;
        }
        if (newPosition < - maxWrapperPosition()) {
            newPosition = - maxWrapperPosition();
        }
        if (newPosition === currentPosition) return false;

        runCallbacks = runCallbacks === false ? false : true;

        swipeToPosition(newPosition, 'to', {index: index, speed: speed, runCallbacks: runCallbacks});
        return true;
    };

    function swipeToPosition(newPosition, action, toOptions) {
        var speed = (action === 'to' && toOptions.speed >= 0) ? toOptions.speed : params.speed;
        var timeOld = + new Date();

        function anim() {
            var timeNew = + new Date();
            var time = timeNew - timeOld;
            currentPosition += animationStep * time / (1000 / 60);
            condition = direction === 'toNext' ? currentPosition > newPosition : currentPosition < newPosition;
            if (condition) {
                _this.setWrapperTranslate(Math.ceil(currentPosition));
                _this._DOMAnimating = true;
                window.setTimeout(function () {
                    anim();
                }, 1000 / 60);
            }
            else {
                if (params.onSlideChangeEnd) {
                    if (action === 'to') {
                        if (toOptions.runCallbacks === true) _this.fireCallback(params.onSlideChangeEnd, _this, direction);
                    }
                    else {
                        _this.fireCallback(params.onSlideChangeEnd, _this, direction);
                    }
                    
                }
                _this.setWrapperTranslate(newPosition);
                _this._DOMAnimating = false;
            }
        }

        if (_this.support.transitions || !params.DOMAnimation) {
            _this.setWrapperTranslate(newPosition);
            _this.setWrapperTransition(speed);
        }
        else {
            //Try the DOM animation
            var currentPosition = _this.getWrapperTranslate();
            var animationStep = Math.ceil((newPosition - currentPosition) / speed * (1000 / 60));
            var direction = currentPosition > newPosition ? 'toNext' : 'toPrev';
            var condition = direction === 'toNext' ? currentPosition > newPosition : currentPosition < newPosition;
            if (_this._DOMAnimating) return;

            anim();
        }

        //Update Active Slide Index
        _this.updateActiveSlide(newPosition);

        //Callbacks
        if (params.onSlideNext && action === 'next') {
            _this.fireCallback(params.onSlideNext, _this, newPosition);
        }
        if (params.onSlidePrev && action === 'prev') {
            _this.fireCallback(params.onSlidePrev, _this, newPosition);
        }
        //'Reset' Callback
        if (params.onSlideReset && action === 'reset') {
            _this.fireCallback(params.onSlideReset, _this, newPosition);
        }

        //'Next', 'Prev' and 'To' Callbacks
        if (action === 'next' || action === 'prev' || (action === 'to' && toOptions.runCallbacks === true))
            slideChangeCallbacks(action);
    }
    /*==================================================
        Transition Callbacks
    ====================================================*/
    //Prevent Multiple Callbacks
    _this._queueStartCallbacks = false;
    _this._queueEndCallbacks = false;
    function slideChangeCallbacks(direction) {
        //Transition Start Callback
        _this.callPlugins('onSlideChangeStart');
        if (params.onSlideChangeStart) {
            if (params.queueStartCallbacks && _this.support.transitions) {
                if (_this._queueStartCallbacks) return;
                _this._queueStartCallbacks = true;
                _this.fireCallback(params.onSlideChangeStart, _this, direction);
                _this.wrapperTransitionEnd(function () {
                    _this._queueStartCallbacks = false;
                });
            }
            else _this.fireCallback(params.onSlideChangeStart, _this, direction);
        }
        //Transition End Callback
        if (params.onSlideChangeEnd) {
            if (_this.support.transitions) {
                if (params.queueEndCallbacks) {
                    if (_this._queueEndCallbacks) return;
                    _this._queueEndCallbacks = true;
                    _this.wrapperTransitionEnd(function (swiper) {
                        _this.fireCallback(params.onSlideChangeEnd, swiper, direction);
                    });
                }
                else {
                    _this.wrapperTransitionEnd(function (swiper) {
                        _this.fireCallback(params.onSlideChangeEnd, swiper, direction);
                    });
                }
            }
            else {
                if (!params.DOMAnimation) {
                    setTimeout(function () {
                        _this.fireCallback(params.onSlideChangeEnd, _this, direction);
                    }, 10);
                }
            }
        }
    }

    /*==================================================
        Update Active Slide Index
    ====================================================*/
    _this.updateActiveSlide = function (position) {
        if (!_this.initialized) return;
        if (_this.slides.length === 0) return;
        _this.previousIndex = _this.activeIndex;
        if (typeof position === 'undefined') position = _this.getWrapperTranslate();
        if (position > 0) position = 0;
        var i;
        if (params.slidesPerView === 'auto') {
            var slidesOffset = 0;
            _this.activeIndex = _this.slidesGrid.indexOf(-position);
            if (_this.activeIndex < 0) {
                for (i = 0; i < _this.slidesGrid.length - 1; i++) {
                    if (-position > _this.slidesGrid[i] && -position < _this.slidesGrid[i + 1]) {
                        break;
                    }
                }
                var leftDistance = Math.abs(_this.slidesGrid[i] + position);
                var rightDistance = Math.abs(_this.slidesGrid[i + 1] + position);
                if (leftDistance <= rightDistance) _this.activeIndex = i;
                else _this.activeIndex = i + 1;
            }
        }
        else {
            _this.activeIndex = Math[params.visibilityFullFit ? 'ceil' : 'round'](-position / slideSize);
        }

        if (_this.activeIndex === _this.slides.length) _this.activeIndex = _this.slides.length - 1;
        if (_this.activeIndex < 0) _this.activeIndex = 0;

        // Check for slide
        if (!_this.slides[_this.activeIndex]) return;

        // Calc Visible slides
        _this.calcVisibleSlides(position);

        // Mark visible and active slides with additonal classes
        if (_this.support.classList) {
            var slide;
            for (i = 0; i < _this.slides.length; i++) {
                slide = _this.slides[i];
                slide.classList.remove(params.slideActiveClass);
                if (_this.visibleSlides.indexOf(slide) >= 0) {
                    slide.classList.add(params.slideVisibleClass);
                } else {
                    slide.classList.remove(params.slideVisibleClass);
                }
            }
            _this.slides[_this.activeIndex].classList.add(params.slideActiveClass);
        } else {
            var activeClassRegexp = new RegExp('\\s*' + params.slideActiveClass);
            var inViewClassRegexp = new RegExp('\\s*' + params.slideVisibleClass);

            for (i = 0; i < _this.slides.length; i++) {
                _this.slides[i].className = _this.slides[i].className.replace(activeClassRegexp, '').replace(inViewClassRegexp, '');
                if (_this.visibleSlides.indexOf(_this.slides[i]) >= 0) {
                    _this.slides[i].className += ' ' + params.slideVisibleClass;
                }
            }
            _this.slides[_this.activeIndex].className += ' ' + params.slideActiveClass;
        }

        //Update loop index
        if (params.loop) {
            var ls = _this.loopedSlides;
            _this.activeLoopIndex = _this.activeIndex - ls;
            if (_this.activeLoopIndex >= _this.slides.length - ls * 2) {
                _this.activeLoopIndex = _this.slides.length - ls * 2 - _this.activeLoopIndex;
            }
            if (_this.activeLoopIndex < 0) {
                _this.activeLoopIndex = _this.slides.length - ls * 2 + _this.activeLoopIndex;
            }
            if (_this.activeLoopIndex < 0) _this.activeLoopIndex = 0;
        }
        else {
            _this.activeLoopIndex = _this.activeIndex;
        }
        //Update Pagination
        if (params.pagination) {
            _this.updatePagination(position);
        }
    };
    /*==================================================
        Pagination
    ====================================================*/
    _this.createPagination = function (firstInit) {
        if (params.paginationClickable && _this.paginationButtons) {
            removePaginationEvents();
        }
        _this.paginationContainer = params.pagination.nodeType ? params.pagination : $$(params.pagination)[0];
        if (params.createPagination) {
            var paginationHTML = '';
            var numOfSlides = _this.slides.length;
            var numOfButtons = numOfSlides;
            if (params.loop) numOfButtons -= _this.loopedSlides * 2;
            for (var i = 0; i < numOfButtons; i++) {
                paginationHTML += '<' + params.paginationElement + ' class="' + params.paginationElementClass + '"></' + params.paginationElement + '>';
            }
            _this.paginationContainer.innerHTML = paginationHTML;
        }
        _this.paginationButtons = $$('.' + params.paginationElementClass, _this.paginationContainer);
        if (!firstInit) _this.updatePagination();
        _this.callPlugins('onCreatePagination');
        if (params.paginationClickable) {
            addPaginationEvents();
        }
    };
    function removePaginationEvents() {
        var pagers = _this.paginationButtons;
        if (pagers) {
            for (var i = 0; i < pagers.length; i++) {
                _this.h.removeEventListener(pagers[i], 'click', paginationClick);
            }
        }
    }
    function addPaginationEvents() {
        var pagers = _this.paginationButtons;
        if (pagers) {
            for (var i = 0; i < pagers.length; i++) {
                _this.h.addEventListener(pagers[i], 'click', paginationClick);
            }
        }
    }
    function paginationClick(e) {
        var index;
        var target = e.target || e.srcElement;
        var pagers = _this.paginationButtons;
        for (var i = 0; i < pagers.length; i++) {
            if (target === pagers[i]) index = i;
        }
        if (params.autoplay) _this.stopAutoplay(true);
        _this.swipeTo(index);
    }
    _this.updatePagination = function (position) {
        if (!params.pagination) return;
        if (_this.slides.length < 1) return;
        var activePagers = $$('.' + params.paginationActiveClass, _this.paginationContainer);
        if (!activePagers) return;

        //Reset all Buttons' class to not active
        var pagers = _this.paginationButtons;
        if (pagers.length === 0) return;
        for (var i = 0; i < pagers.length; i++) {
            pagers[i].className = params.paginationElementClass;
        }

        var indexOffset = params.loop ? _this.loopedSlides : 0;
        if (params.paginationAsRange) {
            if (!_this.visibleSlides) _this.calcVisibleSlides(position);
            //Get Visible Indexes
            var visibleIndexes = [];
            var j; // lopp index - avoid JSHint W004 / W038
            for (j = 0; j < _this.visibleSlides.length; j++) {
                var visIndex = _this.slides.indexOf(_this.visibleSlides[j]) - indexOffset;

                if (params.loop && visIndex < 0) {
                    visIndex = _this.slides.length - _this.loopedSlides * 2 + visIndex;
                }
                if (params.loop && visIndex >= _this.slides.length - _this.loopedSlides * 2) {
                    visIndex = _this.slides.length - _this.loopedSlides * 2 - visIndex;
                    visIndex = Math.abs(visIndex);
                }
                visibleIndexes.push(visIndex);
            }

            for (j = 0; j < visibleIndexes.length; j++) {
                if (pagers[visibleIndexes[j]]) pagers[visibleIndexes[j]].className += ' ' + params.paginationVisibleClass;
            }

            if (params.loop) {
                if (pagers[_this.activeLoopIndex] !== undefined) {
                    pagers[_this.activeLoopIndex].className += ' ' + params.paginationActiveClass;
                }
            }
            else {
                pagers[_this.activeIndex].className += ' ' + params.paginationActiveClass;
            }
        }
        else {
            if (params.loop) {
                if (pagers[_this.activeLoopIndex]) pagers[_this.activeLoopIndex].className += ' ' + params.paginationActiveClass + ' ' + params.paginationVisibleClass;
            }
            else {
                pagers[_this.activeIndex].className += ' ' + params.paginationActiveClass + ' ' + params.paginationVisibleClass;
            }
        }
    };
    _this.calcVisibleSlides = function (position) {
        var visibleSlides = [];
        var _slideLeft = 0, _slideSize = 0, _slideRight = 0;
        if (isH && _this.wrapperLeft > 0) position = position + _this.wrapperLeft;
        if (!isH && _this.wrapperTop > 0) position = position + _this.wrapperTop;

        for (var i = 0; i < _this.slides.length; i++) {
            _slideLeft += _slideSize;
            if (params.slidesPerView === 'auto')
                _slideSize  = isH ? _this.h.getWidth(_this.slides[i], true, params.roundLengths) : _this.h.getHeight(_this.slides[i], true, params.roundLengths);
            else _slideSize = slideSize;

            _slideRight = _slideLeft + _slideSize;
            var isVisibile = false;
            if (params.visibilityFullFit) {
                if (_slideLeft >= -position && _slideRight <= -position + containerSize) isVisibile = true;
                if (_slideLeft <= -position && _slideRight >= -position + containerSize) isVisibile = true;
            }
            else {
                if (_slideRight > -position && _slideRight <= ((-position + containerSize))) isVisibile = true;
                if (_slideLeft >= -position && _slideLeft < ((-position + containerSize))) isVisibile = true;
                if (_slideLeft < -position && _slideRight > ((-position + containerSize))) isVisibile = true;
            }

            if (isVisibile) visibleSlides.push(_this.slides[i]);

        }
        if (visibleSlides.length === 0) visibleSlides = [_this.slides[_this.activeIndex]];

        _this.visibleSlides = visibleSlides;
    };

    /*==========================================
        Autoplay
    ============================================*/
    var autoplayTimeoutId, autoplayIntervalId;
    _this.startAutoplay = function () {
        if (_this.support.transitions) {
            if (typeof autoplayTimeoutId !== 'undefined') return false;
            if (!params.autoplay) return;
            _this.callPlugins('onAutoplayStart');
            if (params.onAutoplayStart) _this.fireCallback(params.onAutoplayStart, _this);
            autoplay();
        }
        else {
            if (typeof autoplayIntervalId !== 'undefined') return false;
            if (!params.autoplay) return;
            _this.callPlugins('onAutoplayStart');
            if (params.onAutoplayStart) _this.fireCallback(params.onAutoplayStart, _this);
            autoplayIntervalId = setInterval(function () {
                if (params.loop) {
                    _this.fixLoop();
                    _this.swipeNext(true);
                }
                else if (!_this.swipeNext(true)) {
                    if (!params.autoplayStopOnLast) _this.swipeTo(0);
                    else {
                        clearInterval(autoplayIntervalId);
                        autoplayIntervalId = undefined;
                    }
                }
            }, params.autoplay);
        }
    };
    _this.stopAutoplay = function (internal) {
        if (_this.support.transitions) {
            if (!autoplayTimeoutId) return;
            if (autoplayTimeoutId) clearTimeout(autoplayTimeoutId);
            autoplayTimeoutId = undefined;
            if (internal && !params.autoplayDisableOnInteraction) {
                _this.wrapperTransitionEnd(function () {
                    autoplay();
                });
            }
            _this.callPlugins('onAutoplayStop');
            if (params.onAutoplayStop) _this.fireCallback(params.onAutoplayStop, _this);
        }
        else {
            if (autoplayIntervalId) clearInterval(autoplayIntervalId);
            autoplayIntervalId = undefined;
            _this.callPlugins('onAutoplayStop');
            if (params.onAutoplayStop) _this.fireCallback(params.onAutoplayStop, _this);
        }
    };
    function autoplay() {
        autoplayTimeoutId = setTimeout(function () {
            if (params.loop) {
                _this.fixLoop();
                _this.swipeNext(true);
            }
            else if (!_this.swipeNext(true)) {
                if (!params.autoplayStopOnLast) _this.swipeTo(0);
                else {
                    clearTimeout(autoplayTimeoutId);
                    autoplayTimeoutId = undefined;
                }
            }
            _this.wrapperTransitionEnd(function () {
                if (typeof autoplayTimeoutId !== 'undefined') autoplay();
            });
        }, params.autoplay);
    }
    /*==================================================
        Loop
    ====================================================*/
    _this.loopCreated = false;
    _this.removeLoopedSlides = function () {
        if (_this.loopCreated) {
            for (var i = 0; i < _this.slides.length; i++) {
                if (_this.slides[i].getData('looped') === true) _this.wrapper.removeChild(_this.slides[i]);
            }
        }
    };

    _this.createLoop = function () {
        if (_this.slides.length === 0) return;
        if (params.slidesPerView === 'auto') {
            _this.loopedSlides = params.loopedSlides || 1;
        }
        else {
            _this.loopedSlides = params.slidesPerView + params.loopAdditionalSlides;
        }

        if (_this.loopedSlides > _this.slides.length) {
            _this.loopedSlides = _this.slides.length;
        }

        var slideFirstHTML = '',
            slideLastHTML = '',
            i;
        var slidesSetFullHTML = '';
        /**
                loopedSlides is too large if loopAdditionalSlides are set.
                Need to divide the slides by maximum number of slides existing.

                @author        Tomaz Lovrec <tomaz.lovrec@blanc-noir.at>
        */
        var numSlides = _this.slides.length;
        var fullSlideSets = Math.floor(_this.loopedSlides / numSlides);
        var remainderSlides = _this.loopedSlides % numSlides;
        // assemble full sets of slides
        for (i = 0; i < (fullSlideSets * numSlides); i++) {
            var j = i;
            if (i >= numSlides) {
                var over = Math.floor(i / numSlides);
                j = i - (numSlides * over);
            }
            slidesSetFullHTML += _this.slides[j].outerHTML;
        }
        // assemble remainder slides
        // assemble remainder appended to existing slides
        for (i = 0; i < remainderSlides;i++) {
            slideLastHTML += addClassToHtmlString(params.slideDuplicateClass, _this.slides[i].outerHTML);
        }
        // assemble slides that get preppended to existing slides
        for (i = numSlides - remainderSlides; i < numSlides;i++) {
            slideFirstHTML += addClassToHtmlString(params.slideDuplicateClass, _this.slides[i].outerHTML);
        }
        // assemble all slides
        var slides = slideFirstHTML + slidesSetFullHTML + wrapper.innerHTML + slidesSetFullHTML + slideLastHTML;
        // set the slides
        wrapper.innerHTML = slides;

        _this.loopCreated = true;
        _this.calcSlides();

        //Update Looped Slides with special class
        for (i = 0; i < _this.slides.length; i++) {
            if (i < _this.loopedSlides || i >= _this.slides.length - _this.loopedSlides) _this.slides[i].setData('looped', true);
        }
        _this.callPlugins('onCreateLoop');

    };

    _this.fixLoop = function () {
        var newIndex;
        //Fix For Negative Oversliding
        if (_this.activeIndex < _this.loopedSlides) {
            newIndex = _this.slides.length - _this.loopedSlides * 3 + _this.activeIndex;
            _this.swipeTo(newIndex, 0, false);
        }
        //Fix For Positive Oversliding
        else if ((params.slidesPerView === 'auto' && _this.activeIndex >= _this.loopedSlides * 2) || (_this.activeIndex > _this.slides.length - params.slidesPerView * 2)) {
            newIndex = -_this.slides.length + _this.activeIndex + _this.loopedSlides;
            _this.swipeTo(newIndex, 0, false);
        }
    };

    /*==================================================
        Slides Loader
    ====================================================*/
    _this.loadSlides = function () {
        var slidesHTML = '';
        _this.activeLoaderIndex = 0;
        var slides = params.loader.slides;
        var slidesToLoad = params.loader.loadAllSlides ? slides.length : params.slidesPerView * (1 + params.loader.surroundGroups);
        for (var i = 0; i < slidesToLoad; i++) {
            if (params.loader.slidesHTMLType === 'outer') slidesHTML += slides[i];
            else {
                slidesHTML += '<' + params.slideElement + ' class="' + params.slideClass + '" data-swiperindex="' + i + '">' + slides[i] + '</' + params.slideElement + '>';
            }
        }
        _this.wrapper.innerHTML = slidesHTML;
        _this.calcSlides(true);
        //Add permanent transitionEnd callback
        if (!params.loader.loadAllSlides) {
            _this.wrapperTransitionEnd(_this.reloadSlides, true);
        }
    };

    _this.reloadSlides = function () {
        var slides = params.loader.slides;
        var newActiveIndex = parseInt(_this.activeSlide().data('swiperindex'), 10);
        if (newActiveIndex < 0 || newActiveIndex > slides.length - 1) return; //<-- Exit
        _this.activeLoaderIndex = newActiveIndex;
        var firstIndex = Math.max(0, newActiveIndex - params.slidesPerView * params.loader.surroundGroups);
        var lastIndex = Math.min(newActiveIndex + params.slidesPerView * (1 + params.loader.surroundGroups) - 1, slides.length - 1);
        //Update Transforms
        if (newActiveIndex > 0) {
            var newTransform = -slideSize * (newActiveIndex - firstIndex);
            _this.setWrapperTranslate(newTransform);
            _this.setWrapperTransition(0);
        }
        var i; // loop index
        //New Slides
        if (params.loader.logic === 'reload') {
            _this.wrapper.innerHTML = '';
            var slidesHTML = '';
            for (i = firstIndex; i <= lastIndex; i++) {
                slidesHTML += params.loader.slidesHTMLType === 'outer' ? slides[i] : '<' + params.slideElement + ' class="' + params.slideClass + '" data-swiperindex="' + i + '">' + slides[i] + '</' + params.slideElement + '>';
            }
            _this.wrapper.innerHTML = slidesHTML;
        }
        else {
            var minExistIndex = 1000;
            var maxExistIndex = 0;

            for (i = 0; i < _this.slides.length; i++) {
                var index = _this.slides[i].data('swiperindex');
                if (index < firstIndex || index > lastIndex) {
                    _this.wrapper.removeChild(_this.slides[i]);
                }
                else {
                    minExistIndex = Math.min(index, minExistIndex);
                    maxExistIndex = Math.max(index, maxExistIndex);
                }
            }
            for (i = firstIndex; i <= lastIndex; i++) {
                var newSlide;
                if (i < minExistIndex) {
                    newSlide = document.createElement(params.slideElement);
                    newSlide.className = params.slideClass;
                    newSlide.setAttribute('data-swiperindex', i);
                    newSlide.innerHTML = slides[i];
                    _this.wrapper.insertBefore(newSlide, _this.wrapper.firstChild);
                }
                if (i > maxExistIndex) {
                    newSlide = document.createElement(params.slideElement);
                    newSlide.className = params.slideClass;
                    newSlide.setAttribute('data-swiperindex', i);
                    newSlide.innerHTML = slides[i];
                    _this.wrapper.appendChild(newSlide);
                }
            }
        }
        //reInit
        _this.reInit(true);
    };

    /*==================================================
        Make Swiper
    ====================================================*/
    function makeSwiper() {
        _this.calcSlides();
        if (params.loader.slides.length > 0 && _this.slides.length === 0) {
            _this.loadSlides();
        }
        if (params.loop) {
            _this.createLoop();
        }
        _this.init();
        initEvents();
        if (params.pagination) {
            _this.createPagination(true);
        }

        if (params.loop || params.initialSlide > 0) {
            _this.swipeTo(params.initialSlide, 0, false);
        }
        else {
            _this.updateActiveSlide(0);
        }
        if (params.autoplay) {
            _this.startAutoplay();
        }
        /**
         * Set center slide index.
         *
         * @author        Tomaz Lovrec <tomaz.lovrec@gmail.com>
         */
        _this.centerIndex = _this.activeIndex;

        // Callbacks
        if (params.onSwiperCreated) _this.fireCallback(params.onSwiperCreated, _this);
        _this.callPlugins('onSwiperCreated');
    }

    makeSwiper();
};

Swiper.prototype = {
    plugins : {},

    /*==================================================
        Wrapper Operations
    ====================================================*/
    wrapperTransitionEnd : function (callback, permanent) {
        'use strict';
        var a = this,
            el = a.wrapper,
            events = ['webkitTransitionEnd', 'transitionend', 'oTransitionEnd', 'MSTransitionEnd', 'msTransitionEnd'],
            i;

        function fireCallBack(e) {
            if (e.target !== el) return;
            callback(a);
            if (a.params.queueEndCallbacks) a._queueEndCallbacks = false;
            if (!permanent) {
                for (i = 0; i < events.length; i++) {
                    a.h.removeEventListener(el, events[i], fireCallBack);
                }
            }
        }

        if (callback) {
            for (i = 0; i < events.length; i++) {
                a.h.addEventListener(el, events[i], fireCallBack);
            }
        }
    },

    getWrapperTranslate : function (axis) {
        'use strict';
        var el = this.wrapper,
            matrix, curTransform, curStyle, transformMatrix;

        // automatic axis detection
        if (typeof axis === 'undefined') {
            axis = this.params.mode === 'horizontal' ? 'x' : 'y';
        }

        if (this.support.transforms && this.params.useCSS3Transforms) {
            curStyle = window.getComputedStyle(el, null);
            if (window.WebKitCSSMatrix) {
                // Some old versions of Webkit choke when 'none' is passed; pass
                // empty string instead in this case
                transformMatrix = new WebKitCSSMatrix(curStyle.webkitTransform === 'none' ? '' : curStyle.webkitTransform);
            }
            else {
                transformMatrix = curStyle.MozTransform || curStyle.OTransform || curStyle.MsTransform || curStyle.msTransform  || curStyle.transform || curStyle.getPropertyValue('transform').replace('translate(', 'matrix(1, 0, 0, 1,');
                matrix = transformMatrix.toString().split(',');
            }

            if (axis === 'x') {
                //Latest Chrome and webkits Fix
                if (window.WebKitCSSMatrix)
                    curTransform = transformMatrix.m41;
                //Crazy IE10 Matrix
                else if (matrix.length === 16)
                    curTransform = parseFloat(matrix[12]);
                //Normal Browsers
                else
                    curTransform = parseFloat(matrix[4]);
            }
            if (axis === 'y') {
                //Latest Chrome and webkits Fix
                if (window.WebKitCSSMatrix)
                    curTransform = transformMatrix.m42;
                //Crazy IE10 Matrix
                else if (matrix.length === 16)
                    curTransform = parseFloat(matrix[13]);
                //Normal Browsers
                else
                    curTransform = parseFloat(matrix[5]);
            }
        }
        else {
            if (axis === 'x') curTransform = parseFloat(el.style.left, 10) || 0;
            if (axis === 'y') curTransform = parseFloat(el.style.top, 10) || 0;
        }
        return curTransform || 0;
    },

    setWrapperTranslate : function (x, y, z) {
        'use strict';
        var es = this.wrapper.style,
            coords = {x: 0, y: 0, z: 0},
            translate;

        // passed all coordinates
        if (arguments.length === 3) {
            coords.x = x;
            coords.y = y;
            coords.z = z;
        }

        // passed one coordinate and optional axis
        else {
            if (typeof y === 'undefined') {
                y = this.params.mode === 'horizontal' ? 'x' : 'y';
            }
            coords[y] = x;
        }

        if (this.support.transforms && this.params.useCSS3Transforms) {
            translate = this.support.transforms3d ? 'translate3d(' + coords.x + 'px, ' + coords.y + 'px, ' + coords.z + 'px)' : 'translate(' + coords.x + 'px, ' + coords.y + 'px)';
            es.webkitTransform = es.MsTransform = es.msTransform = es.MozTransform = es.OTransform = es.transform = translate;
        }
        else {
            es.left = coords.x + 'px';
            es.top  = coords.y + 'px';
        }
        this.callPlugins('onSetWrapperTransform', coords);
        if (this.params.onSetWrapperTransform) this.fireCallback(this.params.onSetWrapperTransform, this, coords);
    },

    setWrapperTransition : function (duration) {
        'use strict';
        var es = this.wrapper.style;
        es.webkitTransitionDuration = es.MsTransitionDuration = es.msTransitionDuration = es.MozTransitionDuration = es.OTransitionDuration = es.transitionDuration = (duration / 1000) + 's';
        this.callPlugins('onSetWrapperTransition', {duration: duration});
        if (this.params.onSetWrapperTransition) this.fireCallback(this.params.onSetWrapperTransition, this, duration);

    },

    /*==================================================
        Helpers
    ====================================================*/
    h : {
        getWidth: function (el, outer, round) {
            'use strict';
            var width = window.getComputedStyle(el, null).getPropertyValue('width');
            var returnWidth = parseFloat(width);
            //IE Fixes
            if (isNaN(returnWidth) || width.indexOf('%') > 0 || returnWidth < 0) {
                returnWidth = el.offsetWidth - parseFloat(window.getComputedStyle(el, null).getPropertyValue('padding-left')) - parseFloat(window.getComputedStyle(el, null).getPropertyValue('padding-right'));
            }
            if (outer) returnWidth += parseFloat(window.getComputedStyle(el, null).getPropertyValue('padding-left')) + parseFloat(window.getComputedStyle(el, null).getPropertyValue('padding-right'));
            if (round) return Math.ceil(returnWidth);
            else return returnWidth;
        },
        getHeight: function (el, outer, round) {
            'use strict';
            if (outer) return el.offsetHeight;

            var height = window.getComputedStyle(el, null).getPropertyValue('height');
            var returnHeight = parseFloat(height);
            //IE Fixes
            if (isNaN(returnHeight) || height.indexOf('%') > 0 || returnHeight < 0) {
                returnHeight = el.offsetHeight - parseFloat(window.getComputedStyle(el, null).getPropertyValue('padding-top')) - parseFloat(window.getComputedStyle(el, null).getPropertyValue('padding-bottom'));
            }
            if (outer) returnHeight += parseFloat(window.getComputedStyle(el, null).getPropertyValue('padding-top')) + parseFloat(window.getComputedStyle(el, null).getPropertyValue('padding-bottom'));
            if (round) return Math.ceil(returnHeight);
            else return returnHeight;
        },
        getOffset: function (el) {
            'use strict';
            var box = el.getBoundingClientRect();
            var body = document.body;
            var clientTop  = el.clientTop  || body.clientTop  || 0;
            var clientLeft = el.clientLeft || body.clientLeft || 0;
            var scrollTop  = window.pageYOffset || el.scrollTop;
            var scrollLeft = window.pageXOffset || el.scrollLeft;
            if (document.documentElement && !window.pageYOffset) {
                //IE7-8
                scrollTop  = document.documentElement.scrollTop;
                scrollLeft = document.documentElement.scrollLeft;
            }
            return {
                top: box.top  + scrollTop  - clientTop,
                left: box.left + scrollLeft - clientLeft
            };
        },
        windowWidth : function () {
            'use strict';
            if (window.innerWidth) return window.innerWidth;
            else if (document.documentElement && document.documentElement.clientWidth) return document.documentElement.clientWidth;
        },
        windowHeight : function () {
            'use strict';
            if (window.innerHeight) return window.innerHeight;
            else if (document.documentElement && document.documentElement.clientHeight) return document.documentElement.clientHeight;
        },
        windowScroll : function () {
            'use strict';
            if (typeof pageYOffset !== 'undefined') {
                return {
                    left: window.pageXOffset,
                    top: window.pageYOffset
                };
            }
            else if (document.documentElement) {
                return {
                    left: document.documentElement.scrollLeft,
                    top: document.documentElement.scrollTop
                };
            }
        },

        addEventListener : function (el, event, listener, useCapture) {
            'use strict';
            if (typeof useCapture === 'undefined') {
                useCapture = false;
            }

            if (el.addEventListener) {
                el.addEventListener(event, listener, useCapture);
            }
            else if (el.attachEvent) {
                el.attachEvent('on' + event, listener);
            }
        },

        removeEventListener : function (el, event, listener, useCapture) {
            'use strict';
            if (typeof useCapture === 'undefined') {
                useCapture = false;
            }

            if (el.removeEventListener) {
                el.removeEventListener(event, listener, useCapture);
            }
            else if (el.detachEvent) {
                el.detachEvent('on' + event, listener);
            }
        }
    },
    setTransform : function (el, transform) {
        'use strict';
        var es = el.style;
        es.webkitTransform = es.MsTransform = es.msTransform = es.MozTransform = es.OTransform = es.transform = transform;
    },
    setTranslate : function (el, translate) {
        'use strict';
        var es = el.style;
        var pos = {
            x : translate.x || 0,
            y : translate.y || 0,
            z : translate.z || 0
        };
        var transformString = this.support.transforms3d ? 'translate3d(' + (pos.x) + 'px,' + (pos.y) + 'px,' + (pos.z) + 'px)' : 'translate(' + (pos.x) + 'px,' + (pos.y) + 'px)';
        es.webkitTransform = es.MsTransform = es.msTransform = es.MozTransform = es.OTransform = es.transform = transformString;
        if (!this.support.transforms) {
            es.left = pos.x + 'px';
            es.top = pos.y + 'px';
        }
    },
    setTransition : function (el, duration) {
        'use strict';
        var es = el.style;
        es.webkitTransitionDuration = es.MsTransitionDuration = es.msTransitionDuration = es.MozTransitionDuration = es.OTransitionDuration = es.transitionDuration = duration + 'ms';
    },
    /*==================================================
        Feature Detection
    ====================================================*/
    support: {

        touch : CUtils.isTouchDevice(),/*(window.Modernizr && Modernizr.touch === true) || (function () {
            'use strict';
            return !!(('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch);
        })(),*/

        transforms3d : (window.Modernizr && Modernizr.csstransforms3d === true) || (function () {
            'use strict';
            var div = document.createElement('div').style;
            return ('webkitPerspective' in div || 'MozPerspective' in div || 'OPerspective' in div || 'MsPerspective' in div || 'perspective' in div);
        })(),

        transforms : (window.Modernizr && Modernizr.csstransforms === true) || (function () {
            'use strict';
            var div = document.createElement('div').style;
            return ('transform' in div || 'WebkitTransform' in div || 'MozTransform' in div || 'msTransform' in div || 'MsTransform' in div || 'OTransform' in div);
        })(),

        transitions : (window.Modernizr && Modernizr.csstransitions === true) || (function () {
            'use strict';
            var div = document.createElement('div').style;
            return ('transition' in div || 'WebkitTransition' in div || 'MozTransition' in div || 'msTransition' in div || 'MsTransition' in div || 'OTransition' in div);
        })(),

        classList : (function () {
            'use strict';
            var div = document.createElement('div').style;
            return 'classList' in div;
        })()
    },

    browser : {

        ie8 : (function () {
            'use strict';
            var rv = -1; // Return value assumes failure.
            if (navigator.appName === 'Microsoft Internet Explorer') {
                var ua = navigator.userAgent;
                var re = new RegExp(/MSIE ([0-9]{1,}[\.0-9]{0,})/);
                if (re.exec(ua) !== null)
                    rv = parseFloat(RegExp.$1);
            }
            return rv !== -1 && rv < 9;
        })(),

        ie10 : window.navigator.msPointerEnabled,
        ie11 : window.navigator.pointerEnabled
    }
};

/*=========================
  jQuery & Zepto Plugins
  ===========================*/
if (window.jQuery || window.Zepto) {
    (function ($) {
        'use strict';
        $.fn.swiper = function (params) {
            var s = new Swiper($(this)[0], params);
            $(this).data('swiper', s);
            return s;
        };
    })(window.jQuery || window.Zepto);
}

// component
if (typeof(module) !== 'undefined')
{
    module.exports = Swiper;
}

// requirejs support
if (typeof define === 'function' && define.amd) {
    define([], function () {
        'use strict';
        return Swiper;
    });
}

Swiper.prototype.plugins.progress = function (swiper, params) {
    'use strict';

    var isH = swiper.params.mode === 'horizontal';
    var wrapperMaxPosition;
    function initSlides() {
        for (var i = 0; i < swiper.slides.length; i++) {
            var slide = swiper.slides[i];
            slide.progressSlideSize = isH ? swiper.h.getWidth(slide) : swiper.h.getHeight(slide);
            if ('offsetLeft' in slide) {
                slide.progressSlideOffset = isH ? slide.offsetLeft : slide.offsetTop;
            }
            else {
                slide.progressSlideOffset = isH ? slide.getOffset().left - swiper.h.getOffset(swiper.container).left : slide.getOffset().top - swiper.h.getOffset(swiper.container).top;
            }
        }
        if (isH) {
            wrapperMaxPosition = swiper.h.getWidth(swiper.wrapper) + swiper.wrapperLeft + swiper.wrapperRight - swiper.width;
        }
        else {
            wrapperMaxPosition = swiper.h.getHeight(swiper.wrapper) + swiper.wrapperTop + swiper.wrapperBottom - swiper.height;
        }
    }
    function calcProgress(transform) {
        transform = transform || {x: 0, y: 0, z: 0};
        var offsetCenter;
        if (swiper.params.centeredSlides === true) offsetCenter = isH ? -transform.x + swiper.width / 2 : -transform.y + swiper.height / 2;
        else offsetCenter = isH ? -transform.x : -transform.y;
        //Each slide offset from offset center
        for (var i = 0; i < swiper.slides.length; i++) {
            var slide = swiper.slides[i];
            var slideCenterOffset = (swiper.params.centeredSlides === true) ? slide.progressSlideSize / 2 : 0;

            var offsetMultiplier = (offsetCenter - slide.progressSlideOffset - slideCenterOffset) / slide.progressSlideSize;
            slide.progress = offsetMultiplier;

        }
        // Global Swiper Progress
        swiper.progress = isH ? -transform.x / wrapperMaxPosition : -transform.y / wrapperMaxPosition;
        // Callback
        if (swiper.params.onProgressChange) swiper.fireCallback(swiper.params.onProgressChange, swiper);
    }

    //Plugin Hooks
    return {
        onFirstInit: function (args) {
            initSlides();
            calcProgress({
                x: swiper.getWrapperTranslate('x'),
                y: swiper.getWrapperTranslate('y')
            });
        },
        onInit: function (args) {
            initSlides();
        },
        onSetWrapperTransform: function (transform) {
            calcProgress(transform);
        }
    };
};
//     Underscore.js 1.6.0
//     http://underscorejs.org
//     (c) 2009-2014 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.
(function(){var n=this,t=n._,r={},e=Array.prototype,u=Object.prototype,i=Function.prototype,a=e.push,o=e.slice,c=e.concat,l=u.toString,f=u.hasOwnProperty,s=e.forEach,p=e.map,h=e.reduce,v=e.reduceRight,g=e.filter,d=e.every,m=e.some,y=e.indexOf,b=e.lastIndexOf,x=Array.isArray,w=Object.keys,_=i.bind,j=function(n){return n instanceof j?n:this instanceof j?void(this._wrapped=n):new j(n)};"undefined"!=typeof exports?("undefined"!=typeof module&&module.exports&&(exports=module.exports=j),exports._=j):n._=j,j.VERSION="1.6.0";var A=j.each=j.forEach=function(n,t,e){if(null==n)return n;if(s&&n.forEach===s)n.forEach(t,e);else if(n.length===+n.length){for(var u=0,i=n.length;i>u;u++)if(t.call(e,n[u],u,n)===r)return}else for(var a=j.keys(n),u=0,i=a.length;i>u;u++)if(t.call(e,n[a[u]],a[u],n)===r)return;return n};j.map=j.collect=function(n,t,r){var e=[];return null==n?e:p&&n.map===p?n.map(t,r):(A(n,function(n,u,i){e.push(t.call(r,n,u,i))}),e)};var O="Reduce of empty array with no initial value";j.reduce=j.foldl=j.inject=function(n,t,r,e){var u=arguments.length>2;if(null==n&&(n=[]),h&&n.reduce===h)return e&&(t=j.bind(t,e)),u?n.reduce(t,r):n.reduce(t);if(A(n,function(n,i,a){u?r=t.call(e,r,n,i,a):(r=n,u=!0)}),!u)throw new TypeError(O);return r},j.reduceRight=j.foldr=function(n,t,r,e){var u=arguments.length>2;if(null==n&&(n=[]),v&&n.reduceRight===v)return e&&(t=j.bind(t,e)),u?n.reduceRight(t,r):n.reduceRight(t);var i=n.length;if(i!==+i){var a=j.keys(n);i=a.length}if(A(n,function(o,c,l){c=a?a[--i]:--i,u?r=t.call(e,r,n[c],c,l):(r=n[c],u=!0)}),!u)throw new TypeError(O);return r},j.find=j.detect=function(n,t,r){var e;return k(n,function(n,u,i){return t.call(r,n,u,i)?(e=n,!0):void 0}),e},j.filter=j.select=function(n,t,r){var e=[];return null==n?e:g&&n.filter===g?n.filter(t,r):(A(n,function(n,u,i){t.call(r,n,u,i)&&e.push(n)}),e)},j.reject=function(n,t,r){return j.filter(n,function(n,e,u){return!t.call(r,n,e,u)},r)},j.every=j.all=function(n,t,e){t||(t=j.identity);var u=!0;return null==n?u:d&&n.every===d?n.every(t,e):(A(n,function(n,i,a){return(u=u&&t.call(e,n,i,a))?void 0:r}),!!u)};var k=j.some=j.any=function(n,t,e){t||(t=j.identity);var u=!1;return null==n?u:m&&n.some===m?n.some(t,e):(A(n,function(n,i,a){return u||(u=t.call(e,n,i,a))?r:void 0}),!!u)};j.contains=j.include=function(n,t){return null==n?!1:y&&n.indexOf===y?n.indexOf(t)!=-1:k(n,function(n){return n===t})},j.invoke=function(n,t){var r=o.call(arguments,2),e=j.isFunction(t);return j.map(n,function(n){return(e?t:n[t]).apply(n,r)})},j.pluck=function(n,t){return j.map(n,j.property(t))},j.where=function(n,t){return j.filter(n,j.matches(t))},j.findWhere=function(n,t){return j.find(n,j.matches(t))},j.max=function(n,t,r){if(!t&&j.isArray(n)&&n[0]===+n[0]&&n.length<65535)return Math.max.apply(Math,n);var e=-1/0,u=-1/0;return A(n,function(n,i,a){var o=t?t.call(r,n,i,a):n;o>u&&(e=n,u=o)}),e},j.min=function(n,t,r){if(!t&&j.isArray(n)&&n[0]===+n[0]&&n.length<65535)return Math.min.apply(Math,n);var e=1/0,u=1/0;return A(n,function(n,i,a){var o=t?t.call(r,n,i,a):n;u>o&&(e=n,u=o)}),e},j.shuffle=function(n){var t,r=0,e=[];return A(n,function(n){t=j.random(r++),e[r-1]=e[t],e[t]=n}),e},j.sample=function(n,t,r){return null==t||r?(n.length!==+n.length&&(n=j.values(n)),n[j.random(n.length-1)]):j.shuffle(n).slice(0,Math.max(0,t))};var E=function(n){return null==n?j.identity:j.isFunction(n)?n:j.property(n)};j.sortBy=function(n,t,r){return t=E(t),j.pluck(j.map(n,function(n,e,u){return{value:n,index:e,criteria:t.call(r,n,e,u)}}).sort(function(n,t){var r=n.criteria,e=t.criteria;if(r!==e){if(r>e||r===void 0)return 1;if(e>r||e===void 0)return-1}return n.index-t.index}),"value")};var F=function(n){return function(t,r,e){var u={};return r=E(r),A(t,function(i,a){var o=r.call(e,i,a,t);n(u,o,i)}),u}};j.groupBy=F(function(n,t,r){j.has(n,t)?n[t].push(r):n[t]=[r]}),j.indexBy=F(function(n,t,r){n[t]=r}),j.countBy=F(function(n,t){j.has(n,t)?n[t]++:n[t]=1}),j.sortedIndex=function(n,t,r,e){r=E(r);for(var u=r.call(e,t),i=0,a=n.length;a>i;){var o=i+a>>>1;r.call(e,n[o])<u?i=o+1:a=o}return i},j.toArray=function(n){return n?j.isArray(n)?o.call(n):n.length===+n.length?j.map(n,j.identity):j.values(n):[]},j.size=function(n){return null==n?0:n.length===+n.length?n.length:j.keys(n).length},j.first=j.head=j.take=function(n,t,r){return null==n?void 0:null==t||r?n[0]:0>t?[]:o.call(n,0,t)},j.initial=function(n,t,r){return o.call(n,0,n.length-(null==t||r?1:t))},j.last=function(n,t,r){return null==n?void 0:null==t||r?n[n.length-1]:o.call(n,Math.max(n.length-t,0))},j.rest=j.tail=j.drop=function(n,t,r){return o.call(n,null==t||r?1:t)},j.compact=function(n){return j.filter(n,j.identity)};var M=function(n,t,r){return t&&j.every(n,j.isArray)?c.apply(r,n):(A(n,function(n){j.isArray(n)||j.isArguments(n)?t?a.apply(r,n):M(n,t,r):r.push(n)}),r)};j.flatten=function(n,t){return M(n,t,[])},j.without=function(n){return j.difference(n,o.call(arguments,1))},j.partition=function(n,t){var r=[],e=[];return A(n,function(n){(t(n)?r:e).push(n)}),[r,e]},j.uniq=j.unique=function(n,t,r,e){j.isFunction(t)&&(e=r,r=t,t=!1);var u=r?j.map(n,r,e):n,i=[],a=[];return A(u,function(r,e){(t?e&&a[a.length-1]===r:j.contains(a,r))||(a.push(r),i.push(n[e]))}),i},j.union=function(){return j.uniq(j.flatten(arguments,!0))},j.intersection=function(n){var t=o.call(arguments,1);return j.filter(j.uniq(n),function(n){return j.every(t,function(t){return j.contains(t,n)})})},j.difference=function(n){var t=c.apply(e,o.call(arguments,1));return j.filter(n,function(n){return!j.contains(t,n)})},j.zip=function(){for(var n=j.max(j.pluck(arguments,"length").concat(0)),t=new Array(n),r=0;n>r;r++)t[r]=j.pluck(arguments,""+r);return t},j.object=function(n,t){if(null==n)return{};for(var r={},e=0,u=n.length;u>e;e++)t?r[n[e]]=t[e]:r[n[e][0]]=n[e][1];return r},j.indexOf=function(n,t,r){if(null==n)return-1;var e=0,u=n.length;if(r){if("number"!=typeof r)return e=j.sortedIndex(n,t),n[e]===t?e:-1;e=0>r?Math.max(0,u+r):r}if(y&&n.indexOf===y)return n.indexOf(t,r);for(;u>e;e++)if(n[e]===t)return e;return-1},j.lastIndexOf=function(n,t,r){if(null==n)return-1;var e=null!=r;if(b&&n.lastIndexOf===b)return e?n.lastIndexOf(t,r):n.lastIndexOf(t);for(var u=e?r:n.length;u--;)if(n[u]===t)return u;return-1},j.range=function(n,t,r){arguments.length<=1&&(t=n||0,n=0),r=arguments[2]||1;for(var e=Math.max(Math.ceil((t-n)/r),0),u=0,i=new Array(e);e>u;)i[u++]=n,n+=r;return i};var R=function(){};j.bind=function(n,t){var r,e;if(_&&n.bind===_)return _.apply(n,o.call(arguments,1));if(!j.isFunction(n))throw new TypeError;return r=o.call(arguments,2),e=function(){if(!(this instanceof e))return n.apply(t,r.concat(o.call(arguments)));R.prototype=n.prototype;var u=new R;R.prototype=null;var i=n.apply(u,r.concat(o.call(arguments)));return Object(i)===i?i:u}},j.partial=function(n){var t=o.call(arguments,1);return function(){for(var r=0,e=t.slice(),u=0,i=e.length;i>u;u++)e[u]===j&&(e[u]=arguments[r++]);for(;r<arguments.length;)e.push(arguments[r++]);return n.apply(this,e)}},j.bindAll=function(n){var t=o.call(arguments,1);if(0===t.length)throw new Error("bindAll must be passed function names");return A(t,function(t){n[t]=j.bind(n[t],n)}),n},j.memoize=function(n,t){var r={};return t||(t=j.identity),function(){var e=t.apply(this,arguments);return j.has(r,e)?r[e]:r[e]=n.apply(this,arguments)}},j.delay=function(n,t){var r=o.call(arguments,2);return setTimeout(function(){return n.apply(null,r)},t)},j.defer=function(n){return j.delay.apply(j,[n,1].concat(o.call(arguments,1)))},j.throttle=function(n,t,r){var e,u,i,a=null,o=0;r||(r={});var c=function(){o=r.leading===!1?0:j.now(),a=null,i=n.apply(e,u),e=u=null};return function(){var l=j.now();o||r.leading!==!1||(o=l);var f=t-(l-o);return e=this,u=arguments,0>=f?(clearTimeout(a),a=null,o=l,i=n.apply(e,u),e=u=null):a||r.trailing===!1||(a=setTimeout(c,f)),i}},j.debounce=function(n,t,r){var e,u,i,a,o,c=function(){var l=j.now()-a;t>l?e=setTimeout(c,t-l):(e=null,r||(o=n.apply(i,u),i=u=null))};return function(){i=this,u=arguments,a=j.now();var l=r&&!e;return e||(e=setTimeout(c,t)),l&&(o=n.apply(i,u),i=u=null),o}},j.once=function(n){var t,r=!1;return function(){return r?t:(r=!0,t=n.apply(this,arguments),n=null,t)}},j.wrap=function(n,t){return j.partial(t,n)},j.compose=function(){var n=arguments;return function(){for(var t=arguments,r=n.length-1;r>=0;r--)t=[n[r].apply(this,t)];return t[0]}},j.after=function(n,t){return function(){return--n<1?t.apply(this,arguments):void 0}},j.keys=function(n){if(!j.isObject(n))return[];if(w)return w(n);var t=[];for(var r in n)j.has(n,r)&&t.push(r);return t},j.values=function(n){for(var t=j.keys(n),r=t.length,e=new Array(r),u=0;r>u;u++)e[u]=n[t[u]];return e},j.pairs=function(n){for(var t=j.keys(n),r=t.length,e=new Array(r),u=0;r>u;u++)e[u]=[t[u],n[t[u]]];return e},j.invert=function(n){for(var t={},r=j.keys(n),e=0,u=r.length;u>e;e++)t[n[r[e]]]=r[e];return t},j.functions=j.methods=function(n){var t=[];for(var r in n)j.isFunction(n[r])&&t.push(r);return t.sort()},j.extend=function(n){return A(o.call(arguments,1),function(t){if(t)for(var r in t)n[r]=t[r]}),n},j.pick=function(n){var t={},r=c.apply(e,o.call(arguments,1));return A(r,function(r){r in n&&(t[r]=n[r])}),t},j.omit=function(n){var t={},r=c.apply(e,o.call(arguments,1));for(var u in n)j.contains(r,u)||(t[u]=n[u]);return t},j.defaults=function(n){return A(o.call(arguments,1),function(t){if(t)for(var r in t)n[r]===void 0&&(n[r]=t[r])}),n},j.clone=function(n){return j.isObject(n)?j.isArray(n)?n.slice():j.extend({},n):n},j.tap=function(n,t){return t(n),n};var S=function(n,t,r,e){if(n===t)return 0!==n||1/n==1/t;if(null==n||null==t)return n===t;n instanceof j&&(n=n._wrapped),t instanceof j&&(t=t._wrapped);var u=l.call(n);if(u!=l.call(t))return!1;switch(u){case"[object String]":return n==String(t);case"[object Number]":return n!=+n?t!=+t:0==n?1/n==1/t:n==+t;case"[object Date]":case"[object Boolean]":return+n==+t;case"[object RegExp]":return n.source==t.source&&n.global==t.global&&n.multiline==t.multiline&&n.ignoreCase==t.ignoreCase}if("object"!=typeof n||"object"!=typeof t)return!1;for(var i=r.length;i--;)if(r[i]==n)return e[i]==t;var a=n.constructor,o=t.constructor;if(a!==o&&!(j.isFunction(a)&&a instanceof a&&j.isFunction(o)&&o instanceof o)&&"constructor"in n&&"constructor"in t)return!1;r.push(n),e.push(t);var c=0,f=!0;if("[object Array]"==u){if(c=n.length,f=c==t.length)for(;c--&&(f=S(n[c],t[c],r,e)););}else{for(var s in n)if(j.has(n,s)&&(c++,!(f=j.has(t,s)&&S(n[s],t[s],r,e))))break;if(f){for(s in t)if(j.has(t,s)&&!c--)break;f=!c}}return r.pop(),e.pop(),f};j.isEqual=function(n,t){return S(n,t,[],[])},j.isEmpty=function(n){if(null==n)return!0;if(j.isArray(n)||j.isString(n))return 0===n.length;for(var t in n)if(j.has(n,t))return!1;return!0},j.isElement=function(n){return!(!n||1!==n.nodeType)},j.isArray=x||function(n){return"[object Array]"==l.call(n)},j.isObject=function(n){return n===Object(n)},A(["Arguments","Function","String","Number","Date","RegExp"],function(n){j["is"+n]=function(t){return l.call(t)=="[object "+n+"]"}}),j.isArguments(arguments)||(j.isArguments=function(n){return!(!n||!j.has(n,"callee"))}),"function"!=typeof/./&&(j.isFunction=function(n){return"function"==typeof n}),j.isFinite=function(n){return isFinite(n)&&!isNaN(parseFloat(n))},j.isNaN=function(n){return j.isNumber(n)&&n!=+n},j.isBoolean=function(n){return n===!0||n===!1||"[object Boolean]"==l.call(n)},j.isNull=function(n){return null===n},j.isUndefined=function(n){return n===void 0},j.has=function(n,t){return f.call(n,t)},j.noConflict=function(){return n._=t,this},j.identity=function(n){return n},j.constant=function(n){return function(){return n}},j.property=function(n){return function(t){return t[n]}},j.matches=function(n){return function(t){if(t===n)return!0;for(var r in n)if(n[r]!==t[r])return!1;return!0}},j.times=function(n,t,r){for(var e=Array(Math.max(0,n)),u=0;n>u;u++)e[u]=t.call(r,u);return e},j.random=function(n,t){return null==t&&(t=n,n=0),n+Math.floor(Math.random()*(t-n+1))},j.now=Date.now||function(){return(new Date).getTime()};var T={escape:{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#x27;"}};T.unescape=j.invert(T.escape);var I={escape:new RegExp("["+j.keys(T.escape).join("")+"]","g"),unescape:new RegExp("("+j.keys(T.unescape).join("|")+")","g")};j.each(["escape","unescape"],function(n){j[n]=function(t){return null==t?"":(""+t).replace(I[n],function(t){return T[n][t]})}}),j.result=function(n,t){if(null==n)return void 0;var r=n[t];return j.isFunction(r)?r.call(n):r},j.mixin=function(n){A(j.functions(n),function(t){var r=j[t]=n[t];j.prototype[t]=function(){var n=[this._wrapped];return a.apply(n,arguments),z.call(this,r.apply(j,n))}})};var N=0;j.uniqueId=function(n){var t=++N+"";return n?n+t:t},j.templateSettings={evaluate:/<%([\s\S]+?)%>/g,interpolate:/<%=([\s\S]+?)%>/g,escape:/<%-([\s\S]+?)%>/g};var q=/(.)^/,B={"'":"'","\\":"\\","\r":"r","\n":"n","	":"t","\u2028":"u2028","\u2029":"u2029"},D=/\\|'|\r|\n|\t|\u2028|\u2029/g;j.template=function(n,t,r){var e;r=j.defaults({},r,j.templateSettings);var u=new RegExp([(r.escape||q).source,(r.interpolate||q).source,(r.evaluate||q).source].join("|")+"|$","g"),i=0,a="__p+='";n.replace(u,function(t,r,e,u,o){return a+=n.slice(i,o).replace(D,function(n){return"\\"+B[n]}),r&&(a+="'+\n((__t=("+r+"))==null?'':_.escape(__t))+\n'"),e&&(a+="'+\n((__t=("+e+"))==null?'':__t)+\n'"),u&&(a+="';\n"+u+"\n__p+='"),i=o+t.length,t}),a+="';\n",r.variable||(a="with(obj||{}){\n"+a+"}\n"),a="var __t,__p='',__j=Array.prototype.join,"+"print=function(){__p+=__j.call(arguments,'');};\n"+a+"return __p;\n";try{e=new Function(r.variable||"obj","_",a)}catch(o){throw o.source=a,o}if(t)return e(t,j);var c=function(n){return e.call(this,n,j)};return c.source="function("+(r.variable||"obj")+"){\n"+a+"}",c},j.chain=function(n){return j(n).chain()};var z=function(n){return this._chain?j(n).chain():n};j.mixin(j),A(["pop","push","reverse","shift","sort","splice","unshift"],function(n){var t=e[n];j.prototype[n]=function(){var r=this._wrapped;return t.apply(r,arguments),"shift"!=n&&"splice"!=n||0!==r.length||delete r[0],z.call(this,r)}}),A(["concat","join","slice"],function(n){var t=e[n];j.prototype[n]=function(){return z.call(this,t.apply(this._wrapped,arguments))}}),j.extend(j.prototype,{chain:function(){return this._chain=!0,this},value:function(){return this._wrapped}}),"function"==typeof define&&define.amd&&define("underscore",[],function(){return j})}).call(this);

var JSONfn  = {};
JSONfn.stringify = function (obj) {

    return JSON.stringify(obj, function (key, value) {
        if (value instanceof Function || typeof value == 'function') {
            return value.toString();
        }
        if (value instanceof RegExp) {
            return '_PxEgEr_' + value;
        }
        return value;
    });
};

JSONfn.parse = function (str, date2obj) {

    var iso8061 = date2obj ? /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/ : false;

    return JSON.parse(str, function (key, value) {
        var prefix;

        if (typeof value != 'string') {
            return value;
        }
        if (value.length < 8) {
            return value;
        }

        prefix = value.substring(0, 8);

        if (iso8061 && value.match(iso8061)) {
            return new Date(value);
        }
        if (prefix === 'function') {
            return eval('(' + value + ')');
        }
        if (prefix === '_PxEgEr_') {
            return eval(value.slice(8));
        }

        return value;
    });
};

JSONfn.clone = function (obj, date2obj) {
    return JSONfn.parse(JSONfn.stringify(obj), date2obj);
};
