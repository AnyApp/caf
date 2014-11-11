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
 * Created by dvircn on 17/08/14.
 */
var CGlobals = Class({
    $singleton: true,
    globals: {},
    initialized: false,
    defaults: {
        headerSize: 55,
        footerSize: 35
    },
    get: function(name){
        var value = CGlobals.globals[name];
        if (CUtils.isEmpty(value) && !CUtils.isEmpty(CGlobals.defaults[name]))
            value = CGlobals.defaults[name];
        return value;
    },
    exist: function(name){
        return !CUtils.isEmpty(CGlobals.get(name));
    },
    set: function(key,value){
        CGlobals.globals[key] = value;
    },
    setGlobals: function(globals){
        _.each(globals,function(value,key){
            CGlobals.globals[key] = value;
        },this);
    }

});
/**
 * Created by dvircn on 06/08/14.
 */
var CLocalStorage = Class({
    $singleton: true,
    base: '',
    initBase: function(){
        CLocalStorage.base = CSettings.get('appID') || '';
        CLocalStorage.base += '/';
    },
    save: function(key,value){
        CLocalStorage.initBase();
        window.localStorage.setItem(CLocalStorage.base+key,JSONfn.stringify(value));
    },
    get: function(key){
        CLocalStorage.initBase();
        var value = window.localStorage.getItem(CLocalStorage.base+key);
        if (CUtils.isEmpty(value)) return null;
        return JSONfn.parse(value);
    },
    empty: function(key){
        CLocalStorage.initBase();
        return CUtils.isEmpty(window.localStorage.getItem(CLocalStorage.base+key));
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
    send: function(url,data,callback,errorHandler,type){
        type = type || 'application/json';
        $.ajax({
            type: 'POST',
            async: true,
            url: url,
            data: JSONfn.stringify(data), //Data sent to server
            contentType: type, // content type sent to server
//            dataType: 'json', //Expected data format from server
            processdata: true, //True or False
            crossDomain: true,
            success: function (data, textStatus, xmlHttp) {
                if (callback) callback(data); // callback
            },
            error: function(e) {
                CLog.error('Request Error at: '+url);
                CLog.log(e);
                if (errorHandler) errorHandler();
            }  // When Service call fails
        });
    },
    request: function(url,data,callback,errorHandler,type){
        type = type || 'application/json';
        this.send(url,data,callback,errorHandler,type);
    },
    downloadText: function(filename, text) {
        var pom = document.createElement('a');
        pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
        pom.setAttribute('download', filename);
        pom.click();
    }

});/**
 * Created by dvircn on 17/08/14.
 */
var CPageData = Class({
    $singleton: true,
    pagesData: {},
    get: function(name){
        var pagesData = CPageData.pagesData[CPager.currentPage];
        if (!CUtils.isEmpty(pagesData))
            return pagesData[name];
        return null;
    },
    exist: function(name){
        return !CUtils.isEmpty(CPageData.get(name));
    },
    set: function(key,value){
        // Init if needed.
        if (CUtils.isEmpty(CPageData.pagesData[CPager.currentPage])){
            CPageData.pagesData[CPager.currentPage] = {};
        }
        // Set
        CPageData.pagesData[CPager.currentPage][key] = value;
    },
    setPageData: function(page,data){
        CPageData.pagesData[page] = data;
    }

});
/**
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
        try {
            var result = navigator.userAgent.match(/(iPad|iPhone|iPod)/g);
            return result;
        }
        catch (e){
            return false;
        }

    },
    /**
     * Return whether or not the device platform is android.
     * @returns {boolean}
     */
    isAndroid: function() {
        if (window.device===undefined || CUtils.isEmpty(window.device || null) || CUtils.isEmpty(window.device.platform || null))      return false;
        return window.device.platform.toLowerCase() == 'android';
    },
    /**
     * Return the android series.
     * Examples: 4.4 => 4, 4.1 => 4, 2.3.3 => 2, 2.2 => 2, 3.2 => 3
     * @returns {number}
     */
    androidSeries: function() {
        if (!this.isAndroid()) return -1;

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
        return (typeof variable == 'string' || variable instanceof String);
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
        if (!el)
            return false;
        return new RegExp('(\\s|^)'+name+'(\\s|$)').test(el.className);
    },
    addClass: function(el, name)
    {
        if (el && !CUtils.hasClass(el, name)) { el.className += (el.className ? ' ' : '') +name; }
    },
    removeClass: function(el, name)
    {
        if (el && CUtils.hasClass(el, name)) {
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
        return (event.targetTouches && event.targetTouches.length>0) ? event.targetTouches[0] : event;
    },
    openLocalURL: function(url){
        window.location = '#'+url;
    },
    openURL: function(url) {
        if (CPlatforms.isIOS()) {
            window.open(url,  '_system', 'location=yes');
        }
        else {
            try {
                navigator.app.loadUrl(url, {openExternal:true});
            }
            catch (e) {
                window.open(url,  '_system', 'location=yes');
            }
        }
    },
    isURLLocal: function(url){
        if (CUtils.isEmpty(url))
            return true;
        return ( (url.indexOf('www.')<0) && (url.indexOf('http://')<0) );
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
    },
    arrayFromObjectsKey: function(objects,key1,key2,key3){
        var arr = [];
        _.each(objects,function(element){
            var value = element[key1];
            if (key2)
                value = value[key2];
            if (key3)
                value = value[key3];
            arr.push(value || null);
        },this);
        return arr;
    },
    doElementsCollide: function(el1, el2) {
        if (CUtils.isEmpty(el1) || CUtils.isEmpty(el2))
            return false;
        el1.offsetBottom = el1.offsetTop + el1.offsetHeight;
        el1.offsetRight = el1.offsetLeft + el1.offsetWidth;
        el2.offsetBottom = el2.offsetTop + el2.offsetHeight;
        el2.offsetRight = el2.offsetLeft + el2.offsetWidth;

        return !((el1.offsetBottom < el2.offsetTop) ||
            (el1.offsetTop > el2.offsetBottom) ||
            (el1.offsetRight < el2.offsetLeft) ||
            (el1.offsetLeft > el2.offsetRight))
    },
    /**
     * Check that the object is really showing:
     * 1. not hidden under any element.
     * 2. on screen.
     * 3. area > 0 (visibility + display:none).
     * @param element
     * @returns {boolean}
     */
    isRealVisible: function(element) {
        if (element.offsetWidth === 0 || element.offsetHeight === 0) return false;
        var height = document.documentElement.clientHeight,
            rects = element.getClientRects(),
            on_top = function(r) {
                var x = (r.left + r.right)/2, y = (r.top + r.bottom)/2;
                var showingElement = document.elementFromPoint(x, y);
                return showingElement.id === element.id ||
                    CUtils.isDeepChild(element.id,showingElement);
            };
        for (var i = 0, l = rects.length; i < l; i++) {
            var r = rects[i],
                in_viewport = r.top > 0 ? r.top <= height : (r.bottom > 0 && r.bottom <= height);
            if (in_viewport && on_top(r)) return true;
        }
        return false;
    },
    isDeepChild: function(parentId,element){
        if (CUtils.isEmpty(element))
            return false;
        return parentId === element.id || CUtils.isDeepChild(parentId,element.parentElement);
    },
    replaceAll: function(string, find, replace) {
        return string.replace(new RegExp(CUtils.escapeRegExp(find), 'g'), replace);
    },
    escapeRegExp: function(string) {
        return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
    },
    stringEndsWith: function(str,suffix) {
        return str.indexOf(suffix, str.length - suffix.length) !== -1;
    },
    stringCountOccurencesInHead: function(needle,haystack){
        return CUtils.stringCountOccurencesInHeadHelper(needle,haystack,0);
    },
    stringCountOccurencesInHeadHelper: function(needle,haystack,count){
        if (haystack.indexOf(needle)===0)
            return CUtils.stringCountOccurencesInHeadHelper(needle,
                            haystack.replace(needle,''),count+1);
        else
            return count;
    },
    stringRemoveAllOccurencesInHead: function(needle,haystack){
        if (haystack.indexOf(needle)===0)
            return CUtils.stringRemoveAllOccurencesInHead(needle,
                haystack.replace(needle,''));
        else
            return haystack;
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
        fade: {'in':'pt-page-fadeIn',out:'pt-page-fadeOut et-page-ontop',duration:600},
        rotateFall: {'in':'pt-page-scaleUp',out:'pt-page-rotateFall et-page-ontop',duration:1000},
        rotateNewspaper: {'in':'pt-page-rotateInNewspaper pt-page-delay500',out:'pt-page-rotateOutNewspaper',duration:1000},
        rotateSlide: {'in':'pt-page-rotateSlideIn pt-page-delay200',out:'pt-page-rotateSlideOut',duration:1200},
        rotateSlide2: {'in':'pt-page-rotateSlideIn',out:'pt-page-rotateSlideOut',duration:1000},
        rotateCarouselBottom: {'in':'pt-page-rotateCarouselBottomIn',out:'pt-page-rotateCarouselBottomOut et-page-ontop',duration:800},
        rotateCarouselTop: {'in':'pt-page-rotateCarouselTopIn',out:'pt-page-rotateCarouselTopOut et-page-ontop',duration:800},
        rotateCarouselRight: {'in':'pt-page-rotateCarouselRightIn',out:'pt-page-rotateCarouselRightOut et-page-ontop',duration:800},
        rotateCarouselLeft: {'in':'pt-page-rotateCarouselLeftIn',out:'pt-page-rotateCarouselLeftOut et-page-ontop',duration:800},
        rotateCubeBottom: {'in':'pt-page-rotateCubeBottomIn',out:'pt-page-rotateCubeBottomOut et-page-ontop',duration:600},
        rotateCubeTop: {'in':'pt-page-rotateCubeTopIn',out:'pt-page-rotateCubeTopOut et-page-ontop',duration:600},
        rotateCubeRight: {'in':'pt-page-rotateCubeRightIn',out:'pt-page-rotateCubeRightOut et-page-ontop',duration:600},
        rotateCubeLeft: {'in':'pt-page-rotateCubeLeftIn',out:'pt-page-rotateCubeLeftOut et-page-ontop',duration:600},
        rotateRoomBottom: {'in':'pt-page-rotateRoomBottomIn',out:'pt-page-rotateRoomBottomOut et-page-ontop',duration:800},
        rotateRoomTop: {'in':'pt-page-rotateRoomTopIn',out:'pt-page-rotateRoomTopOut et-page-ontop',duration:800},
        rotateRoomRight: {'in':'pt-page-rotateRoomRightIn',out:'pt-page-rotateRoomRightOut et-page-ontop',duration:800},
        rotateRoomLeft: {'in':'pt-page-rotateRoomLeftIn',out:'pt-page-rotateRoomLeftOut et-page-ontop',duration:800},
        rotateUnfoldBottom: {'in':'pt-page-rotateUnfoldBottom',out:'pt-page-moveToTopFade',duration:700},
        rotateUnfoldTop: {'in':'pt-page-rotateUnfoldTop',out:'pt-page-moveToBottomFade',duration:700},
        rotateUnfoldRight: {'in':'pt-page-rotateUnfoldRight',out:'pt-page-moveToLeftFade',duration:700},
        rotateUnfoldLeft: {'in':'pt-page-rotateUnfoldLeft',out:'pt-page-moveToRightFade',duration:700},
        moveToTopFade: {'in':'pt-page-moveFromBottomFade',out:'pt-page-rotateFoldTop',duration:700},
        moveToBottomFade: {'in':'pt-page-moveFromTopFade',out:'pt-page-rotateFoldBottom',duration:700},
        moveToRightFade: {'in':'pt-page-moveFromLeftFade',out:'pt-page-rotateFoldRight',duration:700},
        moveToLeftFade: {'in':'pt-page-moveFromRightFade',out:'pt-page-rotateFoldLeft',duration:700},
        moveToTopFade2: {'in':'pt-page-moveFromBottomFade',out:'pt-page-moveToTopFade',duration:700},
        moveToBottomFade2: {'in':'pt-page-moveFromTopFade',out:'pt-page-moveToBottomFade',duration:700},
        moveToRightFade2: {'in':'pt-page-moveFromLeftFade',out:'pt-page-moveToRightFade',duration:700},
        moveToLeftFade2: {'in':'pt-page-moveFromRightFade',out:'pt-page-moveToLeftFade',duration:700},
        moveToTopFade3: {'in':'pt-page-moveFromBottom',out:'pt-page-fade',duration:700},
        moveToBottomFade3: {'in':'pt-page-moveFromTop',out:'pt-page-fade',duration:700},
        moveToRightFade3: {'in':'pt-page-moveFromLeft',out:'pt-page-fade',duration:700},
        moveToLeftFade3: {'in':'pt-page-moveFromRight',out:'pt-page-fade',duration:700},
        rotatePullBottom: {'in':'pt-page-rotatePullBottom pt-page-delay180',out:'pt-page-rotatePushBottom',duration:800},
        rotatePullTop: {'in':'pt-page-rotatePullTop pt-page-delay180',out:'pt-page-rotatePushTop',duration:800},
        rotatePullRight: {'in':'pt-page-rotatePullRight pt-page-delay180',out:'pt-page-rotatePushRight',duration:800},
        rotatePullLeft: {'in':'pt-page-rotatePullLeft pt-page-delay180',out:'pt-page-rotatePushLeft',duration:800},
        flipBottom: {'in':'pt-page-flipInBottom pt-page-delay500',out:'pt-page-flipOutTop',duration:1000},
        flipTop: {'in':'pt-page-flipInTop pt-page-delay500',out:'pt-page-flipOutBottom',duration:1000},
        flipLeft: {'in':'pt-page-flipInLeft pt-page-delay500',out:'pt-page-flipOutRight',duration:1000},
        flipRight: {'in':'pt-page-flipInRight pt-page-delay500',out:'pt-page-flipOutLeft',duration:1000},
        moveToTop: {'in':'pt-page-moveFromBottom pt-page-delay20 et-page-ontop',out:'pt-page-rotateBottomSideFirst',duration:800},
        moveToBottom: {'in':'pt-page-moveFromTop pt-page-delay20 et-page-ontop',out:'pt-page-rotateTopSideFirst',duration:800},
        moveToRight: {'in':'pt-page-moveFromLeft pt-page-delay20 et-page-ontop',out:'pt-page-rotateLeftSideFirst',duration:800},
        moveToLeft: {'in':'pt-page-moveFromRight pt-page-delay20 et-page-ontop',out:'pt-page-rotateRightSideFirst',duration:800},
        moveToTop2: {'in':'pt-page-moveFromBottom',out:'pt-page-rotatePushTop',duration:800},
        moveToBottom2: {'in':'pt-page-moveFromTop',out:'pt-page-rotatePushBottom',duration:800},
        moveToRight2: {'in':'pt-page-moveFromLeft',out:'pt-page-rotatePushRight',duration:800},
        moveToLeft2: {'in':'pt-page-moveFromRight',out:'pt-page-rotatePushLeft',duration:800},
        moveToTop3: {'in':'pt-page-moveFromBottom',out:'pt-page-moveToTop',duration:600},
        moveToBottom3: {'in':'pt-page-moveFromTop',out:'pt-page-moveToBottom',duration:600},
        moveToRight3: {'in':'pt-page-moveFromLeft',out:'pt-page-moveToRight',duration:600},
        moveToLeft3: {'in':'pt-page-moveFromRight',out:'pt-page-moveToLeft',duration:600},
        scaleUpCenter: {'in':'pt-page-scaleUpCenter pt-page-delay400',out:'pt-page-scaleDownCenter',duration:800},
        scaleUpToBottom: {'in':'pt-page-scaleUp et-page-ontop',out:'pt-page-moveToBottom',duration:700},
        scaleUpToTop: {'in':'pt-page-scaleUp et-page-ontop',out:'pt-page-moveToTop',duration:700},
        scaleUpToLeft: {'in':'pt-page-scaleUp et-page-ontop',out:'pt-page-moveToLeft',duration:700},
        scaleUpToRight: {'in':'pt-page-scaleUp et-page-ontop',out:'pt-page-moveToRight',duration:700},
        scaleDownFromBottom: {'in':'pt-page-moveFromBottom et-page-ontop',out:'pt-page-scaleDown',duration:700},
        scaleDownFromTop: {'in':'pt-page-moveFromTop et-page-ontop',out:'pt-page-scaleDown',duration:700},
        scaleDownFromLeft: {'in':'pt-page-moveFromLeft et-page-ontop',out:'pt-page-scaleDown',duration:700},
        scaleDownFromRight: {'in':'pt-page-moveFromRight et-page-ontop',out:'pt-page-scaleDown',duration:700},
        scaleDownUp: {'in':'pt-page-scaleUp pt-page-delay300',out:'pt-page-scaleDownUp',duration:1000},
        scaleUpDown: {'in':'pt-page-scaleUpDown pt-page-delay300',out:'pt-page-scaleDown',duration:1000},
        easeToBottom: {'in':'pt-page-moveFromTop',out:'pt-page-moveToBottomEasing et-page-ontop',duration:700},
        easeToTop: {'in':'pt-page-moveFromBottom',out:'pt-page-moveToTopEasing et-page-ontop',duration:700},
        easeToRight: {'in':'pt-page-moveFromLeft',out:'pt-page-moveToLeftEasing et-page-ontop',duration:700},
        easeToLeft: {'in':'pt-page-moveFromRight',out:'pt-page-moveToRightEasing et-page-ontop',duration:700}

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
    objectInAnim: function(object){
        return object.data.inAnim===true;
    },
    prepareObjectAnimation: function(caller,objectId,options){
        var object = CObjectsHandler.object(objectId);
        // Wait until current animation is finished.
        if (CAnimations.objectInAnim(object)){
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
        CUtils.removeClass(elm,CAnimations.anims[anim]['out']);

        CUtils.addClass(elm,CAnimations.anims[anim]['in']);
        //window.setTimeout(,CAnimations.anims[anim].duration);
        var animEnd = function(){
            // Make sure this function called once per event end.
            var time = (new Date()).getTime();
            if (time-object.data.lastOnEnd<30)
                return;
            object.data.lastOnEnd = time;
            object.data.inAnim = false;
            CUtils.removeClass(elm,CAnimations.anims[anim]['in']);
            onFinish();
            CAnimations.unbindAnimationEnd(object,elm);
        };
        this.bindAnimationEnd(object,elm,animEnd);
    },
    animateOut: function(object,elm,anim,onFinish){
        CUtils.removeClass(elm,CAnimations.anims[anim]['in']);
        CUtils.addClass(elm,CAnimations.anims[anim]['out']);

        var animEnd = function(){
            // Make sure this function called once per event end.
            var time = (new Date()).getTime();
            if (time-object.data.lastOnEnd<30)
                return;
            object.data.lastOnEnd = time;
            object.data.inAnim = false;
            CUtils.addClass(elm,CAnimations.noDisplay);
            CUtils.removeClass(elm,CAnimations.anims[anim]['out']);
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
    isScrolling: undefined,
    lastClick: 0,
    /**
     * Prevent burst of clicks.
     */
    canClick: function(e)
    {
        var currentTime = e.timeStamp;
        if (currentTime-CClicker.lastClick>400) {
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
        object.clicker.activeClasses       = CDesigner.designToClasses(CDesigner.mergeParents(object.getDesign()||{}).active);
        object.clicker.activeRemoveClasses = CDesigner.designToClasses(CDesigner.mergeParents(object.getDesign()||{}).activeRemove);
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
            var isRightClick = ((e.which && e.which == 3) || (e.button && e.button == 2));
            if (isRightClick) return false;

//            e.preventDefault();

            if (object.logic.doStopPropagation===true)
                e.stopPropagation();

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
            if (object.touchData.startX<0) return; // Not Started.
            var pointer = CUtils.getPointerEvent(e);
            // caching the last x & y
            object.touchData.lastX = pointer.pageX;
            object.touchData.lastY = pointer.pageY;
            var isSwipeEvent = CClicker.isTouchOutOfBoundries(object,30,30);
            if (isSwipeEvent)
                CClicker.resetTouch(object);
        }
        object.events.onTouchEndEvent = function(e)
        {
            if (object.touchData.startX<0) return; // Not Started.

            var notAClick = CClicker.isTouchOutOfBoundries(object,15,15);

            if (!notAClick && CClicker.canClick(e) && e.type!='mouseout'
                && !CPullToRefresh.inPullToRefresh())
            {
                if (object.onClicks.length>0){
                    e.preventDefault();
                    // Prevent unneccesary pull.
                    CThreads.runTimes(CPullToRefresh.interrupt,0,100,7);
                }
                // Execute OnClicks.
                _.each(object.onClicks,function(onClick){
                    onClick();
                },this);
            }
            // Reset
            CClicker.resetTouch(object);
        }

        // Set Events Handlers.
        element.addEventListener("touchstart",object.events.onTouchStartEvent);
        element.addEventListener("mousedown",object.events.onTouchStartEvent);
        element.addEventListener("touchend",object.events.onTouchEndEvent);
        element.addEventListener("mouseup",object.events.onTouchEndEvent);
        element.addEventListener("mouseout",object.events.onTouchEndEvent);
        element.addEventListener("touchcancel",object.events.onTouchMoveEvent);
        element.addEventListener("touchmove",object.events.onTouchMoveEvent);
        element.addEventListener("mousemove",object.events.onTouchMoveEvent);

    },
    isTouchOutOfBoundries: function(object,radiusX,radiusY){
        var diffX = Math.abs(object.touchData.lastX-object.touchData.startX);
        var diffY = Math.abs(object.touchData.lastY-object.touchData.startY);
        return diffX > radiusX || diffY > radiusY;
    },
    resetTouch: function(object){
        var element = CUtils.element(object.uid());
        object.touchData.startX = -100000;
        object.touchData.startY = -100000;
        object.touchData.lastX = -200000;
        object.touchData.lastY = -200000;
        CUtils.removeClass(element,object.clicker.activeClasses);
        CUtils.addClass(element,object.clicker.activeRemoveClasses);
    }


});


/**
 * Created by dvircn on 11/08/14.
 */
var CColor = function(color,level){
    if (level == undefined || level == null)
        level = 5;
    return {color:color,level:level};
}/**
 * Created by dvircn on 12/10/14.
 */
var CDesignHandler = Class({
    $singleton: true,
    designs: {},
    get: function(name){
        return CDesignHandler.designs[name] || null;
    },
    addDesign: function(name,design){
        CDesignHandler.designs[name] = design;
    },
    addDesigns: function(designs){
        _.each(designs,function(design,name){
            CDesignHandler.designs[name] = design;
        },this);
    }


});

/**
 * Created by dvircn on 11/08/14.
 */
var CPager = Class({
    $singleton: true,
    firstLoad: true,
    historyStack: new Array(),
    mainPage: '',
    backButtonId: '',
    pages: {},
    router: null,
    currentPageNumber: 0,
    currentPage: '',
    lastPage: '',
    initialize: function(){
        this.resetPages();
        this.setBackForwardDetection();
        // Add all pages names to the router.
        _.each(this.pages,function(pageId,name){
            var currentPage = CObjectsHandler.object(pageId);
            var load = function(){
                var params = CPager.fetchParams(window.location.hash);
                CPager.showPage(name,params);
            }
            if (!CUtils.isEmpty(currentPage.getPageName())){
                // Custom page.
                routie(currentPage.getPageName()+'',load);
                routie(currentPage.getPageName()+'/*',load);
            }
            else // Main Page.
                routie('',load);

        },this);
        routie('*', function() { CLog.dlog('page not found')});

        this.checkAndChangeBackButtonState();
    },
    fetchParams: function(path) {
        if (CUtils.isEmpty(path))
            return [];
        path = path.substr(path.indexOf('#')+1);

        var params = path.split('/');
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
    dataToPath: function (data) {
        data = data || [];
        var path = '';
        _.each(data,function(value){
            path += '/'+value;
        },CPager);
        return path;
    },
    mapDataToPath: function (data) {
        data = data || {};
        var path = '';
        _.each(data,function(value,key){
            path += '/'+key+'/'+value;
        });
        return path;
    },
    moveBack: function() {
        window.history.back();
    },
    setBackForwardDetection: function () {
        var detectBackOrForward = function() {
            CPager.hashHistory   = [window.location.hash];
            CPager.historyLength = window.history.length;
            CPager.historyStart  = CPager.hashHistory.length;
            CPager.currentPageNumber = 0;

            return function() {
                var hash = window.location.hash, length = window.history.length;
                if (CPager.hashHistory.length && CPager.historyLength == length) {
                    if (CPager.hashHistory[CPager.hashHistory.length - 2] == hash) {
                        CPager.hashHistory.pop();
                        CPager.currentPageNumber = CPager.currentPageNumber -1;
                    } else {
                        CPager.hashHistory.push(hash);
                        CPager.currentPageNumber = CPager.currentPageNumber +1;
                    }
                } else {
                    CPager.hashHistory.push(hash);
                    CPager.currentPageNumber = CPager.currentPageNumber +1;
                    CPager.historyLength = length;
                }

                CPager.checkAndChangeBackButtonState();

            }
        };

        window.addEventListener("hashchange", detectBackOrForward());
    },
    checkAndChangeBackButtonState:function() {
        if (CUtils.isEmpty(CPager.backButtonId) || !CPager.hashHistory ) return;
        if (CPager.currentPageNumber===0)
            CUtils.addClass(CUtils.element(CPager.backButtonId),'hidden');
        else
            CUtils.removeClass(CUtils.element(CPager.backButtonId),'hidden');
    },
    onLoadPage: function(pageId) {
        var onPageLoad = CObjectsHandler.object(pageId).getLogic().page.onLoad;
        if (CUtils.isEmpty(onPageLoad))
            return;
        // Execute onPageLoad.
        onPageLoad();
    },
    getPagePath: function(name,params){
        return name+CPager.dataToPath(params);
    },
    showPage: function(name,params){
//        if (CPager.isChangePageLocked())

        // Check if the page need to be reloaded with template data
        // or already loaded template page.
        var id                  = CPager.pages[name];
        if (!CUtils.isEmpty(params)) {
            var pagePath = CPager.getPagePath(name,params);
            id = CPager.pages[pagePath];
            if (CUtils.isEmpty(id)) { // Page not exist.
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

        // Cancel Pull to refresh.
        CPullToRefresh.interrupt();

        // Notice: Update Current Page can be called outside of CPager. Example: Page.
        CPager.lastPage         = CPager.currentPage;
        CPager.currentPage      = id;

        var currentPage = CPager.currentPage;
        var lastPage = CPager.lastPage;

        // Do not reload the same page over and over again.
        if (currentPage == lastPage)
            return;

        // Normal page hide.
        if (!CUtils.isEmpty(lastPage) && !CTemplator.objectHasDynamic(lastPage))
            CAnimations.hide(lastPage,{});

        // Check to-page dynamic.
        var toPageBareId    = CPager.pages[name];
        var toPageBare      = CObjectsHandler.object(toPageBareId);
        // Template page
        if (toPageBare && toPageBare.data && toPageBare.data.template){
            CUtils.element(toPageBareId).style.zIndex       = '';
        }


        var animationOptions    = {};
        // Page Load.
        animationOptions.onAnimShowComplete = function() {
            var page = CObjectsHandler.object(currentPage);
            page.reload();
            // Check from-page dynamic.
            if (!CUtils.isEmpty(lastPage)){
                var fromPage                = CObjectsHandler.object(lastPage);
                var fromPageBareParent    = CObjectsHandler.object(fromPage.parent );
                // Template page
                if (fromPageBareParent && fromPageBareParent.data && fromPageBareParent.data.template){
                    CUtils.element(fromPage.parent).style.zIndex       = '-1';
                }
            }
        };
        var page = CObjectsHandler.object(currentPage);
        CTitleHandler.setTitle(page.getPageTitle());
        page.setParams(this.getParamsAsMap(params));

        // Showing current page.
        if (CUtils.isEmpty(lastPage))
            CAnimations.quickShow(currentPage);
        else
            CAnimations.show(currentPage,animationOptions);

    },
    // Immediate hide to all pages on first load.
    resetPages: function() {
        // Hide All Pages except current.
        _.each(CPager.pages,function(pageId){
            if (!CTemplator.objectHasDynamic(pageId))
                CAnimations.quickHide(pageId);
            else { //Parent dynamic page.
                var pageElement = CUtils.element(pageId);
                if (!CUtils.isEmpty(pageElement)) {
                    pageElement.style.zIndex = '-1';
                    pageElement.style.background   = 'rgba(0, 0, 0, 0)';
                }
            }
        },CPager);
    },
    getParamsAsMap: function(params){
        var map = {};
        if (CUtils.isEmpty(params))
            return map;
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
 * Created by dvirc_000 on 23/09/14.
 */
var CPullToRefresh = Class({
    $singleton: true,
    inPull: false,
    inPullTemplate: null,
    spinnerSize: 60,
    minDistance: 70,
    enabled: true,
    applyPullToRefresh: function(template){
        var element = CUtils.element(template.uid());
        // Set element to be relative.
        element.style.display = 'relative';

        template.events = template.events || {};
        template.pullToRefreshData = {
            started: false,
            startX:-100000,
            startY:-100000,
            lastX:-200000,
            lastY:-200000,
            lastDistance: 0,
            startTime: 0,
            spinnerId:''
        };
        //Unbind
        CUtils.unbindEvent(element,'touchstart',template.events.onPullToRefreshListenerStart);
        CUtils.unbindEvent(element,'mousedown',template.events.onPullToRefreshListenerStart);
        CUtils.unbindEvent(element,'touchend',template.events.onPullToRefreshListenerEnd);
        CUtils.unbindEvent(element,'mouseup',template.events.onPullToRefreshListenerEnd);
        CUtils.unbindEvent(element,'mouseout',template.events.onPullToRefreshListenerEnd);
        CUtils.unbindEvent(element,'touchcancel',template.events.onPullToRefreshListenerEnd);
        CUtils.unbindEvent(element,'touchmove',template.events.onPullToRefreshListenerMove);
        CUtils.unbindEvent(element,'mousemove',template.events.onPullToRefreshListenerMove);

        template.events.onPullToRefreshListenerStart = function(e){
            var isRightClick = ((e.which && e.which == 3) || (e.button && e.button == 2));
            if (isRightClick) return;

            // Disabled.
            if (!CPullToRefresh.enabled)
                return;

            // Check that the scroller is on top.
            var closestScroller = CScrolling.getClosestScrollableObject(template);
            if (CUtils.isEmpty(closestScroller.uid()) ||
                    CScrolling.getScrollerTop(closestScroller.uid())>5){
                return;
            }


            var pointer = CUtils.getPointerEvent(e);
            // caching the start x & y
            template.pullToRefreshData.started    = true;
            template.pullToRefreshData.startX     = pointer.pageX;
            template.pullToRefreshData.startY     = pointer.pageY;
            template.pullToRefreshData.lastX      = pointer.pageX;
            template.pullToRefreshData.lastY      = pointer.pageY;
            //e.preventDefault();

            // Check if template is not showing anymore.
            CPullToRefresh.runNotVisibleCheck(template);
        };
        template.events.onPullToRefreshListenerMove = function(e){
            // Disabled.
            if (!CPullToRefresh.enabled) {
                CPullToRefresh.interrupt();
                return;
            }
            if (template.pullToRefreshData.startY<0) // Not started.
                return;
            var pointer = CUtils.getPointerEvent(e);

            // caching the last x & y
            template.pullToRefreshData.lastX = pointer.pageX;
            template.pullToRefreshData.lastY = pointer.pageY;
            var distance = template.pullToRefreshData.lastY-template.pullToRefreshData.startY;
            distance = distance -10;

            if (distance<=0)
                return;

            distance = distance - (Math.max(0,distance/1.5-10)); // Slower speed when distance is high.
            distance = Math.min(110,distance); // Set max distance
            template.pullToRefreshData.lastDistance = distance;

            // Append element.
            CPullToRefresh.injectSpinner(template);
            CPullToRefresh.inPull = true;
            CPullToRefresh.inPullTemplate = template;
            e.stopPropagation();
            e.preventDefault();

            var element = CUtils.element(template.uid());
            element.style.paddingTop = distance+'px';
            CPullToRefresh.getInjectedSpinner(template).style.top = ((-1)*CPullToRefresh.spinnerSize)+distance+'px';
            if (distance>CPullToRefresh.minDistance)
                CObjectsHandler.object(template.pullToRefreshData.spinnerId).startSpin();

        };
        template.events.onPullToRefreshListenerEnd = function(e){
            if (!CPullToRefresh.inPull) // Not started.
                return;

            var pointer = CUtils.getPointerEvent(e);

            if (pointer && pointer.type && pointer.type ==='mouseout' &&
                CUtils.isDeepChild(template.uid(),e.toElement)){
                return;
            }

            e.stopPropagation();
            // not need refresh.

            if (template.pullToRefreshData.lastDistance<=CPullToRefresh.minDistance){
                CPullToRefresh.reset(template);
                return;
            }

            // refresh.
            template.reload(null,function(){},null);
            // Reset and remove spinner.
            CPullToRefresh.reset(template);

        };



        // Set Events Handlers.
        element.addEventListener("touchstart",template.events.onPullToRefreshListenerStart);
        element.addEventListener("mousedown",template.events.onPullToRefreshListenerStart);
        element.addEventListener("touchend",template.events.onPullToRefreshListenerEnd);
        element.addEventListener("mouseup",template.events.onPullToRefreshListenerEnd);
        element.addEventListener("mouseout",template.events.onPullToRefreshListenerEnd);
        element.addEventListener("touchcancel",template.events.onPullToRefreshListenerMove);
        element.addEventListener("touchmove",template.events.onPullToRefreshListenerMove);
        element.addEventListener("mousemove",template.events.onPullToRefreshListenerMove);
    },
    runNotVisibleCheck: function (template) {
        CThreads.runTimes(function(){
            if (!template.pullToRefreshData.started)
                return;
            var elm = CUtils.element(template.uid());
            if (elm.clientHeight === 0 && elm.clientWidth === 0)
                CPullToRefresh.reset(template);
        },200,200,20);
    },
    inPullToRefresh: function(){
        return CPullToRefresh.inPull;
    },
    injectSpinner: function (template) {
        if (!CUtils.isEmpty(template.pullToRefreshData.spinnerId))
            return;

        var spinnerId = CObjectsHandler.createObject('LoadSpinner',co()
            .design({position:'absolute',height:CPullToRefresh.spinnerSize,
                        color: template.getLoaderColor()}).build()
        );
        template.pullToRefreshData.spinnerId = spinnerId;
        template.appendChild(spinnerId);
        template.rebuild(function(){
            var spinner = CUtils.element(spinnerId);
            spinner.style.top = '-'+CPullToRefresh.spinnerSize+'px';
        });
        CUtils.element(template.uid()).style.overflowY = 'hidden';
    },
    getInjectedSpinner: function(template){
        return CUtils.element(template.pullToRefreshData.spinnerId || '');
    },
    interrupt: function(){
        if (!CUtils.isEmpty(CPullToRefresh.inPullTemplate))
            CPullToRefresh.reset(CPullToRefresh.inPullTemplate);
    },
    disable: function(){
        CPullToRefresh.enabled = false;
    },
    enable: function(){
        CPullToRefresh.enabled = true;
    },
    reset: function(template){
        var element = CUtils.element(template.uid());
        element.style.paddingTop = '0px';
        template.pullToRefreshData.started = false;
        template.pullToRefreshData.startX = -100000;
        template.pullToRefreshData.startY = -100000;
        template.pullToRefreshData.lastX = -200000;
        template.pullToRefreshData.lastY = -200000;

        template.removeChild(template.pullToRefreshData.spinnerId||'');
        template.pullToRefreshData.spinnerId = '';

        CThreads.run(function(){
            CPullToRefresh.inPull = false;
            CPullToRefresh.inPullTemplate = null;
        },100);

        template.rebuild();
    }


});


/**
 * Created by dvircn on 12/08/14.
 */
var CScrolling = Class({
    $singleton: true,
    scrollers: {},
    isNative: null,
    setScrollable: function(object){
        object.logic              = object.logic || {};
        object.design             = object.design ||{};
        object.logic.scrollable   = true;
        object.design.scrollable  = true;
    },
    scrollableClass: function(){
        return 'overthrow';
    },
    isScroller: function(object){
        if (CScrolling.isNativeScrolling())
            return object.getClasses().indexOf(CScrolling.scrollableClass()) > 0;
        else
            return !CUtils.isEmpty(object.scroller);
    },
    isNativeScrolling: function(){
        if (this.isNative===null){
            this.isNative = ! (CPlatforms.isAndroid() && CPlatforms.androidSeries()>0 &&
                                CPlatforms.androidSeries()<4);
        }
        return this.isNative;
    },
    getScrollerTop: function(scrollerId){
        if (CScrolling.isNativeScrolling()) {
            var element = CUtils.element(scrollerId);
            if (!CUtils.isEmpty(element))
                return element.scrollTop;
        }
        else {
            var scroller = CObjectsHandler.object(scrollerId).scroller;
            if (!CUtils.isEmpty(scroller))
                return scroller.getScrollTop();
        }
        return 10000000;
    },
    getClosestScrollableObject: function(object){
        if (CScrolling.isScroller(object))
            return object;
        var parent = CObjectsHandler.object(object.parent);
        if (!CUtils.isEmpty(parent))
            return CScrolling.getClosestScrollableObject(parent);
        return null;
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
    initSideMenu: function(positions,width) {
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
            disable: disable,
            maxPosition: width,
            minPosition: -width,
            resistance: 1000000
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
var CTitleHandler = Class({
    $singleton: true,
    titleId: '',
    setTitleObject: function(id){
        this.titleId = id;
    },
    setTitle: function(text){
        // Set web-page Title
        document.title = text || '';
        // Set CAF page title.
        var titleObject = CObjectsHandler.object(this.titleId);
        if (!CUtils.isEmpty(titleObject))
            titleObject.setText(text);

    }

});


/**
 * Created by dvircn on 19/10/14.
 */
var CThemeFlatBlue = Class({
    $singleton: true,
    designs: {
        'left-menu-button': {
            paddingLeft:6,boxSizing:'borderBox',textAlign:'left',height:45, widthXS: 12,
            fontSize:16,color: CColor('Gray',2), marginTop:1, round: 0,
            active: { bgColor:CColor('Indigo',17),color: CColor('White') }
        },
        'left-menu-button/blue': {
            parents: ['left-menu-button']
        }
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
        if (CUtils.isEmpty(CObjectsHandler.appContainerId)){
            CLog.error('Error: Can\'t build. No App Container exist.');
            return;
        }
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

        try {
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
        }
        catch (e) {
            CLog.error('Error occurred in app building.');
            CLog.log(e);
            if (!CUtils.isEmpty(onFinish))
                onFinish();
        }

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
var CDesigner = Class({
    $singleton: true,
    colors: {
        notLeveled: ['Black', 'White'],
        getColor: function(color,level){
            // Not Leveled Color.
            if (CDesigner.colors.notLeveled.indexOf(color)>=0){
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
            return "bg"+CDesigner.colors.getColor(data.color,data.level || null);
        },
        color: function(data){
            return "c"+CDesigner.colors.getColor(data.color,data.level || null);
        },
        borderColor: function(data){
            return "bc"+CDesigner.colors.getColor(data.color,data.level || null);
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
            if (data=='normal')     classes+="fontStyleNormal ";
            if (data=='italic')     classes+="italic ";
            return classes;
        },
        fontWeight: function(data){
            var classes = "";
            if (data=='bold')       classes+="bold ";
            if (data=='normal')     classes+="fontWeightNormal ";
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
            var values = ['inlineBlock','block','inline','hidden','displayNone'];
            if (!CUtils.isEmpty(data) && (values.indexOf(data)>=0) ) {
                return data;
            }
            return "";
        },
        overflow: function(data){
            if (data==="hidden")        return "hidden";
            //if (data==="scrollable")    return "scrollable";
            if (data==="scrollY")       return "yScrollable";
            return "";
        },
        scrollable: function(data){
            if (data===true && CScrolling.isNativeScrolling())
                return CScrolling.scrollableClass();
            return '';
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
        },
        selectable: function(data){
            if (data===true){
                return "selectable";
            }
        },
        inline: function(data){
            return '';
        },
        parents: function(data){
            return '';
        },
        defaults: function(data){
            return '';
        }

    },
    prepareDesign: function(object){
        var design = object.design;
        // Save the classes in the object.
        object.setClasses(CDesigner.designToClasses(design));
    },
    mergeParents: function(design){
        var parents = design.parents || [];
        _.each(parents,function(parent){
            var parentDesign = {};
            // Design is reference to named design.
            if (CUtils.isString(parent))
                parentDesign = CDesignHandler.get(parent) || {};
            else
                parentDesign = parent;
            // In case it wasn't merged yet, Merge parents of parent.
            CDesigner.mergeParents(parentDesign);
            // Merge parent design into current design - current design is stronger.
            design = CUtils.mergeJSONs(parentDesign,design);
        },this);

        return design;
    },
    getFinalInlineStyle: function(design){
        if (CUtils.isEmpty(design))
            return '';
        if (!CUtils.isEmpty(design.inline))
            return design.inline;
        var inline = '';
        var parents = design.parents || [];
        _.each(parents,function(parent){
            var parentDesign = {};
            // Design is reference to named design.
            if (CUtils.isString(parent))
                parentDesign = CDesignHandler.get(parent) || {};
            else
                parentDesign = parent;
            // Return first arent design with inline,
            // By Saving only the first inline design we catch.
            if (!CUtils.isEmpty(parentDesign.inline) && CUtils.isEmpty(inline))
                inline = parentDesign.inline;
        },this);
        return inline;
    },
    mergeDefaults: function(design){
        var defaults = design.defaults;
        //delete design.defaults;
        return CUtils.mergeJSONs(defaults,design);
    },
    designToClasses: function(design){
        if (CUtils.isEmpty(design))
            return "";

        design = CDesigner.mergeParents(design);
        design = CDesigner.mergeDefaults(design);

        var classesBuilder = new CStringBuilder();
        // Scan the designs and generate classes.
        _.each(design,function(value,attribute){
            if (CUtils.isEmpty(value))  return;
            if (CUtils.isEmpty(CDesigner.designs[attribute])){
                CLog.error("Design: "+attribute+" doesn't exist.")
                return "";
            }
            classesBuilder.append( CDesigner.designs[attribute](value) );
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
        onCreate: function(object,value){
            if (!CUtils.isEmpty(value))
                value();
        },
        onCreateAsync: function(object,value){
            if (!CUtils.isEmpty(value))
                CThreads.start(value);
        },
        onClick: function(object,value){
            CClicker.addOnClick(object,value);
        },
        onTemplateElementClick: function(object,value){
            CClicker.addOnClick(object,value);
        },
        phoneCall: function(object,value){
            if (CUtils.isEmpty(value))
                return;
            CClicker.addOnClick(object,function(){
                window.location = 'tel:'+value;
            });
        },
        openNavigationApp: function(object,value){
            if (CUtils.isEmpty(value))
                return;
            CClicker.addOnClick(object,function(){
                CUtils.openURL("http://maps.google.com/?q=" + value, "_system");
            });
        },
        link: function(object,value){
            if (CUtils.isEmpty(value) || CUtils.isEmpty(value.path))
                return;
            value.path = value.path+''; // Cast to string.
            if ((!CUtils.isURLLocal(value.path))){
                CClicker.addOnClick(object,function(){
                    CUtils.openURL(value.path);
                });
            }
            else {
                CClicker.addOnClick(object,function(){
                    value.data = value.data || {};
                    value.globalData = value.globalData || {};
                    var finalData = CUtils.clone(value.data);
                    // Evaluate dynamic global data.
                    _.each(value.globalData,function(globalName,key){
                        finalData[key] = CGlobals.get(globalName) || '';
                    });
                    CUtils.openLocalURL(value.path+CPager.mapDataToPath(finalData));
                });
            }
        },
        showDialog: function(object,value){
            CClicker.addOnClick(object,function(){
                CDialog.showDialog(value.data || {},value.design || {});
            });
        },
        request: function(object,value){
            CClicker.addOnClick(object,function(){
                CNetwork.request(value.url || '',value.data || {},value.callback || function(){});
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
            var color   = CUtils.isEmpty(value.color)?'': ' '+CDesigner.designs.color(value.color);
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
            CSwiper.initSideMenu(value.positions,value.width || 266);
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
        inputOnFileSelect: function(object,value){
            var element = CUtils.element(object.uid());
            element.addEventListener('change', value, false);
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
        },
        pullToRefresh: function(object,value){
            if (value === true)
                CPullToRefresh.applyPullToRefresh(object);
        },
        scrollable: function(object,value){
            if (value!==true)
                return;
            // Old android only
            if (!CScrolling.isNativeScrolling())
                object.scroller = $('#'+object.uid()).niceScroll({});
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
 * Created by dvircn on 07/08/14.
 */
var CObjectsHandler = Class({
    $singleton: true,
    objectsById: {},
    preparedObjects: Array(),
    appContainerId: "",
    dialogsContainerId: "",
    mainViewId: "",
    contentId: "",

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
    // Extend CObject method: parseRelativeObjectId
    relativeObject: function(baseObjectId,relativeId){
        var baseObject = CObjectsHandler.object(baseObjectId);
        if (CUtils.isEmpty(baseObject)) {
            baseObject = baseObjectId; // Case CObject sent and not id.
            baseObjectId = baseObject.uid();
        }
        if (CUtils.isEmpty(baseObject))
            return null;
        var relativeParentId = '';
        if (baseObject.isRelative())
            relativeParentId = baseObjectId;
        else
            relativeParentId = baseObject.getRelativeParent();
        if (!CUtils.isEmpty(relativeParentId))
            return relativeParentId+'/'+relativeId;

    },
    isCObject: function(id){
        return !CUtils.isEmpty(this.object(id));
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
        if (type=="Content") CObjectsHandler.contentId = cObject.uid(); // Identify Main Object.
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
                // If root object or there is only one object, add to the top container.
                if ( rootObjects.indexOf(abstractObject.uname || '') >=0 || templateData.objects.length === 1)
                    container.appendChild(duplicateId);
            },this);


            // Map container to data.
            object.data.template.containerToData[containerId] = currentData;
        },this);
        object.appendChilds(object.data.template.duplicates);

        if (preventRebuild !== true)
            object.rebuild(onFinish);
    },
    fixRetreivedData: function(retreived){
        // DO NOT MAKE any changes to the source data.
        retreived = CUtils.clone(retreived);
        var fixed = {
            data: retreived.data || {},
            design: retreived.design || {},
            logic: retreived.logic || {}
        }
        delete retreived.data;
        delete retreived.design;
        delete retreived.logic;
        // Merge left data in retreived into fixed.data
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
        });

    }

});


/**
 * Created by dvircn on 19/10/14.
 */
/**
 * Created by dvircn on 06/08/14.
 */
var CThemes = Class({
    $singleton: true,
    mainTheme: '',
    themes: {
        'flat-blue': CThemeFlatBlue
    },
    get: function(name){
        return CThemes[name];
    },
    setMainTheme: function(name) {
        CThemes.mainTheme = name;
    },
    loadTheme: function(name){
        var theme = CThemes.themes[name];
        if (CUtils.isEmpty(theme))
            return;

        _.each(theme.designs, function(design,name){
            CDesignHandler.addDesign(name,design);
        });
    }
});

/**
 * Created by dvircn on 06/08/14.
 */
var CObject = Class({
    $statics: {
        DEFAULT_DESIGN: {
//            gpuAccelerated: true
        },
        DEFAULT_LOGIC: {
        },

        generateID: function() {
            return "c_"+Math.random().toString(36).substring(2);
        },
        setObjectDefaults: function(values,useClass){
            values.design = values.design || {};
            if (!CUtils.isString(values.design))
                values.design.defaults = CUtils.mergeJSONs(values.design.defaults,useClass.DEFAULT_DESIGN);
            values.logic = CUtils.mergeJSONs(useClass.DEFAULT_LOGIC,values.logic);
        },
        setObjectDesignDefaults: function(values,useClass){
            values.design = values.design || {};
            if (!CUtils.isString(values.design))
                values.design.defaults = CUtils.mergeJSONs(values.design.defaults,useClass.DEFAULT_DESIGN);
        }

    },

    constructor: function(values) {
        if (CUtils.isEmpty(values)) return;
        // Merge Defaults.
        CObject.setObjectDefaults(values,CObject);

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
        // Look for relative parent.
        while (!CUtils.isEmpty(parentObject)){
            if (parentObject.isRelative()){
                this.relativeParent = parentObject.uid();
                break;
            }
            else {
                parentObject = CObjectsHandler.object(parentObject.parent);
            }
        }
        // If there is no relative parent and this object is relative, return this object.
        if (this.relativeParent === null && this.isRelative())
            this.relativeParent = this.uid();
        return this.relativeParent;
    },
    getDeepRelativeParent: function(depth){
        if (depth === 0)
            return this;
        else if (depth === 1)
            return CObjectsHandler.object(this.getRelativeParent() || '');
        else
            return CObjectsHandler.object(this.getDeepRelativeParent(depth-1) || '');
    },
    isRelative: function() {
        return this.relative;
    },
    setRelative: function(relative) {
        this.relative = relative;
    },
    getLink: function() {
        return this.data.link || '';
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
    setText: function(text){
        CUtils.element(this.uid()).innerHTML = text||'';
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
        if (CUtils.isEmpty(obj) || obj.parseReferencesVisited === true /* Circular*/)
            return;
        obj.parseReferencesVisited = true;
        for (var property in obj) {
            // Allow parse part of the template data
            if (obj.hasOwnProperty(property) && property=='template') {
                if (!CUtils.isEmpty(obj.template) && !CUtils.isEmpty(obj.template.queryData))
                    this.parseReferences(obj.template.queryData);
            }
            else if (obj.hasOwnProperty(property) && property!='template') {
                if (typeof obj[property] == "object"){
                    this.parseReferences(obj[property]);
                }
                else if (typeof obj[property] == 'string' || obj[property] instanceof String){
                    // Evaluate dynamic data.
                    var evaluated   = this.replaceReferencesInString(obj[property]);
                    obj[property] = evaluated;
                }
                else if (typeof obj[property] == 'function' || obj[property] instanceof Function){
                    // Evaluate references inside functions.
                    var evaluated   = this.replaceReferencesInFunction(obj[property]);
                    obj[property] = evaluated;
                }

            }
        }
        delete obj.parseReferencesVisited;
    },
    parseLocalReference: function(workingObject,str){
        return eval('workingObject.'+str);
    },
    parseGlobalReference: function(str){
        return CGlobals.get(str);
    },
    parsePageReference: function(str){
        return CPageData.get(str);
    },
    parseDesignReference: function(str){
        return CDesignHandler.get(str);
    },
    parseRelativeReference: function(workingObject,str){
        var relativeParentId = workingObject.getRelativeParent();
        if (!CUtils.isEmpty(relativeParentId)){
            var relativeParent = CObjectsHandler.object(relativeParentId);
            return eval('relativeParent'+str);
        }
        return null;
    },
    // Extension of this method in: CObjectHandler.relativeObject
    parseRelativeObjectId: function(workingObject,str){
        if (workingObject.isRelative())
            return eval(workingObject.uid()+str);
        var relativeParentId = workingObject.getRelativeParent();
        if (!CUtils.isEmpty(relativeParentId))
            return relativeParentId+str;
        return str.substr(1);
    },
    replaceReferencesInFunction: function(func) {
        if (CUtils.isEmpty(func))
            return func;
        var thisObjectStr = 'thisObject';
        var funcAsString = JSONfn.stringify(func);
        if (funcAsString.indexOf(thisObjectStr) < 0)
            return func;

        var thisObjectReference = 'CObjectsHandler.object(\''+this.uid()+'\')';
        // Replace all 'thisObject' to reference to this object.
        var replacedReferencesFunc = CUtils.replaceAll(funcAsString,'thisObject',
            thisObjectReference);
        return JSONfn.parse(replacedReferencesFunc);
    },
    replaceReferencesInString: function(str) {
        if (CUtils.isEmpty(str))
            return str;
        if (str.indexOf('#') < 0)
            return str;
        // Multiple reference.
        var parts = str.split(' ');
        for (var i=0; i<parts.length; i++){
            var part = parts[i];
            // not a reference.
            if (part.length<=0 || part[0]!='#')
                continue;
            /**
             * Get the object that the data needed to be extracted from.
             * Examples:'#*'    => workingObject = this
             *          '##*'   => workingObject = this.getRelativeParent()
             *          '###*'  => workingObject = this.getRelativeParent().getRelativeParent()
             *          etc..
            **/
            var countHeadHashes =   CUtils.stringCountOccurencesInHead('#',part);
            var workingObject   =   this.getDeepRelativeParent(countHeadHashes-1);
            part                =   CUtils.stringRemoveAllOccurencesInHead('#',part);
            if (part.length>5 && part.substr(0,5) == 'this.')
                parts[i] = this.parseLocalReference(workingObject,part.substr(5)) || null;
            else if (part.length>1 && part.substr(0,1) == '.')
                parts[i] = this.parseRelativeReference(workingObject,part)  || null;
            else if (part.length>1 && part.substr(0,1) == '/')
                parts[i] = this.parseRelativeObjectId(workingObject,part)   || null;
            else if (part.length>8 && part.substr(0,8) == 'globals.')
                parts[i] = this.parseGlobalReference(part.substr(8))        || null;
            else if (part.length>5 && part.substr(0,5) == 'page.')
                parts[i] = this.parsePageReference(part.substr(5))          || null;
            else if (part.length>8 && part.substr(0,8) == 'designs.')
                parts[i] = this.parseDesignReference(part.substr(8))        || null;
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
        CDesigner.prepareDesign(this);

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
        var inlineDesign = CDesigner.getFinalInlineStyle(this.design);
        if (!CUtils.isEmpty(inlineDesign)) {
            attributes.push('style="'+inlineDesign+'"');
        }

        // Custom tag - can be used to insert a,input..
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
        // Parse relative uname.
        var prevUID = this.uid();
        this.uname = this.replaceReferencesInString(this.uname);
        CObjectsHandler.updateUname(prevUID,this.uname);
        // Update reference in parent.
        if (!CUtils.isEmpty(this.getRelativeParent())){
            var parentObject = CObjectsHandler.object(this.getRelativeParent());
            var thisIndex = parentObject.getChilds().indexOf(prevUID);
            parentObject.setChildInPosition(this.uid(),thisIndex);
        }
        // Retrieve relative and local references.
        this.parseReferences(this.data);
        this.parseReferences(this.logic);
        if (CUtils.isString(this.design)){
            this.design = this.replaceReferencesInString(this.design);
            this.design = CObject.setObjectDesignDefaults(this.design,this);
        }
        else {
            this.parseReferences(this.design);
        }
    },
    isContainer: function(){
        return false;
    },
    removeSelf: function(){
        var parentContainer = CObjectsHandler.object(this.parent);
        parentContainer.removeChild(this.uid());
        parentContainer.rebuild();
    },
    rebuild: function() {
        var parentContainer = CObjectsHandler.object(this.parent);
        parentContainer.rebuild();

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
        CObject.setObjectDefaults(values,CContainer);

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
//    assignReferences: function(){
//        _.each(this.data.childs,function(childID){
//            var object = CObjectsHandler.object(childID);
//            //Set parent to this Object.
//            object.setParent(this.uid());
//            object.assignReferences();
//        },this);
//        CContainer.$superp.assignReferences.call(this);
//    },
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


/**
 * Created by dvircn on 25/08/14.
 */
var CTemplate = Class(CContainer,{
    $statics: {
        gifLoaders:{
            'default': 'loaderDefault'
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
        CObject.setObjectDefaults(values,CTemplate);

        // Invoke parent's constructor
        CTemplate.$super.call(this, values);

        this.design.classes             = this.design.classes           || '';
        //this.design.classes             += ' ' +CTemplate.gifLoaders.default+ ' ';
        this.logic.template             = true;
        this.data.template.pullToRefresh= this.data.template.pullToRefresh || false;
        if (this.data.template.pullToRefresh === true)
            this.logic.pullToRefresh    = true;
        this.data.template              = this.data.template            || {};
        this.data.template.url          = this.data.template.url        || '';
        this.data.template.callback     = this.data.template.callback   || function(){};
        this.data.template.prepareFunction = this.data.template.prepareFunction   || function(data){return data;};
        this.data.template.callbacks    = this.data.template.callbacks  || [];
        this.data.template.queryData    = this.data.template.queryData  || {};
        this.data.template.data         = this.data.template.data       || null;
        this.data.template.applied      = this.data.template.applied    || false;
        this.data.template.showLoader   = this.data.template.showLoader === false ? false : true;
        this.data.template.loaderColor  = this.data.template.loaderColor|| CColor('TealE',9);
        this.data.template.autoLoad     = this.data.template.autoLoad   === false ? false : true;
        this.data.template.resetOnReload= this.data.template.resetOnReload=== false ? false : true;
        this.data.template.loaded       = this.data.template.loaded     || false;
        this.data.template.duplicates   = this.data.template.duplicates || [];
        this.data.template.rootObjects  = this.data.template.rootObjects|| [];
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
        this.data.template.data = data;
        this.parseReferences(this.data.template.data);
        CTemplator.loadObjectWithData(this,data,null,true);
    },
    filter: function(filterFunction){
        filterFunction = filterFunction || function(data) { return true; };
        _.each(this.data.template.containerToData,function(data,id){
            data = data || {};
            if (filterFunction(data)===true)
                CUtils.element(id).style.display = '';
            else
                CUtils.element(id).style.display = 'none';
        },this);
    },
    clearFilter: function(){
      this.filter();
    },
    showLoading: function(){
        if (this.data.template.showLoader!==true || !CUtils.isEmpty(this.spinnerId))
            return;
        this.spinnerId = CObjectsHandler.createObject('LoadSpinner',
            co().spinnerAutoStart()
                .design({color:this.getLoaderColor()}) // Set spinner color.
                .build());
        this.addChildToStart(this.spinnerId);
        this.rebuild();
    },
    stopLoading: function(){
        if (this.data.template.showLoader!==true)
            return
        this.removeChild(this.spinnerId);
        this.rebuild();
        delete this.spinnerId;
    },
    reload: function(queryData,onFinish, reset){
        CTemplator.load(this.uid(),queryData||this.data.template.queryData,
            onFinish||function(){},reset||this.data.template.resetOnReload);
    },
    getLoaderColor: function(){
        return this.data.template.loaderColor;
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
            //round:2,
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
        CObject.setObjectDefaults(values,CDialogContainer);
        // Invoke parent's constructor
        CDialogContainer.$super.call(this, values);

        this.design.top = CGlobals.get('headerSize')+20;
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
            CObjectsHandler.object(CObjectsHandler.dialogsContainerId).appendChild(newDialog);
            var onBuildFinish = function() {CObjectsHandler.object(newDialog).show();};
            CObjectsHandler.object(CObjectsHandler.dialogsContainerId).rebuild(onBuildFinish);
            return newDialog;
        },
        hideDialogContainer: function(){
            CUtils.element(CObjectsHandler.dialogsContainerId).style.zIndex='';
            CUtils.element(CObjectsHandler.dialogsContainerId).style.display='';
        },
        showDialogContainer: function(){
            CUtils.element(CObjectsHandler.dialogsContainerId).style.zIndex='10000';
            CUtils.element(CObjectsHandler.dialogsContainerId).style.display='inherit';
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
        CObject.setObjectDefaults(values,CDialog);
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
        this.data.list              = this.data.list                || {};
        this.data.hideOnListChoose  = this.data.hideOnListChoose===false? false : true;
        this.data.cancelCallOnHide  = this.data.cancelCallOnHide===false? false : true;
        this.data.cancelText        = this.data.cancelText          || '';
        this.data.cancelCallback    = this.data.cancelCallback      || function(){};
        this.data.confirmText       = this.data.confirmText         || '';
        this.data.confirmCallback   = this.data.confirmCallback     || function(){};
        this.data.extraText         = this.data.extraText           || '';
        this.data.extraCallback     = this.data.extraCallback       || function(){};
        // Design
        this.data.dialogColor       = this.data.dialogColor         || CColor('TealE',8);
        this.data.bgColor           = this.data.bgColor             || {color:'Gray',level:0};
        this.data.contentColor      = this.data.contentColor        || {color:'Gray',level:12};
        this.data.listBorderColor   = this.data.listBorderColor     || {color:'Gray',level:2};
        this.data.titleColor        = this.data.titleColor          || this.data.dialogColor;
        this.data.titleAlign        = this.data.titleAlign          || 'center';
        this.data.contentAlign      = this.data.contentAlign        || CGlobals.get('appGeneralAlign') || 'center';
        this.data.dialogWidth       = this.data.dialogWidth         || 400;
        containerDesign.width       = this.data.dialogWidth;
        containerDesign.bgColor     = this.data.bgColor;


        // Init function.
        var dialog = this;
        dialog.isHidden = true;
        // Adnimation handling.
        this.data.onAnimShowComplete = function(){
            dialog.isHidden = false;
            CThreads.runTimes(dialog.onResize,0,100,15);
        };

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
        if (CAnimations.objectInAnim(this) && this.isHidden === false)
            return;
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
    postponeHide: function(dialog,callback){
        CThreads.run(function(){
            dialog.hide(callback);
        },100);
    },
    show: function(){
        if (CAnimations.objectInAnim(this) && this.isHidden === true)
            return;

        CDialog.showDialogContainer();
        CAnimations.show(this.uid());
        this.onResize();
    },
    postponeShow: function(dialog){
        CThreads.run(function(){
            dialog.show();
        },100);
    },
    switchDialog: function(){
        CAnimations.hideOrShow(this.uid());
        this.onResize();
    },
    setDestroyOnHideHandler: function(){
        var object = this;
        if (this.data.destroyOnHide){
            this.data.onAnimHideComplete = function(){
                this.isHidden = true;
                object.removeSelf();
                CUtils.unbindEvent(window,'resize',object.onResize);
                // Hide dialogs container.
                CDialog.hideDialogContainer();
            };
        }
        else {
            this.data.onAnimHideComplete = function(){
                this.isHidden = true;
                // Hide dialogs container.
                CDialog.hideDialogContainer();
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

        CObjectsHandler.object(this.dialogContainer).appendChild(this.dialogTitle);
    },
    createContainer: function(){
        // Create container.
        this.contentContainer = CObjectsHandler.createObject('Container',{
            design: {
                width:'100%',
                height: 'auto',
                //overflow: 'scrollable',
                boxSizing: 'borderBox'
            },
            logic: {}
        });
        // Set scrollable.
        CScrolling.setScrollable(CObjectsHandler.object(this.contentContainer));

        CObjectsHandler.object(this.dialogContainer).appendChild(this.contentContainer);

    },
    appendContent: function(contentId) {
        CObjectsHandler.object(this.contentContainer).appendChild(contentId);
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
        var list            = this.data.list;
        if (CUtils.isEmpty(list) || CUtils.isEmpty(list.logic) ||
            list.logic.template !== true || CUtils.isEmpty(list.data) || CUtils.isEmpty(list.data.template) )
            return;

        var design = {
            color: this.data.contentColor, width:'100%', height: '45', boxSizing: 'borderBox',
            fontSize:17, fontStyle: ['bold'], paddingRight:7, paddingLeft:7,
            textAlign: this.data.contentAlign, display: 'block',
            active: { bgColor: this.data.dialogColor, color: {color:'White'}}
        };

        if (!CUtils.isEmpty(list.data.template.object))
            list.data.template.object.design =
                CUtils.mergeJSONs(design,list.data.template.object.design || {});

        // List template item container - Border
        list.data.template.container    = list.data.template.container  || {type:'Container'};
        var containerDesign = {borderColor: this.data.listBorderColor,border: {top:1},
                            width:'100%',display:'inlineBlock'};
        list.data.template.container.design =
            CUtils.mergeJSONs(containerDesign,list.data.template.container.design);

        list.data.template.callback =  this.createListCallback(this,list.data.template.callback);

        var listId = CObjectsHandler.createObject('Template',list);
        this.appendContent(listId);

        return;
        /*var    iconsList       = this.data.iconsList,
            listCallbacks   = this.data.listCallbacks,
            listItemsData   = this.data.listItemsData,
            listItemsLogic  = this.data.listItemsLogic,
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
            var data = index < listItemsData.length ? listItemsData[index] : {};
            var logic = index < listItemsLogic.length ? listItemsLogic[index] : {};

            var listCallback = index < listCallbacks.length ?
                listCallbacks[index] : function(){};
            var chosenCallback = !CUtils.isEmpty(chooseCallback) ? function(index,text) {
                chooseCallback(index,text);
            } : function(){};

            var hideOnChoose = this.data.hideOnListChoose === true ? function(){
                dialog.hide();
            } : function(){};

            this.createListElement(index,text,data,logic,icon,listCallback,chosenCallback,hideOnChoose);
        }*/

    },
    createListCallback: function(dialog,callback){
        return this.data.hideOnListChoose === true ? function(index,data){
            callback(index,data);
            dialog.hide();
        } : function(index,data){
            callback(index,data);
        };
    },
    createListElement: function (index,text,data,customLogic,icon,listCallback,chosenCallback,hideOnChoose) {
        var design = {
            color: this.data.contentColor,
            width:'100%',
            height: '45',
            boxSizing: 'borderBox',
            fontSize:17,
            fontStyle: ['bold'],
            //margin: 'centered',
            paddingRight:7,
            paddingLeft:7,
            border: {top:1},
            borderColor: this.data.listBorderColor,
            textAlign: this.data.contentAlign,
            active: { bgColor: this.data.dialogColor, color: {color:'White'}}
        };

        design = CUtils.mergeJSONs(design,this.data.listDesign);

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
        logic = CUtils.mergeJSONs(logic,customLogic);

        var contentId = CObjectsHandler.createObject('Button',{
                design: design,
                logic: logic,
                data:data
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

        CObjectsHandler.object(this.dialogContainer).appendChild(this.buttonsContainer);

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
        CObjectsHandler.object(this.buttonsContainer).appendChild(contentId);

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
                if (top<0)  top = CGlobals.get('headerSize') || 40;
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
                if (node.id === dialog.contentContainer || !CObjectsHandler.isCObject(node.id) )
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
        CObject.setObjectDefaults(values,CAppContainer);

        // Invoke parent's constructor
        CAppContainer.$super.call(this, values);

        this.data.childs = this.data.childs || [];
        var dialogsContainer = CObjectsHandler.createObject('Container',{
            design:{
                position: 'absolute',
                display:'displayNone',
                top:0,bottom:0,right:0,left:0
            }
        });
        CObjectsHandler.dialogsContainerId = dialogsContainer;
        this.appendChild(dialogsContainer);
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
            textAlign: 'center'

        },
        DEFAULT_LOGIC: {
        }
    },

    constructor: function(values) {
        if (CUtils.isEmpty(values)) return;
        // Merge Defaults.
        CObject.setObjectDefaults(values,CMainView);
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
        CObject.setObjectDefaults(values,CSideMenu);
        // Invoke parent's constructor
        CSideMenu.$super.call(this, values);
        this.data.sideMenuWidth = this.data.sideMenuWidth || null;
        var design = {};
        if (!CUtils.isEmpty(this.data.sideMenuWidth))
            design.width = this.data.sideMenuWidth;

        this.leftContainer  = values.data.leftContainer  || null;
        this.rightContainer = values.data.rightContainer || null;

        var leftMenuChilds = [];
        if (!CUtils.isEmpty(this.leftContainer))
            leftMenuChilds.push(this.leftContainer);
        var rightMenuChilds = [];
        if (!CUtils.isEmpty(this.rightContainer))
            rightMenuChilds.push(this.rightContainer);
        // Create left and right menus.
        this.leftMenu   = CObjectsHandler.createObject('SideMenuLeft',{
            data: {  childs: leftMenuChilds },
            design: design
        });
        this.rightMenu  = CObjectsHandler.createObject('SideMenuRight',{
            data: {  childs: rightMenuChilds },
            design: design
        });

        // Set Children.
        this.data.childs = [this.leftMenu,this.rightMenu];
        var positions = [];
        if (this.leftContainer != null)
            positions.push('left');
        if (this.rightContainer != null)
            positions.push('right');


        this.logic.sideMenu = {
            positions:  positions,
            width:      this.data.sideMenuWidth
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
        CObject.setObjectDefaults(values,CSideMenuContainer);
        // Invoke parent's constructor
        CSideMenuContainer.$super.call(this, values);
        this.design             = this.design || {};
        this.design.height      = '100%';
        CScrolling.setScrollable(this);

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
        CObject.setObjectDefaults(values,CSideMenuLeft);
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
        CObject.setObjectDefaults(values,CSideMenuRight);
        // Invoke parent's constructor
        CSideMenuRight.$super.call(this, values);
        //this.uname = 'side-menu-right';
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
        CObject.setObjectDefaults(values,CFooter);

        // Invoke parent's constructor
        CFooter.$super.call(this, values);

        this.design.height = CGlobals.get('footerSize');

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
        CObject.setObjectDefaults(values,CHeader);

        // Invoke parent's constructor
        CHeader.$super.call(this, values);

        this.design.height = CGlobals.get('headerSize');

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
        CTitleHandler.setTitleObject(this.data.title);

        // Set up childs array.
        this.appendChilds(this.data.left);
        this.appendChilds([this.data.title]);
        this.appendChilds(this.data.right);

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
            }
        },
        DEFAULT_LOGIC: {
        }

    },

    constructor: function(values) {
        if (CUtils.isEmpty(values)) return;
        // Merge Defaults.
        CObject.setObjectDefaults(values,CContent);

        // Invoke parent's constructor
        CContent.$super.call(this, values);

        this.design.top     =   CGlobals.get('headerSize');
        this.design.bottom  =   CGlobals.get('footerSize');

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
        CObject.setObjectDefaults(values,CPage);

        // Invoke parent's constructor
        CPage.$super.call(this, values);
        CScrolling.setScrollable(this);
        // Page properties.
        this.data.page         = this.data.page           || {};
        this.data.page.name    = this.data.page.name      || '';
        this.data.page.title   = this.data.page.title     || '';
        this.data.page.onLoad  = this.data.page.onLoad    || function(){};
        this.data.page.id      = this.uid();
        this.data.page.loaded  = false;
        this.data.page.params  = {};
        this.data.page.paramsChanged  = false;
    },
    setParams: function(params){
        if ( !CUtils.equals(this.data.page.params,params)){
            this.data.page.params = params;
            this.data.page.paramsChanged = true;
            // Set PageData
            CPageData.setPageData(this.uid(),params);
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
            'default': 'loaderDefault'
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
        CObject.setObjectDefaults(values,CTemplatePage);

        // Invoke parent's constructor
        CTemplatePage.$super.call(this, values);
        CTemplate.prototype.constructor.call(this, values);
        // Set that there is a page container for the abstract objects.
        this.data.template.container.data.page   = this.data.template.container.data.page || {};
        if (this.data.page)
            this.data.template.container.data.page = CUtils.clone(this.data.page);

        //this.data.page                  = null;
        this.data.template.container.type        = 'Page';
        this.data.template.autoLoad = false;

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
        CObject.setObjectDefaults(values,CPagination);

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
        CObject.setObjectDefaults(values,CSliderWrapper);

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
        CObject.setObjectDefaults(values,CSliderSlide);

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
        CObject.setObjectDefaults(values,CSlider);

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
            this.appendChild(sliderId);
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
        CObject.setObjectDefaults(values,CGallery);

        this.data = values.data || {};
        this.data.childs = values.data.childs || [];

        // Create Images.
        _.each(this.data.images,function(imageSrc){
            var imageId = CObjectsHandler.createObject('ZoomedImage',{
                data: {  src: [imageSrc] }
            });
            this.appendChild(imageId);
        },this);

        // Invoke parent's constructor
        CGallery.$super.call(this, values);

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
        },
        setLabelText: function(uid,text){
            var label = CObjectsHandler.object(uid);
            label.setText(text);
            label.rebuild();
        }

    },

    constructor: function(values) {
        if (CUtils.isEmpty(values)) return;
        // Merge Defaults.
        CObject.setObjectDefaults(values,CLabel);

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
            cursor: 'pointer'
        },
        DEFAULT_LOGIC: {
        }

    },

    constructor: function(values) {
        if (CUtils.isEmpty(values)) return;
        // Merge Defaults.
        CObject.setObjectDefaults(values,CButton);

        // Invoke parent's constructor
        CButton.$super.call(this, values);

    }


});

/**
 * Created by dvircn on 15/08/14.
 */
var CIFrame = Class(CObject,{
    $statics: {
        DEFAULT_DESIGN: {
            classes: "",
            border: {all:0}
        },
        DEFAULT_LOGIC: {
        }

    },

    constructor: function(values) {
        if (CUtils.isEmpty(values)) return;
        // Merge Defaults.
        CObject.setObjectDefaults(values,CIFrame);

        // Invoke parent's constructor
        CIFrame.$super.call(this, values);
        values.data = values.data || {};
        this.data.src = values.data.src || '';
    },
    /**
     *  Build Object.
     */
    prepareBuild: function(data){
        // Prepare this element.
        return CIFrame.$superp.prepareBuild.call(this,{
            tag: 'iframe',
            attributes: ['src="'+this.data.src+'"','frameborder="0"','webkitallowfullscreen',
                'mozallowfullscreen','allowfullscreen']
        });
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
        CObject.setObjectDefaults(values,CImage);

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
 * Created by dvircn on 06/08/14.
 */
/**
 * Created by dvircn on 06/08/14.
 */
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
        },
        setLabelText: function(uid,text){
            var label = CObjectsHandler.object(uid);
            label.setText(text);
            label.rebuild();
        }

    },

    constructor: function(values) {
        if (CUtils.isEmpty(values)) return;
        // Merge Defaults.
        CObject.setObjectDefaults(values,CLabel);

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
var CLoadSpinner = Class(CObject,{
    $statics: {
        DEFAULT_DESIGN: {
            height: 60,
            width: '100%',
            fontStyle:['bold'],
            color:CColor('TealE',7)

        },
        DEFAULT_LOGIC: {
            icon: { name:   'spinner9' }
        },
        spinClass:'infiniteSpin750'

    },

    constructor: function(values) {
        if (CUtils.isEmpty(values)) return;
        // Merge Defaults.
        CObject.setObjectDefaults(values,CLoadSpinner);

        // Invoke parent's constructor
        CLoadSpinner.$super.call(this, values);
        this.data.spinnerSize = this.data.spinnerSize || 40;
        this.logic.icon.size = this.data.spinnerSize;
        if (this.data.spinnerAutoStart===true){
            this.design.classes = this.design.classes || '';
            this.design.classes += CLoadSpinner.spinClass;
        }
    },
    startSpin: function(){
        var spinner = CUtils.element(this.uid());
        CUtils.addClass(spinner,CLoadSpinner.spinClass);
    },
    stopSpin: function(){
        var spinner = CUtils.element(this.uid());
        CUtils.removeClass(spinner,CLoadSpinner.spinClass);
    }


});

/**
 * Created by dvircn on 15/08/14.
 */
var CStaticMap = Class(CImage,{
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
        CObject.setObjectDefaults(values,CStaticMap);

        // Invoke parent's constructor
        CStaticMap.$super.call(this, values);

        // Parameters.
        this.data.mapData               = this.data.mapData         || {};
        this.data.mapData.width         = this.data.mapData.width   || 600;
        this.data.mapData.height        = this.data.mapData.height  || 300;
        this.data.mapData.zoom          = this.data.mapData.zoom    || 13;
        this.data.mapData.maptype       = this.data.mapData.maptype || 'roadmap';
        this.data.mapData.center        = this.data.mapData.center  || '';
        this.data.mapData.marker        = this.data.mapData.marker  || {};
        this.data.mapData.marker.color  = this.data.mapData.marker.color        || 'blue';
        // Position default to map center.
        this.data.mapData.marker.position = this.data.mapData.marker.position   || this.data.mapData.center;

        this.data.src = 'https://maps.googleapis.com/maps/api/staticmap?center='+
            this.data.mapData.center+'&zoom='+this.data.mapData.zoom
            +'&size='+this.data.mapData.width+'x'+this.data.mapData.height
            +'&maptype='+this.data.mapData.maptype+'&markers=color:'+this.data.mapData.marker.color
            +'%7C'+this.data.mapData.marker.position;
    },
    /**
     *  Build Object.
     */
    prepareBuild: function(data){
        // Prepare this element - wrap it's children.
        return CStaticMap.$superp.prepareBuild.call(this,{
            tag: 'img',
            attributes: ['src="'+this.data.src+'"'],
            tagHasInner: false
        });
    }


});

/**
 * Created by dvircn on 15/08/14.
 */
var CVideo = Class(CObject,{
    $statics: {
        DEFAULT_DESIGN: {
            classes: "",
            border: {all:0}
        },
        DEFAULT_LOGIC: {
        }

    },

    constructor: function(values) {
        if (CUtils.isEmpty(values)) return;
        // Merge Defaults.
        CObject.setObjectDefaults(values,CVideo);

        // Invoke parent's constructor
        CVideo.$super.call(this, values);

        this.data.src = values.data.src || '';
    },
    youtubeParse: function(url){
        var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
        var match = url.match(regExp);
        if (match&&match[7].length==11){
            return match[7];
        }else{
            return null;
        }
    },
    vimeoParse: function(url){
        var regExp = /^.*(vimeo\.com\/)((channels\/[A-z]+\/)|(groups\/[A-z]+\/videos\/))?([0-9]+)/;
        var parseUrl = url.match(regExp);
        if (CUtils.isEmpty(parseUrl) || parseUrl.length<6)
            return null;
        else
            return parseUrl[5];
    },
    /**
     *  Build Object.
     */
    prepareBuild: function(data){
        var youtubeId = this.youtubeParse(this.data.src);
        var vimeoId = this.vimeoParse(this.data.src);
        var url = '';
        if (!CUtils.isEmpty(youtubeId))
            url = 'http://www.youtube.com/embed/'+youtubeId;
        else if (!CUtils.isEmpty(vimeoId))
            url = 'http://player.vimeo.com/video/'+vimeoId;
        else
            url = 'incorrect';
        // Prepare this element - wrap it's children.
        return CVideo.$superp.prepareBuild.call(this,{
            tag: 'iframe',
            attributes: ['src="'+url+'"','frameborder="0"','webkitallowfullscreen',
                'mozallowfullscreen','allowfullscreen']
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
        CObject.setObjectDefaults(values,CZoomedImage);

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
        CObject.setObjectDefaults(values,CTab);

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

            var holdClass = CDesigner.designToClasses(CObjectsHandler.object(tabButtonId).getDesign().hold);
            if (!CUtils.isEmpty(holdClass))
                CUtils.addClass(CUtils.element(tabButtonId),holdClass);
        },
        removeHoldClass: function(tabButtonId) {
            if (CUtils.isEmpty(tabButtonId))    return;

            var holdClass = CDesigner.designToClasses(CObjectsHandler.object(tabButtonId).getDesign().hold);
            if (!CUtils.isEmpty(holdClass))
                CUtils.removeClass(CUtils.element(tabButtonId),holdClass);
        }

    },

    constructor: function(values) {
        if (CUtils.isEmpty(values)) return;
        // Merge Defaults.
        CObject.setObjectDefaults(values,CTabber);

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
        CObject.setObjectDefaults(values,CForm);

        // Invoke parent's constructor
        this.$class.$super.call(this, values);
        this.data.inputs            = values.data.inputs || [];
        this.data.saveToUrl         = values.data.saveToUrl || '';
        this.data.saveToUrlCallback = values.data.saveToUrlCallback || function(){};
        this.data.onSubmit          = values.data.onSubmit ||  function(){};
        this.data.prepareValues     = values.data.prepareValues ||  function(values) {return values;};
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
        values = this.data.prepareValues(values);
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
            padding: 2,
            fontSize:16,
            fontStyle:['bold']
        },
        DEFAULT_LOGIC: {
        }
    },

    constructor: function(values) {
        if (CUtils.isEmpty(values)) return;
        // Merge Defaults.
        CObject.setObjectDefaults(values,CInput);

        // Invoke parent's constructor
        this.$class.$super.call(this, values);
        this.data.name               = values.data.name          || '';
        this.data.type               = values.data.type          || 'text';
        this.data.value              = values.data.value         || '';
        this.data.disabled           = values.data.disabled      || false;
        this.data.disabledAttribute  = values.data.disabled===true? 'disabled' : '';
        this.data.required           = values.data.required      || false;
        this.data.validators         = values.data.validators    || [];
        this.data.prepares           = values.data.prepares      || [];
        this.data.placeholder        = values.data.placeholder   || '';

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
            tagHasInner: false,
            attributes: [
                'placeholder="' +this.data.placeholder+'"',
                'value="'       +this.data.value+'"',
                'type="'        +this.data.type+'"',
                this.data.disabledAttribute

            ]
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
        if (this.data.disabled === true) // Do not clear if disabled.
            return;
        CUtils.element(this.uid()).value = '';
        CUtils.element(this.uid()).setAttribute('value','');
    },
    getName: function(){
        return this.data.name;
    },
    getValidators: function(){
        return this.data.validators;
    },
    disable: function(){
        this.data.disabled = true;
        CUtils.element(this.uid()).setAttribute('disabled','');
    },
    enable: function(){
        this.data.disabled = false;
        CUtils.element(this.uid()).removeAttribute('disabled');
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
        CObject.setObjectDefaults(values,CForm);

        values.prepares = values.prepares || [];
        values.prepares.push('email');
        // Invoke parent's constructor
        this.$class.$super.call(this, values);
    }

});


/**
 * Created by dvircn on 06/08/14.
 */
var CAppHandler = Class({
    $singleton:         true,
    appDataKey:         'application-data',
    appVersionKey:      'app-version',
    appData:            {},
    localDataPath:      'core/data.dcaf',
    failedLoadDCAF:     false,
    start: function(callback){
        callback = callback || function(){};
        CAppHandler.loadAppObjects(function(){
            CAppHandler.initialize(callback);
        });
    },
    initialize: function(callback){
        // Load objects failure.
//        if (CAppHandler.failedLoadDCAF === true) {
//            CThreads.start(callback);
//            return;
//        }
        try {
            var startLoadObjects        = (new  Date()).getTime();

            var appData                 = CAppHandler.appData;
            CAppHandler.appData         = null; // Remove reference.

            appData.data                = appData.data || {};
            appData.data.app_settings   = appData.data.app_settings || {};

            // Load Theme if chosen.
            if (appData.data.app_settings['app_main_theme'] && !CUtils.isEmpty(appData.data.app_settings['app_main_theme']))
                CThemes.loadTheme(appData.data['app_main_theme']);
            // Set named designs and globals.
            CDesignHandler.addDesigns(appData.designs || {});
            CGlobals.setGlobals(appData.data || {});

            // Check if objects empty. If so, create app-container so the build won't fail.
            if (CUtils.isEmpty(appData.objects) || _.keys(appData.objects).length===0 /*Empty object*/){
                appData.objects = [{type: "AppContainer", uname: "app-container"}];
            }

            // Load Objects.
            CObjectsHandler.loadObjects(appData.objects || []);
            var endLoadObjects  = (new  Date()).getTime();

            var startBuildAll = (new  Date()).getTime();

            CBuilder.buildAll();
            var endBuildAll = (new  Date()).getTime();
            CLog.dlog('Load Objects Time     : '+(endLoadObjects-startLoadObjects)+' Milliseconds.');
            CLog.dlog('Build Time            : '+(endBuildAll-startBuildAll)+' Milliseconds.');
            CLog.dlog('Total Initialize Time : '+(endBuildAll-startLoadObjects)+' Milliseconds.');

            CPager.initialize();
        }
        catch (e){
            CLog.error('CAppHandler.initialize error occured.');
            CLog.log(e);
        }
        // After finished, we can run the callback.
        CThreads.start(callback);
    },
    resetApp: function() {
        window.location.hash = '';
        window.location.reload();
    },
    loadAppObjects: function(callback){
        var data = CLocalStorage.get(CAppHandler.appDataKey) || null;
        if (!CUtils.isEmpty(data)){
            CAppHandler.appData = data;
            callback();
        }
        else {
            // Load the local file.
            CNetwork.request(CAppHandler.localDataPath,{},function(content){
                if (!CUtils.isEmpty(content)){
                    CLocalStorage.save(CAppHandler.appDataKey,JSONfn.parse(content));
                    // Re-Parse the data. In case that the data hasn't parsed functions.
                    CAppHandler.appData = JSONfn.parse(content);
                }
                callback();
            },function() {
                CAppHandler.failedLoadDCAF = true;
                CLog.error('Failed to load local objects, waiting for remote load.');
                callback();
            });
        }
    }

});

/**
 * Created by dvircn on 06/08/14.
 */
var CAppUpdater = Class({
    $singleton: true,
    appUpdateURL: 'http://codletech-builder.herokuapp.com/getAppData',
    update: function(onFinish){
        var currentVersion = CLocalStorage.get(CAppHandler.appVersionKey) || -1;
        var appID = CSettings.get('appID') || '';
        if (CUtils.isEmpty(appID)) { // Mark as checked.
            Caf.appUpdateChecked = true;
            if (onFinish) onFinish();
            return;
        }
        // Request Update.
        CNetwork.request(CAppUpdater.appUpdateURL,
            {appID: appID,version: currentVersion},
            function(data){
                // Updated (data===true means the versions matched and no update needed).
                var dontNeedUpdate = !CUtils.isEmpty(data) && !CUtils.isEmpty(data.status);
                if (!CUtils.isEmpty(data) && !CUtils.isEmpty(data.objects) && !dontNeedUpdate ){
                    CLog.dlog('App Updated');
                    CAppUpdater.saveApp(data);
                    CLocalStorage.save(CAppHandler.appVersionKey,data.version);
                    Caf.appUpdated = true;
                }
                // Mark as checked.
                Caf.appUpdateChecked = true;
            },
            function(e){ // Failed
                // Mark as checked.
                Caf.appUpdateChecked = true;
            }
        );
        if (onFinish) onFinish();
    },
    saveApp: function(data){
        data.objects =  data.objects    || [];
        data.designs =  data.designs    || {};
        data.data    =  data.data       || {};

        // Save to local storage.
        if (!CUtils.isEmpty(data.objects))
            CLocalStorage.save(CAppHandler.appDataKey,data);

    },
    clearAppData: function(data){
        CLocalStorage.save(CAppHandler.appDataKey,'');
    }

});

/**
 * Created by dvircn on 06/08/14.
 */
var Caf = Class({
    $singleton: true,
    coreJSUpdateChecked: false,
    coreCSSUpdateChecked: false,
    appUpdateChecked: false,
    appUpdated: false,
    appUpdateStarted: false,
    coreUpdated: false,
    updateCheckFinished: false,
    waitToLoadDialog: null,
    firstLoadKey: 'caf-first-load',
    firstLoad: false,
    start: function(){
        // Check for update start in 5 seconds - make sure the app will get updated in any case.
        CThreads.run(Caf.updateStartCheck,5000);

        Caf.firstLoad = CLocalStorage.get(Caf.firstLoadKey);
        if (CUtils.isEmpty(Caf.firstLoad))
            Caf.firstLoad = true;

        CAppHandler.start(function(){
            if (Caf.firstLoad) {
                Caf.showWaitToLoad();
                Caf.startUpdate();
            }
            else
                Caf.startUpdate();
        });

        // Phonegap on ready.
        document.addEventListener('deviceready', Caf.onDeviceReady, false);

    },
    onDeviceReady : function() {
        if (navigator && navigator.splashscreen)
            navigator.splashscreen.hide();
    },
    startUpdate: function(){
        if (Caf.appUpdateStarted === true) // Update check already performed.
            return;
        Caf.appUpdateStarted = true; // Mark as started.

        // Run parallel.
        CThreads.start(CAppUpdater.update);
        CThreads.start(CCoreUpdater.update);
        CThreads.run(Caf.updatedCheck,300);
    },
    updateStartCheck: function(){
        if (Caf.appUpdateStarted === false)
            Caf.startUpdate();
    },
    updatedCheck: function(){
        if (Caf.coreCSSUpdateChecked && Caf.coreJSUpdateChecked
            && Caf.appUpdateChecked && !Caf.updateCheckFinished)
            Caf.hideWaitToLoad();
        else
            CThreads.run(Caf.updatedCheck,100);
    },
    hideWaitToLoad: function(){
        Caf.updateCheckFinished = true;
        if (Caf.firstLoad) {
            CLocalStorage.save(Caf.firstLoadKey,false);
            if (Caf.appUpdated || Caf.coreUpdated)
                CAppHandler.resetApp();
            else
                CObjectsHandler.object(Caf.waitToLoadDialog).hide();
        }
        else {
            if (Caf.appUpdated || Caf.coreUpdated) {
                CDialog.showDialog({
                    hideOnOutClick: false,
                    title: 'עדכון מוכן',
                    textContent: 'כדי להחיל את השינויים, אנא הפעל את האפליקציה מחדש.',
                    dialogColor: CColor('TealE',8),
                    cancelText: 'מאוחר יותר',
                    confirmText: 'הפעל מחדש',
                    confirmCallback: function() { CAppHandler.resetApp(); },

                });
            }

        }

    },
    showWaitToLoad: function(){
        Caf.waitToLoadDialog = CDialog.showDialog({
            hideOnOutClick: false,
            title: 'מכין מספר דברים...',
            dialogColor: CColor('TealE',8)
        }, { minHeight: 'auto'});
    }

});

/**
 * Created by dvircn on 12/10/14.
 */
var CCoreUpdater = Class({
    $singleton:             true,
    upToDateSign:           'File up to date',
    cafFilePrefix:          'caf-file-',
    coreCSSName:            'caf.min.css',
    coreJSName:             'caf.min.js',
    coreCSSPath:            'http://codletech.net/CAF/api/getGlobalFile.php',
    coreJSPath:             'http://codletech.net/CAF/api/getGlobalFile.php',


    update: function(){
        CThreads.start(CCoreUpdater.updateJS);
        CThreads.start(CCoreUpdater.updateCSS);
    },
    updateJS: function(){
        CCoreUpdater.updateFile(CCoreUpdater.coreJSPath,CCoreUpdater.coreJSName,
            function() {
                // Marked as checked.
                Caf.coreJSUpdateChecked = true;
            });
    },
    updateCSS: function(){
        CCoreUpdater.updateFile(CCoreUpdater.coreCSSPath,CCoreUpdater.coreCSSName,
            function(){
                // Marked as checked.
                Caf.coreCSSUpdateChecked = true;
            });
    },
    updateFile: function(path,name,callback){
        callback            = callback || function(){};
        var currentFileData = CLocalStorage.get(CCoreUpdater.cafFilePrefix+name);
        if (currentFileData == null || currentFileData == undefined)
            currentFileData = '';
        var shaObj         = new jsSHA(currentFileData, "TEXT");
        var sha            = shaObj.getHash("SHA-512", "HEX");
        CCoreUpdater.requestUpdateFile(path,name,sha,callback);

    },
    requestUpdateFile: function(path,name,sha,callback) {
        CNetwork.request(path,{fileName:name,fileSha:sha},function(content){
            if (CUtils.isEmpty(content)){
                callback();
                return;
            }
            var dontNeedUpdate = content.status === 1 || content.status === -1;
            // Updated (data===true means the versions matched and no update needed) .
            if (!dontNeedUpdate){
                try {
                    CLocalStorage.save(CCoreUpdater.cafFilePrefix+name,content);
                    Caf.coreUpdated = true;
                }
                catch (e) {
                    CLog.error('Error at: '+name);
                    CLog.error(e);
                }
                CLog.dlog('Update Needed:\t\t'+name);
            }
            else{
                CLog.dlog('Don\'t Need Update:\t'+name);
            }
            callback();
        },callback);
    },
    clearAll: function(){
        CLocalStorage.save(CCoreUpdater.cafFilePrefix+CCoreUpdater.coreCSSName,'');
        CLocalStorage.save(CCoreUpdater.cafFilePrefix+CCoreUpdater.coreJSName,'');
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
        this.properties.data        = {};
        this.properties.design      = {};
        this.properties.logic       = {};
    },
    build: function(){
        return this.properties;
    },
    initTemplate: function(){
        this.properties.data.template   = this.properties.data.template || {};
        this.properties.data.template.container    = this.properties.data.template.container  || {type:'Container'};
        this.properties.logic.template  = true;
    },
    childs: function(childs){
        this.properties.data.childs    = childs;
        return this;
    },
    child: function(child){
        this.properties.data.childs    = this.properties.data.childs || [];
        this.properties.data.childs.push(child);
        return this;
    },
    page: function(name,title,onLoad){
        this.properties.data.page =
                { name: name || '', title: title || '', onLoad: onLoad || function() {} };
        this.properties.logic.page = true;
        return this;
    },
    pageOnLoad: function(onLoad){
        this.properties.data.page = this.properties.data.page || {};
        this.properties.data.page.onLoad = onLoad  || function() {};
        this.properties.logic.page = true;
        return this;
    },
    sideMenuWidth: function(width) {
        this.properties.data.sideMenuWidth = width;
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
    scrollable: function() {
        CScrolling.setScrollable(this.properties);
        return this;
    },
    template: function(url,autoLoad,queryData){
        this.initTemplate();
        this.properties.data.template = {
            url:        url         || null,
            autoLoad:   autoLoad,
            queryData:  queryData   || null
        };
        return this;
    },
    templateDataPrepareFunction: function(prepareFunction){
        this.initTemplate();
        this.properties.data.template.prepareFunction = prepareFunction;
        return this;
    },
    templateRootObjects: function(rootObjects) {
        this.initTemplate();
        this.properties.data.template.rootObjects = rootObjects;
        return this;
    },
    templateObjects: function(objects) {
        this.initTemplate();
        this.properties.data.template.objects = [];
        // Build objects.
        _.each(objects,function(objectBuilder){
            this.properties.data.template.objects.push(objectBuilder.build());
        },this);

        return this;
    },
    templateObject: function(object) {
        this.initTemplate();
        this.properties.data.template.object = object.build();
        return this;
    },
    templatePullToRefresh: function() {
        this.initTemplate();
        this.properties.data.template.pullToRefresh = true;
        return this;
    },
    templateLoaderColor: function(loaderColor) {
        this.initTemplate();
        this.properties.data.template.loaderColor = loaderColor || null;
        return this;
    },
    templateData: function(data) {
        this.initTemplate();
        this.properties.data.template.data = data;
        return this;
    },
    templateContainerDesign: function(design) {
        this.initTemplate();
        this.properties.data.template.container.design = design;
        return this;
    },
    templateResetOnReload: function(resetOnReload) {
        this.initTemplate();
        this.properties.data.template.resetOnReload = resetOnReload;
        return this;
    },
    templateBorder: function(color,size) {
        this.initTemplate();
        this.properties.data.template.container.design
            = this.properties.data.template.container.design || {};
        this.properties.data.template.container.design.border = {top:size||1};
        this.properties.data.template.container.design.borderColor = color || CColor('Gray',4);
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
    request: function(url,data,callback){
        this.properties.logic.request = {
            url:        url             || null,
            data:       data            || null,
            callback:   callback        || null
        }
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
    inputType: function(type) {
        this.properties.data.type = type || null;
        return this;
    },
    inputValue: function(value) {
        this.properties.data.value = value || null;
        return this;
    },
    inputRequired: function() {
        this.properties.data.required = true;
        return this;
    },
    inputDisabled: function() {
        this.properties.data.disabled = true;
        return this;
    },
    inputEnabled: function() {
        this.properties.data.disabled = false;
        return this;
    },
    inputNotRequired: function() {
        this.properties.data.required = false;
        return this;
    },
    inputPlaceholder: function(placeholder) {
        this.properties.data.placeholder = placeholder;
        return this;
    },
    inputOnFileSelect: function(inputOnFileSelect) {
        this.properties.logic.inputOnFileSelect = inputOnFileSelect;
        return this;
    },
    inputValidators: function(validators) {
        this.properties.data.validators = validators;
        return this;
    },
    inputValidator: function(validator) {
        this.properties.data.validators = this.properties.data.validators || [];
        this.properties.data.validators.push(validator);
        return this;
    },
    inputPrepares: function(prepares) {
        this.properties.data.prepares = prepares;
        return this;
    },
    inputPrepare: function(prepare) {
        this.properties.data.prepares = this.properties.data.prepares || [];
        this.properties.data.prepares.push(prepare);
        return this;
    },
    formPrepareValues: function(prepareValuesFunction) {
        this.properties.data.prepareValues = prepareValuesFunction;
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
    imageSource: function(src) {
        this.properties.data.src = src;
        return this;
    },
    staticMapData: function(staticMapData) {
        this.properties.data.mapData = staticMapData;
        return this;
    },
    videoSource: function(src) {
        this.properties.data.src = src;
        return this;
    },
    iframeSource: function(src) {
        this.properties.data.src = src;
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
    onCreate: function(onCreateHandler) {
        this.properties.logic.onCreate = onCreateHandler;
        return this;
    },
    onCreateAsync: function(onCreateAsyncHandler) {
        this.properties.logic.onCreateAsync = onCreateAsyncHandler;
        return this;
    },
    phoneCall: function(number) {
        this.properties.logic.phoneCall = number;
        return this;
    },
    openNavigationApp: function(address) {
        this.properties.logic.openNavigationApp = address;
        return this;
    },
    link: function(path,data,globalData) {
        this.properties.logic.link = {
            path:           path || null,
            data:           data || null,
            globalData:     globalData || null
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
    spinnerAutoStart: function() {
        this.properties.data.spinnerAutoStart = true;
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
        this.data = {};
    },
    addDesign: function(name,design){
        this.designs[name] = design;
    },
    getDesign: function(name){
        return this.designs[name];
    },
    addData: function(name,data){
        this.data[name] = data;
    },
    getData: function(name){
        return this.data[name];
    },
    build: function(){
        // Create Objects.
        var builtObjects = [];
        _.each(this.objects,function(objectBuilder){
            builtObjects.push(objectBuilder.build());
        });

        var appData = {
            objects:    builtObjects,
            designs:    this.designs,
            data:       this.data
        };
        return appData;
    },
    create: function(type,uname){
        var objectBuilder = new CBuilderObject(type || '',uname || '');
        this.objects.push(objectBuilder);
        return objectBuilder;
    },
    saveAppDataToFile: function(path){

    }


});

/*
 A JavaScript implementation of the SHA family of hashes, as
 defined in FIPS PUB 180-2 as well as the corresponding HMAC implementation
 as defined in FIPS PUB 198a

 Copyright Brian Turek 2008-2013
 Distributed under the BSD License
 See http://caligatio.github.com/jsSHA/ for more information

 Several functions taken from Paul Johnston
*/
(function(T){function z(a,c,b){var g=0,f=[0],h="",l=null,h=b||"UTF8";if("UTF8"!==h&&"UTF16"!==h)throw"encoding must be UTF8 or UTF16";if("HEX"===c){if(0!==a.length%2)throw"srcString of HEX type must be in byte increments";l=B(a);g=l.binLen;f=l.value}else if("ASCII"===c||"TEXT"===c)l=J(a,h),g=l.binLen,f=l.value;else if("B64"===c)l=K(a),g=l.binLen,f=l.value;else throw"inputFormat must be HEX, TEXT, ASCII, or B64";this.getHash=function(a,c,b,h){var l=null,d=f.slice(),n=g,p;3===arguments.length?"number"!==
typeof b&&(h=b,b=1):2===arguments.length&&(b=1);if(b!==parseInt(b,10)||1>b)throw"numRounds must a integer >= 1";switch(c){case "HEX":l=L;break;case "B64":l=M;break;default:throw"format must be HEX or B64";}if("SHA-1"===a)for(p=0;p<b;p++)d=y(d,n),n=160;else if("SHA-224"===a)for(p=0;p<b;p++)d=v(d,n,a),n=224;else if("SHA-256"===a)for(p=0;p<b;p++)d=v(d,n,a),n=256;else if("SHA-384"===a)for(p=0;p<b;p++)d=v(d,n,a),n=384;else if("SHA-512"===a)for(p=0;p<b;p++)d=v(d,n,a),n=512;else throw"Chosen SHA variant is not supported";
return l(d,N(h))};this.getHMAC=function(a,b,c,l,s){var d,n,p,m,w=[],x=[];d=null;switch(l){case "HEX":l=L;break;case "B64":l=M;break;default:throw"outputFormat must be HEX or B64";}if("SHA-1"===c)n=64,m=160;else if("SHA-224"===c)n=64,m=224;else if("SHA-256"===c)n=64,m=256;else if("SHA-384"===c)n=128,m=384;else if("SHA-512"===c)n=128,m=512;else throw"Chosen SHA variant is not supported";if("HEX"===b)d=B(a),p=d.binLen,d=d.value;else if("ASCII"===b||"TEXT"===b)d=J(a,h),p=d.binLen,d=d.value;else if("B64"===
b)d=K(a),p=d.binLen,d=d.value;else throw"inputFormat must be HEX, TEXT, ASCII, or B64";a=8*n;b=n/4-1;n<p/8?(d="SHA-1"===c?y(d,p):v(d,p,c),d[b]&=4294967040):n>p/8&&(d[b]&=4294967040);for(n=0;n<=b;n+=1)w[n]=d[n]^909522486,x[n]=d[n]^1549556828;c="SHA-1"===c?y(x.concat(y(w.concat(f),a+g)),a+m):v(x.concat(v(w.concat(f),a+g,c)),a+m,c);return l(c,N(s))}}function s(a,c){this.a=a;this.b=c}function J(a,c){var b=[],g,f=[],h=0,l;if("UTF8"===c)for(l=0;l<a.length;l+=1)for(g=a.charCodeAt(l),f=[],2048<g?(f[0]=224|
(g&61440)>>>12,f[1]=128|(g&4032)>>>6,f[2]=128|g&63):128<g?(f[0]=192|(g&1984)>>>6,f[1]=128|g&63):f[0]=g,g=0;g<f.length;g+=1)b[h>>>2]|=f[g]<<24-h%4*8,h+=1;else if("UTF16"===c)for(l=0;l<a.length;l+=1)b[h>>>2]|=a.charCodeAt(l)<<16-h%4*8,h+=2;return{value:b,binLen:8*h}}function B(a){var c=[],b=a.length,g,f;if(0!==b%2)throw"String of HEX type must be in byte increments";for(g=0;g<b;g+=2){f=parseInt(a.substr(g,2),16);if(isNaN(f))throw"String of HEX type contains invalid characters";c[g>>>3]|=f<<24-g%8*4}return{value:c,
binLen:4*b}}function K(a){var c=[],b=0,g,f,h,l,r;if(-1===a.search(/^[a-zA-Z0-9=+\/]+$/))throw"Invalid character in base-64 string";g=a.indexOf("=");a=a.replace(/\=/g,"");if(-1!==g&&g<a.length)throw"Invalid '=' found in base-64 string";for(f=0;f<a.length;f+=4){r=a.substr(f,4);for(h=l=0;h<r.length;h+=1)g="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".indexOf(r[h]),l|=g<<18-6*h;for(h=0;h<r.length-1;h+=1)c[b>>2]|=(l>>>16-8*h&255)<<24-b%4*8,b+=1}return{value:c,binLen:8*b}}function L(a,
c){var b="",g=4*a.length,f,h;for(f=0;f<g;f+=1)h=a[f>>>2]>>>8*(3-f%4),b+="0123456789abcdef".charAt(h>>>4&15)+"0123456789abcdef".charAt(h&15);return c.outputUpper?b.toUpperCase():b}function M(a,c){var b="",g=4*a.length,f,h,l;for(f=0;f<g;f+=3)for(l=(a[f>>>2]>>>8*(3-f%4)&255)<<16|(a[f+1>>>2]>>>8*(3-(f+1)%4)&255)<<8|a[f+2>>>2]>>>8*(3-(f+2)%4)&255,h=0;4>h;h+=1)b=8*f+6*h<=32*a.length?b+"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".charAt(l>>>6*(3-h)&63):b+c.b64Pad;return b}function N(a){var c=
{outputUpper:!1,b64Pad:"="};try{a.hasOwnProperty("outputUpper")&&(c.outputUpper=a.outputUpper),a.hasOwnProperty("b64Pad")&&(c.b64Pad=a.b64Pad)}catch(b){}if("boolean"!==typeof c.outputUpper)throw"Invalid outputUpper formatting option";if("string"!==typeof c.b64Pad)throw"Invalid b64Pad formatting option";return c}function U(a,c){return a<<c|a>>>32-c}function u(a,c){return a>>>c|a<<32-c}function t(a,c){var b=null,b=new s(a.a,a.b);return b=32>=c?new s(b.a>>>c|b.b<<32-c&4294967295,b.b>>>c|b.a<<32-c&4294967295):
new s(b.b>>>c-32|b.a<<64-c&4294967295,b.a>>>c-32|b.b<<64-c&4294967295)}function O(a,c){var b=null;return b=32>=c?new s(a.a>>>c,a.b>>>c|a.a<<32-c&4294967295):new s(0,a.a>>>c-32)}function V(a,c,b){return a^c^b}function P(a,c,b){return a&c^~a&b}function W(a,c,b){return new s(a.a&c.a^~a.a&b.a,a.b&c.b^~a.b&b.b)}function Q(a,c,b){return a&c^a&b^c&b}function X(a,c,b){return new s(a.a&c.a^a.a&b.a^c.a&b.a,a.b&c.b^a.b&b.b^c.b&b.b)}function Y(a){return u(a,2)^u(a,13)^u(a,22)}function Z(a){var c=t(a,28),b=t(a,
34);a=t(a,39);return new s(c.a^b.a^a.a,c.b^b.b^a.b)}function $(a){return u(a,6)^u(a,11)^u(a,25)}function aa(a){var c=t(a,14),b=t(a,18);a=t(a,41);return new s(c.a^b.a^a.a,c.b^b.b^a.b)}function ba(a){return u(a,7)^u(a,18)^a>>>3}function ca(a){var c=t(a,1),b=t(a,8);a=O(a,7);return new s(c.a^b.a^a.a,c.b^b.b^a.b)}function da(a){return u(a,17)^u(a,19)^a>>>10}function ea(a){var c=t(a,19),b=t(a,61);a=O(a,6);return new s(c.a^b.a^a.a,c.b^b.b^a.b)}function R(a,c){var b=(a&65535)+(c&65535);return((a>>>16)+(c>>>
16)+(b>>>16)&65535)<<16|b&65535}function fa(a,c,b,g){var f=(a&65535)+(c&65535)+(b&65535)+(g&65535);return((a>>>16)+(c>>>16)+(b>>>16)+(g>>>16)+(f>>>16)&65535)<<16|f&65535}function S(a,c,b,g,f){var h=(a&65535)+(c&65535)+(b&65535)+(g&65535)+(f&65535);return((a>>>16)+(c>>>16)+(b>>>16)+(g>>>16)+(f>>>16)+(h>>>16)&65535)<<16|h&65535}function ga(a,c){var b,g,f;b=(a.b&65535)+(c.b&65535);g=(a.b>>>16)+(c.b>>>16)+(b>>>16);f=(g&65535)<<16|b&65535;b=(a.a&65535)+(c.a&65535)+(g>>>16);g=(a.a>>>16)+(c.a>>>16)+(b>>>
16);return new s((g&65535)<<16|b&65535,f)}function ha(a,c,b,g){var f,h,l;f=(a.b&65535)+(c.b&65535)+(b.b&65535)+(g.b&65535);h=(a.b>>>16)+(c.b>>>16)+(b.b>>>16)+(g.b>>>16)+(f>>>16);l=(h&65535)<<16|f&65535;f=(a.a&65535)+(c.a&65535)+(b.a&65535)+(g.a&65535)+(h>>>16);h=(a.a>>>16)+(c.a>>>16)+(b.a>>>16)+(g.a>>>16)+(f>>>16);return new s((h&65535)<<16|f&65535,l)}function ia(a,c,b,g,f){var h,l,r;h=(a.b&65535)+(c.b&65535)+(b.b&65535)+(g.b&65535)+(f.b&65535);l=(a.b>>>16)+(c.b>>>16)+(b.b>>>16)+(g.b>>>16)+(f.b>>>
16)+(h>>>16);r=(l&65535)<<16|h&65535;h=(a.a&65535)+(c.a&65535)+(b.a&65535)+(g.a&65535)+(f.a&65535)+(l>>>16);l=(a.a>>>16)+(c.a>>>16)+(b.a>>>16)+(g.a>>>16)+(f.a>>>16)+(h>>>16);return new s((l&65535)<<16|h&65535,r)}function y(a,c){var b=[],g,f,h,l,r,s,u=P,t=V,v=Q,d=U,n=R,p,m,w=S,x,q=[1732584193,4023233417,2562383102,271733878,3285377520];a[c>>>5]|=128<<24-c%32;a[(c+65>>>9<<4)+15]=c;x=a.length;for(p=0;p<x;p+=16){g=q[0];f=q[1];h=q[2];l=q[3];r=q[4];for(m=0;80>m;m+=1)b[m]=16>m?a[m+p]:d(b[m-3]^b[m-8]^b[m-
14]^b[m-16],1),s=20>m?w(d(g,5),u(f,h,l),r,1518500249,b[m]):40>m?w(d(g,5),t(f,h,l),r,1859775393,b[m]):60>m?w(d(g,5),v(f,h,l),r,2400959708,b[m]):w(d(g,5),t(f,h,l),r,3395469782,b[m]),r=l,l=h,h=d(f,30),f=g,g=s;q[0]=n(g,q[0]);q[1]=n(f,q[1]);q[2]=n(h,q[2]);q[3]=n(l,q[3]);q[4]=n(r,q[4])}return q}function v(a,c,b){var g,f,h,l,r,t,u,v,z,d,n,p,m,w,x,q,y,C,D,E,F,G,H,I,e,A=[],B,k=[1116352408,1899447441,3049323471,3921009573,961987163,1508970993,2453635748,2870763221,3624381080,310598401,607225278,1426881987,
1925078388,2162078206,2614888103,3248222580,3835390401,4022224774,264347078,604807628,770255983,1249150122,1555081692,1996064986,2554220882,2821834349,2952996808,3210313671,3336571891,3584528711,113926993,338241895,666307205,773529912,1294757372,1396182291,1695183700,1986661051,2177026350,2456956037,2730485921,2820302411,3259730800,3345764771,3516065817,3600352804,4094571909,275423344,430227734,506948616,659060556,883997877,958139571,1322822218,1537002063,1747873779,1955562222,2024104815,2227730452,
2361852424,2428436474,2756734187,3204031479,3329325298];d=[3238371032,914150663,812702999,4144912697,4290775857,1750603025,1694076839,3204075428];f=[1779033703,3144134277,1013904242,2773480762,1359893119,2600822924,528734635,1541459225];if("SHA-224"===b||"SHA-256"===b)n=64,g=(c+65>>>9<<4)+15,w=16,x=1,e=Number,q=R,y=fa,C=S,D=ba,E=da,F=Y,G=$,I=Q,H=P,d="SHA-224"===b?d:f;else if("SHA-384"===b||"SHA-512"===b)n=80,g=(c+128>>>10<<5)+31,w=32,x=2,e=s,q=ga,y=ha,C=ia,D=ca,E=ea,F=Z,G=aa,I=X,H=W,k=[new e(k[0],
3609767458),new e(k[1],602891725),new e(k[2],3964484399),new e(k[3],2173295548),new e(k[4],4081628472),new e(k[5],3053834265),new e(k[6],2937671579),new e(k[7],3664609560),new e(k[8],2734883394),new e(k[9],1164996542),new e(k[10],1323610764),new e(k[11],3590304994),new e(k[12],4068182383),new e(k[13],991336113),new e(k[14],633803317),new e(k[15],3479774868),new e(k[16],2666613458),new e(k[17],944711139),new e(k[18],2341262773),new e(k[19],2007800933),new e(k[20],1495990901),new e(k[21],1856431235),
new e(k[22],3175218132),new e(k[23],2198950837),new e(k[24],3999719339),new e(k[25],766784016),new e(k[26],2566594879),new e(k[27],3203337956),new e(k[28],1034457026),new e(k[29],2466948901),new e(k[30],3758326383),new e(k[31],168717936),new e(k[32],1188179964),new e(k[33],1546045734),new e(k[34],1522805485),new e(k[35],2643833823),new e(k[36],2343527390),new e(k[37],1014477480),new e(k[38],1206759142),new e(k[39],344077627),new e(k[40],1290863460),new e(k[41],3158454273),new e(k[42],3505952657),
new e(k[43],106217008),new e(k[44],3606008344),new e(k[45],1432725776),new e(k[46],1467031594),new e(k[47],851169720),new e(k[48],3100823752),new e(k[49],1363258195),new e(k[50],3750685593),new e(k[51],3785050280),new e(k[52],3318307427),new e(k[53],3812723403),new e(k[54],2003034995),new e(k[55],3602036899),new e(k[56],1575990012),new e(k[57],1125592928),new e(k[58],2716904306),new e(k[59],442776044),new e(k[60],593698344),new e(k[61],3733110249),new e(k[62],2999351573),new e(k[63],3815920427),new e(3391569614,
3928383900),new e(3515267271,566280711),new e(3940187606,3454069534),new e(4118630271,4000239992),new e(116418474,1914138554),new e(174292421,2731055270),new e(289380356,3203993006),new e(460393269,320620315),new e(685471733,587496836),new e(852142971,1086792851),new e(1017036298,365543100),new e(1126000580,2618297676),new e(1288033470,3409855158),new e(1501505948,4234509866),new e(1607167915,987167468),new e(1816402316,1246189591)],d="SHA-384"===b?[new e(3418070365,d[0]),new e(1654270250,d[1]),new e(2438529370,
d[2]),new e(355462360,d[3]),new e(1731405415,d[4]),new e(41048885895,d[5]),new e(3675008525,d[6]),new e(1203062813,d[7])]:[new e(f[0],4089235720),new e(f[1],2227873595),new e(f[2],4271175723),new e(f[3],1595750129),new e(f[4],2917565137),new e(f[5],725511199),new e(f[6],4215389547),new e(f[7],327033209)];else throw"Unexpected error in SHA-2 implementation";a[c>>>5]|=128<<24-c%32;a[g]=c;B=a.length;for(p=0;p<B;p+=w){c=d[0];g=d[1];f=d[2];h=d[3];l=d[4];r=d[5];t=d[6];u=d[7];for(m=0;m<n;m+=1)A[m]=16>m?
new e(a[m*x+p],a[m*x+p+1]):y(E(A[m-2]),A[m-7],D(A[m-15]),A[m-16]),v=C(u,G(l),H(l,r,t),k[m],A[m]),z=q(F(c),I(c,g,f)),u=t,t=r,r=l,l=q(h,v),h=f,f=g,g=c,c=q(v,z);d[0]=q(c,d[0]);d[1]=q(g,d[1]);d[2]=q(f,d[2]);d[3]=q(h,d[3]);d[4]=q(l,d[4]);d[5]=q(r,d[5]);d[6]=q(t,d[6]);d[7]=q(u,d[7])}if("SHA-224"===b)a=[d[0],d[1],d[2],d[3],d[4],d[5],d[6]];else if("SHA-256"===b)a=d;else if("SHA-384"===b)a=[d[0].a,d[0].b,d[1].a,d[1].b,d[2].a,d[2].b,d[3].a,d[3].b,d[4].a,d[4].b,d[5].a,d[5].b];else if("SHA-512"===b)a=[d[0].a,
d[0].b,d[1].a,d[1].b,d[2].a,d[2].b,d[3].a,d[3].b,d[4].a,d[4].b,d[5].a,d[5].b,d[6].a,d[6].b,d[7].a,d[7].b];else throw"Unexpected error in SHA-2 implementation";return a}"function"===typeof define&&typeof define.amd?define(function(){return z}):"undefined"!==typeof exports?"undefined"!==typeof module&&module.exports?module.exports=exports=z:exports=z:T.jsSHA=z})(this);
/*
 A JavaScript implementation of the SHA family of hashes, as
 defined in FIPS PUB 180-2 as well as the corresponding HMAC implementation
 as defined in FIPS PUB 198a

 Copyright Brian Turek 2008-2013
 Distributed under the BSD License
 See http://caligatio.github.com/jsSHA/ for more information

 Several functions taken from Paul Johnston
*/
(function(A){function q(a,d,b){var f=0,e=[0],c="",g=null,c=b||"UTF8";if("UTF8"!==c&&"UTF16"!==c)throw"encoding must be UTF8 or UTF16";if("HEX"===d){if(0!==a.length%2)throw"srcString of HEX type must be in byte increments";g=t(a);f=g.binLen;e=g.value}else if("ASCII"===d||"TEXT"===d)g=v(a,c),f=g.binLen,e=g.value;else if("B64"===d)g=w(a),f=g.binLen,e=g.value;else throw"inputFormat must be HEX, TEXT, ASCII, or B64";this.getHash=function(a,b,c,d){var g=null,h=e.slice(),k=f,m;3===arguments.length?"number"!==
typeof c&&(d=c,c=1):2===arguments.length&&(c=1);if(c!==parseInt(c,10)||1>c)throw"numRounds must a integer >= 1";switch(b){case "HEX":g=x;break;case "B64":g=y;break;default:throw"format must be HEX or B64";}if("SHA-1"===a)for(m=0;m<c;m++)h=s(h,k),k=160;else throw"Chosen SHA variant is not supported";return g(h,z(d))};this.getHMAC=function(a,b,d,g,q){var h,k,m,l,r=[],u=[];h=null;switch(g){case "HEX":g=x;break;case "B64":g=y;break;default:throw"outputFormat must be HEX or B64";}if("SHA-1"===d)k=64,l=
160;else throw"Chosen SHA variant is not supported";if("HEX"===b)h=t(a),m=h.binLen,h=h.value;else if("ASCII"===b||"TEXT"===b)h=v(a,c),m=h.binLen,h=h.value;else if("B64"===b)h=w(a),m=h.binLen,h=h.value;else throw"inputFormat must be HEX, TEXT, ASCII, or B64";a=8*k;b=k/4-1;if(k<m/8){if("SHA-1"===d)h=s(h,m);else throw"Unexpected error in HMAC implementation";h[b]&=4294967040}else k>m/8&&(h[b]&=4294967040);for(k=0;k<=b;k+=1)r[k]=h[k]^909522486,u[k]=h[k]^1549556828;if("SHA-1"===d)d=s(u.concat(s(r.concat(e),
a+f)),a+l);else throw"Unexpected error in HMAC implementation";return g(d,z(q))}}function v(a,d){var b=[],f,e=[],c=0,g;if("UTF8"===d)for(g=0;g<a.length;g+=1)for(f=a.charCodeAt(g),e=[],2048<f?(e[0]=224|(f&61440)>>>12,e[1]=128|(f&4032)>>>6,e[2]=128|f&63):128<f?(e[0]=192|(f&1984)>>>6,e[1]=128|f&63):e[0]=f,f=0;f<e.length;f+=1)b[c>>>2]|=e[f]<<24-c%4*8,c+=1;else if("UTF16"===d)for(g=0;g<a.length;g+=1)b[c>>>2]|=a.charCodeAt(g)<<16-c%4*8,c+=2;return{value:b,binLen:8*c}}function t(a){var d=[],b=a.length,f,
e;if(0!==b%2)throw"String of HEX type must be in byte increments";for(f=0;f<b;f+=2){e=parseInt(a.substr(f,2),16);if(isNaN(e))throw"String of HEX type contains invalid characters";d[f>>>3]|=e<<24-f%8*4}return{value:d,binLen:4*b}}function w(a){var d=[],b=0,f,e,c,g,p;if(-1===a.search(/^[a-zA-Z0-9=+\/]+$/))throw"Invalid character in base-64 string";f=a.indexOf("=");a=a.replace(/\=/g,"");if(-1!==f&&f<a.length)throw"Invalid '=' found in base-64 string";for(e=0;e<a.length;e+=4){p=a.substr(e,4);for(c=g=0;c<
p.length;c+=1)f="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".indexOf(p[c]),g|=f<<18-6*c;for(c=0;c<p.length-1;c+=1)d[b>>2]|=(g>>>16-8*c&255)<<24-b%4*8,b+=1}return{value:d,binLen:8*b}}function x(a,d){var b="",f=4*a.length,e,c;for(e=0;e<f;e+=1)c=a[e>>>2]>>>8*(3-e%4),b+="0123456789abcdef".charAt(c>>>4&15)+"0123456789abcdef".charAt(c&15);return d.outputUpper?b.toUpperCase():b}function y(a,d){var b="",f=4*a.length,e,c,g;for(e=0;e<f;e+=3)for(g=(a[e>>>2]>>>8*(3-e%4)&255)<<16|(a[e+1>>>
2]>>>8*(3-(e+1)%4)&255)<<8|a[e+2>>>2]>>>8*(3-(e+2)%4)&255,c=0;4>c;c+=1)b=8*e+6*c<=32*a.length?b+"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".charAt(g>>>6*(3-c)&63):b+d.b64Pad;return b}function z(a){var d={outputUpper:!1,b64Pad:"="};try{a.hasOwnProperty("outputUpper")&&(d.outputUpper=a.outputUpper),a.hasOwnProperty("b64Pad")&&(d.b64Pad=a.b64Pad)}catch(b){}if("boolean"!==typeof d.outputUpper)throw"Invalid outputUpper formatting option";if("string"!==typeof d.b64Pad)throw"Invalid b64Pad formatting option";
return d}function B(a,d){return a<<d|a>>>32-d}function C(a,d,b){return a^d^b}function D(a,d,b){return a&d^~a&b}function E(a,d,b){return a&d^a&b^d&b}function F(a,d){var b=(a&65535)+(d&65535);return((a>>>16)+(d>>>16)+(b>>>16)&65535)<<16|b&65535}function G(a,d,b,f,e){var c=(a&65535)+(d&65535)+(b&65535)+(f&65535)+(e&65535);return((a>>>16)+(d>>>16)+(b>>>16)+(f>>>16)+(e>>>16)+(c>>>16)&65535)<<16|c&65535}function s(a,d){var b=[],f,e,c,g,p,q,s=D,t=C,v=E,h=B,k=F,m,l,r=G,u,n=[1732584193,4023233417,2562383102,
271733878,3285377520];a[d>>>5]|=128<<24-d%32;a[(d+65>>>9<<4)+15]=d;u=a.length;for(m=0;m<u;m+=16){f=n[0];e=n[1];c=n[2];g=n[3];p=n[4];for(l=0;80>l;l+=1)b[l]=16>l?a[l+m]:h(b[l-3]^b[l-8]^b[l-14]^b[l-16],1),q=20>l?r(h(f,5),s(e,c,g),p,1518500249,b[l]):40>l?r(h(f,5),t(e,c,g),p,1859775393,b[l]):60>l?r(h(f,5),v(e,c,g),p,2400959708,b[l]):r(h(f,5),t(e,c,g),p,3395469782,b[l]),p=g,g=c,c=h(e,30),e=f,f=q;n[0]=k(f,n[0]);n[1]=k(e,n[1]);n[2]=k(c,n[2]);n[3]=k(g,n[3]);n[4]=k(p,n[4])}return n}"function"===typeof define&&
typeof define.amd?define(function(){return q}):"undefined"!==typeof exports?"undefined"!==typeof module&&module.exports?module.exports=exports=q:exports=q:A.jsSHA=q})(this);
/*
 A JavaScript implementation of the SHA family of hashes, as
 defined in FIPS PUB 180-2 as well as the corresponding HMAC implementation
 as defined in FIPS PUB 198a

 Copyright Brian Turek 2008-2013
 Distributed under the BSD License
 See http://caligatio.github.com/jsSHA/ for more information

 Several functions taken from Paul Johnston
*/
(function(B){function r(a,c,b){var f=0,e=[0],g="",h=null,g=b||"UTF8";if("UTF8"!==g&&"UTF16"!==g)throw"encoding must be UTF8 or UTF16";if("HEX"===c){if(0!==a.length%2)throw"srcString of HEX type must be in byte increments";h=u(a);f=h.binLen;e=h.value}else if("ASCII"===c||"TEXT"===c)h=v(a,g),f=h.binLen,e=h.value;else if("B64"===c)h=w(a),f=h.binLen,e=h.value;else throw"inputFormat must be HEX, TEXT, ASCII, or B64";this.getHash=function(a,c,b,g){var h=null,d=e.slice(),l=f,m;3===arguments.length?"number"!==
typeof b&&(g=b,b=1):2===arguments.length&&(b=1);if(b!==parseInt(b,10)||1>b)throw"numRounds must a integer >= 1";switch(c){case "HEX":h=x;break;case "B64":h=y;break;default:throw"format must be HEX or B64";}if("SHA-224"===a)for(m=0;m<b;m++)d=q(d,l,a),l=224;else if("SHA-256"===a)for(m=0;m<b;m++)d=q(d,l,a),l=256;else throw"Chosen SHA variant is not supported";return h(d,z(g))};this.getHMAC=function(a,b,c,h,k){var d,l,m,n,A=[],s=[];d=null;switch(h){case "HEX":h=x;break;case "B64":h=y;break;default:throw"outputFormat must be HEX or B64";
}if("SHA-224"===c)l=64,n=224;else if("SHA-256"===c)l=64,n=256;else throw"Chosen SHA variant is not supported";if("HEX"===b)d=u(a),m=d.binLen,d=d.value;else if("ASCII"===b||"TEXT"===b)d=v(a,g),m=d.binLen,d=d.value;else if("B64"===b)d=w(a),m=d.binLen,d=d.value;else throw"inputFormat must be HEX, TEXT, ASCII, or B64";a=8*l;b=l/4-1;l<m/8?(d=q(d,m,c),d[b]&=4294967040):l>m/8&&(d[b]&=4294967040);for(l=0;l<=b;l+=1)A[l]=d[l]^909522486,s[l]=d[l]^1549556828;c=q(s.concat(q(A.concat(e),a+f,c)),a+n,c);return h(c,
z(k))}}function v(a,c){var b=[],f,e=[],g=0,h;if("UTF8"===c)for(h=0;h<a.length;h+=1)for(f=a.charCodeAt(h),e=[],2048<f?(e[0]=224|(f&61440)>>>12,e[1]=128|(f&4032)>>>6,e[2]=128|f&63):128<f?(e[0]=192|(f&1984)>>>6,e[1]=128|f&63):e[0]=f,f=0;f<e.length;f+=1)b[g>>>2]|=e[f]<<24-g%4*8,g+=1;else if("UTF16"===c)for(h=0;h<a.length;h+=1)b[g>>>2]|=a.charCodeAt(h)<<16-g%4*8,g+=2;return{value:b,binLen:8*g}}function u(a){var c=[],b=a.length,f,e;if(0!==b%2)throw"String of HEX type must be in byte increments";for(f=0;f<
b;f+=2){e=parseInt(a.substr(f,2),16);if(isNaN(e))throw"String of HEX type contains invalid characters";c[f>>>3]|=e<<24-f%8*4}return{value:c,binLen:4*b}}function w(a){var c=[],b=0,f,e,g,h,k;if(-1===a.search(/^[a-zA-Z0-9=+\/]+$/))throw"Invalid character in base-64 string";f=a.indexOf("=");a=a.replace(/\=/g,"");if(-1!==f&&f<a.length)throw"Invalid '=' found in base-64 string";for(e=0;e<a.length;e+=4){k=a.substr(e,4);for(g=h=0;g<k.length;g+=1)f="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".indexOf(k[g]),
h|=f<<18-6*g;for(g=0;g<k.length-1;g+=1)c[b>>2]|=(h>>>16-8*g&255)<<24-b%4*8,b+=1}return{value:c,binLen:8*b}}function x(a,c){var b="",f=4*a.length,e,g;for(e=0;e<f;e+=1)g=a[e>>>2]>>>8*(3-e%4),b+="0123456789abcdef".charAt(g>>>4&15)+"0123456789abcdef".charAt(g&15);return c.outputUpper?b.toUpperCase():b}function y(a,c){var b="",f=4*a.length,e,g,h;for(e=0;e<f;e+=3)for(h=(a[e>>>2]>>>8*(3-e%4)&255)<<16|(a[e+1>>>2]>>>8*(3-(e+1)%4)&255)<<8|a[e+2>>>2]>>>8*(3-(e+2)%4)&255,g=0;4>g;g+=1)b=8*e+6*g<=32*a.length?b+
"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".charAt(h>>>6*(3-g)&63):b+c.b64Pad;return b}function z(a){var c={outputUpper:!1,b64Pad:"="};try{a.hasOwnProperty("outputUpper")&&(c.outputUpper=a.outputUpper),a.hasOwnProperty("b64Pad")&&(c.b64Pad=a.b64Pad)}catch(b){}if("boolean"!==typeof c.outputUpper)throw"Invalid outputUpper formatting option";if("string"!==typeof c.b64Pad)throw"Invalid b64Pad formatting option";return c}function k(a,c){return a>>>c|a<<32-c}function I(a,c,b){return a&
c^~a&b}function J(a,c,b){return a&c^a&b^c&b}function K(a){return k(a,2)^k(a,13)^k(a,22)}function L(a){return k(a,6)^k(a,11)^k(a,25)}function M(a){return k(a,7)^k(a,18)^a>>>3}function N(a){return k(a,17)^k(a,19)^a>>>10}function O(a,c){var b=(a&65535)+(c&65535);return((a>>>16)+(c>>>16)+(b>>>16)&65535)<<16|b&65535}function P(a,c,b,f){var e=(a&65535)+(c&65535)+(b&65535)+(f&65535);return((a>>>16)+(c>>>16)+(b>>>16)+(f>>>16)+(e>>>16)&65535)<<16|e&65535}function Q(a,c,b,f,e){var g=(a&65535)+(c&65535)+(b&
65535)+(f&65535)+(e&65535);return((a>>>16)+(c>>>16)+(b>>>16)+(f>>>16)+(e>>>16)+(g>>>16)&65535)<<16|g&65535}function q(a,c,b){var f,e,g,h,k,q,r,C,u,d,l,m,n,A,s,p,v,w,x,y,z,D,E,F,G,t=[],H,B=[1116352408,1899447441,3049323471,3921009573,961987163,1508970993,2453635748,2870763221,3624381080,310598401,607225278,1426881987,1925078388,2162078206,2614888103,3248222580,3835390401,4022224774,264347078,604807628,770255983,1249150122,1555081692,1996064986,2554220882,2821834349,2952996808,3210313671,3336571891,
3584528711,113926993,338241895,666307205,773529912,1294757372,1396182291,1695183700,1986661051,2177026350,2456956037,2730485921,2820302411,3259730800,3345764771,3516065817,3600352804,4094571909,275423344,430227734,506948616,659060556,883997877,958139571,1322822218,1537002063,1747873779,1955562222,2024104815,2227730452,2361852424,2428436474,2756734187,3204031479,3329325298];d=[3238371032,914150663,812702999,4144912697,4290775857,1750603025,1694076839,3204075428];f=[1779033703,3144134277,1013904242,
2773480762,1359893119,2600822924,528734635,1541459225];if("SHA-224"===b||"SHA-256"===b)l=64,A=16,s=1,G=Number,p=O,v=P,w=Q,x=M,y=N,z=K,D=L,F=J,E=I,d="SHA-224"===b?d:f;else throw"Unexpected error in SHA-2 implementation";a[c>>>5]|=128<<24-c%32;a[(c+65>>>9<<4)+15]=c;H=a.length;for(m=0;m<H;m+=A){c=d[0];f=d[1];e=d[2];g=d[3];h=d[4];k=d[5];q=d[6];r=d[7];for(n=0;n<l;n+=1)t[n]=16>n?new G(a[n*s+m],a[n*s+m+1]):v(y(t[n-2]),t[n-7],x(t[n-15]),t[n-16]),C=w(r,D(h),E(h,k,q),B[n],t[n]),u=p(z(c),F(c,f,e)),r=q,q=k,k=
h,h=p(g,C),g=e,e=f,f=c,c=p(C,u);d[0]=p(c,d[0]);d[1]=p(f,d[1]);d[2]=p(e,d[2]);d[3]=p(g,d[3]);d[4]=p(h,d[4]);d[5]=p(k,d[5]);d[6]=p(q,d[6]);d[7]=p(r,d[7])}if("SHA-224"===b)a=[d[0],d[1],d[2],d[3],d[4],d[5],d[6]];else if("SHA-256"===b)a=d;else throw"Unexpected error in SHA-2 implementation";return a}"function"===typeof define&&typeof define.amd?define(function(){return r}):"undefined"!==typeof exports?"undefined"!==typeof module&&module.exports?module.exports=exports=r:exports=r:B.jsSHA=r})(this);
/*
 A JavaScript implementation of the SHA family of hashes, as
 defined in FIPS PUB 180-2 as well as the corresponding HMAC implementation
 as defined in FIPS PUB 198a

 Copyright Brian Turek 2008-2013
 Distributed under the BSD License
 See http://caligatio.github.com/jsSHA/ for more information

 Several functions taken from Paul Johnston
*/
(function(J){function u(a,c,b){var h=0,f=[0],k="",l=null,k=b||"UTF8";if("UTF8"!==k&&"UTF16"!==k)throw"encoding must be UTF8 or UTF16";if("HEX"===c){if(0!==a.length%2)throw"srcString of HEX type must be in byte increments";l=x(a);h=l.binLen;f=l.value}else if("ASCII"===c||"TEXT"===c)l=y(a,k),h=l.binLen,f=l.value;else if("B64"===c)l=z(a),h=l.binLen,f=l.value;else throw"inputFormat must be HEX, TEXT, ASCII, or B64";this.getHash=function(a,c,b,k){var l=null,e=f.slice(),m=h,q;3===arguments.length?"number"!==
typeof b&&(k=b,b=1):2===arguments.length&&(b=1);if(b!==parseInt(b,10)||1>b)throw"numRounds must a integer >= 1";switch(c){case "HEX":l=A;break;case "B64":l=B;break;default:throw"format must be HEX or B64";}if("SHA-384"===a)for(q=0;q<b;q++)e=t(e,m,a),m=384;else if("SHA-512"===a)for(q=0;q<b;q++)e=t(e,m,a),m=512;else throw"Chosen SHA variant is not supported";return l(e,C(k))};this.getHMAC=function(a,b,c,l,n){var e,m,q,r,p=[],v=[];e=null;switch(l){case "HEX":l=A;break;case "B64":l=B;break;default:throw"outputFormat must be HEX or B64";
}if("SHA-384"===c)m=128,r=384;else if("SHA-512"===c)m=128,r=512;else throw"Chosen SHA variant is not supported";if("HEX"===b)e=x(a),q=e.binLen,e=e.value;else if("ASCII"===b||"TEXT"===b)e=y(a,k),q=e.binLen,e=e.value;else if("B64"===b)e=z(a),q=e.binLen,e=e.value;else throw"inputFormat must be HEX, TEXT, ASCII, or B64";a=8*m;b=m/4-1;m<q/8?(e=t(e,q,c),e[b]&=4294967040):m>q/8&&(e[b]&=4294967040);for(m=0;m<=b;m+=1)p[m]=e[m]^909522486,v[m]=e[m]^1549556828;c=t(v.concat(t(p.concat(f),a+h,c)),a+r,c);return l(c,
C(n))}}function n(a,c){this.a=a;this.b=c}function y(a,c){var b=[],h,f=[],k=0,l;if("UTF8"===c)for(l=0;l<a.length;l+=1)for(h=a.charCodeAt(l),f=[],2048<h?(f[0]=224|(h&61440)>>>12,f[1]=128|(h&4032)>>>6,f[2]=128|h&63):128<h?(f[0]=192|(h&1984)>>>6,f[1]=128|h&63):f[0]=h,h=0;h<f.length;h+=1)b[k>>>2]|=f[h]<<24-k%4*8,k+=1;else if("UTF16"===c)for(l=0;l<a.length;l+=1)b[k>>>2]|=a.charCodeAt(l)<<16-k%4*8,k+=2;return{value:b,binLen:8*k}}function x(a){var c=[],b=a.length,h,f;if(0!==b%2)throw"String of HEX type must be in byte increments";
for(h=0;h<b;h+=2){f=parseInt(a.substr(h,2),16);if(isNaN(f))throw"String of HEX type contains invalid characters";c[h>>>3]|=f<<24-h%8*4}return{value:c,binLen:4*b}}function z(a){var c=[],b=0,h,f,k,l,n;if(-1===a.search(/^[a-zA-Z0-9=+\/]+$/))throw"Invalid character in base-64 string";h=a.indexOf("=");a=a.replace(/\=/g,"");if(-1!==h&&h<a.length)throw"Invalid '=' found in base-64 string";for(f=0;f<a.length;f+=4){n=a.substr(f,4);for(k=l=0;k<n.length;k+=1)h="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".indexOf(n[k]),
l|=h<<18-6*k;for(k=0;k<n.length-1;k+=1)c[b>>2]|=(l>>>16-8*k&255)<<24-b%4*8,b+=1}return{value:c,binLen:8*b}}function A(a,c){var b="",h=4*a.length,f,k;for(f=0;f<h;f+=1)k=a[f>>>2]>>>8*(3-f%4),b+="0123456789abcdef".charAt(k>>>4&15)+"0123456789abcdef".charAt(k&15);return c.outputUpper?b.toUpperCase():b}function B(a,c){var b="",h=4*a.length,f,k,l;for(f=0;f<h;f+=3)for(l=(a[f>>>2]>>>8*(3-f%4)&255)<<16|(a[f+1>>>2]>>>8*(3-(f+1)%4)&255)<<8|a[f+2>>>2]>>>8*(3-(f+2)%4)&255,k=0;4>k;k+=1)b=8*f+6*k<=32*a.length?b+
"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".charAt(l>>>6*(3-k)&63):b+c.b64Pad;return b}function C(a){var c={outputUpper:!1,b64Pad:"="};try{a.hasOwnProperty("outputUpper")&&(c.outputUpper=a.outputUpper),a.hasOwnProperty("b64Pad")&&(c.b64Pad=a.b64Pad)}catch(b){}if("boolean"!==typeof c.outputUpper)throw"Invalid outputUpper formatting option";if("string"!==typeof c.b64Pad)throw"Invalid b64Pad formatting option";return c}function p(a,c){var b=null,b=new n(a.a,a.b);return b=32>=c?
new n(b.a>>>c|b.b<<32-c&4294967295,b.b>>>c|b.a<<32-c&4294967295):new n(b.b>>>c-32|b.a<<64-c&4294967295,b.a>>>c-32|b.b<<64-c&4294967295)}function D(a,c){var b=null;return b=32>=c?new n(a.a>>>c,a.b>>>c|a.a<<32-c&4294967295):new n(0,a.a>>>c-32)}function K(a,c,b){return new n(a.a&c.a^~a.a&b.a,a.b&c.b^~a.b&b.b)}function L(a,c,b){return new n(a.a&c.a^a.a&b.a^c.a&b.a,a.b&c.b^a.b&b.b^c.b&b.b)}function M(a){var c=p(a,28),b=p(a,34);a=p(a,39);return new n(c.a^b.a^a.a,c.b^b.b^a.b)}function N(a){var c=p(a,14),
b=p(a,18);a=p(a,41);return new n(c.a^b.a^a.a,c.b^b.b^a.b)}function O(a){var c=p(a,1),b=p(a,8);a=D(a,7);return new n(c.a^b.a^a.a,c.b^b.b^a.b)}function P(a){var c=p(a,19),b=p(a,61);a=D(a,6);return new n(c.a^b.a^a.a,c.b^b.b^a.b)}function Q(a,c){var b,h,f;b=(a.b&65535)+(c.b&65535);h=(a.b>>>16)+(c.b>>>16)+(b>>>16);f=(h&65535)<<16|b&65535;b=(a.a&65535)+(c.a&65535)+(h>>>16);h=(a.a>>>16)+(c.a>>>16)+(b>>>16);return new n((h&65535)<<16|b&65535,f)}function R(a,c,b,h){var f,k,l;f=(a.b&65535)+(c.b&65535)+(b.b&
65535)+(h.b&65535);k=(a.b>>>16)+(c.b>>>16)+(b.b>>>16)+(h.b>>>16)+(f>>>16);l=(k&65535)<<16|f&65535;f=(a.a&65535)+(c.a&65535)+(b.a&65535)+(h.a&65535)+(k>>>16);k=(a.a>>>16)+(c.a>>>16)+(b.a>>>16)+(h.a>>>16)+(f>>>16);return new n((k&65535)<<16|f&65535,l)}function S(a,c,b,h,f){var k,l,p;k=(a.b&65535)+(c.b&65535)+(b.b&65535)+(h.b&65535)+(f.b&65535);l=(a.b>>>16)+(c.b>>>16)+(b.b>>>16)+(h.b>>>16)+(f.b>>>16)+(k>>>16);p=(l&65535)<<16|k&65535;k=(a.a&65535)+(c.a&65535)+(b.a&65535)+(h.a&65535)+(f.a&65535)+(l>>>
16);l=(a.a>>>16)+(c.a>>>16)+(b.a>>>16)+(h.a>>>16)+(f.a>>>16)+(k>>>16);return new n((l&65535)<<16|k&65535,p)}function t(a,c,b){var h,f,k,l,p,t,u,E,x,e,m,q,r,y,v,s,z,A,B,C,D,F,G,H,d,w=[],I,g=[1116352408,1899447441,3049323471,3921009573,961987163,1508970993,2453635748,2870763221,3624381080,310598401,607225278,1426881987,1925078388,2162078206,2614888103,3248222580,3835390401,4022224774,264347078,604807628,770255983,1249150122,1555081692,1996064986,2554220882,2821834349,2952996808,3210313671,3336571891,
3584528711,113926993,338241895,666307205,773529912,1294757372,1396182291,1695183700,1986661051,2177026350,2456956037,2730485921,2820302411,3259730800,3345764771,3516065817,3600352804,4094571909,275423344,430227734,506948616,659060556,883997877,958139571,1322822218,1537002063,1747873779,1955562222,2024104815,2227730452,2361852424,2428436474,2756734187,3204031479,3329325298];e=[3238371032,914150663,812702999,4144912697,4290775857,1750603025,1694076839,3204075428];f=[1779033703,3144134277,1013904242,
2773480762,1359893119,2600822924,528734635,1541459225];if("SHA-384"===b||"SHA-512"===b)m=80,h=(c+128>>>10<<5)+31,y=32,v=2,d=n,s=Q,z=R,A=S,B=O,C=P,D=M,F=N,H=L,G=K,g=[new d(g[0],3609767458),new d(g[1],602891725),new d(g[2],3964484399),new d(g[3],2173295548),new d(g[4],4081628472),new d(g[5],3053834265),new d(g[6],2937671579),new d(g[7],3664609560),new d(g[8],2734883394),new d(g[9],1164996542),new d(g[10],1323610764),new d(g[11],3590304994),new d(g[12],4068182383),new d(g[13],991336113),new d(g[14],
633803317),new d(g[15],3479774868),new d(g[16],2666613458),new d(g[17],944711139),new d(g[18],2341262773),new d(g[19],2007800933),new d(g[20],1495990901),new d(g[21],1856431235),new d(g[22],3175218132),new d(g[23],2198950837),new d(g[24],3999719339),new d(g[25],766784016),new d(g[26],2566594879),new d(g[27],3203337956),new d(g[28],1034457026),new d(g[29],2466948901),new d(g[30],3758326383),new d(g[31],168717936),new d(g[32],1188179964),new d(g[33],1546045734),new d(g[34],1522805485),new d(g[35],2643833823),
new d(g[36],2343527390),new d(g[37],1014477480),new d(g[38],1206759142),new d(g[39],344077627),new d(g[40],1290863460),new d(g[41],3158454273),new d(g[42],3505952657),new d(g[43],106217008),new d(g[44],3606008344),new d(g[45],1432725776),new d(g[46],1467031594),new d(g[47],851169720),new d(g[48],3100823752),new d(g[49],1363258195),new d(g[50],3750685593),new d(g[51],3785050280),new d(g[52],3318307427),new d(g[53],3812723403),new d(g[54],2003034995),new d(g[55],3602036899),new d(g[56],1575990012),
new d(g[57],1125592928),new d(g[58],2716904306),new d(g[59],442776044),new d(g[60],593698344),new d(g[61],3733110249),new d(g[62],2999351573),new d(g[63],3815920427),new d(3391569614,3928383900),new d(3515267271,566280711),new d(3940187606,3454069534),new d(4118630271,4000239992),new d(116418474,1914138554),new d(174292421,2731055270),new d(289380356,3203993006),new d(460393269,320620315),new d(685471733,587496836),new d(852142971,1086792851),new d(1017036298,365543100),new d(1126000580,2618297676),
new d(1288033470,3409855158),new d(1501505948,4234509866),new d(1607167915,987167468),new d(1816402316,1246189591)],e="SHA-384"===b?[new d(3418070365,e[0]),new d(1654270250,e[1]),new d(2438529370,e[2]),new d(355462360,e[3]),new d(1731405415,e[4]),new d(41048885895,e[5]),new d(3675008525,e[6]),new d(1203062813,e[7])]:[new d(f[0],4089235720),new d(f[1],2227873595),new d(f[2],4271175723),new d(f[3],1595750129),new d(f[4],2917565137),new d(f[5],725511199),new d(f[6],4215389547),new d(f[7],327033209)];
else throw"Unexpected error in SHA-2 implementation";a[c>>>5]|=128<<24-c%32;a[h]=c;I=a.length;for(q=0;q<I;q+=y){c=e[0];h=e[1];f=e[2];k=e[3];l=e[4];p=e[5];t=e[6];u=e[7];for(r=0;r<m;r+=1)w[r]=16>r?new d(a[r*v+q],a[r*v+q+1]):z(C(w[r-2]),w[r-7],B(w[r-15]),w[r-16]),E=A(u,F(l),G(l,p,t),g[r],w[r]),x=s(D(c),H(c,h,f)),u=t,t=p,p=l,l=s(k,E),k=f,f=h,h=c,c=s(E,x);e[0]=s(c,e[0]);e[1]=s(h,e[1]);e[2]=s(f,e[2]);e[3]=s(k,e[3]);e[4]=s(l,e[4]);e[5]=s(p,e[5]);e[6]=s(t,e[6]);e[7]=s(u,e[7])}if("SHA-384"===b)a=[e[0].a,e[0].b,
e[1].a,e[1].b,e[2].a,e[2].b,e[3].a,e[3].b,e[4].a,e[4].b,e[5].a,e[5].b];else if("SHA-512"===b)a=[e[0].a,e[0].b,e[1].a,e[1].b,e[2].a,e[2].b,e[3].a,e[3].b,e[4].a,e[4].b,e[5].a,e[5].b,e[6].a,e[6].b,e[7].a,e[7].b];else throw"Unexpected error in SHA-2 implementation";return a}"function"===typeof define&&typeof define.amd?define(function(){return u}):"undefined"!==typeof exports?"undefined"!==typeof module&&module.exports?module.exports=exports=u:exports=u:J.jsSHA=u})(this);
/**
 * @preserve A JavaScript implementation of the SHA family of hashes, as
 * defined in FIPS PUB 180-2 as well as the corresponding HMAC implementation
 * as defined in FIPS PUB 198a
 *
 * Copyright Brian Turek 2008-2013
 * Distributed under the BSD License
 * See http://caligatio.github.com/jsSHA/ for more information
 *
 * Several functions taken from Paul Johnston
 */

 /**
  * SUPPORTED_ALGS is the stub for a compile flag that will cause pruning of
  * functions that are not needed when a limited number of SHA families are
  * selected
  *
  * @define {number} ORed value of SHA variants to be supported
  *   1 = SHA-1, 2 = SHA-224/SHA-256, 4 = SHA-384/SHA-512
  */
var SUPPORTED_ALGS = 4 | 2 | 1;

(function (global)
{
	"use strict";
	/**
	 * Int_64 is a object for 2 32-bit numbers emulating a 64-bit number
	 *
	 * @private
	 * @constructor
	 * @this {Int_64}
	 * @param {number} msint_32 The most significant 32-bits of a 64-bit number
	 * @param {number} lsint_32 The least significant 32-bits of a 64-bit number
	 */
	function Int_64(msint_32, lsint_32)
	{
		this.highOrder = msint_32;
		this.lowOrder = lsint_32;
	}

	/**
	 * Convert a string to an array of big-endian words
	 *
	 * @private
	 * @param {string} str String to be converted to binary representation
	 * @param {string} utfType The Unicode type, UTF8 or UTF16, to use to
	 *   encode the source string
	 * @return {{value : Array.<number>, binLen : number}} Hash list where
	 *   "value" contains the output number array and "binLen" is the binary
	 *   length of "value"
	 */
	function str2binb(str, utfType)
	{
		var bin = [], codePnt, binArr = [], byteCnt = 0, i, j;

		if ("UTF8" === utfType)
		{
			for (i = 0; i < str.length; i += 1)
			{
				codePnt = str.charCodeAt(i);
				binArr = [];

				if (0x800 < codePnt)
				{
					binArr[0] = 0xE0 | ((codePnt & 0xF000) >>> 12);
					binArr[1] = 0x80 | ((codePnt & 0xFC0) >>> 6);
					binArr[2] = 0x80 | (codePnt & 0x3F);
				}
				else if (0x80 < codePnt)
				{
					binArr[0] = 0xC0 | ((codePnt & 0x7C0) >>> 6);
					binArr[1] = 0x80 | (codePnt & 0x3F);
				}
				else
				{
					binArr[0] = codePnt;
				}

				for (j = 0; j < binArr.length; j += 1)
				{
					bin[byteCnt >>> 2] |= binArr[j] << (24 - (8 * (byteCnt % 4)));
					byteCnt += 1;
				}
			}
		}
		else if ("UTF16" === utfType)
		{
			for (i = 0; i < str.length; i += 1)
			{
				codePnt = str.charCodeAt(i);

				bin[byteCnt >>> 2] |= str.charCodeAt(i) << (16 - (8 * (byteCnt % 4)));
				byteCnt += 2;
			}
		}
		return {"value" : bin, "binLen" : byteCnt * 8};
	}

	/**
	 * Convert a hex string to an array of big-endian words
	 *
	 * @private
	 * @param {string} str String to be converted to binary representation
	 * @return {{value : Array.<number>, binLen : number}} Hash list where
	 *   "value" contains the output number array and "binLen" is the binary
	 *   length of "value"
	 */
	function hex2binb(str)
	{
		var bin = [], length = str.length, i, num;

		if (0 !== (length % 2))
		{
			throw "String of HEX type must be in byte increments";
		}

		for (i = 0; i < length; i += 2)
		{
			num = parseInt(str.substr(i, 2), 16);
			if (!isNaN(num))
			{
				bin[i >>> 3] |= num << (24 - (4 * (i % 8)));
			}
			else
			{
				throw "String of HEX type contains invalid characters";
			}
		}

		return {"value" : bin, "binLen" : length * 4};
	}

	/**
	 * Convert a base-64 string to an array of big-endian words
	 *
	 * @private
	 * @param {string} str String to be converted to binary representation
	 * @return {{value : Array.<number>, binLen : number}} Hash list where
	 *   "value" contains the output number array and "binLen" is the binary
	 *   length of "value"
	 */
	function b642binb(str)
	{
		var retVal = [], byteCnt = 0, index, i, j, tmpInt, strPart, firstEqual,
			b64Tab = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

		if (-1 === str.search(/^[a-zA-Z0-9=+\/]+$/))
		{
			throw "Invalid character in base-64 string";
		}
		firstEqual = str.indexOf('=');
		str = str.replace(/\=/g, '');
		if ((-1 !== firstEqual) && (firstEqual < str.length))
		{
			throw "Invalid '=' found in base-64 string";
		}

		for (i = 0; i < str.length; i += 4)
		{
			strPart = str.substr(i, 4);
			tmpInt = 0;

			for (j = 0; j < strPart.length; j += 1)
			{
				index = b64Tab.indexOf(strPart[j]);
				tmpInt |= index << (18 - (6 * j));
			}

			for (j = 0; j < strPart.length - 1; j += 1)
			{
				retVal[byteCnt >> 2] |= ((tmpInt >>> (16 - (j * 8))) & 0xFF) <<
					(24 - (8 * (byteCnt % 4)));
				byteCnt += 1;
			}
		}

		return {"value" : retVal, "binLen" : byteCnt * 8};
	}

	/**
	 * Convert an array of big-endian words to a hex string.
	 *
	 * @private
	 * @param {Array.<number>} binarray Array of integers to be converted to
	 *   hexidecimal representation
	 * @param {{outputUpper : boolean, b64Pad : string}} formatOpts Hash list
	 *   containing validated output formatting options
	 * @return {string} Hexidecimal representation of the parameter in String
	 *   form
	 */
	function binb2hex(binarray, formatOpts)
	{
		var hex_tab = "0123456789abcdef", str = "",
			length = binarray.length * 4, i, srcByte;

		for (i = 0; i < length; i += 1)
		{
			srcByte = binarray[i >>> 2] >>> ((3 - (i % 4)) * 8);
			str += hex_tab.charAt((srcByte >>> 4) & 0xF) +
				hex_tab.charAt(srcByte & 0xF);
		}

		return (formatOpts["outputUpper"]) ? str.toUpperCase() : str;
	}

	/**
	 * Convert an array of big-endian words to a base-64 string
	 *
	 * @private
	 * @param {Array.<number>} binarray Array of integers to be converted to
	 *   base-64 representation
	 * @param {{outputUpper : boolean, b64Pad : string}} formatOpts Hash list
	 *   containing validated output formatting options
	 * @return {string} Base-64 encoded representation of the parameter in
	 *   String form
	 */
	function binb2b64(binarray, formatOpts)
	{
		var str = "", length = binarray.length * 4, i, j, triplet,
			b64Tab = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

		for (i = 0; i < length; i += 3)
		{
			triplet = (((binarray[i >>> 2] >>> 8 * (3 - i % 4)) & 0xFF) << 16) |
				(((binarray[i + 1 >>> 2] >>> 8 * (3 - (i + 1) % 4)) & 0xFF) << 8) |
				((binarray[i + 2 >>> 2] >>> 8 * (3 - (i + 2) % 4)) & 0xFF);
			for (j = 0; j < 4; j += 1)
			{
				if (i * 8 + j * 6 <= binarray.length * 32)
				{
					str += b64Tab.charAt((triplet >>> 6 * (3 - j)) & 0x3F);
				}
				else
				{
					str += formatOpts["b64Pad"];
				}
			}
		}
		return str;
	}

	/**
	 * Validate hash list containing output formatting options, ensuring
	 * presence of every option or adding the default value
	 *
	 * @private
	 * @param {{outputUpper : boolean, b64Pad : string}|undefined} outputOpts
	 *   Hash list of output formatting options
	 * @return {{outputUpper : boolean, b64Pad : string}} Validated hash list
	 *   containing output formatting options
	 */
	function getOutputOpts(outputOpts)
	{
		var retVal = {"outputUpper" : false, "b64Pad" : "="};

		try
		{
			if (outputOpts.hasOwnProperty("outputUpper"))
			{
				retVal["outputUpper"] = outputOpts["outputUpper"];
			}

			if (outputOpts.hasOwnProperty("b64Pad"))
			{
				retVal["b64Pad"] = outputOpts["b64Pad"];
			}
		}
		catch(ignore)
		{}

		if ("boolean" !== typeof(retVal["outputUpper"]))
		{
			throw "Invalid outputUpper formatting option";
		}

		if ("string" !== typeof(retVal["b64Pad"]))
		{
			throw "Invalid b64Pad formatting option";
		}

		return retVal;
	}

	/**
	 * The 32-bit implementation of circular rotate left
	 *
	 * @private
	 * @param {number} x The 32-bit integer argument
	 * @param {number} n The number of bits to shift
	 * @return {number} The x shifted circularly by n bits
	 */
	function rotl_32(x, n)
	{
		return (x << n) | (x >>> (32 - n));
	}

	/**
	 * The 32-bit implementation of circular rotate right
	 *
	 * @private
	 * @param {number} x The 32-bit integer argument
	 * @param {number} n The number of bits to shift
	 * @return {number} The x shifted circularly by n bits
	 */
	function rotr_32(x, n)
	{
		return (x >>> n) | (x << (32 - n));
	}

	/**
	 * The 64-bit implementation of circular rotate right
	 *
	 * @private
	 * @param {Int_64} x The 64-bit integer argument
	 * @param {number} n The number of bits to shift
	 * @return {Int_64} The x shifted circularly by n bits
	 */
	function rotr_64(x, n)
	{
		var retVal = null, tmp = new Int_64(x.highOrder, x.lowOrder);

		if (32 >= n)
		{
			retVal = new Int_64(
					(tmp.highOrder >>> n) | ((tmp.lowOrder << (32 - n)) & 0xFFFFFFFF),
					(tmp.lowOrder >>> n) | ((tmp.highOrder << (32 - n)) & 0xFFFFFFFF)
				);
		}
		else
		{
			retVal = new Int_64(
					(tmp.lowOrder >>> (n - 32)) | ((tmp.highOrder << (64 - n)) & 0xFFFFFFFF),
					(tmp.highOrder >>> (n - 32)) | ((tmp.lowOrder << (64 - n)) & 0xFFFFFFFF)
				);
		}

		return retVal;
	}

	/**
	 * The 32-bit implementation of shift right
	 *
	 * @private
	 * @param {number} x The 32-bit integer argument
	 * @param {number} n The number of bits to shift
	 * @return {number} The x shifted by n bits
	 */
	function shr_32(x, n)
	{
		return x >>> n;
	}

	/**
	 * The 64-bit implementation of shift right
	 *
	 * @private
	 * @param {Int_64} x The 64-bit integer argument
	 * @param {number} n The number of bits to shift
	 * @return {Int_64} The x shifted by n bits
	 */
	function shr_64(x, n)
	{
		var retVal = null;

		if (32 >= n)
		{
			retVal = new Int_64(
					x.highOrder >>> n,
					x.lowOrder >>> n | ((x.highOrder << (32 - n)) & 0xFFFFFFFF)
				);
		}
		else
		{
			retVal = new Int_64(
					0,
					x.highOrder >>> (n - 32)
				);
		}

		return retVal;
	}

	/**
	 * The 32-bit implementation of the NIST specified Parity function
	 *
	 * @private
	 * @param {number} x The first 32-bit integer argument
	 * @param {number} y The second 32-bit integer argument
	 * @param {number} z The third 32-bit integer argument
	 * @return {number} The NIST specified output of the function
	 */
	function parity_32(x, y, z)
	{
		return x ^ y ^ z;
	}

	/**
	 * The 32-bit implementation of the NIST specified Ch function
	 *
	 * @private
	 * @param {number} x The first 32-bit integer argument
	 * @param {number} y The second 32-bit integer argument
	 * @param {number} z The third 32-bit integer argument
	 * @return {number} The NIST specified output of the function
	 */
	function ch_32(x, y, z)
	{
		return (x & y) ^ (~x & z);
	}

	/**
	 * The 64-bit implementation of the NIST specified Ch function
	 *
	 * @private
	 * @param {Int_64} x The first 64-bit integer argument
	 * @param {Int_64} y The second 64-bit integer argument
	 * @param {Int_64} z The third 64-bit integer argument
	 * @return {Int_64} The NIST specified output of the function
	 */
	function ch_64(x, y, z)
	{
		return new Int_64(
				(x.highOrder & y.highOrder) ^ (~x.highOrder & z.highOrder),
				(x.lowOrder & y.lowOrder) ^ (~x.lowOrder & z.lowOrder)
			);
	}

	/**
	 * The 32-bit implementation of the NIST specified Maj function
	 *
	 * @private
	 * @param {number} x The first 32-bit integer argument
	 * @param {number} y The second 32-bit integer argument
	 * @param {number} z The third 32-bit integer argument
	 * @return {number} The NIST specified output of the function
	 */
	function maj_32(x, y, z)
	{
		return (x & y) ^ (x & z) ^ (y & z);
	}

	/**
	 * The 64-bit implementation of the NIST specified Maj function
	 *
	 * @private
	 * @param {Int_64} x The first 64-bit integer argument
	 * @param {Int_64} y The second 64-bit integer argument
	 * @param {Int_64} z The third 64-bit integer argument
	 * @return {Int_64} The NIST specified output of the function
	 */
	function maj_64(x, y, z)
	{
		return new Int_64(
				(x.highOrder & y.highOrder) ^
				(x.highOrder & z.highOrder) ^
				(y.highOrder & z.highOrder),
				(x.lowOrder & y.lowOrder) ^
				(x.lowOrder & z.lowOrder) ^
				(y.lowOrder & z.lowOrder)
			);
	}

	/**
	 * The 32-bit implementation of the NIST specified Sigma0 function
	 *
	 * @private
	 * @param {number} x The 32-bit integer argument
	 * @return {number} The NIST specified output of the function
	 */
	function sigma0_32(x)
	{
		return rotr_32(x, 2) ^ rotr_32(x, 13) ^ rotr_32(x, 22);
	}

	/**
	 * The 64-bit implementation of the NIST specified Sigma0 function
	 *
	 * @private
	 * @param {Int_64} x The 64-bit integer argument
	 * @return {Int_64} The NIST specified output of the function
	 */
	function sigma0_64(x)
	{
		var rotr28 = rotr_64(x, 28), rotr34 = rotr_64(x, 34),
			rotr39 = rotr_64(x, 39);

		return new Int_64(
				rotr28.highOrder ^ rotr34.highOrder ^ rotr39.highOrder,
				rotr28.lowOrder ^ rotr34.lowOrder ^ rotr39.lowOrder);
	}

	/**
	 * The 32-bit implementation of the NIST specified Sigma1 function
	 *
	 * @private
	 * @param {number} x The 32-bit integer argument
	 * @return {number} The NIST specified output of the function
	 */
	function sigma1_32(x)
	{
		return rotr_32(x, 6) ^ rotr_32(x, 11) ^ rotr_32(x, 25);
	}

	/**
	 * The 64-bit implementation of the NIST specified Sigma1 function
	 *
	 * @private
	 * @param {Int_64} x The 64-bit integer argument
	 * @return {Int_64} The NIST specified output of the function
	 */
	function sigma1_64(x)
	{
		var rotr14 = rotr_64(x, 14), rotr18 = rotr_64(x, 18),
			rotr41 = rotr_64(x, 41);

		return new Int_64(
				rotr14.highOrder ^ rotr18.highOrder ^ rotr41.highOrder,
				rotr14.lowOrder ^ rotr18.lowOrder ^ rotr41.lowOrder);
	}

	/**
	 * The 32-bit implementation of the NIST specified Gamma0 function
	 *
	 * @private
	 * @param {number} x The 32-bit integer argument
	 * @return {number} The NIST specified output of the function
	 */
	function gamma0_32(x)
	{
		return rotr_32(x, 7) ^ rotr_32(x, 18) ^ shr_32(x, 3);
	}

	/**
	 * The 64-bit implementation of the NIST specified Gamma0 function
	 *
	 * @private
	 * @param {Int_64} x The 64-bit integer argument
	 * @return {Int_64} The NIST specified output of the function
	 */
	function gamma0_64(x)
	{
		var rotr1 = rotr_64(x, 1), rotr8 = rotr_64(x, 8), shr7 = shr_64(x, 7);

		return new Int_64(
				rotr1.highOrder ^ rotr8.highOrder ^ shr7.highOrder,
				rotr1.lowOrder ^ rotr8.lowOrder ^ shr7.lowOrder
			);
	}

	/**
	 * The 32-bit implementation of the NIST specified Gamma1 function
	 *
	 * @private
	 * @param {number} x The 32-bit integer argument
	 * @return {number} The NIST specified output of the function
	 */
	function gamma1_32(x)
	{
		return rotr_32(x, 17) ^ rotr_32(x, 19) ^ shr_32(x, 10);
	}

	/**
	 * The 64-bit implementation of the NIST specified Gamma1 function
	 *
	 * @private
	 * @param {Int_64} x The 64-bit integer argument
	 * @return {Int_64} The NIST specified output of the function
	 */
	function gamma1_64(x)
	{
		var rotr19 = rotr_64(x, 19), rotr61 = rotr_64(x, 61),
			shr6 = shr_64(x, 6);

		return new Int_64(
				rotr19.highOrder ^ rotr61.highOrder ^ shr6.highOrder,
				rotr19.lowOrder ^ rotr61.lowOrder ^ shr6.lowOrder
			);
	}

	/**
	 * Add two 32-bit integers, wrapping at 2^32. This uses 16-bit operations
	 * internally to work around bugs in some JS interpreters.
	 *
	 * @private
	 * @param {number} a The first 32-bit integer argument to be added
	 * @param {number} b The second 32-bit integer argument to be added
	 * @return {number} The sum of a + b
	 */
	function safeAdd_32_2(a, b)
	{
		var lsw = (a & 0xFFFF) + (b & 0xFFFF),
			msw = (a >>> 16) + (b >>> 16) + (lsw >>> 16);

		return ((msw & 0xFFFF) << 16) | (lsw & 0xFFFF);
	}

	/**
	 * Add four 32-bit integers, wrapping at 2^32. This uses 16-bit operations
	 * internally to work around bugs in some JS interpreters.
	 *
	 * @private
	 * @param {number} a The first 32-bit integer argument to be added
	 * @param {number} b The second 32-bit integer argument to be added
	 * @param {number} c The third 32-bit integer argument to be added
	 * @param {number} d The fourth 32-bit integer argument to be added
	 * @return {number} The sum of a + b + c + d
	 */
	function safeAdd_32_4(a, b, c, d)
	{
		var lsw = (a & 0xFFFF) + (b & 0xFFFF) + (c & 0xFFFF) + (d & 0xFFFF),
			msw = (a >>> 16) + (b >>> 16) + (c >>> 16) + (d >>> 16) +
				(lsw >>> 16);

		return ((msw & 0xFFFF) << 16) | (lsw & 0xFFFF);
	}

	/**
	 * Add five 32-bit integers, wrapping at 2^32. This uses 16-bit operations
	 * internally to work around bugs in some JS interpreters.
	 *
	 * @private
	 * @param {number} a The first 32-bit integer argument to be added
	 * @param {number} b The second 32-bit integer argument to be added
	 * @param {number} c The third 32-bit integer argument to be added
	 * @param {number} d The fourth 32-bit integer argument to be added
	 * @param {number} e The fifth 32-bit integer argument to be added
	 * @return {number} The sum of a + b + c + d + e
	 */
	function safeAdd_32_5(a, b, c, d, e)
	{
		var lsw = (a & 0xFFFF) + (b & 0xFFFF) + (c & 0xFFFF) + (d & 0xFFFF) +
				(e & 0xFFFF),
			msw = (a >>> 16) + (b >>> 16) + (c >>> 16) + (d >>> 16) +
				(e >>> 16) + (lsw >>> 16);

		return ((msw & 0xFFFF) << 16) | (lsw & 0xFFFF);
	}

	/**
	 * Add two 64-bit integers, wrapping at 2^64. This uses 16-bit operations
	 * internally to work around bugs in some JS interpreters.
	 *
	 * @private
	 * @param {Int_64} x The first 64-bit integer argument to be added
	 * @param {Int_64} y The second 64-bit integer argument to be added
	 * @return {Int_64} The sum of x + y
	 */
	function safeAdd_64_2(x, y)
	{
		var lsw, msw, lowOrder, highOrder;

		lsw = (x.lowOrder & 0xFFFF) + (y.lowOrder & 0xFFFF);
		msw = (x.lowOrder >>> 16) + (y.lowOrder >>> 16) + (lsw >>> 16);
		lowOrder = ((msw & 0xFFFF) << 16) | (lsw & 0xFFFF);

		lsw = (x.highOrder & 0xFFFF) + (y.highOrder & 0xFFFF) + (msw >>> 16);
		msw = (x.highOrder >>> 16) + (y.highOrder >>> 16) + (lsw >>> 16);
		highOrder = ((msw & 0xFFFF) << 16) | (lsw & 0xFFFF);

		return new Int_64(highOrder, lowOrder);
	}

	/**
	 * Add four 64-bit integers, wrapping at 2^64. This uses 16-bit operations
	 * internally to work around bugs in some JS interpreters.
	 *
	 * @private
	 * @param {Int_64} a The first 64-bit integer argument to be added
	 * @param {Int_64} b The second 64-bit integer argument to be added
	 * @param {Int_64} c The third 64-bit integer argument to be added
	 * @param {Int_64} d The fouth 64-bit integer argument to be added
	 * @return {Int_64} The sum of a + b + c + d
	 */
	function safeAdd_64_4(a, b, c, d)
	{
		var lsw, msw, lowOrder, highOrder;

		lsw = (a.lowOrder & 0xFFFF) + (b.lowOrder & 0xFFFF) +
			(c.lowOrder & 0xFFFF) + (d.lowOrder & 0xFFFF);
		msw = (a.lowOrder >>> 16) + (b.lowOrder >>> 16) +
			(c.lowOrder >>> 16) + (d.lowOrder >>> 16) + (lsw >>> 16);
		lowOrder = ((msw & 0xFFFF) << 16) | (lsw & 0xFFFF);

		lsw = (a.highOrder & 0xFFFF) + (b.highOrder & 0xFFFF) +
			(c.highOrder & 0xFFFF) + (d.highOrder & 0xFFFF) + (msw >>> 16);
		msw = (a.highOrder >>> 16) + (b.highOrder >>> 16) +
			(c.highOrder >>> 16) + (d.highOrder >>> 16) + (lsw >>> 16);
		highOrder = ((msw & 0xFFFF) << 16) | (lsw & 0xFFFF);

		return new Int_64(highOrder, lowOrder);
	}

	/**
	 * Add five 64-bit integers, wrapping at 2^64. This uses 16-bit operations
	 * internally to work around bugs in some JS interpreters.
	 *
	 * @private
	 * @param {Int_64} a The first 64-bit integer argument to be added
	 * @param {Int_64} b The second 64-bit integer argument to be added
	 * @param {Int_64} c The third 64-bit integer argument to be added
	 * @param {Int_64} d The fouth 64-bit integer argument to be added
	 * @param {Int_64} e The fouth 64-bit integer argument to be added
	 * @return {Int_64} The sum of a + b + c + d + e
	 */
	function safeAdd_64_5(a, b, c, d, e)
	{
		var lsw, msw, lowOrder, highOrder;

		lsw = (a.lowOrder & 0xFFFF) + (b.lowOrder & 0xFFFF) +
			(c.lowOrder & 0xFFFF) + (d.lowOrder & 0xFFFF) +
			(e.lowOrder & 0xFFFF);
		msw = (a.lowOrder >>> 16) + (b.lowOrder >>> 16) +
			(c.lowOrder >>> 16) + (d.lowOrder >>> 16) + (e.lowOrder >>> 16) +
			(lsw >>> 16);
		lowOrder = ((msw & 0xFFFF) << 16) | (lsw & 0xFFFF);

		lsw = (a.highOrder & 0xFFFF) + (b.highOrder & 0xFFFF) +
			(c.highOrder & 0xFFFF) + (d.highOrder & 0xFFFF) +
			(e.highOrder & 0xFFFF) + (msw >>> 16);
		msw = (a.highOrder >>> 16) + (b.highOrder >>> 16) +
			(c.highOrder >>> 16) + (d.highOrder >>> 16) +
			(e.highOrder >>> 16) + (lsw >>> 16);
		highOrder = ((msw & 0xFFFF) << 16) | (lsw & 0xFFFF);

		return new Int_64(highOrder, lowOrder);
	}

	/**
	 * Calculates the SHA-1 hash of the string set at instantiation
	 *
	 * @private
	 * @param {Array.<number>} message The binary array representation of the
	 *   string to hash
	 * @param {number} messageLen The number of bits in the message
	 * @return {Array.<number>} The array of integers representing the SHA-1
	 *   hash of message
	 */
	function coreSHA1(message, messageLen)
	{
		var W = [], a, b, c, d, e, T, ch = ch_32, parity = parity_32,
			maj = maj_32, rotl = rotl_32, safeAdd_2 = safeAdd_32_2, i, t,
			safeAdd_5 = safeAdd_32_5, appendedMessageLength,
			H = [
				0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476, 0xc3d2e1f0
			];

		/* Append '1' at the end of the binary string */
		message[messageLen >>> 5] |= 0x80 << (24 - (messageLen % 32));
		/* Append length of binary string in the position such that the new
		length is a multiple of 512.  Logic does not work for even multiples
		of 512 but there can never be even multiples of 512 */
		message[(((messageLen + 65) >>> 9) << 4) + 15] = messageLen;

		appendedMessageLength = message.length;

		for (i = 0; i < appendedMessageLength; i += 16)
		{
			a = H[0];
			b = H[1];
			c = H[2];
			d = H[3];
			e = H[4];

			for (t = 0; t < 80; t += 1)
			{
				if (t < 16)
				{
					W[t] = message[t + i];
				}
				else
				{
					W[t] = rotl(W[t - 3] ^ W[t - 8] ^ W[t - 14] ^ W[t - 16], 1);
				}

				if (t < 20)
				{
					T = safeAdd_5(rotl(a, 5), ch(b, c, d), e, 0x5a827999, W[t]);
				}
				else if (t < 40)
				{
					T = safeAdd_5(rotl(a, 5), parity(b, c, d), e, 0x6ed9eba1, W[t]);
				}
				else if (t < 60)
				{
					T = safeAdd_5(rotl(a, 5), maj(b, c, d), e, 0x8f1bbcdc, W[t]);
				} else {
					T = safeAdd_5(rotl(a, 5), parity(b, c, d), e, 0xca62c1d6, W[t]);
				}

				e = d;
				d = c;
				c = rotl(b, 30);
				b = a;
				a = T;
			}

			H[0] = safeAdd_2(a, H[0]);
			H[1] = safeAdd_2(b, H[1]);
			H[2] = safeAdd_2(c, H[2]);
			H[3] = safeAdd_2(d, H[3]);
			H[4] = safeAdd_2(e, H[4]);
		}

		return H;
	}

	/**
	 * Calculates the desired SHA-2 hash of the string set at instantiation
	 *
	 * @private
	 * @param {Array.<number>} message The binary array representation of the
	 *   string to hash
	 * @param {number} messageLen The number of bits in message
	 * @param {string} variant The desired SHA-2 variant
	 * @return {Array.<number>} The array of integers representing the SHA-2
	 *   hash of message
	 */
	function coreSHA2(message, messageLen, variant)
	{
		var a, b, c, d, e, f, g, h, T1, T2, H, numRounds, lengthPosition, i, t,
			binaryStringInc, binaryStringMult, safeAdd_2, safeAdd_4, safeAdd_5,
			gamma0, gamma1, sigma0, sigma1, ch, maj, Int, W = [],
			appendedMessageLength, retVal,
			K = [
				0x428A2F98, 0x71374491, 0xB5C0FBCF, 0xE9B5DBA5,
				0x3956C25B, 0x59F111F1, 0x923F82A4, 0xAB1C5ED5,
				0xD807AA98, 0x12835B01, 0x243185BE, 0x550C7DC3,
				0x72BE5D74, 0x80DEB1FE, 0x9BDC06A7, 0xC19BF174,
				0xE49B69C1, 0xEFBE4786, 0x0FC19DC6, 0x240CA1CC,
				0x2DE92C6F, 0x4A7484AA, 0x5CB0A9DC, 0x76F988DA,
				0x983E5152, 0xA831C66D, 0xB00327C8, 0xBF597FC7,
				0xC6E00BF3, 0xD5A79147, 0x06CA6351, 0x14292967,
				0x27B70A85, 0x2E1B2138, 0x4D2C6DFC, 0x53380D13,
				0x650A7354, 0x766A0ABB, 0x81C2C92E, 0x92722C85,
				0xA2BFE8A1, 0xA81A664B, 0xC24B8B70, 0xC76C51A3,
				0xD192E819, 0xD6990624, 0xF40E3585, 0x106AA070,
				0x19A4C116, 0x1E376C08, 0x2748774C, 0x34B0BCB5,
				0x391C0CB3, 0x4ED8AA4A, 0x5B9CCA4F, 0x682E6FF3,
				0x748F82EE, 0x78A5636F, 0x84C87814, 0x8CC70208,
				0x90BEFFFA, 0xA4506CEB, 0xBEF9A3F7, 0xC67178F2
			],
			H_trunc = [
				0xc1059ed8, 0x367cd507, 0x3070dd17, 0xf70e5939,
				0xffc00b31, 0x68581511, 0x64f98fa7, 0xbefa4fa4
			],
			H_full = [
				0x6A09E667, 0xBB67AE85, 0x3C6EF372, 0xA54FF53A,
				0x510E527F, 0x9B05688C, 0x1F83D9AB, 0x5BE0CD19
			];

		/* Set up the various function handles and variable for the specific
		 * variant */
		if ((variant === "SHA-224" || variant === "SHA-256") &&
			(2 & SUPPORTED_ALGS))
		{
			/* 32-bit variant */
			numRounds = 64;
			lengthPosition = (((messageLen + 65) >>> 9) << 4) + 15;
			binaryStringInc = 16;
			binaryStringMult = 1;
			Int = Number;
			safeAdd_2 = safeAdd_32_2;
			safeAdd_4 = safeAdd_32_4;
			safeAdd_5 = safeAdd_32_5;
			gamma0 = gamma0_32;
			gamma1 = gamma1_32;
			sigma0 = sigma0_32;
			sigma1 = sigma1_32;
			maj = maj_32;
			ch = ch_32;

			if ("SHA-224" === variant)
			{
				H = H_trunc;
			}
			else /* "SHA-256" === variant */
			{
				H = H_full;
			}
		}
		else if ((variant === "SHA-384" || variant === "SHA-512") &&
			(4 & SUPPORTED_ALGS))
		{
			/* 64-bit variant */
			numRounds = 80;
			lengthPosition = (((messageLen + 128) >>> 10) << 5) + 31;
			binaryStringInc = 32;
			binaryStringMult = 2;
			Int = Int_64;
			safeAdd_2 = safeAdd_64_2;
			safeAdd_4 = safeAdd_64_4;
			safeAdd_5 = safeAdd_64_5;
			gamma0 = gamma0_64;
			gamma1 = gamma1_64;
			sigma0 = sigma0_64;
			sigma1 = sigma1_64;
			maj = maj_64;
			ch = ch_64;

			K = [
				new Int(K[ 0], 0xd728ae22), new Int(K[ 1], 0x23ef65cd),
				new Int(K[ 2], 0xec4d3b2f), new Int(K[ 3], 0x8189dbbc),
				new Int(K[ 4], 0xf348b538), new Int(K[ 5], 0xb605d019),
				new Int(K[ 6], 0xaf194f9b), new Int(K[ 7], 0xda6d8118),
				new Int(K[ 8], 0xa3030242), new Int(K[ 9], 0x45706fbe),
				new Int(K[10], 0x4ee4b28c), new Int(K[11], 0xd5ffb4e2),
				new Int(K[12], 0xf27b896f), new Int(K[13], 0x3b1696b1),
				new Int(K[14], 0x25c71235), new Int(K[15], 0xcf692694),
				new Int(K[16], 0x9ef14ad2), new Int(K[17], 0x384f25e3),
				new Int(K[18], 0x8b8cd5b5), new Int(K[19], 0x77ac9c65),
				new Int(K[20], 0x592b0275), new Int(K[21], 0x6ea6e483),
				new Int(K[22], 0xbd41fbd4), new Int(K[23], 0x831153b5),
				new Int(K[24], 0xee66dfab), new Int(K[25], 0x2db43210),
				new Int(K[26], 0x98fb213f), new Int(K[27], 0xbeef0ee4),
				new Int(K[28], 0x3da88fc2), new Int(K[29], 0x930aa725),
				new Int(K[30], 0xe003826f), new Int(K[31], 0x0a0e6e70),
				new Int(K[32], 0x46d22ffc), new Int(K[33], 0x5c26c926),
				new Int(K[34], 0x5ac42aed), new Int(K[35], 0x9d95b3df),
				new Int(K[36], 0x8baf63de), new Int(K[37], 0x3c77b2a8),
				new Int(K[38], 0x47edaee6), new Int(K[39], 0x1482353b),
				new Int(K[40], 0x4cf10364), new Int(K[41], 0xbc423001),
				new Int(K[42], 0xd0f89791), new Int(K[43], 0x0654be30),
				new Int(K[44], 0xd6ef5218), new Int(K[45], 0x5565a910),
				new Int(K[46], 0x5771202a), new Int(K[47], 0x32bbd1b8),
				new Int(K[48], 0xb8d2d0c8), new Int(K[49], 0x5141ab53),
				new Int(K[50], 0xdf8eeb99), new Int(K[51], 0xe19b48a8),
				new Int(K[52], 0xc5c95a63), new Int(K[53], 0xe3418acb),
				new Int(K[54], 0x7763e373), new Int(K[55], 0xd6b2b8a3),
				new Int(K[56], 0x5defb2fc), new Int(K[57], 0x43172f60),
				new Int(K[58], 0xa1f0ab72), new Int(K[59], 0x1a6439ec),
				new Int(K[60], 0x23631e28), new Int(K[61], 0xde82bde9),
				new Int(K[62], 0xb2c67915), new Int(K[63], 0xe372532b),
				new Int(0xca273ece, 0xea26619c), new Int(0xd186b8c7, 0x21c0c207),
				new Int(0xeada7dd6, 0xcde0eb1e), new Int(0xf57d4f7f, 0xee6ed178),
				new Int(0x06f067aa, 0x72176fba), new Int(0x0a637dc5, 0xa2c898a6),
				new Int(0x113f9804, 0xbef90dae), new Int(0x1b710b35, 0x131c471b),
				new Int(0x28db77f5, 0x23047d84), new Int(0x32caab7b, 0x40c72493),
				new Int(0x3c9ebe0a, 0x15c9bebc), new Int(0x431d67c4, 0x9c100d4c),
				new Int(0x4cc5d4be, 0xcb3e42b6), new Int(0x597f299c, 0xfc657e2a),
				new Int(0x5fcb6fab, 0x3ad6faec), new Int(0x6c44198c, 0x4a475817)
			];

			if ("SHA-384" === variant)
			{
				H = [
					new Int(0xcbbb9d5d, H_trunc[0]), new Int(0x0629a292a, H_trunc[1]),
					new Int(0x9159015a, H_trunc[2]), new Int(0x0152fecd8, H_trunc[3]),
					new Int(0x67332667, H_trunc[4]), new Int(0x98eb44a87, H_trunc[5]),
					new Int(0xdb0c2e0d, H_trunc[6]), new Int(0x047b5481d, H_trunc[7])
				];
			}
			else /* "SHA-512" === variant */
			{
				H = [
					new Int(H_full[0], 0xf3bcc908), new Int(H_full[1], 0x84caa73b),
					new Int(H_full[2], 0xfe94f82b), new Int(H_full[3], 0x5f1d36f1),
					new Int(H_full[4], 0xade682d1), new Int(H_full[5], 0x2b3e6c1f),
					new Int(H_full[6], 0xfb41bd6b), new Int(H_full[7], 0x137e2179)
				];
			}
		}
		else
		{
			throw "Unexpected error in SHA-2 implementation";
		}

		/* Append '1' at the end of the binary string */
		message[messageLen >>> 5] |= 0x80 << (24 - messageLen % 32);
		/* Append length of binary string in the position such that the new
		 * length is correct */
		message[lengthPosition] = messageLen;

		appendedMessageLength = message.length;

		for (i = 0; i < appendedMessageLength; i += binaryStringInc)
		{
			a = H[0];
			b = H[1];
			c = H[2];
			d = H[3];
			e = H[4];
			f = H[5];
			g = H[6];
			h = H[7];

			for (t = 0; t < numRounds; t += 1)
			{
				if (t < 16)
				{
					/* Bit of a hack - for 32-bit, the second term is ignored */
					W[t] = new Int(message[t * binaryStringMult + i],
							message[t * binaryStringMult + i + 1]);
				}
				else
				{
					W[t] = safeAdd_4(
							gamma1(W[t - 2]), W[t - 7],
							gamma0(W[t - 15]), W[t - 16]
						);
				}

				T1 = safeAdd_5(h, sigma1(e), ch(e, f, g), K[t], W[t]);
				T2 = safeAdd_2(sigma0(a), maj(a, b, c));
				h = g;
				g = f;
				f = e;
				e = safeAdd_2(d, T1);
				d = c;
				c = b;
				b = a;
				a = safeAdd_2(T1, T2);

			}

			H[0] = safeAdd_2(a, H[0]);
			H[1] = safeAdd_2(b, H[1]);
			H[2] = safeAdd_2(c, H[2]);
			H[3] = safeAdd_2(d, H[3]);
			H[4] = safeAdd_2(e, H[4]);
			H[5] = safeAdd_2(f, H[5]);
			H[6] = safeAdd_2(g, H[6]);
			H[7] = safeAdd_2(h, H[7]);
		}

		if (("SHA-224" === variant) && (2 & SUPPORTED_ALGS))
		{
			retVal = [
				H[0], H[1], H[2], H[3],
				H[4], H[5], H[6]
			];
		}
		else if (("SHA-256" === variant) && (2 & SUPPORTED_ALGS))
		{
			retVal = H;
		}
		else if (("SHA-384" === variant) && (4 & SUPPORTED_ALGS))
		{
			retVal = [
				H[0].highOrder, H[0].lowOrder,
				H[1].highOrder, H[1].lowOrder,
				H[2].highOrder, H[2].lowOrder,
				H[3].highOrder, H[3].lowOrder,
				H[4].highOrder, H[4].lowOrder,
				H[5].highOrder, H[5].lowOrder
			];
		}
		else if (("SHA-512" === variant) && (4 & SUPPORTED_ALGS))
		{
			retVal = [
				H[0].highOrder, H[0].lowOrder,
				H[1].highOrder, H[1].lowOrder,
				H[2].highOrder, H[2].lowOrder,
				H[3].highOrder, H[3].lowOrder,
				H[4].highOrder, H[4].lowOrder,
				H[5].highOrder, H[5].lowOrder,
				H[6].highOrder, H[6].lowOrder,
				H[7].highOrder, H[7].lowOrder
			];
		}
		else /* This should never be reached */
		{
			throw "Unexpected error in SHA-2 implementation";
		}

		return retVal;
	}

	/**
	 * jsSHA is the workhorse of the library.  Instantiate it with the string to
	 * be hashed as the parameter
	 *
	 * @constructor
	 * @this {jsSHA}
	 * @param {string} srcString The string to be hashed
	 * @param {string} inputFormat The format of srcString, HEX, TEXT, or ASCII
	 * @param {string=} encoding The text encoding to use to encode the source
	 *   string
	 */
	var jsSHA = function(srcString, inputFormat, encoding)
	{
		var strBinLen = 0, strToHash = [0], utfType = '', srcConvertRet = null;

		utfType = encoding || "UTF8";

		if (!(("UTF8" === utfType) || ("UTF16" === utfType)))
		{
			throw "encoding must be UTF8 or UTF16";
		}

		/* Convert the input string into the correct type */
		if ("HEX" === inputFormat)
		{
			if (0 !== (srcString.length % 2))
			{
				throw "srcString of HEX type must be in byte increments";
			}
			srcConvertRet = hex2binb(srcString);
			strBinLen = srcConvertRet["binLen"];
			strToHash = srcConvertRet["value"];
		}
		else if (("ASCII" === inputFormat) || ("TEXT" === inputFormat))
		{
			srcConvertRet = str2binb(srcString, utfType);
			strBinLen = srcConvertRet["binLen"];
			strToHash = srcConvertRet["value"];
		}
		else if ("B64" === inputFormat)
		{
			srcConvertRet = b642binb(srcString);
			strBinLen = srcConvertRet["binLen"];
			strToHash = srcConvertRet["value"];
		}
		else
		{
			throw "inputFormat must be HEX, TEXT, ASCII, or B64";
		}

		/**
		 * Returns the desired SHA hash of the string specified at instantiation
		 * using the specified parameters
		 *
		 * @expose
		 * @param {string} variant The desired SHA variant (SHA-1, SHA-224,
		 *	 SHA-256, SHA-384, or SHA-512)
		 * @param {string} format The desired output formatting (B64 or HEX)
		 * @param {number=} numRounds The number of rounds of hashing to be
		 *   executed
		 * @param {{outputUpper : boolean, b64Pad : string}=} outputFormatOpts
		 *   Hash list of output formatting options
		 * @return {string} The string representation of the hash in the format
		 *   specified
		 */
		this.getHash = function(variant, format, numRounds, outputFormatOpts)
		{
			var formatFunc = null, message = strToHash.slice(),
				messageBinLen = strBinLen, i;

			/* Need to do argument patching since both numRounds and
			   outputFormatOpts are optional */
			if (3 === arguments.length)
			{
				if ("number" !== typeof numRounds)
				{
					outputFormatOpts = numRounds;
					numRounds = 1;
				}
			}
			else if (2 === arguments.length)
			{
				numRounds = 1;
			}

			/* Validate the numRounds argument */
			if ((numRounds !== parseInt(numRounds, 10)) || (1 > numRounds))
			{
				throw "numRounds must a integer >= 1";
			}

			/* Validate the output format selection */
			switch (format)
			{
			case "HEX":
				formatFunc = binb2hex;
				break;
			case "B64":
				formatFunc = binb2b64;
				break;
			default:
				throw "format must be HEX or B64";
			}

			if (("SHA-1" === variant) && (1 & SUPPORTED_ALGS))
			{
				for (i = 0; i < numRounds; i++)
				{
					message = coreSHA1(message, messageBinLen);
					messageBinLen = 160;
				}
			}
			else if (("SHA-224" === variant) && (2 & SUPPORTED_ALGS))
			{
				for (i = 0; i < numRounds; i++)
				{
					message = coreSHA2(message, messageBinLen, variant);
					messageBinLen = 224;
				}
			}
			else if (("SHA-256" === variant) && (2 & SUPPORTED_ALGS))
			{
				for (i = 0; i < numRounds; i++)
				{
					message = coreSHA2(message, messageBinLen, variant);
					messageBinLen = 256;
				}
			}
			else if (("SHA-384" === variant) && (4 & SUPPORTED_ALGS))
			{
				for (i = 0; i < numRounds; i++)
				{
					message = coreSHA2(message, messageBinLen, variant);
					messageBinLen = 384;
				}
			}
			else if (("SHA-512" === variant) && (4 & SUPPORTED_ALGS))
			{
				for (i = 0; i < numRounds; i++)
				{
					message = coreSHA2(message, messageBinLen, variant);
					messageBinLen = 512;
				}
			}
			else
			{
				throw "Chosen SHA variant is not supported";
			}

			return formatFunc(message, getOutputOpts(outputFormatOpts));
		};

		/**
		 * Returns the desired HMAC of the string specified at instantiation
		 * using the key and variant parameter
		 *
		 * @expose
		 * @param {string} key The key used to calculate the HMAC
		 * @param {string} inputFormat The format of key, HEX or TEXT or ASCII
		 * @param {string} variant The desired SHA variant (SHA-1, SHA-224,
		 *	 SHA-256, SHA-384, or SHA-512)
		 * @param {string} outputFormat The desired output formatting
		 *   (B64 or HEX)
		 * @param {{outputUpper : boolean, b64Pad : string}=} outputFormatOpts
		 *   associative array of output formatting options
		 * @return {string} The string representation of the hash in the format
		 *   specified
		 */
		this.getHMAC = function(key, inputFormat, variant, outputFormat,
			outputFormatOpts)
		{
			var formatFunc, keyToUse, blockByteSize, blockBitSize, i,
				retVal, lastArrayIndex, keyBinLen, hashBitSize,
				keyWithIPad = [], keyWithOPad = [], keyConvertRet = null;

			/* Validate the output format selection */
			switch (outputFormat)
			{
			case "HEX":
				formatFunc = binb2hex;
				break;
			case "B64":
				formatFunc = binb2b64;
				break;
			default:
				throw "outputFormat must be HEX or B64";
			}

			/* Validate the hash variant selection and set needed variables */
			if (("SHA-1" === variant) && (1 & SUPPORTED_ALGS))
			{
				blockByteSize = 64;
				hashBitSize = 160;
			}
			else if (("SHA-224" === variant) && (2 & SUPPORTED_ALGS))
			{
				blockByteSize = 64;
				hashBitSize = 224;
			}
			else if (("SHA-256" === variant) && (2 & SUPPORTED_ALGS))
			{
				blockByteSize = 64;
				hashBitSize = 256;
			}
			else if (("SHA-384" === variant) && (4 & SUPPORTED_ALGS))
			{
				blockByteSize = 128;
				hashBitSize = 384;
			}
			else if (("SHA-512" === variant) && (4 & SUPPORTED_ALGS))
			{
				blockByteSize = 128;
				hashBitSize = 512;
			}
			else
			{
				throw "Chosen SHA variant is not supported";
			}

			/* Validate input format selection */
			if ("HEX" === inputFormat)
			{
				keyConvertRet = hex2binb(key);
				keyBinLen = keyConvertRet["binLen"];
				keyToUse = keyConvertRet["value"];
			}
			else if (("ASCII" === inputFormat) || ("TEXT" === inputFormat))
			{
				keyConvertRet = str2binb(key, utfType);
				keyBinLen = keyConvertRet["binLen"];
				keyToUse = keyConvertRet["value"];
			}
			else if ("B64" === inputFormat)
			{
				keyConvertRet = b642binb(key);
				keyBinLen = keyConvertRet["binLen"];
				keyToUse = keyConvertRet["value"];
			}
			else
			{
				throw "inputFormat must be HEX, TEXT, ASCII, or B64";
			}

			/* These are used multiple times, calculate and store them */
			blockBitSize = blockByteSize * 8;
			lastArrayIndex = (blockByteSize / 4) - 1;

			/* Figure out what to do with the key based on its size relative to
			 * the hash's block size */
			if (blockByteSize < (keyBinLen / 8))
			{
				if (("SHA-1" === variant) && (1 & SUPPORTED_ALGS))
				{
					keyToUse = coreSHA1(keyToUse, keyBinLen);
				}
				else if (6 & SUPPORTED_ALGS)
				{
					keyToUse = coreSHA2(keyToUse, keyBinLen, variant);
				}
				else
				{
					throw "Unexpected error in HMAC implementation";
				}
				/* For all variants, the block size is bigger than the output
				 * size so there will never be a useful byte at the end of the
				 * string */
				keyToUse[lastArrayIndex] &= 0xFFFFFF00;
			}
			else if (blockByteSize > (keyBinLen / 8))
			{
				/* If the blockByteSize is greater than the key length, there
				 * will always be at LEAST one "useless" byte at the end of the
				 * string */
				keyToUse[lastArrayIndex] &= 0xFFFFFF00;
			}

			/* Create ipad and opad */
			for (i = 0; i <= lastArrayIndex; i += 1)
			{
				keyWithIPad[i] = keyToUse[i] ^ 0x36363636;
				keyWithOPad[i] = keyToUse[i] ^ 0x5C5C5C5C;
			}

			/* Calculate the HMAC */
			if (("SHA-1" === variant) && (1 & SUPPORTED_ALGS))
			{
				retVal = coreSHA1(
					keyWithOPad.concat(
						coreSHA1(
							keyWithIPad.concat(strToHash),
							blockBitSize + strBinLen
						)
					),
					blockBitSize + hashBitSize);
			}
			else if (6 & SUPPORTED_ALGS)
			{
				retVal = coreSHA2(
					keyWithOPad.concat(
						coreSHA2(
							keyWithIPad.concat(strToHash),
							blockBitSize + strBinLen,
							variant
						)
					),
					blockBitSize + hashBitSize, variant);
			}
			else
			{
				throw "Unexpected error in HMAC implementation";
			}

			return formatFunc(retVal, getOutputOpts(outputFormatOpts));
		};
	};

	if (("function" === typeof define) && (typeof define["amd"])) /* AMD Support */
	{
		define(function()
		{
			return jsSHA;
		});
	} else if ("undefined" !== typeof exports) /* Node Support */
	{
		if (("undefined" !== typeof module) && module["exports"])
		{
		  module["exports"] = exports = jsSHA;
		}
		else {
			exports = jsSHA;
		}
	} else { /* Browsers and Web Workers*/
		global["jsSHA"] = jsSHA;
	}
}(this));
/* jQuery v1.7.2 jquery.com | jquery.org/license */
(function(a,b){function cy(a){return f.isWindow(a)?a:a.nodeType===9?a.defaultView||a.parentWindow:!1}function cu(a){if(!cj[a]){var b=c.body,d=f("<"+a+">").appendTo(b),e=d.css("display");d.remove();if(e==="none"||e===""){ck||(ck=c.createElement("iframe"),ck.frameBorder=ck.width=ck.height=0),b.appendChild(ck);if(!cl||!ck.createElement)cl=(ck.contentWindow||ck.contentDocument).document,cl.write((f.support.boxModel?"<!doctype html>":"")+"<html><body>"),cl.close();d=cl.createElement(a),cl.body.appendChild(d),e=f.css(d,"display"),b.removeChild(ck)}cj[a]=e}return cj[a]}function ct(a,b){var c={};f.each(cp.concat.apply([],cp.slice(0,b)),function(){c[this]=a});return c}function cs(){cq=b}function cr(){setTimeout(cs,0);return cq=f.now()}function ci(){try{return new a.ActiveXObject("Microsoft.XMLHTTP")}catch(b){}}function ch(){try{return new a.XMLHttpRequest}catch(b){}}function cb(a,c){a.dataFilter&&(c=a.dataFilter(c,a.dataType));var d=a.dataTypes,e={},g,h,i=d.length,j,k=d[0],l,m,n,o,p;for(g=1;g<i;g++){if(g===1)for(h in a.converters)typeof h=="string"&&(e[h.toLowerCase()]=a.converters[h]);l=k,k=d[g];if(k==="*")k=l;else if(l!=="*"&&l!==k){m=l+" "+k,n=e[m]||e["* "+k];if(!n){p=b;for(o in e){j=o.split(" ");if(j[0]===l||j[0]==="*"){p=e[j[1]+" "+k];if(p){o=e[o],o===!0?n=p:p===!0&&(n=o);break}}}}!n&&!p&&f.error("No conversion from "+m.replace(" "," to ")),n!==!0&&(c=n?n(c):p(o(c)))}}return c}function ca(a,c,d){var e=a.contents,f=a.dataTypes,g=a.responseFields,h,i,j,k;for(i in g)i in d&&(c[g[i]]=d[i]);while(f[0]==="*")f.shift(),h===b&&(h=a.mimeType||c.getResponseHeader("content-type"));if(h)for(i in e)if(e[i]&&e[i].test(h)){f.unshift(i);break}if(f[0]in d)j=f[0];else{for(i in d){if(!f[0]||a.converters[i+" "+f[0]]){j=i;break}k||(k=i)}j=j||k}if(j){j!==f[0]&&f.unshift(j);return d[j]}}function b_(a,b,c,d){if(f.isArray(b))f.each(b,function(b,e){c||bD.test(a)?d(a,e):b_(a+"["+(typeof e=="object"?b:"")+"]",e,c,d)});else if(!c&&f.type(b)==="object")for(var e in b)b_(a+"["+e+"]",b[e],c,d);else d(a,b)}function b$(a,c){var d,e,g=f.ajaxSettings.flatOptions||{};for(d in c)c[d]!==b&&((g[d]?a:e||(e={}))[d]=c[d]);e&&f.extend(!0,a,e)}function bZ(a,c,d,e,f,g){f=f||c.dataTypes[0],g=g||{},g[f]=!0;var h=a[f],i=0,j=h?h.length:0,k=a===bS,l;for(;i<j&&(k||!l);i++)l=h[i](c,d,e),typeof l=="string"&&(!k||g[l]?l=b:(c.dataTypes.unshift(l),l=bZ(a,c,d,e,l,g)));(k||!l)&&!g["*"]&&(l=bZ(a,c,d,e,"*",g));return l}function bY(a){return function(b,c){typeof b!="string"&&(c=b,b="*");if(f.isFunction(c)){var d=b.toLowerCase().split(bO),e=0,g=d.length,h,i,j;for(;e<g;e++)h=d[e],j=/^\+/.test(h),j&&(h=h.substr(1)||"*"),i=a[h]=a[h]||[],i[j?"unshift":"push"](c)}}}function bB(a,b,c){var d=b==="width"?a.offsetWidth:a.offsetHeight,e=b==="width"?1:0,g=4;if(d>0){if(c!=="border")for(;e<g;e+=2)c||(d-=parseFloat(f.css(a,"padding"+bx[e]))||0),c==="margin"?d+=parseFloat(f.css(a,c+bx[e]))||0:d-=parseFloat(f.css(a,"border"+bx[e]+"Width"))||0;return d+"px"}d=by(a,b);if(d<0||d==null)d=a.style[b];if(bt.test(d))return d;d=parseFloat(d)||0;if(c)for(;e<g;e+=2)d+=parseFloat(f.css(a,"padding"+bx[e]))||0,c!=="padding"&&(d+=parseFloat(f.css(a,"border"+bx[e]+"Width"))||0),c==="margin"&&(d+=parseFloat(f.css(a,c+bx[e]))||0);return d+"px"}function bo(a){var b=c.createElement("div");bh.appendChild(b),b.innerHTML=a.outerHTML;return b.firstChild}function bn(a){var b=(a.nodeName||"").toLowerCase();b==="input"?bm(a):b!=="script"&&typeof a.getElementsByTagName!="undefined"&&f.grep(a.getElementsByTagName("input"),bm)}function bm(a){if(a.type==="checkbox"||a.type==="radio")a.defaultChecked=a.checked}function bl(a){return typeof a.getElementsByTagName!="undefined"?a.getElementsByTagName("*"):typeof a.querySelectorAll!="undefined"?a.querySelectorAll("*"):[]}function bk(a,b){var c;b.nodeType===1&&(b.clearAttributes&&b.clearAttributes(),b.mergeAttributes&&b.mergeAttributes(a),c=b.nodeName.toLowerCase(),c==="object"?b.outerHTML=a.outerHTML:c!=="input"||a.type!=="checkbox"&&a.type!=="radio"?c==="option"?b.selected=a.defaultSelected:c==="input"||c==="textarea"?b.defaultValue=a.defaultValue:c==="script"&&b.text!==a.text&&(b.text=a.text):(a.checked&&(b.defaultChecked=b.checked=a.checked),b.value!==a.value&&(b.value=a.value)),b.removeAttribute(f.expando),b.removeAttribute("_submit_attached"),b.removeAttribute("_change_attached"))}function bj(a,b){if(b.nodeType===1&&!!f.hasData(a)){var c,d,e,g=f._data(a),h=f._data(b,g),i=g.events;if(i){delete h.handle,h.events={};for(c in i)for(d=0,e=i[c].length;d<e;d++)f.event.add(b,c,i[c][d])}h.data&&(h.data=f.extend({},h.data))}}function bi(a,b){return f.nodeName(a,"table")?a.getElementsByTagName("tbody")[0]||a.appendChild(a.ownerDocument.createElement("tbody")):a}function U(a){var b=V.split("|"),c=a.createDocumentFragment();if(c.createElement)while(b.length)c.createElement(b.pop());return c}function T(a,b,c){b=b||0;if(f.isFunction(b))return f.grep(a,function(a,d){var e=!!b.call(a,d,a);return e===c});if(b.nodeType)return f.grep(a,function(a,d){return a===b===c});if(typeof b=="string"){var d=f.grep(a,function(a){return a.nodeType===1});if(O.test(b))return f.filter(b,d,!c);b=f.filter(b,d)}return f.grep(a,function(a,d){return f.inArray(a,b)>=0===c})}function S(a){return!a||!a.parentNode||a.parentNode.nodeType===11}function K(){return!0}function J(){return!1}function n(a,b,c){var d=b+"defer",e=b+"queue",g=b+"mark",h=f._data(a,d);h&&(c==="queue"||!f._data(a,e))&&(c==="mark"||!f._data(a,g))&&setTimeout(function(){!f._data(a,e)&&!f._data(a,g)&&(f.removeData(a,d,!0),h.fire())},0)}function m(a){for(var b in a){if(b==="data"&&f.isEmptyObject(a[b]))continue;if(b!=="toJSON")return!1}return!0}function l(a,c,d){if(d===b&&a.nodeType===1){var e="data-"+c.replace(k,"-$1").toLowerCase();d=a.getAttribute(e);if(typeof d=="string"){try{d=d==="true"?!0:d==="false"?!1:d==="null"?null:f.isNumeric(d)?+d:j.test(d)?f.parseJSON(d):d}catch(g){}f.data(a,c,d)}else d=b}return d}function h(a){var b=g[a]={},c,d;a=a.split(/\s+/);for(c=0,d=a.length;c<d;c++)b[a[c]]=!0;return b}var c=a.document,d=a.navigator,e=a.location,f=function(){function J(){if(!e.isReady){try{c.documentElement.doScroll("left")}catch(a){setTimeout(J,1);return}e.ready()}}var e=function(a,b){return new e.fn.init(a,b,h)},f=a.jQuery,g=a.$,h,i=/^(?:[^#<]*(<[\w\W]+>)[^>]*$|#([\w\-]*)$)/,j=/\S/,k=/^\s+/,l=/\s+$/,m=/^<(\w+)\s*\/?>(?:<\/\1>)?$/,n=/^[\],:{}\s]*$/,o=/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,p=/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,q=/(?:^|:|,)(?:\s*\[)+/g,r=/(webkit)[ \/]([\w.]+)/,s=/(opera)(?:.*version)?[ \/]([\w.]+)/,t=/(msie) ([\w.]+)/,u=/(mozilla)(?:.*? rv:([\w.]+))?/,v=/-([a-z]|[0-9])/ig,w=/^-ms-/,x=function(a,b){return(b+"").toUpperCase()},y=d.userAgent,z,A,B,C=Object.prototype.toString,D=Object.prototype.hasOwnProperty,E=Array.prototype.push,F=Array.prototype.slice,G=String.prototype.trim,H=Array.prototype.indexOf,I={};e.fn=e.prototype={constructor:e,init:function(a,d,f){var g,h,j,k;if(!a)return this;if(a.nodeType){this.context=this[0]=a,this.length=1;return this}if(a==="body"&&!d&&c.body){this.context=c,this[0]=c.body,this.selector=a,this.length=1;return this}if(typeof a=="string"){a.charAt(0)!=="<"||a.charAt(a.length-1)!==">"||a.length<3?g=i.exec(a):g=[null,a,null];if(g&&(g[1]||!d)){if(g[1]){d=d instanceof e?d[0]:d,k=d?d.ownerDocument||d:c,j=m.exec(a),j?e.isPlainObject(d)?(a=[c.createElement(j[1])],e.fn.attr.call(a,d,!0)):a=[k.createElement(j[1])]:(j=e.buildFragment([g[1]],[k]),a=(j.cacheable?e.clone(j.fragment):j.fragment).childNodes);return e.merge(this,a)}h=c.getElementById(g[2]);if(h&&h.parentNode){if(h.id!==g[2])return f.find(a);this.length=1,this[0]=h}this.context=c,this.selector=a;return this}return!d||d.jquery?(d||f).find(a):this.constructor(d).find(a)}if(e.isFunction(a))return f.ready(a);a.selector!==b&&(this.selector=a.selector,this.context=a.context);return e.makeArray(a,this)},selector:"",jquery:"1.7.2",length:0,size:function(){return this.length},toArray:function(){return F.call(this,0)},get:function(a){return a==null?this.toArray():a<0?this[this.length+a]:this[a]},pushStack:function(a,b,c){var d=this.constructor();e.isArray(a)?E.apply(d,a):e.merge(d,a),d.prevObject=this,d.context=this.context,b==="find"?d.selector=this.selector+(this.selector?" ":"")+c:b&&(d.selector=this.selector+"."+b+"("+c+")");return d},each:function(a,b){return e.each(this,a,b)},ready:function(a){e.bindReady(),A.add(a);return this},eq:function(a){a=+a;return a===-1?this.slice(a):this.slice(a,a+1)},first:function(){return this.eq(0)},last:function(){return this.eq(-1)},slice:function(){return this.pushStack(F.apply(this,arguments),"slice",F.call(arguments).join(","))},map:function(a){return this.pushStack(e.map(this,function(b,c){return a.call(b,c,b)}))},end:function(){return this.prevObject||this.constructor(null)},push:E,sort:[].sort,splice:[].splice},e.fn.init.prototype=e.fn,e.extend=e.fn.extend=function(){var a,c,d,f,g,h,i=arguments[0]||{},j=1,k=arguments.length,l=!1;typeof i=="boolean"&&(l=i,i=arguments[1]||{},j=2),typeof i!="object"&&!e.isFunction(i)&&(i={}),k===j&&(i=this,--j);for(;j<k;j++)if((a=arguments[j])!=null)for(c in a){d=i[c],f=a[c];if(i===f)continue;l&&f&&(e.isPlainObject(f)||(g=e.isArray(f)))?(g?(g=!1,h=d&&e.isArray(d)?d:[]):h=d&&e.isPlainObject(d)?d:{},i[c]=e.extend(l,h,f)):f!==b&&(i[c]=f)}return i},e.extend({noConflict:function(b){a.$===e&&(a.$=g),b&&a.jQuery===e&&(a.jQuery=f);return e},isReady:!1,readyWait:1,holdReady:function(a){a?e.readyWait++:e.ready(!0)},ready:function(a){if(a===!0&&!--e.readyWait||a!==!0&&!e.isReady){if(!c.body)return setTimeout(e.ready,1);e.isReady=!0;if(a!==!0&&--e.readyWait>0)return;A.fireWith(c,[e]),e.fn.trigger&&e(c).trigger("ready").off("ready")}},bindReady:function(){if(!A){A=e.Callbacks("once memory");if(c.readyState==="complete")return setTimeout(e.ready,1);if(c.addEventListener)c.addEventListener("DOMContentLoaded",B,!1),a.addEventListener("load",e.ready,!1);else if(c.attachEvent){c.attachEvent("onreadystatechange",B),a.attachEvent("onload",e.ready);var b=!1;try{b=a.frameElement==null}catch(d){}c.documentElement.doScroll&&b&&J()}}},isFunction:function(a){return e.type(a)==="function"},isArray:Array.isArray||function(a){return e.type(a)==="array"},isWindow:function(a){return a!=null&&a==a.window},isNumeric:function(a){return!isNaN(parseFloat(a))&&isFinite(a)},type:function(a){return a==null?String(a):I[C.call(a)]||"object"},isPlainObject:function(a){if(!a||e.type(a)!=="object"||a.nodeType||e.isWindow(a))return!1;try{if(a.constructor&&!D.call(a,"constructor")&&!D.call(a.constructor.prototype,"isPrototypeOf"))return!1}catch(c){return!1}var d;for(d in a);return d===b||D.call(a,d)},isEmptyObject:function(a){for(var b in a)return!1;return!0},error:function(a){throw new Error(a)},parseJSON:function(b){if(typeof b!="string"||!b)return null;b=e.trim(b);if(a.JSON&&a.JSON.parse)return a.JSON.parse(b);if(n.test(b.replace(o,"@").replace(p,"]").replace(q,"")))return(new Function("return "+b))();e.error("Invalid JSON: "+b)},parseXML:function(c){if(typeof c!="string"||!c)return null;var d,f;try{a.DOMParser?(f=new DOMParser,d=f.parseFromString(c,"text/xml")):(d=new ActiveXObject("Microsoft.XMLDOM"),d.async="false",d.loadXML(c))}catch(g){d=b}(!d||!d.documentElement||d.getElementsByTagName("parsererror").length)&&e.error("Invalid XML: "+c);return d},noop:function(){},globalEval:function(b){b&&j.test(b)&&(a.execScript||function(b){a.eval.call(a,b)})(b)},camelCase:function(a){return a.replace(w,"ms-").replace(v,x)},nodeName:function(a,b){return a.nodeName&&a.nodeName.toUpperCase()===b.toUpperCase()},each:function(a,c,d){var f,g=0,h=a.length,i=h===b||e.isFunction(a);if(d){if(i){for(f in a)if(c.apply(a[f],d)===!1)break}else for(;g<h;)if(c.apply(a[g++],d)===!1)break}else if(i){for(f in a)if(c.call(a[f],f,a[f])===!1)break}else for(;g<h;)if(c.call(a[g],g,a[g++])===!1)break;return a},trim:G?function(a){return a==null?"":G.call(a)}:function(a){return a==null?"":(a+"").replace(k,"").replace(l,"")},makeArray:function(a,b){var c=b||[];if(a!=null){var d=e.type(a);a.length==null||d==="string"||d==="function"||d==="regexp"||e.isWindow(a)?E.call(c,a):e.merge(c,a)}return c},inArray:function(a,b,c){var d;if(b){if(H)return H.call(b,a,c);d=b.length,c=c?c<0?Math.max(0,d+c):c:0;for(;c<d;c++)if(c in b&&b[c]===a)return c}return-1},merge:function(a,c){var d=a.length,e=0;if(typeof c.length=="number")for(var f=c.length;e<f;e++)a[d++]=c[e];else while(c[e]!==b)a[d++]=c[e++];a.length=d;return a},grep:function(a,b,c){var d=[],e;c=!!c;for(var f=0,g=a.length;f<g;f++)e=!!b(a[f],f),c!==e&&d.push(a[f]);return d},map:function(a,c,d){var f,g,h=[],i=0,j=a.length,k=a instanceof e||j!==b&&typeof j=="number"&&(j>0&&a[0]&&a[j-1]||j===0||e.isArray(a));if(k)for(;i<j;i++)f=c(a[i],i,d),f!=null&&(h[h.length]=f);else for(g in a)f=c(a[g],g,d),f!=null&&(h[h.length]=f);return h.concat.apply([],h)},guid:1,proxy:function(a,c){if(typeof c=="string"){var d=a[c];c=a,a=d}if(!e.isFunction(a))return b;var f=F.call(arguments,2),g=function(){return a.apply(c,f.concat(F.call(arguments)))};g.guid=a.guid=a.guid||g.guid||e.guid++;return g},access:function(a,c,d,f,g,h,i){var j,k=d==null,l=0,m=a.length;if(d&&typeof d=="object"){for(l in d)e.access(a,c,l,d[l],1,h,f);g=1}else if(f!==b){j=i===b&&e.isFunction(f),k&&(j?(j=c,c=function(a,b,c){return j.call(e(a),c)}):(c.call(a,f),c=null));if(c)for(;l<m;l++)c(a[l],d,j?f.call(a[l],l,c(a[l],d)):f,i);g=1}return g?a:k?c.call(a):m?c(a[0],d):h},now:function(){return(new Date).getTime()},uaMatch:function(a){a=a.toLowerCase();var b=r.exec(a)||s.exec(a)||t.exec(a)||a.indexOf("compatible")<0&&u.exec(a)||[];return{browser:b[1]||"",version:b[2]||"0"}},sub:function(){function a(b,c){return new a.fn.init(b,c)}e.extend(!0,a,this),a.superclass=this,a.fn=a.prototype=this(),a.fn.constructor=a,a.sub=this.sub,a.fn.init=function(d,f){f&&f instanceof e&&!(f instanceof a)&&(f=a(f));return e.fn.init.call(this,d,f,b)},a.fn.init.prototype=a.fn;var b=a(c);return a},browser:{}}),e.each("Boolean Number String Function Array Date RegExp Object".split(" "),function(a,b){I["[object "+b+"]"]=b.toLowerCase()}),z=e.uaMatch(y),z.browser&&(e.browser[z.browser]=!0,e.browser.version=z.version),e.browser.webkit&&(e.browser.safari=!0),j.test(" ")&&(k=/^[\s\xA0]+/,l=/[\s\xA0]+$/),h=e(c),c.addEventListener?B=function(){c.removeEventListener("DOMContentLoaded",B,!1),e.ready()}:c.attachEvent&&(B=function(){c.readyState==="complete"&&(c.detachEvent("onreadystatechange",B),e.ready())});return e}(),g={};f.Callbacks=function(a){a=a?g[a]||h(a):{};var c=[],d=[],e,i,j,k,l,m,n=function(b){var d,e,g,h,i;for(d=0,e=b.length;d<e;d++)g=b[d],h=f.type(g),h==="array"?n(g):h==="function"&&(!a.unique||!p.has(g))&&c.push(g)},o=function(b,f){f=f||[],e=!a.memory||[b,f],i=!0,j=!0,m=k||0,k=0,l=c.length;for(;c&&m<l;m++)if(c[m].apply(b,f)===!1&&a.stopOnFalse){e=!0;break}j=!1,c&&(a.once?e===!0?p.disable():c=[]:d&&d.length&&(e=d.shift(),p.fireWith(e[0],e[1])))},p={add:function(){if(c){var a=c.length;n(arguments),j?l=c.length:e&&e!==!0&&(k=a,o(e[0],e[1]))}return this},remove:function(){if(c){var b=arguments,d=0,e=b.length;for(;d<e;d++)for(var f=0;f<c.length;f++)if(b[d]===c[f]){j&&f<=l&&(l--,f<=m&&m--),c.splice(f--,1);if(a.unique)break}}return this},has:function(a){if(c){var b=0,d=c.length;for(;b<d;b++)if(a===c[b])return!0}return!1},empty:function(){c=[];return this},disable:function(){c=d=e=b;return this},disabled:function(){return!c},lock:function(){d=b,(!e||e===!0)&&p.disable();return this},locked:function(){return!d},fireWith:function(b,c){d&&(j?a.once||d.push([b,c]):(!a.once||!e)&&o(b,c));return this},fire:function(){p.fireWith(this,arguments);return this},fired:function(){return!!i}};return p};var i=[].slice;f.extend({Deferred:function(a){var b=f.Callbacks("once memory"),c=f.Callbacks("once memory"),d=f.Callbacks("memory"),e="pending",g={resolve:b,reject:c,notify:d},h={done:b.add,fail:c.add,progress:d.add,state:function(){return e},isResolved:b.fired,isRejected:c.fired,then:function(a,b,c){i.done(a).fail(b).progress(c);return this},always:function(){i.done.apply(i,arguments).fail.apply(i,arguments);return this},pipe:function(a,b,c){return f.Deferred(function(d){f.each({done:[a,"resolve"],fail:[b,"reject"],progress:[c,"notify"]},function(a,b){var c=b[0],e=b[1],g;f.isFunction(c)?i[a](function(){g=c.apply(this,arguments),g&&f.isFunction(g.promise)?g.promise().then(d.resolve,d.reject,d.notify):d[e+"With"](this===i?d:this,[g])}):i[a](d[e])})}).promise()},promise:function(a){if(a==null)a=h;else for(var b in h)a[b]=h[b];return a}},i=h.promise({}),j;for(j in g)i[j]=g[j].fire,i[j+"With"]=g[j].fireWith;i.done(function(){e="resolved"},c.disable,d.lock).fail(function(){e="rejected"},b.disable,d.lock),a&&a.call(i,i);return i},when:function(a){function m(a){return function(b){e[a]=arguments.length>1?i.call(arguments,0):b,j.notifyWith(k,e)}}function l(a){return function(c){b[a]=arguments.length>1?i.call(arguments,0):c,--g||j.resolveWith(j,b)}}var b=i.call(arguments,0),c=0,d=b.length,e=Array(d),g=d,h=d,j=d<=1&&a&&f.isFunction(a.promise)?a:f.Deferred(),k=j.promise();if(d>1){for(;c<d;c++)b[c]&&b[c].promise&&f.isFunction(b[c].promise)?b[c].promise().then(l(c),j.reject,m(c)):--g;g||j.resolveWith(j,b)}else j!==a&&j.resolveWith(j,d?[a]:[]);return k}}),f.support=function(){var b,d,e,g,h,i,j,k,l,m,n,o,p=c.createElement("div"),q=c.documentElement;p.setAttribute("className","t"),p.innerHTML="   <link/><table></table><a href='/a' style='top:1px;float:left;opacity:.55;'>a</a><input type='checkbox'/>",d=p.getElementsByTagName("*"),e=p.getElementsByTagName("a")[0];if(!d||!d.length||!e)return{};g=c.createElement("select"),h=g.appendChild(c.createElement("option")),i=p.getElementsByTagName("input")[0],b={leadingWhitespace:p.firstChild.nodeType===3,tbody:!p.getElementsByTagName("tbody").length,htmlSerialize:!!p.getElementsByTagName("link").length,style:/top/.test(e.getAttribute("style")),hrefNormalized:e.getAttribute("href")==="/a",opacity:/^0.55/.test(e.style.opacity),cssFloat:!!e.style.cssFloat,checkOn:i.value==="on",optSelected:h.selected,getSetAttribute:p.className!=="t",enctype:!!c.createElement("form").enctype,html5Clone:c.createElement("nav").cloneNode(!0).outerHTML!=="<:nav></:nav>",submitBubbles:!0,changeBubbles:!0,focusinBubbles:!1,deleteExpando:!0,noCloneEvent:!0,inlineBlockNeedsLayout:!1,shrinkWrapBlocks:!1,reliableMarginRight:!0,pixelMargin:!0},f.boxModel=b.boxModel=c.compatMode==="CSS1Compat",i.checked=!0,b.noCloneChecked=i.cloneNode(!0).checked,g.disabled=!0,b.optDisabled=!h.disabled;try{delete p.test}catch(r){b.deleteExpando=!1}!p.addEventListener&&p.attachEvent&&p.fireEvent&&(p.attachEvent("onclick",function(){b.noCloneEvent=!1}),p.cloneNode(!0).fireEvent("onclick")),i=c.createElement("input"),i.value="t",i.setAttribute("type","radio"),b.radioValue=i.value==="t",i.setAttribute("checked","checked"),i.setAttribute("name","t"),p.appendChild(i),j=c.createDocumentFragment(),j.appendChild(p.lastChild),b.checkClone=j.cloneNode(!0).cloneNode(!0).lastChild.checked,b.appendChecked=i.checked,j.removeChild(i),j.appendChild(p);if(p.attachEvent)for(n in{submit:1,change:1,focusin:1})m="on"+n,o=m in p,o||(p.setAttribute(m,"return;"),o=typeof p[m]=="function"),b[n+"Bubbles"]=o;j.removeChild(p),j=g=h=p=i=null,f(function(){var d,e,g,h,i,j,l,m,n,q,r,s,t,u=c.getElementsByTagName("body")[0];!u||(m=1,t="padding:0;margin:0;border:",r="position:absolute;top:0;left:0;width:1px;height:1px;",s=t+"0;visibility:hidden;",n="style='"+r+t+"5px solid #000;",q="<div "+n+"display:block;'><div style='"+t+"0;display:block;overflow:hidden;'></div></div>"+"<table "+n+"' cellpadding='0' cellspacing='0'>"+"<tr><td></td></tr></table>",d=c.createElement("div"),d.style.cssText=s+"width:0;height:0;position:static;top:0;margin-top:"+m+"px",u.insertBefore(d,u.firstChild),p=c.createElement("div"),d.appendChild(p),p.innerHTML="<table><tr><td style='"+t+"0;display:none'></td><td>t</td></tr></table>",k=p.getElementsByTagName("td"),o=k[0].offsetHeight===0,k[0].style.display="",k[1].style.display="none",b.reliableHiddenOffsets=o&&k[0].offsetHeight===0,a.getComputedStyle&&(p.innerHTML="",l=c.createElement("div"),l.style.width="0",l.style.marginRight="0",p.style.width="2px",p.appendChild(l),b.reliableMarginRight=(parseInt((a.getComputedStyle(l,null)||{marginRight:0}).marginRight,10)||0)===0),typeof p.style.zoom!="undefined"&&(p.innerHTML="",p.style.width=p.style.padding="1px",p.style.border=0,p.style.overflow="hidden",p.style.display="inline",p.style.zoom=1,b.inlineBlockNeedsLayout=p.offsetWidth===3,p.style.display="block",p.style.overflow="visible",p.innerHTML="<div style='width:5px;'></div>",b.shrinkWrapBlocks=p.offsetWidth!==3),p.style.cssText=r+s,p.innerHTML=q,e=p.firstChild,g=e.firstChild,i=e.nextSibling.firstChild.firstChild,j={doesNotAddBorder:g.offsetTop!==5,doesAddBorderForTableAndCells:i.offsetTop===5},g.style.position="fixed",g.style.top="20px",j.fixedPosition=g.offsetTop===20||g.offsetTop===15,g.style.position=g.style.top="",e.style.overflow="hidden",e.style.position="relative",j.subtractsBorderForOverflowNotVisible=g.offsetTop===-5,j.doesNotIncludeMarginInBodyOffset=u.offsetTop!==m,a.getComputedStyle&&(p.style.marginTop="1%",b.pixelMargin=(a.getComputedStyle(p,null)||{marginTop:0}).marginTop!=="1%"),typeof d.style.zoom!="undefined"&&(d.style.zoom=1),u.removeChild(d),l=p=d=null,f.extend(b,j))});return b}();var j=/^(?:\{.*\}|\[.*\])$/,k=/([A-Z])/g;f.extend({cache:{},uuid:0,expando:"jQuery"+(f.fn.jquery+Math.random()).replace(/\D/g,""),noData:{embed:!0,object:"clsid:D27CDB6E-AE6D-11cf-96B8-444553540000",applet:!0},hasData:function(a){a=a.nodeType?f.cache[a[f.expando]]:a[f.expando];return!!a&&!m(a)},data:function(a,c,d,e){if(!!f.acceptData(a)){var g,h,i,j=f.expando,k=typeof c=="string",l=a.nodeType,m=l?f.cache:a,n=l?a[j]:a[j]&&j,o=c==="events";if((!n||!m[n]||!o&&!e&&!m[n].data)&&k&&d===b)return;n||(l?a[j]=n=++f.uuid:n=j),m[n]||(m[n]={},l||(m[n].toJSON=f.noop));if(typeof c=="object"||typeof c=="function")e?m[n]=f.extend(m[n],c):m[n].data=f.extend(m[n].data,c);g=h=m[n],e||(h.data||(h.data={}),h=h.data),d!==b&&(h[f.camelCase(c)]=d);if(o&&!h[c])return g.events;k?(i=h[c],i==null&&(i=h[f.camelCase(c)])):i=h;return i}},removeData:function(a,b,c){if(!!f.acceptData(a)){var d,e,g,h=f.expando,i=a.nodeType,j=i?f.cache:a,k=i?a[h]:h;if(!j[k])return;if(b){d=c?j[k]:j[k].data;if(d){f.isArray(b)||(b in d?b=[b]:(b=f.camelCase(b),b in d?b=[b]:b=b.split(" ")));for(e=0,g=b.length;e<g;e++)delete d[b[e]];if(!(c?m:f.isEmptyObject)(d))return}}if(!c){delete j[k].data;if(!m(j[k]))return}f.support.deleteExpando||!j.setInterval?delete j[k]:j[k]=null,i&&(f.support.deleteExpando?delete a[h]:a.removeAttribute?a.removeAttribute(h):a[h]=null)}},_data:function(a,b,c){return f.data(a,b,c,!0)},acceptData:function(a){if(a.nodeName){var b=f.noData[a.nodeName.toLowerCase()];if(b)return b!==!0&&a.getAttribute("classid")===b}return!0}}),f.fn.extend({data:function(a,c){var d,e,g,h,i,j=this[0],k=0,m=null;if(a===b){if(this.length){m=f.data(j);if(j.nodeType===1&&!f._data(j,"parsedAttrs")){g=j.attributes;for(i=g.length;k<i;k++)h=g[k].name,h.indexOf("data-")===0&&(h=f.camelCase(h.substring(5)),l(j,h,m[h]));f._data(j,"parsedAttrs",!0)}}return m}if(typeof a=="object")return this.each(function(){f.data(this,a)});d=a.split(".",2),d[1]=d[1]?"."+d[1]:"",e=d[1]+"!";return f.access(this,function(c){if(c===b){m=this.triggerHandler("getData"+e,[d[0]]),m===b&&j&&(m=f.data(j,a),m=l(j,a,m));return m===b&&d[1]?this.data(d[0]):m}d[1]=c,this.each(function(){var b=f(this);b.triggerHandler("setData"+e,d),f.data(this,a,c),b.triggerHandler("changeData"+e,d)})},null,c,arguments.length>1,null,!1)},removeData:function(a){return this.each(function(){f.removeData(this,a)})}}),f.extend({_mark:function(a,b){a&&(b=(b||"fx")+"mark",f._data(a,b,(f._data(a,b)||0)+1))},_unmark:function(a,b,c){a!==!0&&(c=b,b=a,a=!1);if(b){c=c||"fx";var d=c+"mark",e=a?0:(f._data(b,d)||1)-1;e?f._data(b,d,e):(f.removeData(b,d,!0),n(b,c,"mark"))}},queue:function(a,b,c){var d;if(a){b=(b||"fx")+"queue",d=f._data(a,b),c&&(!d||f.isArray(c)?d=f._data(a,b,f.makeArray(c)):d.push(c));return d||[]}},dequeue:function(a,b){b=b||"fx";var c=f.queue(a,b),d=c.shift(),e={};d==="inprogress"&&(d=c.shift()),d&&(b==="fx"&&c.unshift("inprogress"),f._data(a,b+".run",e),d.call(a,function(){f.dequeue(a,b)},e)),c.length||(f.removeData(a,b+"queue "+b+".run",!0),n(a,b,"queue"))}}),f.fn.extend({queue:function(a,c){var d=2;typeof a!="string"&&(c=a,a="fx",d--);if(arguments.length<d)return f.queue(this[0],a);return c===b?this:this.each(function(){var b=f.queue(this,a,c);a==="fx"&&b[0]!=="inprogress"&&f.dequeue(this,a)})},dequeue:function(a){return this.each(function(){f.dequeue(this,a)})},delay:function(a,b){a=f.fx?f.fx.speeds[a]||a:a,b=b||"fx";return this.queue(b,function(b,c){var d=setTimeout(b,a);c.stop=function(){clearTimeout(d)}})},clearQueue:function(a){return this.queue(a||"fx",[])},promise:function(a,c){function m(){--h||d.resolveWith(e,[e])}typeof a!="string"&&(c=a,a=b),a=a||"fx";var d=f.Deferred(),e=this,g=e.length,h=1,i=a+"defer",j=a+"queue",k=a+"mark",l;while(g--)if(l=f.data(e[g],i,b,!0)||(f.data(e[g],j,b,!0)||f.data(e[g],k,b,!0))&&f.data(e[g],i,f.Callbacks("once memory"),!0))h++,l.add(m);m();return d.promise(c)}});var o=/[\n\t\r]/g,p=/\s+/,q=/\r/g,r=/^(?:button|input)$/i,s=/^(?:button|input|object|select|textarea)$/i,t=/^a(?:rea)?$/i,u=/^(?:autofocus|autoplay|async|checked|controls|defer|disabled|hidden|loop|multiple|open|readonly|required|scoped|selected)$/i,v=f.support.getSetAttribute,w,x,y;f.fn.extend({attr:function(a,b){return f.access(this,f.attr,a,b,arguments.length>1)},removeAttr:function(a){return this.each(function(){f.removeAttr(this,a)})},prop:function(a,b){return f.access(this,f.prop,a,b,arguments.length>1)},removeProp:function(a){a=f.propFix[a]||a;return this.each(function(){try{this[a]=b,delete this[a]}catch(c){}})},addClass:function(a){var b,c,d,e,g,h,i;if(f.isFunction(a))return this.each(function(b){f(this).addClass(a.call(this,b,this.className))});if(a&&typeof a=="string"){b=a.split(p);for(c=0,d=this.length;c<d;c++){e=this[c];if(e.nodeType===1)if(!e.className&&b.length===1)e.className=a;else{g=" "+e.className+" ";for(h=0,i=b.length;h<i;h++)~g.indexOf(" "+b[h]+" ")||(g+=b[h]+" ");e.className=f.trim(g)}}}return this},removeClass:function(a){var c,d,e,g,h,i,j;if(f.isFunction(a))return this.each(function(b){f(this).removeClass(a.call(this,b,this.className))});if(a&&typeof a=="string"||a===b){c=(a||"").split(p);for(d=0,e=this.length;d<e;d++){g=this[d];if(g.nodeType===1&&g.className)if(a){h=(" "+g.className+" ").replace(o," ");for(i=0,j=c.length;i<j;i++)h=h.replace(" "+c[i]+" "," ");g.className=f.trim(h)}else g.className=""}}return this},toggleClass:function(a,b){var c=typeof a,d=typeof b=="boolean";if(f.isFunction(a))return this.each(function(c){f(this).toggleClass(a.call(this,c,this.className,b),b)});return this.each(function(){if(c==="string"){var e,g=0,h=f(this),i=b,j=a.split(p);while(e=j[g++])i=d?i:!h.hasClass(e),h[i?"addClass":"removeClass"](e)}else if(c==="undefined"||c==="boolean")this.className&&f._data(this,"__className__",this.className),this.className=this.className||a===!1?"":f._data(this,"__className__")||""})},hasClass:function(a){var b=" "+a+" ",c=0,d=this.length;for(;c<d;c++)if(this[c].nodeType===1&&(" "+this[c].className+" ").replace(o," ").indexOf(b)>-1)return!0;return!1},val:function(a){var c,d,e,g=this[0];{if(!!arguments.length){e=f.isFunction(a);return this.each(function(d){var g=f(this),h;if(this.nodeType===1){e?h=a.call(this,d,g.val()):h=a,h==null?h="":typeof h=="number"?h+="":f.isArray(h)&&(h=f.map(h,function(a){return a==null?"":a+""})),c=f.valHooks[this.type]||f.valHooks[this.nodeName.toLowerCase()];if(!c||!("set"in c)||c.set(this,h,"value")===b)this.value=h}})}if(g){c=f.valHooks[g.type]||f.valHooks[g.nodeName.toLowerCase()];if(c&&"get"in c&&(d=c.get(g,"value"))!==b)return d;d=g.value;return typeof d=="string"?d.replace(q,""):d==null?"":d}}}}),f.extend({valHooks:{option:{get:function(a){var b=a.attributes.value;return!b||b.specified?a.value:a.text}},select:{get:function(a){var b,c,d,e,g=a.selectedIndex,h=[],i=a.options,j=a.type==="select-one";if(g<0)return null;c=j?g:0,d=j?g+1:i.length;for(;c<d;c++){e=i[c];if(e.selected&&(f.support.optDisabled?!e.disabled:e.getAttribute("disabled")===null)&&(!e.parentNode.disabled||!f.nodeName(e.parentNode,"optgroup"))){b=f(e).val();if(j)return b;h.push(b)}}if(j&&!h.length&&i.length)return f(i[g]).val();return h},set:function(a,b){var c=f.makeArray(b);f(a).find("option").each(function(){this.selected=f.inArray(f(this).val(),c)>=0}),c.length||(a.selectedIndex=-1);return c}}},attrFn:{val:!0,css:!0,html:!0,text:!0,data:!0,width:!0,height:!0,offset:!0},attr:function(a,c,d,e){var g,h,i,j=a.nodeType;if(!!a&&j!==3&&j!==8&&j!==2){if(e&&c in f.attrFn)return f(a)[c](d);if(typeof a.getAttribute=="undefined")return f.prop(a,c,d);i=j!==1||!f.isXMLDoc(a),i&&(c=c.toLowerCase(),h=f.attrHooks[c]||(u.test(c)?x:w));if(d!==b){if(d===null){f.removeAttr(a,c);return}if(h&&"set"in h&&i&&(g=h.set(a,d,c))!==b)return g;a.setAttribute(c,""+d);return d}if(h&&"get"in h&&i&&(g=h.get(a,c))!==null)return g;g=a.getAttribute(c);return g===null?b:g}},removeAttr:function(a,b){var c,d,e,g,h,i=0;if(b&&a.nodeType===1){d=b.toLowerCase().split(p),g=d.length;for(;i<g;i++)e=d[i],e&&(c=f.propFix[e]||e,h=u.test(e),h||f.attr(a,e,""),a.removeAttribute(v?e:c),h&&c in a&&(a[c]=!1))}},attrHooks:{type:{set:function(a,b){if(r.test(a.nodeName)&&a.parentNode)f.error("type property can't be changed");else if(!f.support.radioValue&&b==="radio"&&f.nodeName(a,"input")){var c=a.value;a.setAttribute("type",b),c&&(a.value=c);return b}}},value:{get:function(a,b){if(w&&f.nodeName(a,"button"))return w.get(a,b);return b in a?a.value:null},set:function(a,b,c){if(w&&f.nodeName(a,"button"))return w.set(a,b,c);a.value=b}}},propFix:{tabindex:"tabIndex",readonly:"readOnly","for":"htmlFor","class":"className",maxlength:"maxLength",cellspacing:"cellSpacing",cellpadding:"cellPadding",rowspan:"rowSpan",colspan:"colSpan",usemap:"useMap",frameborder:"frameBorder",contenteditable:"contentEditable"},prop:function(a,c,d){var e,g,h,i=a.nodeType;if(!!a&&i!==3&&i!==8&&i!==2){h=i!==1||!f.isXMLDoc(a),h&&(c=f.propFix[c]||c,g=f.propHooks[c]);return d!==b?g&&"set"in g&&(e=g.set(a,d,c))!==b?e:a[c]=d:g&&"get"in g&&(e=g.get(a,c))!==null?e:a[c]}},propHooks:{tabIndex:{get:function(a){var c=a.getAttributeNode("tabindex");return c&&c.specified?parseInt(c.value,10):s.test(a.nodeName)||t.test(a.nodeName)&&a.href?0:b}}}}),f.attrHooks.tabindex=f.propHooks.tabIndex,x={get:function(a,c){var d,e=f.prop(a,c);return e===!0||typeof e!="boolean"&&(d=a.getAttributeNode(c))&&d.nodeValue!==!1?c.toLowerCase():b},set:function(a,b,c){var d;b===!1?f.removeAttr(a,c):(d=f.propFix[c]||c,d in a&&(a[d]=!0),a.setAttribute(c,c.toLowerCase()));return c}},v||(y={name:!0,id:!0,coords:!0},w=f.valHooks.button={get:function(a,c){var d;d=a.getAttributeNode(c);return d&&(y[c]?d.nodeValue!=="":d.specified)?d.nodeValue:b},set:function(a,b,d){var e=a.getAttributeNode(d);e||(e=c.createAttribute(d),a.setAttributeNode(e));return e.nodeValue=b+""}},f.attrHooks.tabindex.set=w.set,f.each(["width","height"],function(a,b){f.attrHooks[b]=f.extend(f.attrHooks[b],{set:function(a,c){if(c===""){a.setAttribute(b,"auto");return c}}})}),f.attrHooks.contenteditable={get:w.get,set:function(a,b,c){b===""&&(b="false"),w.set(a,b,c)}}),f.support.hrefNormalized||f.each(["href","src","width","height"],function(a,c){f.attrHooks[c]=f.extend(f.attrHooks[c],{get:function(a){var d=a.getAttribute(c,2);return d===null?b:d}})}),f.support.style||(f.attrHooks.style={get:function(a){return a.style.cssText.toLowerCase()||b},set:function(a,b){return a.style.cssText=""+b}}),f.support.optSelected||(f.propHooks.selected=f.extend(f.propHooks.selected,{get:function(a){var b=a.parentNode;b&&(b.selectedIndex,b.parentNode&&b.parentNode.selectedIndex);return null}})),f.support.enctype||(f.propFix.enctype="encoding"),f.support.checkOn||f.each(["radio","checkbox"],function(){f.valHooks[this]={get:function(a){return a.getAttribute("value")===null?"on":a.value}}}),f.each(["radio","checkbox"],function(){f.valHooks[this]=f.extend(f.valHooks[this],{set:function(a,b){if(f.isArray(b))return a.checked=f.inArray(f(a).val(),b)>=0}})});var z=/^(?:textarea|input|select)$/i,A=/^([^\.]*)?(?:\.(.+))?$/,B=/(?:^|\s)hover(\.\S+)?\b/,C=/^key/,D=/^(?:mouse|contextmenu)|click/,E=/^(?:focusinfocus|focusoutblur)$/,F=/^(\w*)(?:#([\w\-]+))?(?:\.([\w\-]+))?$/,G=function(
a){var b=F.exec(a);b&&(b[1]=(b[1]||"").toLowerCase(),b[3]=b[3]&&new RegExp("(?:^|\\s)"+b[3]+"(?:\\s|$)"));return b},H=function(a,b){var c=a.attributes||{};return(!b[1]||a.nodeName.toLowerCase()===b[1])&&(!b[2]||(c.id||{}).value===b[2])&&(!b[3]||b[3].test((c["class"]||{}).value))},I=function(a){return f.event.special.hover?a:a.replace(B,"mouseenter$1 mouseleave$1")};f.event={add:function(a,c,d,e,g){var h,i,j,k,l,m,n,o,p,q,r,s;if(!(a.nodeType===3||a.nodeType===8||!c||!d||!(h=f._data(a)))){d.handler&&(p=d,d=p.handler,g=p.selector),d.guid||(d.guid=f.guid++),j=h.events,j||(h.events=j={}),i=h.handle,i||(h.handle=i=function(a){return typeof f!="undefined"&&(!a||f.event.triggered!==a.type)?f.event.dispatch.apply(i.elem,arguments):b},i.elem=a),c=f.trim(I(c)).split(" ");for(k=0;k<c.length;k++){l=A.exec(c[k])||[],m=l[1],n=(l[2]||"").split(".").sort(),s=f.event.special[m]||{},m=(g?s.delegateType:s.bindType)||m,s=f.event.special[m]||{},o=f.extend({type:m,origType:l[1],data:e,handler:d,guid:d.guid,selector:g,quick:g&&G(g),namespace:n.join(".")},p),r=j[m];if(!r){r=j[m]=[],r.delegateCount=0;if(!s.setup||s.setup.call(a,e,n,i)===!1)a.addEventListener?a.addEventListener(m,i,!1):a.attachEvent&&a.attachEvent("on"+m,i)}s.add&&(s.add.call(a,o),o.handler.guid||(o.handler.guid=d.guid)),g?r.splice(r.delegateCount++,0,o):r.push(o),f.event.global[m]=!0}a=null}},global:{},remove:function(a,b,c,d,e){var g=f.hasData(a)&&f._data(a),h,i,j,k,l,m,n,o,p,q,r,s;if(!!g&&!!(o=g.events)){b=f.trim(I(b||"")).split(" ");for(h=0;h<b.length;h++){i=A.exec(b[h])||[],j=k=i[1],l=i[2];if(!j){for(j in o)f.event.remove(a,j+b[h],c,d,!0);continue}p=f.event.special[j]||{},j=(d?p.delegateType:p.bindType)||j,r=o[j]||[],m=r.length,l=l?new RegExp("(^|\\.)"+l.split(".").sort().join("\\.(?:.*\\.)?")+"(\\.|$)"):null;for(n=0;n<r.length;n++)s=r[n],(e||k===s.origType)&&(!c||c.guid===s.guid)&&(!l||l.test(s.namespace))&&(!d||d===s.selector||d==="**"&&s.selector)&&(r.splice(n--,1),s.selector&&r.delegateCount--,p.remove&&p.remove.call(a,s));r.length===0&&m!==r.length&&((!p.teardown||p.teardown.call(a,l)===!1)&&f.removeEvent(a,j,g.handle),delete o[j])}f.isEmptyObject(o)&&(q=g.handle,q&&(q.elem=null),f.removeData(a,["events","handle"],!0))}},customEvent:{getData:!0,setData:!0,changeData:!0},trigger:function(c,d,e,g){if(!e||e.nodeType!==3&&e.nodeType!==8){var h=c.type||c,i=[],j,k,l,m,n,o,p,q,r,s;if(E.test(h+f.event.triggered))return;h.indexOf("!")>=0&&(h=h.slice(0,-1),k=!0),h.indexOf(".")>=0&&(i=h.split("."),h=i.shift(),i.sort());if((!e||f.event.customEvent[h])&&!f.event.global[h])return;c=typeof c=="object"?c[f.expando]?c:new f.Event(h,c):new f.Event(h),c.type=h,c.isTrigger=!0,c.exclusive=k,c.namespace=i.join("."),c.namespace_re=c.namespace?new RegExp("(^|\\.)"+i.join("\\.(?:.*\\.)?")+"(\\.|$)"):null,o=h.indexOf(":")<0?"on"+h:"";if(!e){j=f.cache;for(l in j)j[l].events&&j[l].events[h]&&f.event.trigger(c,d,j[l].handle.elem,!0);return}c.result=b,c.target||(c.target=e),d=d!=null?f.makeArray(d):[],d.unshift(c),p=f.event.special[h]||{};if(p.trigger&&p.trigger.apply(e,d)===!1)return;r=[[e,p.bindType||h]];if(!g&&!p.noBubble&&!f.isWindow(e)){s=p.delegateType||h,m=E.test(s+h)?e:e.parentNode,n=null;for(;m;m=m.parentNode)r.push([m,s]),n=m;n&&n===e.ownerDocument&&r.push([n.defaultView||n.parentWindow||a,s])}for(l=0;l<r.length&&!c.isPropagationStopped();l++)m=r[l][0],c.type=r[l][1],q=(f._data(m,"events")||{})[c.type]&&f._data(m,"handle"),q&&q.apply(m,d),q=o&&m[o],q&&f.acceptData(m)&&q.apply(m,d)===!1&&c.preventDefault();c.type=h,!g&&!c.isDefaultPrevented()&&(!p._default||p._default.apply(e.ownerDocument,d)===!1)&&(h!=="click"||!f.nodeName(e,"a"))&&f.acceptData(e)&&o&&e[h]&&(h!=="focus"&&h!=="blur"||c.target.offsetWidth!==0)&&!f.isWindow(e)&&(n=e[o],n&&(e[o]=null),f.event.triggered=h,e[h](),f.event.triggered=b,n&&(e[o]=n));return c.result}},dispatch:function(c){c=f.event.fix(c||a.event);var d=(f._data(this,"events")||{})[c.type]||[],e=d.delegateCount,g=[].slice.call(arguments,0),h=!c.exclusive&&!c.namespace,i=f.event.special[c.type]||{},j=[],k,l,m,n,o,p,q,r,s,t,u;g[0]=c,c.delegateTarget=this;if(!i.preDispatch||i.preDispatch.call(this,c)!==!1){if(e&&(!c.button||c.type!=="click")){n=f(this),n.context=this.ownerDocument||this;for(m=c.target;m!=this;m=m.parentNode||this)if(m.disabled!==!0){p={},r=[],n[0]=m;for(k=0;k<e;k++)s=d[k],t=s.selector,p[t]===b&&(p[t]=s.quick?H(m,s.quick):n.is(t)),p[t]&&r.push(s);r.length&&j.push({elem:m,matches:r})}}d.length>e&&j.push({elem:this,matches:d.slice(e)});for(k=0;k<j.length&&!c.isPropagationStopped();k++){q=j[k],c.currentTarget=q.elem;for(l=0;l<q.matches.length&&!c.isImmediatePropagationStopped();l++){s=q.matches[l];if(h||!c.namespace&&!s.namespace||c.namespace_re&&c.namespace_re.test(s.namespace))c.data=s.data,c.handleObj=s,o=((f.event.special[s.origType]||{}).handle||s.handler).apply(q.elem,g),o!==b&&(c.result=o,o===!1&&(c.preventDefault(),c.stopPropagation()))}}i.postDispatch&&i.postDispatch.call(this,c);return c.result}},props:"attrChange attrName relatedNode srcElement altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "),fixHooks:{},keyHooks:{props:"char charCode key keyCode".split(" "),filter:function(a,b){a.which==null&&(a.which=b.charCode!=null?b.charCode:b.keyCode);return a}},mouseHooks:{props:"button buttons clientX clientY fromElement offsetX offsetY pageX pageY screenX screenY toElement".split(" "),filter:function(a,d){var e,f,g,h=d.button,i=d.fromElement;a.pageX==null&&d.clientX!=null&&(e=a.target.ownerDocument||c,f=e.documentElement,g=e.body,a.pageX=d.clientX+(f&&f.scrollLeft||g&&g.scrollLeft||0)-(f&&f.clientLeft||g&&g.clientLeft||0),a.pageY=d.clientY+(f&&f.scrollTop||g&&g.scrollTop||0)-(f&&f.clientTop||g&&g.clientTop||0)),!a.relatedTarget&&i&&(a.relatedTarget=i===a.target?d.toElement:i),!a.which&&h!==b&&(a.which=h&1?1:h&2?3:h&4?2:0);return a}},fix:function(a){if(a[f.expando])return a;var d,e,g=a,h=f.event.fixHooks[a.type]||{},i=h.props?this.props.concat(h.props):this.props;a=f.Event(g);for(d=i.length;d;)e=i[--d],a[e]=g[e];a.target||(a.target=g.srcElement||c),a.target.nodeType===3&&(a.target=a.target.parentNode),a.metaKey===b&&(a.metaKey=a.ctrlKey);return h.filter?h.filter(a,g):a},special:{ready:{setup:f.bindReady},load:{noBubble:!0},focus:{delegateType:"focusin"},blur:{delegateType:"focusout"},beforeunload:{setup:function(a,b,c){f.isWindow(this)&&(this.onbeforeunload=c)},teardown:function(a,b){this.onbeforeunload===b&&(this.onbeforeunload=null)}}},simulate:function(a,b,c,d){var e=f.extend(new f.Event,c,{type:a,isSimulated:!0,originalEvent:{}});d?f.event.trigger(e,null,b):f.event.dispatch.call(b,e),e.isDefaultPrevented()&&c.preventDefault()}},f.event.handle=f.event.dispatch,f.removeEvent=c.removeEventListener?function(a,b,c){a.removeEventListener&&a.removeEventListener(b,c,!1)}:function(a,b,c){a.detachEvent&&a.detachEvent("on"+b,c)},f.Event=function(a,b){if(!(this instanceof f.Event))return new f.Event(a,b);a&&a.type?(this.originalEvent=a,this.type=a.type,this.isDefaultPrevented=a.defaultPrevented||a.returnValue===!1||a.getPreventDefault&&a.getPreventDefault()?K:J):this.type=a,b&&f.extend(this,b),this.timeStamp=a&&a.timeStamp||f.now(),this[f.expando]=!0},f.Event.prototype={preventDefault:function(){this.isDefaultPrevented=K;var a=this.originalEvent;!a||(a.preventDefault?a.preventDefault():a.returnValue=!1)},stopPropagation:function(){this.isPropagationStopped=K;var a=this.originalEvent;!a||(a.stopPropagation&&a.stopPropagation(),a.cancelBubble=!0)},stopImmediatePropagation:function(){this.isImmediatePropagationStopped=K,this.stopPropagation()},isDefaultPrevented:J,isPropagationStopped:J,isImmediatePropagationStopped:J},f.each({mouseenter:"mouseover",mouseleave:"mouseout"},function(a,b){f.event.special[a]={delegateType:b,bindType:b,handle:function(a){var c=this,d=a.relatedTarget,e=a.handleObj,g=e.selector,h;if(!d||d!==c&&!f.contains(c,d))a.type=e.origType,h=e.handler.apply(this,arguments),a.type=b;return h}}}),f.support.submitBubbles||(f.event.special.submit={setup:function(){if(f.nodeName(this,"form"))return!1;f.event.add(this,"click._submit keypress._submit",function(a){var c=a.target,d=f.nodeName(c,"input")||f.nodeName(c,"button")?c.form:b;d&&!d._submit_attached&&(f.event.add(d,"submit._submit",function(a){a._submit_bubble=!0}),d._submit_attached=!0)})},postDispatch:function(a){a._submit_bubble&&(delete a._submit_bubble,this.parentNode&&!a.isTrigger&&f.event.simulate("submit",this.parentNode,a,!0))},teardown:function(){if(f.nodeName(this,"form"))return!1;f.event.remove(this,"._submit")}}),f.support.changeBubbles||(f.event.special.change={setup:function(){if(z.test(this.nodeName)){if(this.type==="checkbox"||this.type==="radio")f.event.add(this,"propertychange._change",function(a){a.originalEvent.propertyName==="checked"&&(this._just_changed=!0)}),f.event.add(this,"click._change",function(a){this._just_changed&&!a.isTrigger&&(this._just_changed=!1,f.event.simulate("change",this,a,!0))});return!1}f.event.add(this,"beforeactivate._change",function(a){var b=a.target;z.test(b.nodeName)&&!b._change_attached&&(f.event.add(b,"change._change",function(a){this.parentNode&&!a.isSimulated&&!a.isTrigger&&f.event.simulate("change",this.parentNode,a,!0)}),b._change_attached=!0)})},handle:function(a){var b=a.target;if(this!==b||a.isSimulated||a.isTrigger||b.type!=="radio"&&b.type!=="checkbox")return a.handleObj.handler.apply(this,arguments)},teardown:function(){f.event.remove(this,"._change");return z.test(this.nodeName)}}),f.support.focusinBubbles||f.each({focus:"focusin",blur:"focusout"},function(a,b){var d=0,e=function(a){f.event.simulate(b,a.target,f.event.fix(a),!0)};f.event.special[b]={setup:function(){d++===0&&c.addEventListener(a,e,!0)},teardown:function(){--d===0&&c.removeEventListener(a,e,!0)}}}),f.fn.extend({on:function(a,c,d,e,g){var h,i;if(typeof a=="object"){typeof c!="string"&&(d=d||c,c=b);for(i in a)this.on(i,c,d,a[i],g);return this}d==null&&e==null?(e=c,d=c=b):e==null&&(typeof c=="string"?(e=d,d=b):(e=d,d=c,c=b));if(e===!1)e=J;else if(!e)return this;g===1&&(h=e,e=function(a){f().off(a);return h.apply(this,arguments)},e.guid=h.guid||(h.guid=f.guid++));return this.each(function(){f.event.add(this,a,e,d,c)})},one:function(a,b,c,d){return this.on(a,b,c,d,1)},off:function(a,c,d){if(a&&a.preventDefault&&a.handleObj){var e=a.handleObj;f(a.delegateTarget).off(e.namespace?e.origType+"."+e.namespace:e.origType,e.selector,e.handler);return this}if(typeof a=="object"){for(var g in a)this.off(g,c,a[g]);return this}if(c===!1||typeof c=="function")d=c,c=b;d===!1&&(d=J);return this.each(function(){f.event.remove(this,a,d,c)})},bind:function(a,b,c){return this.on(a,null,b,c)},unbind:function(a,b){return this.off(a,null,b)},live:function(a,b,c){f(this.context).on(a,this.selector,b,c);return this},die:function(a,b){f(this.context).off(a,this.selector||"**",b);return this},delegate:function(a,b,c,d){return this.on(b,a,c,d)},undelegate:function(a,b,c){return arguments.length==1?this.off(a,"**"):this.off(b,a,c)},trigger:function(a,b){return this.each(function(){f.event.trigger(a,b,this)})},triggerHandler:function(a,b){if(this[0])return f.event.trigger(a,b,this[0],!0)},toggle:function(a){var b=arguments,c=a.guid||f.guid++,d=0,e=function(c){var e=(f._data(this,"lastToggle"+a.guid)||0)%d;f._data(this,"lastToggle"+a.guid,e+1),c.preventDefault();return b[e].apply(this,arguments)||!1};e.guid=c;while(d<b.length)b[d++].guid=c;return this.click(e)},hover:function(a,b){return this.mouseenter(a).mouseleave(b||a)}}),f.each("blur focus focusin focusout load resize scroll unload click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup error contextmenu".split(" "),function(a,b){f.fn[b]=function(a,c){c==null&&(c=a,a=null);return arguments.length>0?this.on(b,null,a,c):this.trigger(b)},f.attrFn&&(f.attrFn[b]=!0),C.test(b)&&(f.event.fixHooks[b]=f.event.keyHooks),D.test(b)&&(f.event.fixHooks[b]=f.event.mouseHooks)}),function(){function x(a,b,c,e,f,g){for(var h=0,i=e.length;h<i;h++){var j=e[h];if(j){var k=!1;j=j[a];while(j){if(j[d]===c){k=e[j.sizset];break}if(j.nodeType===1){g||(j[d]=c,j.sizset=h);if(typeof b!="string"){if(j===b){k=!0;break}}else if(m.filter(b,[j]).length>0){k=j;break}}j=j[a]}e[h]=k}}}function w(a,b,c,e,f,g){for(var h=0,i=e.length;h<i;h++){var j=e[h];if(j){var k=!1;j=j[a];while(j){if(j[d]===c){k=e[j.sizset];break}j.nodeType===1&&!g&&(j[d]=c,j.sizset=h);if(j.nodeName.toLowerCase()===b){k=j;break}j=j[a]}e[h]=k}}}var a=/((?:\((?:\([^()]+\)|[^()]+)+\)|\[(?:\[[^\[\]]*\]|['"][^'"]*['"]|[^\[\]'"]+)+\]|\\.|[^ >+~,(\[\\]+)+|[>+~])(\s*,\s*)?((?:.|\r|\n)*)/g,d="sizcache"+(Math.random()+"").replace(".",""),e=0,g=Object.prototype.toString,h=!1,i=!0,j=/\\/g,k=/\r\n/g,l=/\W/;[0,0].sort(function(){i=!1;return 0});var m=function(b,d,e,f){e=e||[],d=d||c;var h=d;if(d.nodeType!==1&&d.nodeType!==9)return[];if(!b||typeof b!="string")return e;var i,j,k,l,n,q,r,t,u=!0,v=m.isXML(d),w=[],x=b;do{a.exec(""),i=a.exec(x);if(i){x=i[3],w.push(i[1]);if(i[2]){l=i[3];break}}}while(i);if(w.length>1&&p.exec(b))if(w.length===2&&o.relative[w[0]])j=y(w[0]+w[1],d,f);else{j=o.relative[w[0]]?[d]:m(w.shift(),d);while(w.length)b=w.shift(),o.relative[b]&&(b+=w.shift()),j=y(b,j,f)}else{!f&&w.length>1&&d.nodeType===9&&!v&&o.match.ID.test(w[0])&&!o.match.ID.test(w[w.length-1])&&(n=m.find(w.shift(),d,v),d=n.expr?m.filter(n.expr,n.set)[0]:n.set[0]);if(d){n=f?{expr:w.pop(),set:s(f)}:m.find(w.pop(),w.length===1&&(w[0]==="~"||w[0]==="+")&&d.parentNode?d.parentNode:d,v),j=n.expr?m.filter(n.expr,n.set):n.set,w.length>0?k=s(j):u=!1;while(w.length)q=w.pop(),r=q,o.relative[q]?r=w.pop():q="",r==null&&(r=d),o.relative[q](k,r,v)}else k=w=[]}k||(k=j),k||m.error(q||b);if(g.call(k)==="[object Array]")if(!u)e.push.apply(e,k);else if(d&&d.nodeType===1)for(t=0;k[t]!=null;t++)k[t]&&(k[t]===!0||k[t].nodeType===1&&m.contains(d,k[t]))&&e.push(j[t]);else for(t=0;k[t]!=null;t++)k[t]&&k[t].nodeType===1&&e.push(j[t]);else s(k,e);l&&(m(l,h,e,f),m.uniqueSort(e));return e};m.uniqueSort=function(a){if(u){h=i,a.sort(u);if(h)for(var b=1;b<a.length;b++)a[b]===a[b-1]&&a.splice(b--,1)}return a},m.matches=function(a,b){return m(a,null,null,b)},m.matchesSelector=function(a,b){return m(b,null,null,[a]).length>0},m.find=function(a,b,c){var d,e,f,g,h,i;if(!a)return[];for(e=0,f=o.order.length;e<f;e++){h=o.order[e];if(g=o.leftMatch[h].exec(a)){i=g[1],g.splice(1,1);if(i.substr(i.length-1)!=="\\"){g[1]=(g[1]||"").replace(j,""),d=o.find[h](g,b,c);if(d!=null){a=a.replace(o.match[h],"");break}}}}d||(d=typeof b.getElementsByTagName!="undefined"?b.getElementsByTagName("*"):[]);return{set:d,expr:a}},m.filter=function(a,c,d,e){var f,g,h,i,j,k,l,n,p,q=a,r=[],s=c,t=c&&c[0]&&m.isXML(c[0]);while(a&&c.length){for(h in o.filter)if((f=o.leftMatch[h].exec(a))!=null&&f[2]){k=o.filter[h],l=f[1],g=!1,f.splice(1,1);if(l.substr(l.length-1)==="\\")continue;s===r&&(r=[]);if(o.preFilter[h]){f=o.preFilter[h](f,s,d,r,e,t);if(!f)g=i=!0;else if(f===!0)continue}if(f)for(n=0;(j=s[n])!=null;n++)j&&(i=k(j,f,n,s),p=e^i,d&&i!=null?p?g=!0:s[n]=!1:p&&(r.push(j),g=!0));if(i!==b){d||(s=r),a=a.replace(o.match[h],"");if(!g)return[];break}}if(a===q)if(g==null)m.error(a);else break;q=a}return s},m.error=function(a){throw new Error("Syntax error, unrecognized expression: "+a)};var n=m.getText=function(a){var b,c,d=a.nodeType,e="";if(d){if(d===1||d===9||d===11){if(typeof a.textContent=="string")return a.textContent;if(typeof a.innerText=="string")return a.innerText.replace(k,"");for(a=a.firstChild;a;a=a.nextSibling)e+=n(a)}else if(d===3||d===4)return a.nodeValue}else for(b=0;c=a[b];b++)c.nodeType!==8&&(e+=n(c));return e},o=m.selectors={order:["ID","NAME","TAG"],match:{ID:/#((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,CLASS:/\.((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,NAME:/\[name=['"]*((?:[\w\u00c0-\uFFFF\-]|\\.)+)['"]*\]/,ATTR:/\[\s*((?:[\w\u00c0-\uFFFF\-]|\\.)+)\s*(?:(\S?=)\s*(?:(['"])(.*?)\3|(#?(?:[\w\u00c0-\uFFFF\-]|\\.)*)|)|)\s*\]/,TAG:/^((?:[\w\u00c0-\uFFFF\*\-]|\\.)+)/,CHILD:/:(only|nth|last|first)-child(?:\(\s*(even|odd|(?:[+\-]?\d+|(?:[+\-]?\d*)?n\s*(?:[+\-]\s*\d+)?))\s*\))?/,POS:/:(nth|eq|gt|lt|first|last|even|odd)(?:\((\d*)\))?(?=[^\-]|$)/,PSEUDO:/:((?:[\w\u00c0-\uFFFF\-]|\\.)+)(?:\((['"]?)((?:\([^\)]+\)|[^\(\)]*)+)\2\))?/},leftMatch:{},attrMap:{"class":"className","for":"htmlFor"},attrHandle:{href:function(a){return a.getAttribute("href")},type:function(a){return a.getAttribute("type")}},relative:{"+":function(a,b){var c=typeof b=="string",d=c&&!l.test(b),e=c&&!d;d&&(b=b.toLowerCase());for(var f=0,g=a.length,h;f<g;f++)if(h=a[f]){while((h=h.previousSibling)&&h.nodeType!==1);a[f]=e||h&&h.nodeName.toLowerCase()===b?h||!1:h===b}e&&m.filter(b,a,!0)},">":function(a,b){var c,d=typeof b=="string",e=0,f=a.length;if(d&&!l.test(b)){b=b.toLowerCase();for(;e<f;e++){c=a[e];if(c){var g=c.parentNode;a[e]=g.nodeName.toLowerCase()===b?g:!1}}}else{for(;e<f;e++)c=a[e],c&&(a[e]=d?c.parentNode:c.parentNode===b);d&&m.filter(b,a,!0)}},"":function(a,b,c){var d,f=e++,g=x;typeof b=="string"&&!l.test(b)&&(b=b.toLowerCase(),d=b,g=w),g("parentNode",b,f,a,d,c)},"~":function(a,b,c){var d,f=e++,g=x;typeof b=="string"&&!l.test(b)&&(b=b.toLowerCase(),d=b,g=w),g("previousSibling",b,f,a,d,c)}},find:{ID:function(a,b,c){if(typeof b.getElementById!="undefined"&&!c){var d=b.getElementById(a[1]);return d&&d.parentNode?[d]:[]}},NAME:function(a,b){if(typeof b.getElementsByName!="undefined"){var c=[],d=b.getElementsByName(a[1]);for(var e=0,f=d.length;e<f;e++)d[e].getAttribute("name")===a[1]&&c.push(d[e]);return c.length===0?null:c}},TAG:function(a,b){if(typeof b.getElementsByTagName!="undefined")return b.getElementsByTagName(a[1])}},preFilter:{CLASS:function(a,b,c,d,e,f){a=" "+a[1].replace(j,"")+" ";if(f)return a;for(var g=0,h;(h=b[g])!=null;g++)h&&(e^(h.className&&(" "+h.className+" ").replace(/[\t\n\r]/g," ").indexOf(a)>=0)?c||d.push(h):c&&(b[g]=!1));return!1},ID:function(a){return a[1].replace(j,"")},TAG:function(a,b){return a[1].replace(j,"").toLowerCase()},CHILD:function(a){if(a[1]==="nth"){a[2]||m.error(a[0]),a[2]=a[2].replace(/^\+|\s*/g,"");var b=/(-?)(\d*)(?:n([+\-]?\d*))?/.exec(a[2]==="even"&&"2n"||a[2]==="odd"&&"2n+1"||!/\D/.test(a[2])&&"0n+"+a[2]||a[2]);a[2]=b[1]+(b[2]||1)-0,a[3]=b[3]-0}else a[2]&&m.error(a[0]);a[0]=e++;return a},ATTR:function(a,b,c,d,e,f){var g=a[1]=a[1].replace(j,"");!f&&o.attrMap[g]&&(a[1]=o.attrMap[g]),a[4]=(a[4]||a[5]||"").replace(j,""),a[2]==="~="&&(a[4]=" "+a[4]+" ");return a},PSEUDO:function(b,c,d,e,f){if(b[1]==="not")if((a.exec(b[3])||"").length>1||/^\w/.test(b[3]))b[3]=m(b[3],null,null,c);else{var g=m.filter(b[3],c,d,!0^f);d||e.push.apply(e,g);return!1}else if(o.match.POS.test(b[0])||o.match.CHILD.test(b[0]))return!0;return b},POS:function(a){a.unshift(!0);return a}},filters:{enabled:function(a){return a.disabled===!1&&a.type!=="hidden"},disabled:function(a){return a.disabled===!0},checked:function(a){return a.checked===!0},selected:function(a){a.parentNode&&a.parentNode.selectedIndex;return a.selected===!0},parent:function(a){return!!a.firstChild},empty:function(a){return!a.firstChild},has:function(a,b,c){return!!m(c[3],a).length},header:function(a){return/h\d/i.test(a.nodeName)},text:function(a){var b=a.getAttribute("type"),c=a.type;return a.nodeName.toLowerCase()==="input"&&"text"===c&&(b===c||b===null)},radio:function(a){return a.nodeName.toLowerCase()==="input"&&"radio"===a.type},checkbox:function(a){return a.nodeName.toLowerCase()==="input"&&"checkbox"===a.type},file:function(a){return a.nodeName.toLowerCase()==="input"&&"file"===a.type},password:function(a){return a.nodeName.toLowerCase()==="input"&&"password"===a.type},submit:function(a){var b=a.nodeName.toLowerCase();return(b==="input"||b==="button")&&"submit"===a.type},image:function(a){return a.nodeName.toLowerCase()==="input"&&"image"===a.type},reset:function(a){var b=a.nodeName.toLowerCase();return(b==="input"||b==="button")&&"reset"===a.type},button:function(a){var b=a.nodeName.toLowerCase();return b==="input"&&"button"===a.type||b==="button"},input:function(a){return/input|select|textarea|button/i.test(a.nodeName)},focus:function(a){return a===a.ownerDocument.activeElement}},setFilters:{first:function(a,b){return b===0},last:function(a,b,c,d){return b===d.length-1},even:function(a,b){return b%2===0},odd:function(a,b){return b%2===1},lt:function(a,b,c){return b<c[3]-0},gt:function(a,b,c){return b>c[3]-0},nth:function(a,b,c){return c[3]-0===b},eq:function(a,b,c){return c[3]-0===b}},filter:{PSEUDO:function(a,b,c,d){var e=b[1],f=o.filters[e];if(f)return f(a,c,b,d);if(e==="contains")return(a.textContent||a.innerText||n([a])||"").indexOf(b[3])>=0;if(e==="not"){var g=b[3];for(var h=0,i=g.length;h<i;h++)if(g[h]===a)return!1;return!0}m.error(e)},CHILD:function(a,b){var c,e,f,g,h,i,j,k=b[1],l=a;switch(k){case"only":case"first":while(l=l.previousSibling)if(l.nodeType===1)return!1;if(k==="first")return!0;l=a;case"last":while(l=l.nextSibling)if(l.nodeType===1)return!1;return!0;case"nth":c=b[2],e=b[3];if(c===1&&e===0)return!0;f=b[0],g=a.parentNode;if(g&&(g[d]!==f||!a.nodeIndex)){i=0;for(l=g.firstChild;l;l=l.nextSibling)l.nodeType===1&&(l.nodeIndex=++i);g[d]=f}j=a.nodeIndex-e;return c===0?j===0:j%c===0&&j/c>=0}},ID:function(a,b){return a.nodeType===1&&a.getAttribute("id")===b},TAG:function(a,b){return b==="*"&&a.nodeType===1||!!a.nodeName&&a.nodeName.toLowerCase()===b},CLASS:function(a,b){return(" "+(a.className||a.getAttribute("class"))+" ").indexOf(b)>-1},ATTR:function(a,b){var c=b[1],d=m.attr?m.attr(a,c):o.attrHandle[c]?o.attrHandle[c](a):a[c]!=null?a[c]:a.getAttribute(c),e=d+"",f=b[2],g=b[4];return d==null?f==="!=":!f&&m.attr?d!=null:f==="="?e===g:f==="*="?e.indexOf(g)>=0:f==="~="?(" "+e+" ").indexOf(g)>=0:g?f==="!="?e!==g:f==="^="?e.indexOf(g)===0:f==="$="?e.substr(e.length-g.length)===g:f==="|="?e===g||e.substr(0,g.length+1)===g+"-":!1:e&&d!==!1},POS:function(a,b,c,d){var e=b[2],f=o.setFilters[e];if(f)return f(a,c,b,d)}}},p=o.match.POS,q=function(a,b){return"\\"+(b-0+1)};for(var r in o.match)o.match[r]=new RegExp(o.match[r].source+/(?![^\[]*\])(?![^\(]*\))/.source),o.leftMatch[r]=new RegExp(/(^(?:.|\r|\n)*?)/.source+o.match[r].source.replace(/\\(\d+)/g,q));o.match.globalPOS=p;var s=function(a,b){a=Array.prototype.slice.call(a,0);if(b){b.push.apply(b,a);return b}return a};try{Array.prototype.slice.call(c.documentElement.childNodes,0)[0].nodeType}catch(t){s=function(a,b){var c=0,d=b||[];if(g.call(a)==="[object Array]")Array.prototype.push.apply(d,a);else if(typeof a.length=="number")for(var e=a.length;c<e;c++)d.push(a[c]);else for(;a[c];c++)d.push(a[c]);return d}}var u,v;c.documentElement.compareDocumentPosition?u=function(a,b){if(a===b){h=!0;return 0}if(!a.compareDocumentPosition||!b.compareDocumentPosition)return a.compareDocumentPosition?-1:1;return a.compareDocumentPosition(b)&4?-1:1}:(u=function(a,b){if(a===b){h=!0;return 0}if(a.sourceIndex&&b.sourceIndex)return a.sourceIndex-b.sourceIndex;var c,d,e=[],f=[],g=a.parentNode,i=b.parentNode,j=g;if(g===i)return v(a,b);if(!g)return-1;if(!i)return 1;while(j)e.unshift(j),j=j.parentNode;j=i;while(j)f.unshift(j),j=j.parentNode;c=e.length,d=f.length;for(var k=0;k<c&&k<d;k++)if(e[k]!==f[k])return v(e[k],f[k]);return k===c?v(a,f[k],-1):v(e[k],b,1)},v=function(a,b,c){if(a===b)return c;var d=a.nextSibling;while(d){if(d===b)return-1;d=d.nextSibling}return 1}),function(){var a=c.createElement("div"),d="script"+(new Date).getTime(),e=c.documentElement;a.innerHTML="<a name='"+d+"'/>",e.insertBefore(a,e.firstChild),c.getElementById(d)&&(o.find.ID=function(a,c,d){if(typeof c.getElementById!="undefined"&&!d){var e=c.getElementById(a[1]);return e?e.id===a[1]||typeof e.getAttributeNode!="undefined"&&e.getAttributeNode("id").nodeValue===a[1]?[e]:b:[]}},o.filter.ID=function(a,b){var c=typeof a.getAttributeNode!="undefined"&&a.getAttributeNode("id");return a.nodeType===1&&c&&c.nodeValue===b}),e.removeChild(a),e=a=null}(),function(){var a=c.createElement("div");a.appendChild(c.createComment("")),a.getElementsByTagName("*").length>0&&(o.find.TAG=function(a,b){var c=b.getElementsByTagName(a[1]);if(a[1]==="*"){var d=[];for(var e=0;c[e];e++)c[e].nodeType===1&&d.push(c[e]);c=d}return c}),a.innerHTML="<a href='#'></a>",a.firstChild&&typeof a.firstChild.getAttribute!="undefined"&&a.firstChild.getAttribute("href")!=="#"&&(o.attrHandle.href=function(a){return a.getAttribute("href",2)}),a=null}(),c.querySelectorAll&&function(){var a=m,b=c.createElement("div"),d="__sizzle__";b.innerHTML="<p class='TEST'></p>";if(!b.querySelectorAll||b.querySelectorAll(".TEST").length!==0){m=function(b,e,f,g){e=e||c;if(!g&&!m.isXML(e)){var h=/^(\w+$)|^\.([\w\-]+$)|^#([\w\-]+$)/.exec(b);if(h&&(e.nodeType===1||e.nodeType===9)){if(h[1])return s(e.getElementsByTagName(b),f);if(h[2]&&o.find.CLASS&&e.getElementsByClassName)return s(e.getElementsByClassName(h[2]),f)}if(e.nodeType===9){if(b==="body"&&e.body)return s([e.body],f);if(h&&h[3]){var i=e.getElementById(h[3]);if(!i||!i.parentNode)return s([],f);if(i.id===h[3])return s([i],f)}try{return s(e.querySelectorAll(b),f)}catch(j){}}else if(e.nodeType===1&&e.nodeName.toLowerCase()!=="object"){var k=e,l=e.getAttribute("id"),n=l||d,p=e.parentNode,q=/^\s*[+~]/.test(b);l?n=n.replace(/'/g,"\\$&"):e.setAttribute("id",n),q&&p&&(e=e.parentNode);try{if(!q||p)return s(e.querySelectorAll("[id='"+n+"'] "+b),f)}catch(r){}finally{l||k.removeAttribute("id")}}}return a(b,e,f,g)};for(var e in a)m[e]=a[e];b=null}}(),function(){var a=c.documentElement,b=a.matchesSelector||a.mozMatchesSelector||a.webkitMatchesSelector||a.msMatchesSelector;if(b){var d=!b.call(c.createElement("div"),"div"),e=!1;try{b.call(c.documentElement,"[test!='']:sizzle")}catch(f){e=!0}m.matchesSelector=function(a,c){c=c.replace(/\=\s*([^'"\]]*)\s*\]/g,"='$1']");if(!m.isXML(a))try{if(e||!o.match.PSEUDO.test(c)&&!/!=/.test(c)){var f=b.call(a,c);if(f||!d||a.document&&a.document.nodeType!==11)return f}}catch(g){}return m(c,null,null,[a]).length>0}}}(),function(){var a=c.createElement("div");a.innerHTML="<div class='test e'></div><div class='test'></div>";if(!!a.getElementsByClassName&&a.getElementsByClassName("e").length!==0){a.lastChild.className="e";if(a.getElementsByClassName("e").length===1)return;o.order.splice(1,0,"CLASS"),o.find.CLASS=function(a,b,c){if(typeof b.getElementsByClassName!="undefined"&&!c)return b.getElementsByClassName(a[1])},a=null}}(),c.documentElement.contains?m.contains=function(a,b){return a!==b&&(a.contains?a.contains(b):!0)}:c.documentElement.compareDocumentPosition?m.contains=function(a,b){return!!(a.compareDocumentPosition(b)&16)}:m.contains=function(){return!1},m.isXML=function(a){var b=(a?a.ownerDocument||a:0).documentElement;return b?b.nodeName!=="HTML":!1};var y=function(a,b,c){var d,e=[],f="",g=b.nodeType?[b]:b;while(d=o.match.PSEUDO.exec(a))f+=d[0],a=a.replace(o.match.PSEUDO,"");a=o.relative[a]?a+"*":a;for(var h=0,i=g.length;h<i;h++)m(a,g[h],e,c);return m.filter(f,e)};m.attr=f.attr,m.selectors.attrMap={},f.find=m,f.expr=m.selectors,f.expr[":"]=f.expr.filters,f.unique=m.uniqueSort,f.text=m.getText,f.isXMLDoc=m.isXML,f.contains=m.contains}();var L=/Until$/,M=/^(?:parents|prevUntil|prevAll)/,N=/,/,O=/^.[^:#\[\.,]*$/,P=Array.prototype.slice,Q=f.expr.match.globalPOS,R={children:!0,contents:!0,next:!0,prev:!0};f.fn.extend({find:function(a){var b=this,c,d;if(typeof a!="string")return f(a).filter(function(){for(c=0,d=b.length;c<d;c++)if(f.contains(b[c],this))return!0});var e=this.pushStack("","find",a),g,h,i;for(c=0,d=this.length;c<d;c++){g=e.length,f.find(a,this[c],e);if(c>0)for(h=g;h<e.length;h++)for(i=0;i<g;i++)if(e[i]===e[h]){e.splice(h--,1);break}}return e},has:function(a){var b=f(a);return this.filter(function(){for(var a=0,c=b.length;a<c;a++)if(f.contains(this,b[a]))return!0})},not:function(a){return this.pushStack(T(this,a,!1),"not",a)},filter:function(a){return this.pushStack(T(this,a,!0),"filter",a)},is:function(a){return!!a&&(typeof a=="string"?Q.test(a)?f(a,this.context).index(this[0])>=0:f.filter(a,this).length>0:this.filter(a).length>0)},closest:function(a,b){var c=[],d,e,g=this[0];if(f.isArray(a)){var h=1;while(g&&g.ownerDocument&&g!==b){for(d=0;d<a.length;d++)f(g).is(a[d])&&c.push({selector:a[d],elem:g,level:h});g=g.parentNode,h++}return c}var i=Q.test(a)||typeof a!="string"?f(a,b||this.context):0;for(d=0,e=this.length;d<e;d++){g=this[d];while(g){if(i?i.index(g)>-1:f.find.matchesSelector(g,a)){c.push(g);break}g=g.parentNode;if(!g||!g.ownerDocument||g===b||g.nodeType===11)break}}c=c.length>1?f.unique(c):c;return this.pushStack(c,"closest",a)},index:function(a){if(!a)return this[0]&&this[0].parentNode?this.prevAll().length:-1;if(typeof a=="string")return f.inArray(this[0],f(a));return f.inArray(a.jquery?a[0]:a,this)},add:function(a,b){var c=typeof a=="string"?f(a,b):f.makeArray(a&&a.nodeType?[a]:a),d=f.merge(this.get(),c);return this.pushStack(S(c[0])||S(d[0])?d:f.unique(d))},andSelf:function(){return this.add(this.prevObject)}}),f.each({parent:function(a){var b=a.parentNode;return b&&b.nodeType!==11?b:null},parents:function(a){return f.dir(a,"parentNode")},parentsUntil:function(a,b,c){return f.dir(a,"parentNode",c)},next:function(a){return f.nth(a,2,"nextSibling")},prev:function(a){return f.nth(a,2,"previousSibling")},nextAll:function(a){return f.dir(a,"nextSibling")},prevAll:function(a){return f.dir(a,"previousSibling")},nextUntil:function(a,b,c){return f.dir(a,"nextSibling",c)},prevUntil:function(a,b,c){return f.dir(a,"previousSibling",c)},siblings:function(a){return f.sibling((a.parentNode||{}).firstChild,a)},children:function(a){return f.sibling(a.firstChild)},contents:function(a){return f.nodeName(a,"iframe")?a.contentDocument||a.contentWindow.document:f.makeArray(a.childNodes)}},function(a,b){f.fn[a]=function(c,d){var e=f.map(this,b,c);L.test(a)||(d=c),d&&typeof d=="string"&&(e=f.filter(d,e)),e=this.length>1&&!R[a]?f.unique(e):e,(this.length>1||N.test(d))&&M.test(a)&&(e=e.reverse());return this.pushStack(e,a,P.call(arguments).join(","))}}),f.extend({filter:function(a,b,c){c&&(a=":not("+a+")");return b.length===1?f.find.matchesSelector(b[0],a)?[b[0]]:[]:f.find.matches(a,b)},dir:function(a,c,d){var e=[],g=a[c];while(g&&g.nodeType!==9&&(d===b||g.nodeType!==1||!f(g).is(d)))g.nodeType===1&&e.push(g),g=g[c];return e},nth:function(a,b,c,d){b=b||1;var e=0;for(;a;a=a[c])if(a.nodeType===1&&++e===b)break;return a},sibling:function(a,b){var c=[];for(;a;a=a.nextSibling)a.nodeType===1&&a!==b&&c.push(a);return c}});var V="abbr|article|aside|audio|bdi|canvas|data|datalist|details|figcaption|figure|footer|header|hgroup|mark|meter|nav|output|progress|section|summary|time|video",W=/ jQuery\d+="(?:\d+|null)"/g,X=/^\s+/,Y=/<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig,Z=/<([\w:]+)/,$=/<tbody/i,_=/<|&#?\w+;/,ba=/<(?:script|style)/i,bb=/<(?:script|object|embed|option|style)/i,bc=new RegExp("<(?:"+V+")[\\s/>]","i"),bd=/checked\s*(?:[^=]|=\s*.checked.)/i,be=/\/(java|ecma)script/i,bf=/^\s*<!(?:\[CDATA\[|\-\-)/,bg={option:[1,"<select multiple='multiple'>","</select>"],legend:[1,"<fieldset>","</fieldset>"],thead:[1,"<table>","</table>"],tr:[2,"<table><tbody>","</tbody></table>"],td:[3,"<table><tbody><tr>","</tr></tbody></table>"],col:[2,"<table><tbody></tbody><colgroup>","</colgroup></table>"],area:[1,"<map>","</map>"],_default:[0,"",""]},bh=U(c);bg.optgroup=bg.option,bg.tbody=bg.tfoot=bg.colgroup=bg.caption=bg.thead,bg.th=bg.td,f.support.htmlSerialize||(bg._default=[1,"div<div>","</div>"]),f.fn.extend({text:function(a){return f.access(this,function(a){return a===b?f.text(this):this.empty().append((this[0]&&this[0].ownerDocument||c).createTextNode(a))},null,a,arguments.length)},wrapAll:function(a){if(f.isFunction(a))return this.each(function(b){f(this).wrapAll(a.call(this,b))});if(this[0]){var b=f(a,this[0].ownerDocument).eq(0).clone(!0);this[0].parentNode&&b.insertBefore(this[0]),b.map(function(){var a=this;while(a.firstChild&&a.firstChild.nodeType===1)a=a.firstChild;return a}).append(this)}return this},wrapInner:function(a){if(f.isFunction(a))return this.each(function(b){f(this).wrapInner(a.call(this,b))});return this.each(function(){var b=f(this),c=b.contents();c.length?c.wrapAll(a):b.append(a)})},wrap:function(a){var b=f.isFunction(a);return this.each(function(c){f(this).wrapAll(b?a.call(this,c):a)})},unwrap:function(){return this.parent().each(function(){f.nodeName(this,"body")||f(this).replaceWith(this.childNodes)}).end()},append:function(){return this.domManip(arguments,!0,function(a){this.nodeType===1&&this.appendChild(a)})},prepend:function(){return this.domManip(arguments,!0,function(a){this.nodeType===1&&this.insertBefore(a,this.firstChild)})},before:function(){if(this[0]&&this[0].parentNode)return this.domManip(arguments,!1,function(a){this.parentNode.insertBefore(a,this)});if(arguments.length){var a=f
.clean(arguments);a.push.apply(a,this.toArray());return this.pushStack(a,"before",arguments)}},after:function(){if(this[0]&&this[0].parentNode)return this.domManip(arguments,!1,function(a){this.parentNode.insertBefore(a,this.nextSibling)});if(arguments.length){var a=this.pushStack(this,"after",arguments);a.push.apply(a,f.clean(arguments));return a}},remove:function(a,b){for(var c=0,d;(d=this[c])!=null;c++)if(!a||f.filter(a,[d]).length)!b&&d.nodeType===1&&(f.cleanData(d.getElementsByTagName("*")),f.cleanData([d])),d.parentNode&&d.parentNode.removeChild(d);return this},empty:function(){for(var a=0,b;(b=this[a])!=null;a++){b.nodeType===1&&f.cleanData(b.getElementsByTagName("*"));while(b.firstChild)b.removeChild(b.firstChild)}return this},clone:function(a,b){a=a==null?!1:a,b=b==null?a:b;return this.map(function(){return f.clone(this,a,b)})},html:function(a){return f.access(this,function(a){var c=this[0]||{},d=0,e=this.length;if(a===b)return c.nodeType===1?c.innerHTML.replace(W,""):null;if(typeof a=="string"&&!ba.test(a)&&(f.support.leadingWhitespace||!X.test(a))&&!bg[(Z.exec(a)||["",""])[1].toLowerCase()]){a=a.replace(Y,"<$1></$2>");try{for(;d<e;d++)c=this[d]||{},c.nodeType===1&&(f.cleanData(c.getElementsByTagName("*")),c.innerHTML=a);c=0}catch(g){}}c&&this.empty().append(a)},null,a,arguments.length)},replaceWith:function(a){if(this[0]&&this[0].parentNode){if(f.isFunction(a))return this.each(function(b){var c=f(this),d=c.html();c.replaceWith(a.call(this,b,d))});typeof a!="string"&&(a=f(a).detach());return this.each(function(){var b=this.nextSibling,c=this.parentNode;f(this).remove(),b?f(b).before(a):f(c).append(a)})}return this.length?this.pushStack(f(f.isFunction(a)?a():a),"replaceWith",a):this},detach:function(a){return this.remove(a,!0)},domManip:function(a,c,d){var e,g,h,i,j=a[0],k=[];if(!f.support.checkClone&&arguments.length===3&&typeof j=="string"&&bd.test(j))return this.each(function(){f(this).domManip(a,c,d,!0)});if(f.isFunction(j))return this.each(function(e){var g=f(this);a[0]=j.call(this,e,c?g.html():b),g.domManip(a,c,d)});if(this[0]){i=j&&j.parentNode,f.support.parentNode&&i&&i.nodeType===11&&i.childNodes.length===this.length?e={fragment:i}:e=f.buildFragment(a,this,k),h=e.fragment,h.childNodes.length===1?g=h=h.firstChild:g=h.firstChild;if(g){c=c&&f.nodeName(g,"tr");for(var l=0,m=this.length,n=m-1;l<m;l++)d.call(c?bi(this[l],g):this[l],e.cacheable||m>1&&l<n?f.clone(h,!0,!0):h)}k.length&&f.each(k,function(a,b){b.src?f.ajax({type:"GET",global:!1,url:b.src,async:!1,dataType:"script"}):f.globalEval((b.text||b.textContent||b.innerHTML||"").replace(bf,"/*$0*/")),b.parentNode&&b.parentNode.removeChild(b)})}return this}}),f.buildFragment=function(a,b,d){var e,g,h,i,j=a[0];b&&b[0]&&(i=b[0].ownerDocument||b[0]),i.createDocumentFragment||(i=c),a.length===1&&typeof j=="string"&&j.length<512&&i===c&&j.charAt(0)==="<"&&!bb.test(j)&&(f.support.checkClone||!bd.test(j))&&(f.support.html5Clone||!bc.test(j))&&(g=!0,h=f.fragments[j],h&&h!==1&&(e=h)),e||(e=i.createDocumentFragment(),f.clean(a,i,e,d)),g&&(f.fragments[j]=h?e:1);return{fragment:e,cacheable:g}},f.fragments={},f.each({appendTo:"append",prependTo:"prepend",insertBefore:"before",insertAfter:"after",replaceAll:"replaceWith"},function(a,b){f.fn[a]=function(c){var d=[],e=f(c),g=this.length===1&&this[0].parentNode;if(g&&g.nodeType===11&&g.childNodes.length===1&&e.length===1){e[b](this[0]);return this}for(var h=0,i=e.length;h<i;h++){var j=(h>0?this.clone(!0):this).get();f(e[h])[b](j),d=d.concat(j)}return this.pushStack(d,a,e.selector)}}),f.extend({clone:function(a,b,c){var d,e,g,h=f.support.html5Clone||f.isXMLDoc(a)||!bc.test("<"+a.nodeName+">")?a.cloneNode(!0):bo(a);if((!f.support.noCloneEvent||!f.support.noCloneChecked)&&(a.nodeType===1||a.nodeType===11)&&!f.isXMLDoc(a)){bk(a,h),d=bl(a),e=bl(h);for(g=0;d[g];++g)e[g]&&bk(d[g],e[g])}if(b){bj(a,h);if(c){d=bl(a),e=bl(h);for(g=0;d[g];++g)bj(d[g],e[g])}}d=e=null;return h},clean:function(a,b,d,e){var g,h,i,j=[];b=b||c,typeof b.createElement=="undefined"&&(b=b.ownerDocument||b[0]&&b[0].ownerDocument||c);for(var k=0,l;(l=a[k])!=null;k++){typeof l=="number"&&(l+="");if(!l)continue;if(typeof l=="string")if(!_.test(l))l=b.createTextNode(l);else{l=l.replace(Y,"<$1></$2>");var m=(Z.exec(l)||["",""])[1].toLowerCase(),n=bg[m]||bg._default,o=n[0],p=b.createElement("div"),q=bh.childNodes,r;b===c?bh.appendChild(p):U(b).appendChild(p),p.innerHTML=n[1]+l+n[2];while(o--)p=p.lastChild;if(!f.support.tbody){var s=$.test(l),t=m==="table"&&!s?p.firstChild&&p.firstChild.childNodes:n[1]==="<table>"&&!s?p.childNodes:[];for(i=t.length-1;i>=0;--i)f.nodeName(t[i],"tbody")&&!t[i].childNodes.length&&t[i].parentNode.removeChild(t[i])}!f.support.leadingWhitespace&&X.test(l)&&p.insertBefore(b.createTextNode(X.exec(l)[0]),p.firstChild),l=p.childNodes,p&&(p.parentNode.removeChild(p),q.length>0&&(r=q[q.length-1],r&&r.parentNode&&r.parentNode.removeChild(r)))}var u;if(!f.support.appendChecked)if(l[0]&&typeof (u=l.length)=="number")for(i=0;i<u;i++)bn(l[i]);else bn(l);l.nodeType?j.push(l):j=f.merge(j,l)}if(d){g=function(a){return!a.type||be.test(a.type)};for(k=0;j[k];k++){h=j[k];if(e&&f.nodeName(h,"script")&&(!h.type||be.test(h.type)))e.push(h.parentNode?h.parentNode.removeChild(h):h);else{if(h.nodeType===1){var v=f.grep(h.getElementsByTagName("script"),g);j.splice.apply(j,[k+1,0].concat(v))}d.appendChild(h)}}}return j},cleanData:function(a){var b,c,d=f.cache,e=f.event.special,g=f.support.deleteExpando;for(var h=0,i;(i=a[h])!=null;h++){if(i.nodeName&&f.noData[i.nodeName.toLowerCase()])continue;c=i[f.expando];if(c){b=d[c];if(b&&b.events){for(var j in b.events)e[j]?f.event.remove(i,j):f.removeEvent(i,j,b.handle);b.handle&&(b.handle.elem=null)}g?delete i[f.expando]:i.removeAttribute&&i.removeAttribute(f.expando),delete d[c]}}}});var bp=/alpha\([^)]*\)/i,bq=/opacity=([^)]*)/,br=/([A-Z]|^ms)/g,bs=/^[\-+]?(?:\d*\.)?\d+$/i,bt=/^-?(?:\d*\.)?\d+(?!px)[^\d\s]+$/i,bu=/^([\-+])=([\-+.\de]+)/,bv=/^margin/,bw={position:"absolute",visibility:"hidden",display:"block"},bx=["Top","Right","Bottom","Left"],by,bz,bA;f.fn.css=function(a,c){return f.access(this,function(a,c,d){return d!==b?f.style(a,c,d):f.css(a,c)},a,c,arguments.length>1)},f.extend({cssHooks:{opacity:{get:function(a,b){if(b){var c=by(a,"opacity");return c===""?"1":c}return a.style.opacity}}},cssNumber:{fillOpacity:!0,fontWeight:!0,lineHeight:!0,opacity:!0,orphans:!0,widows:!0,zIndex:!0,zoom:!0},cssProps:{"float":f.support.cssFloat?"cssFloat":"styleFloat"},style:function(a,c,d,e){if(!!a&&a.nodeType!==3&&a.nodeType!==8&&!!a.style){var g,h,i=f.camelCase(c),j=a.style,k=f.cssHooks[i];c=f.cssProps[i]||i;if(d===b){if(k&&"get"in k&&(g=k.get(a,!1,e))!==b)return g;return j[c]}h=typeof d,h==="string"&&(g=bu.exec(d))&&(d=+(g[1]+1)*+g[2]+parseFloat(f.css(a,c)),h="number");if(d==null||h==="number"&&isNaN(d))return;h==="number"&&!f.cssNumber[i]&&(d+="px");if(!k||!("set"in k)||(d=k.set(a,d))!==b)try{j[c]=d}catch(l){}}},css:function(a,c,d){var e,g;c=f.camelCase(c),g=f.cssHooks[c],c=f.cssProps[c]||c,c==="cssFloat"&&(c="float");if(g&&"get"in g&&(e=g.get(a,!0,d))!==b)return e;if(by)return by(a,c)},swap:function(a,b,c){var d={},e,f;for(f in b)d[f]=a.style[f],a.style[f]=b[f];e=c.call(a);for(f in b)a.style[f]=d[f];return e}}),f.curCSS=f.css,c.defaultView&&c.defaultView.getComputedStyle&&(bz=function(a,b){var c,d,e,g,h=a.style;b=b.replace(br,"-$1").toLowerCase(),(d=a.ownerDocument.defaultView)&&(e=d.getComputedStyle(a,null))&&(c=e.getPropertyValue(b),c===""&&!f.contains(a.ownerDocument.documentElement,a)&&(c=f.style(a,b))),!f.support.pixelMargin&&e&&bv.test(b)&&bt.test(c)&&(g=h.width,h.width=c,c=e.width,h.width=g);return c}),c.documentElement.currentStyle&&(bA=function(a,b){var c,d,e,f=a.currentStyle&&a.currentStyle[b],g=a.style;f==null&&g&&(e=g[b])&&(f=e),bt.test(f)&&(c=g.left,d=a.runtimeStyle&&a.runtimeStyle.left,d&&(a.runtimeStyle.left=a.currentStyle.left),g.left=b==="fontSize"?"1em":f,f=g.pixelLeft+"px",g.left=c,d&&(a.runtimeStyle.left=d));return f===""?"auto":f}),by=bz||bA,f.each(["height","width"],function(a,b){f.cssHooks[b]={get:function(a,c,d){if(c)return a.offsetWidth!==0?bB(a,b,d):f.swap(a,bw,function(){return bB(a,b,d)})},set:function(a,b){return bs.test(b)?b+"px":b}}}),f.support.opacity||(f.cssHooks.opacity={get:function(a,b){return bq.test((b&&a.currentStyle?a.currentStyle.filter:a.style.filter)||"")?parseFloat(RegExp.$1)/100+"":b?"1":""},set:function(a,b){var c=a.style,d=a.currentStyle,e=f.isNumeric(b)?"alpha(opacity="+b*100+")":"",g=d&&d.filter||c.filter||"";c.zoom=1;if(b>=1&&f.trim(g.replace(bp,""))===""){c.removeAttribute("filter");if(d&&!d.filter)return}c.filter=bp.test(g)?g.replace(bp,e):g+" "+e}}),f(function(){f.support.reliableMarginRight||(f.cssHooks.marginRight={get:function(a,b){return f.swap(a,{display:"inline-block"},function(){return b?by(a,"margin-right"):a.style.marginRight})}})}),f.expr&&f.expr.filters&&(f.expr.filters.hidden=function(a){var b=a.offsetWidth,c=a.offsetHeight;return b===0&&c===0||!f.support.reliableHiddenOffsets&&(a.style&&a.style.display||f.css(a,"display"))==="none"},f.expr.filters.visible=function(a){return!f.expr.filters.hidden(a)}),f.each({margin:"",padding:"",border:"Width"},function(a,b){f.cssHooks[a+b]={expand:function(c){var d,e=typeof c=="string"?c.split(" "):[c],f={};for(d=0;d<4;d++)f[a+bx[d]+b]=e[d]||e[d-2]||e[0];return f}}});var bC=/%20/g,bD=/\[\]$/,bE=/\r?\n/g,bF=/#.*$/,bG=/^(.*?):[ \t]*([^\r\n]*)\r?$/mg,bH=/^(?:color|date|datetime|datetime-local|email|hidden|month|number|password|range|search|tel|text|time|url|week)$/i,bI=/^(?:about|app|app\-storage|.+\-extension|file|res|widget):$/,bJ=/^(?:GET|HEAD)$/,bK=/^\/\//,bL=/\?/,bM=/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,bN=/^(?:select|textarea)/i,bO=/\s+/,bP=/([?&])_=[^&]*/,bQ=/^([\w\+\.\-]+:)(?:\/\/([^\/?#:]*)(?::(\d+))?)?/,bR=f.fn.load,bS={},bT={},bU,bV,bW=["*/"]+["*"];try{bU=e.href}catch(bX){bU=c.createElement("a"),bU.href="",bU=bU.href}bV=bQ.exec(bU.toLowerCase())||[],f.fn.extend({load:function(a,c,d){if(typeof a!="string"&&bR)return bR.apply(this,arguments);if(!this.length)return this;var e=a.indexOf(" ");if(e>=0){var g=a.slice(e,a.length);a=a.slice(0,e)}var h="GET";c&&(f.isFunction(c)?(d=c,c=b):typeof c=="object"&&(c=f.param(c,f.ajaxSettings.traditional),h="POST"));var i=this;f.ajax({url:a,type:h,dataType:"html",data:c,complete:function(a,b,c){c=a.responseText,a.isResolved()&&(a.done(function(a){c=a}),i.html(g?f("<div>").append(c.replace(bM,"")).find(g):c)),d&&i.each(d,[c,b,a])}});return this},serialize:function(){return f.param(this.serializeArray())},serializeArray:function(){return this.map(function(){return this.elements?f.makeArray(this.elements):this}).filter(function(){return this.name&&!this.disabled&&(this.checked||bN.test(this.nodeName)||bH.test(this.type))}).map(function(a,b){var c=f(this).val();return c==null?null:f.isArray(c)?f.map(c,function(a,c){return{name:b.name,value:a.replace(bE,"\r\n")}}):{name:b.name,value:c.replace(bE,"\r\n")}}).get()}}),f.each("ajaxStart ajaxStop ajaxComplete ajaxError ajaxSuccess ajaxSend".split(" "),function(a,b){f.fn[b]=function(a){return this.on(b,a)}}),f.each(["get","post"],function(a,c){f[c]=function(a,d,e,g){f.isFunction(d)&&(g=g||e,e=d,d=b);return f.ajax({type:c,url:a,data:d,success:e,dataType:g})}}),f.extend({getScript:function(a,c){return f.get(a,b,c,"script")},getJSON:function(a,b,c){return f.get(a,b,c,"json")},ajaxSetup:function(a,b){b?b$(a,f.ajaxSettings):(b=a,a=f.ajaxSettings),b$(a,b);return a},ajaxSettings:{url:bU,isLocal:bI.test(bV[1]),global:!0,type:"GET",contentType:"application/x-www-form-urlencoded; charset=UTF-8",processData:!0,async:!0,accepts:{xml:"application/xml, text/xml",html:"text/html",text:"text/plain",json:"application/json, text/javascript","*":bW},contents:{xml:/xml/,html:/html/,json:/json/},responseFields:{xml:"responseXML",text:"responseText"},converters:{"* text":a.String,"text html":!0,"text json":f.parseJSON,"text xml":f.parseXML},flatOptions:{context:!0,url:!0}},ajaxPrefilter:bY(bS),ajaxTransport:bY(bT),ajax:function(a,c){function w(a,c,l,m){if(s!==2){s=2,q&&clearTimeout(q),p=b,n=m||"",v.readyState=a>0?4:0;var o,r,u,w=c,x=l?ca(d,v,l):b,y,z;if(a>=200&&a<300||a===304){if(d.ifModified){if(y=v.getResponseHeader("Last-Modified"))f.lastModified[k]=y;if(z=v.getResponseHeader("Etag"))f.etag[k]=z}if(a===304)w="notmodified",o=!0;else try{r=cb(d,x),w="success",o=!0}catch(A){w="parsererror",u=A}}else{u=w;if(!w||a)w="error",a<0&&(a=0)}v.status=a,v.statusText=""+(c||w),o?h.resolveWith(e,[r,w,v]):h.rejectWith(e,[v,w,u]),v.statusCode(j),j=b,t&&g.trigger("ajax"+(o?"Success":"Error"),[v,d,o?r:u]),i.fireWith(e,[v,w]),t&&(g.trigger("ajaxComplete",[v,d]),--f.active||f.event.trigger("ajaxStop"))}}typeof a=="object"&&(c=a,a=b),c=c||{};var d=f.ajaxSetup({},c),e=d.context||d,g=e!==d&&(e.nodeType||e instanceof f)?f(e):f.event,h=f.Deferred(),i=f.Callbacks("once memory"),j=d.statusCode||{},k,l={},m={},n,o,p,q,r,s=0,t,u,v={readyState:0,setRequestHeader:function(a,b){if(!s){var c=a.toLowerCase();a=m[c]=m[c]||a,l[a]=b}return this},getAllResponseHeaders:function(){return s===2?n:null},getResponseHeader:function(a){var c;if(s===2){if(!o){o={};while(c=bG.exec(n))o[c[1].toLowerCase()]=c[2]}c=o[a.toLowerCase()]}return c===b?null:c},overrideMimeType:function(a){s||(d.mimeType=a);return this},abort:function(a){a=a||"abort",p&&p.abort(a),w(0,a);return this}};h.promise(v),v.success=v.done,v.error=v.fail,v.complete=i.add,v.statusCode=function(a){if(a){var b;if(s<2)for(b in a)j[b]=[j[b],a[b]];else b=a[v.status],v.then(b,b)}return this},d.url=((a||d.url)+"").replace(bF,"").replace(bK,bV[1]+"//"),d.dataTypes=f.trim(d.dataType||"*").toLowerCase().split(bO),d.crossDomain==null&&(r=bQ.exec(d.url.toLowerCase()),d.crossDomain=!(!r||r[1]==bV[1]&&r[2]==bV[2]&&(r[3]||(r[1]==="http:"?80:443))==(bV[3]||(bV[1]==="http:"?80:443)))),d.data&&d.processData&&typeof d.data!="string"&&(d.data=f.param(d.data,d.traditional)),bZ(bS,d,c,v);if(s===2)return!1;t=d.global,d.type=d.type.toUpperCase(),d.hasContent=!bJ.test(d.type),t&&f.active++===0&&f.event.trigger("ajaxStart");if(!d.hasContent){d.data&&(d.url+=(bL.test(d.url)?"&":"?")+d.data,delete d.data),k=d.url;if(d.cache===!1){var x=f.now(),y=d.url.replace(bP,"$1_="+x);d.url=y+(y===d.url?(bL.test(d.url)?"&":"?")+"_="+x:"")}}(d.data&&d.hasContent&&d.contentType!==!1||c.contentType)&&v.setRequestHeader("Content-Type",d.contentType),d.ifModified&&(k=k||d.url,f.lastModified[k]&&v.setRequestHeader("If-Modified-Since",f.lastModified[k]),f.etag[k]&&v.setRequestHeader("If-None-Match",f.etag[k])),v.setRequestHeader("Accept",d.dataTypes[0]&&d.accepts[d.dataTypes[0]]?d.accepts[d.dataTypes[0]]+(d.dataTypes[0]!=="*"?", "+bW+"; q=0.01":""):d.accepts["*"]);for(u in d.headers)v.setRequestHeader(u,d.headers[u]);if(d.beforeSend&&(d.beforeSend.call(e,v,d)===!1||s===2)){v.abort();return!1}for(u in{success:1,error:1,complete:1})v[u](d[u]);p=bZ(bT,d,c,v);if(!p)w(-1,"No Transport");else{v.readyState=1,t&&g.trigger("ajaxSend",[v,d]),d.async&&d.timeout>0&&(q=setTimeout(function(){v.abort("timeout")},d.timeout));try{s=1,p.send(l,w)}catch(z){if(s<2)w(-1,z);else throw z}}return v},param:function(a,c){var d=[],e=function(a,b){b=f.isFunction(b)?b():b,d[d.length]=encodeURIComponent(a)+"="+encodeURIComponent(b)};c===b&&(c=f.ajaxSettings.traditional);if(f.isArray(a)||a.jquery&&!f.isPlainObject(a))f.each(a,function(){e(this.name,this.value)});else for(var g in a)b_(g,a[g],c,e);return d.join("&").replace(bC,"+")}}),f.extend({active:0,lastModified:{},etag:{}});var cc=f.now(),cd=/(\=)\?(&|$)|\?\?/i;f.ajaxSetup({jsonp:"callback",jsonpCallback:function(){return f.expando+"_"+cc++}}),f.ajaxPrefilter("json jsonp",function(b,c,d){var e=typeof b.data=="string"&&/^application\/x\-www\-form\-urlencoded/.test(b.contentType);if(b.dataTypes[0]==="jsonp"||b.jsonp!==!1&&(cd.test(b.url)||e&&cd.test(b.data))){var g,h=b.jsonpCallback=f.isFunction(b.jsonpCallback)?b.jsonpCallback():b.jsonpCallback,i=a[h],j=b.url,k=b.data,l="$1"+h+"$2";b.jsonp!==!1&&(j=j.replace(cd,l),b.url===j&&(e&&(k=k.replace(cd,l)),b.data===k&&(j+=(/\?/.test(j)?"&":"?")+b.jsonp+"="+h))),b.url=j,b.data=k,a[h]=function(a){g=[a]},d.always(function(){a[h]=i,g&&f.isFunction(i)&&a[h](g[0])}),b.converters["script json"]=function(){g||f.error(h+" was not called");return g[0]},b.dataTypes[0]="json";return"script"}}),f.ajaxSetup({accepts:{script:"text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"},contents:{script:/javascript|ecmascript/},converters:{"text script":function(a){f.globalEval(a);return a}}}),f.ajaxPrefilter("script",function(a){a.cache===b&&(a.cache=!1),a.crossDomain&&(a.type="GET",a.global=!1)}),f.ajaxTransport("script",function(a){if(a.crossDomain){var d,e=c.head||c.getElementsByTagName("head")[0]||c.documentElement;return{send:function(f,g){d=c.createElement("script"),d.async="async",a.scriptCharset&&(d.charset=a.scriptCharset),d.src=a.url,d.onload=d.onreadystatechange=function(a,c){if(c||!d.readyState||/loaded|complete/.test(d.readyState))d.onload=d.onreadystatechange=null,e&&d.parentNode&&e.removeChild(d),d=b,c||g(200,"success")},e.insertBefore(d,e.firstChild)},abort:function(){d&&d.onload(0,1)}}}});var ce=a.ActiveXObject?function(){for(var a in cg)cg[a](0,1)}:!1,cf=0,cg;f.ajaxSettings.xhr=a.ActiveXObject?function(){return!this.isLocal&&ch()||ci()}:ch,function(a){f.extend(f.support,{ajax:!!a,cors:!!a&&"withCredentials"in a})}(f.ajaxSettings.xhr()),f.support.ajax&&f.ajaxTransport(function(c){if(!c.crossDomain||f.support.cors){var d;return{send:function(e,g){var h=c.xhr(),i,j;c.username?h.open(c.type,c.url,c.async,c.username,c.password):h.open(c.type,c.url,c.async);if(c.xhrFields)for(j in c.xhrFields)h[j]=c.xhrFields[j];c.mimeType&&h.overrideMimeType&&h.overrideMimeType(c.mimeType),!c.crossDomain&&!e["X-Requested-With"]&&(e["X-Requested-With"]="XMLHttpRequest");try{for(j in e)h.setRequestHeader(j,e[j])}catch(k){}h.send(c.hasContent&&c.data||null),d=function(a,e){var j,k,l,m,n;try{if(d&&(e||h.readyState===4)){d=b,i&&(h.onreadystatechange=f.noop,ce&&delete cg[i]);if(e)h.readyState!==4&&h.abort();else{j=h.status,l=h.getAllResponseHeaders(),m={},n=h.responseXML,n&&n.documentElement&&(m.xml=n);try{m.text=h.responseText}catch(a){}try{k=h.statusText}catch(o){k=""}!j&&c.isLocal&&!c.crossDomain?j=m.text?200:404:j===1223&&(j=204)}}}catch(p){e||g(-1,p)}m&&g(j,k,m,l)},!c.async||h.readyState===4?d():(i=++cf,ce&&(cg||(cg={},f(a).unload(ce)),cg[i]=d),h.onreadystatechange=d)},abort:function(){d&&d(0,1)}}}});var cj={},ck,cl,cm=/^(?:toggle|show|hide)$/,cn=/^([+\-]=)?([\d+.\-]+)([a-z%]*)$/i,co,cp=[["height","marginTop","marginBottom","paddingTop","paddingBottom"],["width","marginLeft","marginRight","paddingLeft","paddingRight"],["opacity"]],cq;f.fn.extend({show:function(a,b,c){var d,e;if(a||a===0)return this.animate(ct("show",3),a,b,c);for(var g=0,h=this.length;g<h;g++)d=this[g],d.style&&(e=d.style.display,!f._data(d,"olddisplay")&&e==="none"&&(e=d.style.display=""),(e===""&&f.css(d,"display")==="none"||!f.contains(d.ownerDocument.documentElement,d))&&f._data(d,"olddisplay",cu(d.nodeName)));for(g=0;g<h;g++){d=this[g];if(d.style){e=d.style.display;if(e===""||e==="none")d.style.display=f._data(d,"olddisplay")||""}}return this},hide:function(a,b,c){if(a||a===0)return this.animate(ct("hide",3),a,b,c);var d,e,g=0,h=this.length;for(;g<h;g++)d=this[g],d.style&&(e=f.css(d,"display"),e!=="none"&&!f._data(d,"olddisplay")&&f._data(d,"olddisplay",e));for(g=0;g<h;g++)this[g].style&&(this[g].style.display="none");return this},_toggle:f.fn.toggle,toggle:function(a,b,c){var d=typeof a=="boolean";f.isFunction(a)&&f.isFunction(b)?this._toggle.apply(this,arguments):a==null||d?this.each(function(){var b=d?a:f(this).is(":hidden");f(this)[b?"show":"hide"]()}):this.animate(ct("toggle",3),a,b,c);return this},fadeTo:function(a,b,c,d){return this.filter(":hidden").css("opacity",0).show().end().animate({opacity:b},a,c,d)},animate:function(a,b,c,d){function g(){e.queue===!1&&f._mark(this);var b=f.extend({},e),c=this.nodeType===1,d=c&&f(this).is(":hidden"),g,h,i,j,k,l,m,n,o,p,q;b.animatedProperties={};for(i in a){g=f.camelCase(i),i!==g&&(a[g]=a[i],delete a[i]);if((k=f.cssHooks[g])&&"expand"in k){l=k.expand(a[g]),delete a[g];for(i in l)i in a||(a[i]=l[i])}}for(g in a){h=a[g],f.isArray(h)?(b.animatedProperties[g]=h[1],h=a[g]=h[0]):b.animatedProperties[g]=b.specialEasing&&b.specialEasing[g]||b.easing||"swing";if(h==="hide"&&d||h==="show"&&!d)return b.complete.call(this);c&&(g==="height"||g==="width")&&(b.overflow=[this.style.overflow,this.style.overflowX,this.style.overflowY],f.css(this,"display")==="inline"&&f.css(this,"float")==="none"&&(!f.support.inlineBlockNeedsLayout||cu(this.nodeName)==="inline"?this.style.display="inline-block":this.style.zoom=1))}b.overflow!=null&&(this.style.overflow="hidden");for(i in a)j=new f.fx(this,b,i),h=a[i],cm.test(h)?(q=f._data(this,"toggle"+i)||(h==="toggle"?d?"show":"hide":0),q?(f._data(this,"toggle"+i,q==="show"?"hide":"show"),j[q]()):j[h]()):(m=cn.exec(h),n=j.cur(),m?(o=parseFloat(m[2]),p=m[3]||(f.cssNumber[i]?"":"px"),p!=="px"&&(f.style(this,i,(o||1)+p),n=(o||1)/j.cur()*n,f.style(this,i,n+p)),m[1]&&(o=(m[1]==="-="?-1:1)*o+n),j.custom(n,o,p)):j.custom(n,h,""));return!0}var e=f.speed(b,c,d);if(f.isEmptyObject(a))return this.each(e.complete,[!1]);a=f.extend({},a);return e.queue===!1?this.each(g):this.queue(e.queue,g)},stop:function(a,c,d){typeof a!="string"&&(d=c,c=a,a=b),c&&a!==!1&&this.queue(a||"fx",[]);return this.each(function(){function h(a,b,c){var e=b[c];f.removeData(a,c,!0),e.stop(d)}var b,c=!1,e=f.timers,g=f._data(this);d||f._unmark(!0,this);if(a==null)for(b in g)g[b]&&g[b].stop&&b.indexOf(".run")===b.length-4&&h(this,g,b);else g[b=a+".run"]&&g[b].stop&&h(this,g,b);for(b=e.length;b--;)e[b].elem===this&&(a==null||e[b].queue===a)&&(d?e[b](!0):e[b].saveState(),c=!0,e.splice(b,1));(!d||!c)&&f.dequeue(this,a)})}}),f.each({slideDown:ct("show",1),slideUp:ct("hide",1),slideToggle:ct("toggle",1),fadeIn:{opacity:"show"},fadeOut:{opacity:"hide"},fadeToggle:{opacity:"toggle"}},function(a,b){f.fn[a]=function(a,c,d){return this.animate(b,a,c,d)}}),f.extend({speed:function(a,b,c){var d=a&&typeof a=="object"?f.extend({},a):{complete:c||!c&&b||f.isFunction(a)&&a,duration:a,easing:c&&b||b&&!f.isFunction(b)&&b};d.duration=f.fx.off?0:typeof d.duration=="number"?d.duration:d.duration in f.fx.speeds?f.fx.speeds[d.duration]:f.fx.speeds._default;if(d.queue==null||d.queue===!0)d.queue="fx";d.old=d.complete,d.complete=function(a){f.isFunction(d.old)&&d.old.call(this),d.queue?f.dequeue(this,d.queue):a!==!1&&f._unmark(this)};return d},easing:{linear:function(a){return a},swing:function(a){return-Math.cos(a*Math.PI)/2+.5}},timers:[],fx:function(a,b,c){this.options=b,this.elem=a,this.prop=c,b.orig=b.orig||{}}}),f.fx.prototype={update:function(){this.options.step&&this.options.step.call(this.elem,this.now,this),(f.fx.step[this.prop]||f.fx.step._default)(this)},cur:function(){if(this.elem[this.prop]!=null&&(!this.elem.style||this.elem.style[this.prop]==null))return this.elem[this.prop];var a,b=f.css(this.elem,this.prop);return isNaN(a=parseFloat(b))?!b||b==="auto"?0:b:a},custom:function(a,c,d){function h(a){return e.step(a)}var e=this,g=f.fx;this.startTime=cq||cr(),this.end=c,this.now=this.start=a,this.pos=this.state=0,this.unit=d||this.unit||(f.cssNumber[this.prop]?"":"px"),h.queue=this.options.queue,h.elem=this.elem,h.saveState=function(){f._data(e.elem,"fxshow"+e.prop)===b&&(e.options.hide?f._data(e.elem,"fxshow"+e.prop,e.start):e.options.show&&f._data(e.elem,"fxshow"+e.prop,e.end))},h()&&f.timers.push(h)&&!co&&(co=setInterval(g.tick,g.interval))},show:function(){var a=f._data(this.elem,"fxshow"+this.prop);this.options.orig[this.prop]=a||f.style(this.elem,this.prop),this.options.show=!0,a!==b?this.custom(this.cur(),a):this.custom(this.prop==="width"||this.prop==="height"?1:0,this.cur()),f(this.elem).show()},hide:function(){this.options.orig[this.prop]=f._data(this.elem,"fxshow"+this.prop)||f.style(this.elem,this.prop),this.options.hide=!0,this.custom(this.cur(),0)},step:function(a){var b,c,d,e=cq||cr(),g=!0,h=this.elem,i=this.options;if(a||e>=i.duration+this.startTime){this.now=this.end,this.pos=this.state=1,this.update(),i.animatedProperties[this.prop]=!0;for(b in i.animatedProperties)i.animatedProperties[b]!==!0&&(g=!1);if(g){i.overflow!=null&&!f.support.shrinkWrapBlocks&&f.each(["","X","Y"],function(a,b){h.style["overflow"+b]=i.overflow[a]}),i.hide&&f(h).hide();if(i.hide||i.show)for(b in i.animatedProperties)f.style(h,b,i.orig[b]),f.removeData(h,"fxshow"+b,!0),f.removeData(h,"toggle"+b,!0);d=i.complete,d&&(i.complete=!1,d.call(h))}return!1}i.duration==Infinity?this.now=e:(c=e-this.startTime,this.state=c/i.duration,this.pos=f.easing[i.animatedProperties[this.prop]](this.state,c,0,1,i.duration),this.now=this.start+(this.end-this.start)*this.pos),this.update();return!0}},f.extend(f.fx,{tick:function(){var a,b=f.timers,c=0;for(;c<b.length;c++)a=b[c],!a()&&b[c]===a&&b.splice(c--,1);b.length||f.fx.stop()},interval:13,stop:function(){clearInterval(co),co=null},speeds:{slow:600,fast:200,_default:400},step:{opacity:function(a){f.style(a.elem,"opacity",a.now)},_default:function(a){a.elem.style&&a.elem.style[a.prop]!=null?a.elem.style[a.prop]=a.now+a.unit:a.elem[a.prop]=a.now}}}),f.each(cp.concat.apply([],cp),function(a,b){b.indexOf("margin")&&(f.fx.step[b]=function(a){f.style(a.elem,b,Math.max(0,a.now)+a.unit)})}),f.expr&&f.expr.filters&&(f.expr.filters.animated=function(a){return f.grep(f.timers,function(b){return a===b.elem}).length});var cv,cw=/^t(?:able|d|h)$/i,cx=/^(?:body|html)$/i;"getBoundingClientRect"in c.documentElement?cv=function(a,b,c,d){try{d=a.getBoundingClientRect()}catch(e){}if(!d||!f.contains(c,a))return d?{top:d.top,left:d.left}:{top:0,left:0};var g=b.body,h=cy(b),i=c.clientTop||g.clientTop||0,j=c.clientLeft||g.clientLeft||0,k=h.pageYOffset||f.support.boxModel&&c.scrollTop||g.scrollTop,l=h.pageXOffset||f.support.boxModel&&c.scrollLeft||g.scrollLeft,m=d.top+k-i,n=d.left+l-j;return{top:m,left:n}}:cv=function(a,b,c){var d,e=a.offsetParent,g=a,h=b.body,i=b.defaultView,j=i?i.getComputedStyle(a,null):a.currentStyle,k=a.offsetTop,l=a.offsetLeft;while((a=a.parentNode)&&a!==h&&a!==c){if(f.support.fixedPosition&&j.position==="fixed")break;d=i?i.getComputedStyle(a,null):a.currentStyle,k-=a.scrollTop,l-=a.scrollLeft,a===e&&(k+=a.offsetTop,l+=a.offsetLeft,f.support.doesNotAddBorder&&(!f.support.doesAddBorderForTableAndCells||!cw.test(a.nodeName))&&(k+=parseFloat(d.borderTopWidth)||0,l+=parseFloat(d.borderLeftWidth)||0),g=e,e=a.offsetParent),f.support.subtractsBorderForOverflowNotVisible&&d.overflow!=="visible"&&(k+=parseFloat(d.borderTopWidth)||0,l+=parseFloat(d.borderLeftWidth)||0),j=d}if(j.position==="relative"||j.position==="static")k+=h.offsetTop,l+=h.offsetLeft;f.support.fixedPosition&&j.position==="fixed"&&(k+=Math.max(c.scrollTop,h.scrollTop),l+=Math.max(c.scrollLeft,h.scrollLeft));return{top:k,left:l}},f.fn.offset=function(a){if(arguments.length)return a===b?this:this.each(function(b){f.offset.setOffset(this,a,b)});var c=this[0],d=c&&c.ownerDocument;if(!d)return null;if(c===d.body)return f.offset.bodyOffset(c);return cv(c,d,d.documentElement)},f.offset={bodyOffset:function(a){var b=a.offsetTop,c=a.offsetLeft;f.support.doesNotIncludeMarginInBodyOffset&&(b+=parseFloat(f.css(a,"marginTop"))||0,c+=parseFloat(f.css(a,"marginLeft"))||0);return{top:b,left:c}},setOffset:function(a,b,c){var d=f.css(a,"position");d==="static"&&(a.style.position="relative");var e=f(a),g=e.offset(),h=f.css(a,"top"),i=f.css(a,"left"),j=(d==="absolute"||d==="fixed")&&f.inArray("auto",[h,i])>-1,k={},l={},m,n;j?(l=e.position(),m=l.top,n=l.left):(m=parseFloat(h)||0,n=parseFloat(i)||0),f.isFunction(b)&&(b=b.call(a,c,g)),b.top!=null&&(k.top=b.top-g.top+m),b.left!=null&&(k.left=b.left-g.left+n),"using"in b?b.using.call(a,k):e.css(k)}},f.fn.extend({position:function(){if(!this[0])return null;var a=this[0],b=this.offsetParent(),c=this.offset(),d=cx.test(b[0].nodeName)?{top:0,left:0}:b.offset();c.top-=parseFloat(f.css(a,"marginTop"))||0,c.left-=parseFloat(f.css(a,"marginLeft"))||0,d.top+=parseFloat(f.css(b[0],"borderTopWidth"))||0,d.left+=parseFloat(f.css(b[0],"borderLeftWidth"))||0;return{top:c.top-d.top,left:c.left-d.left}},offsetParent:function(){return this.map(function(){var a=this.offsetParent||c.body;while(a&&!cx.test(a.nodeName)&&f.css(a,"position")==="static")a=a.offsetParent;return a})}}),f.each({scrollLeft:"pageXOffset",scrollTop:"pageYOffset"},function(a,c){var d=/Y/.test(c);f.fn[a]=function(e){return f.access(this,function(a,e,g){var h=cy(a);if(g===b)return h?c in h?h[c]:f.support.boxModel&&h.document.documentElement[e]||h.document.body[e]:a[e];h?h.scrollTo(d?f(h).scrollLeft():g,d?g:f(h).scrollTop()):a[e]=g},a,e,arguments.length,null)}}),f.each({Height:"height",Width:"width"},function(a,c){var d="client"+a,e="scroll"+a,g="offset"+a;f.fn["inner"+a]=function(){var a=this[0];return a?a.style?parseFloat(f.css(a,c,"padding")):this[c]():null},f.fn["outer"+a]=function(a){var b=this[0];return b?b.style?parseFloat(f.css(b,c,a?"margin":"border")):this[c]():null},f.fn[c]=function(a){return f.access(this,function(a,c,h){var i,j,k,l;if(f.isWindow(a)){i=a.document,j=i.documentElement[d];return f.support.boxModel&&j||i.body&&i.body[d]||j}if(a.nodeType===9){i=a.documentElement;if(i[d]>=i[e])return i[d];return Math.max(a.body[e],i[e],a.body[g],i[g])}if(h===b){k=f.css(a,c),l=parseFloat(k);return f.isNumeric(l)?l:k}f(a).css(c,h)},c,a,arguments.length,null)}}),a.jQuery=a.$=f,typeof define=="function"&&define.amd&&define.amd.jQuery&&define("jquery",[],function(){return f})})(window);/* jquery.nicescroll
-- version 3.5.0 BETA5
-- copyright 2011-12-13 InuYaksa*2013
-- licensed under the MIT
--
-- http://areaaperta.com/nicescroll
-- https://github.com/inuyaksa/jquery.nicescroll
--
*/

(function(jQuery){

  // globals
  var domfocus = false;
  var mousefocus = false;
  var zoomactive = false;
  var tabindexcounter = 5000;
  var ascrailcounter = 2000;
  var globalmaxzindex = 0;
  
  var $ = jQuery;  // sandbox
 
  // http://stackoverflow.com/questions/2161159/get-script-path
  function getScriptPath() {
    var scripts=document.getElementsByTagName('script');
    var path=scripts[scripts.length-1].src.split('?')[0];
    return (path.split('/').length>0) ? path.split('/').slice(0,-1).join('/')+'/' : '';
  }
  var scriptpath = getScriptPath();
  
  var vendors = ['ms','moz','webkit','o'];
  
  var setAnimationFrame = window.requestAnimationFrame||false;
  var clearAnimationFrame = window.cancelAnimationFrame||false;

  if (!setAnimationFrame) {
    for(var vx in vendors) {
      var v = vendors[vx];
      if (!setAnimationFrame) setAnimationFrame = window[v+'RequestAnimationFrame'];
      if (!clearAnimationFrame) clearAnimationFrame = window[v+'CancelAnimationFrame']||window[v+'CancelRequestAnimationFrame'];
    }
  }
  
  var clsMutationObserver = window.MutationObserver || window.WebKitMutationObserver || false;
  
  var _globaloptions = {
      zindex:"auto",
      cursoropacitymin:0,
      cursoropacitymax:1,
      cursorcolor:"#424242",
      cursorwidth:"5px",
      cursorborder:"1px solid #fff",
      cursorborderradius:"5px",
      scrollspeed:60,
      mousescrollstep:8*3,
      touchbehavior:false,
      hwacceleration:true,
      usetransition:true,
      boxzoom:false,
      dblclickzoom:true,
      gesturezoom:true,
      grabcursorenabled:true,
      autohidemode:true,
      background:"",
      iframeautoresize:true,
      cursorminheight:32,
      preservenativescrolling:true,
      railoffset:false,
      bouncescroll:true,
      spacebarenabled:true,
      railpadding:{top:0,right:0,left:0,bottom:0},
      disableoutline:true,
      horizrailenabled:true,
      railalign:"right",
      railvalign:"bottom",
      enabletranslate3d:true,
      enablemousewheel:true,
      enablekeyboard:true,
      smoothscroll:true,
      sensitiverail:true,
      enablemouselockapi:true,
//      cursormaxheight:false,
      cursorfixedheight:false,      
      directionlockdeadzone:6,
      hidecursordelay:400,
      nativeparentscrolling:true,
      enablescrollonselection:true,
      overflowx:true,
      overflowy:true,
      cursordragspeed:0.3,
      rtlmode:false,
      cursordragontouch:false,
      oneaxismousemode:"auto"
  }
  
  var browserdetected = false;
  
  var getBrowserDetection = function() {
  
    if (browserdetected) return browserdetected;
  
    var domtest = document.createElement('DIV');

    var d = {};
    
		d.haspointerlock = "pointerLockElement" in document || "mozPointerLockElement" in document || "webkitPointerLockElement" in document;
		
    d.isopera = ("opera" in window);
    d.isopera12 = (d.isopera&&("getUserMedia" in navigator));
    d.isoperamini = (Object.prototype.toString.call(window.operamini) === "[object OperaMini]");
    
    d.isie = (("all" in document) && ("attachEvent" in domtest) && !d.isopera);
    d.isieold = (d.isie && !("msInterpolationMode" in domtest.style));  // IE6 and older
    d.isie7 = d.isie&&!d.isieold&&(!("documentMode" in document)||(document.documentMode==7));
    d.isie8 = d.isie&&("documentMode" in document)&&(document.documentMode==8);
    d.isie9 = d.isie&&("performance" in window)&&(document.documentMode>=9);
    d.isie10 = d.isie&&("performance" in window)&&(document.documentMode>=10);
    
    d.isie9mobile = /iemobile.9/i.test(navigator.userAgent);  //wp 7.1 mango
    if (d.isie9mobile) d.isie9 = false;
    d.isie7mobile = (!d.isie9mobile&&d.isie7) && /iemobile/i.test(navigator.userAgent);  //wp 7.0
    
    d.ismozilla = ("MozAppearance" in domtest.style);
		
    d.iswebkit = ("WebkitAppearance" in domtest.style);
    
    d.ischrome = ("chrome" in window);
		d.ischrome22 = (d.ischrome&&d.haspointerlock);
    d.ischrome26 = (d.ischrome&&("transition" in domtest.style));  // issue with transform detection (maintain prefix)
    
    d.cantouch = ("ontouchstart" in document.documentElement)||("ontouchstart" in window);  // detection for Chrome Touch Emulation
    d.hasmstouch = (window.navigator.msPointerEnabled||false);  // IE10+ pointer events
		
    d.ismac = /^mac$/i.test(navigator.platform);
    
    d.isios = (d.cantouch && /iphone|ipad|ipod/i.test(navigator.platform));
    d.isios4 = ((d.isios)&&!("seal" in Object));
    
    d.isandroid = (/android/i.test(navigator.userAgent));
    
    d.trstyle = false;
    d.hastransform = false;
    d.hastranslate3d = false;
    d.transitionstyle = false;
    d.hastransition = false;
    d.transitionend = false;
    
    var check = ['transform','msTransform','webkitTransform','MozTransform','OTransform'];
    for(var a=0;a<check.length;a++){
      if (typeof domtest.style[check[a]] != "undefined") {
        d.trstyle = check[a];
        break;
      }
    }
    d.hastransform = (d.trstyle != false);
    if (d.hastransform) {
      domtest.style[d.trstyle] = "translate3d(1px,2px,3px)";
      d.hastranslate3d = /translate3d/.test(domtest.style[d.trstyle]);
    }
    
    d.transitionstyle = false;
    d.prefixstyle = '';
    d.transitionend = false;
    var check = ['transition','webkitTransition','MozTransition','OTransition','OTransition','msTransition','KhtmlTransition'];
    var prefix = ['','-webkit-','-moz-','-o-','-o','-ms-','-khtml-'];
    var evs = ['transitionend','webkitTransitionEnd','transitionend','otransitionend','oTransitionEnd','msTransitionEnd','KhtmlTransitionEnd'];
    for(var a=0;a<check.length;a++) {
      if (check[a] in domtest.style) {
        d.transitionstyle = check[a];
        d.prefixstyle = prefix[a];
        d.transitionend = evs[a];
        break;
      }
    }
    if (d.ischrome26) {  // use always prefix
      d.prefixstyle = prefix[1];
    }
    
    d.hastransition = (d.transitionstyle);
    
    function detectCursorGrab() {      
      var lst = ['-moz-grab','-webkit-grab','grab'];
      if ((d.ischrome&&!d.ischrome22)||d.isie) lst=[];  // force setting for IE returns false positive and chrome cursor bug
      for(var a=0;a<lst.length;a++) {
        var p = lst[a];
        domtest.style['cursor']=p;
        if (domtest.style['cursor']==p) return p;
      }
      return 'url(http://www.google.com/intl/en_ALL/mapfiles/openhand.cur),n-resize';  // thank you google for custom cursor!
    }
    d.cursorgrabvalue = detectCursorGrab();

    d.hasmousecapture = ("setCapture" in domtest);
    
    d.hasMutationObserver = (clsMutationObserver !== false);
    
    domtest = null;  //memory released

    browserdetected = d;
    
    return d;  
  }
  
  var NiceScrollClass = function(myopt,me) {

    var self = this;

    this.version = '3.5.0 BETA5';
    this.name = 'nicescroll';
    
    this.me = me;
    
    this.opt = {
      doc:$("body"),
      win:false
    };
    
    $.extend(this.opt,_globaloptions);
    
// Options for internal use
    this.opt.snapbackspeed = 80;
    
    if (myopt||false) {
      for(var a in self.opt) {
        if (typeof myopt[a] != "undefined") self.opt[a] = myopt[a];
      }
    }
    
    this.doc = self.opt.doc;
    this.iddoc = (this.doc&&this.doc[0])?this.doc[0].id||'':'';    
    this.ispage = /BODY|HTML/.test((self.opt.win)?self.opt.win[0].nodeName:this.doc[0].nodeName);
    this.haswrapper = (self.opt.win!==false);
    this.win = self.opt.win||(this.ispage?$(window):this.doc);
    this.docscroll = (this.ispage&&!this.haswrapper)?$(window):this.win;
    this.body = $("body");
    this.viewport = false;
    
    this.isfixed = false;
    
    this.iframe = false;
    this.isiframe = ((this.doc[0].nodeName == 'IFRAME') && (this.win[0].nodeName == 'IFRAME'));
    
    this.istextarea = (this.win[0].nodeName == 'TEXTAREA');
    
    this.forcescreen = false; //force to use screen position on events

    this.canshowonmouseevent = (self.opt.autohidemode!="scroll");
    
// Events jump table    
    this.onmousedown = false;
    this.onmouseup = false;
    this.onmousemove = false;
    this.onmousewheel = false;
    this.onkeypress = false;
    this.ongesturezoom = false;
    this.onclick = false;
    
// Nicescroll custom events
    this.onscrollstart = false;
    this.onscrollend = false;
    this.onscrollcancel = false;    
    
    this.onzoomin = false;
    this.onzoomout = false;
    
// Let's start!  
    this.view = false;
    this.page = false;
    
    this.scroll = {x:0,y:0};
    this.scrollratio = {x:0,y:0};    
    this.cursorheight = 20;
    this.scrollvaluemax = 0;
    
    this.checkrtlmode = false;
    
    this.scrollrunning = false;
    
    this.scrollmom = false;
    
    this.observer = false;
    this.observerremover = false;  // observer on parent for remove detection
    
    do {
      this.id = "ascrail"+(ascrailcounter++);
    } while (document.getElementById(this.id));
    
    this.rail = false;
    this.cursor = false;
    this.cursorfreezed = false;  
    this.selectiondrag = false;
    
    this.zoom = false;
    this.zoomactive = false;
    
    this.hasfocus = false;
    this.hasmousefocus = false;
    
    this.visibility = true;
    this.locked = false;
    this.hidden = false; // rails always hidden
    this.cursoractive = true; // user can interact with cursors
    
    this.overflowx = self.opt.overflowx;
    this.overflowy = self.opt.overflowy;
    
    this.nativescrollingarea = false;
    this.checkarea = 0;
    
    this.events = [];  // event list for unbind
    
    this.saved = {};
    
    this.delaylist = {};
    this.synclist = {};
    
    this.lastdeltax = 0;
    this.lastdeltay = 0;
    
    this.detected = getBrowserDetection(); 
    
    var cap = $.extend({},this.detected);
 
    this.canhwscroll = (cap.hastransform&&self.opt.hwacceleration);
    this.ishwscroll = (this.canhwscroll&&self.haswrapper);
    
    this.istouchcapable = false;  // desktop devices with touch screen support
    
//## Check Chrome desktop with touch support
    if (cap.cantouch&&cap.ischrome&&!cap.isios&&!cap.isandroid) {
      this.istouchcapable = true;
      cap.cantouch = false;  // parse normal desktop events
    }    

//## Firefox 18 nightly build (desktop) false positive (or desktop with touch support)
    if (cap.cantouch&&cap.ismozilla&&!cap.isios&&!cap.isandroid) {
      this.istouchcapable = true;
      cap.cantouch = false;  // parse normal desktop events
    }    
    
//## disable MouseLock API on user request

    if (!self.opt.enablemouselockapi) {
      cap.hasmousecapture = false;
      cap.haspointerlock = false;
    }
    
    this.delayed = function(name,fn,tm,lazy) {
      var dd = self.delaylist[name];
      var nw = (new Date()).getTime();
      if (!lazy&&dd&&dd.tt) return false;
      if (dd&&dd.tt) clearTimeout(dd.tt);
      if (dd&&dd.last+tm>nw&&!dd.tt) {      
        self.delaylist[name] = {
          last:nw+tm,
          tt:setTimeout(function(){self.delaylist[name].tt=0;fn.call();},tm)
        }
      }
      else if (!dd||!dd.tt) {
        self.delaylist[name] = {
          last:nw,
          tt:0
        }
        setTimeout(function(){fn.call();},0);
      }
    };
    
    this.debounced = function(name,fn,tm) {
      var dd = self.delaylist[name];
      var nw = (new Date()).getTime();      
      self.delaylist[name] = fn;
      if (!dd) {        
        setTimeout(function(){var fn=self.delaylist[name];self.delaylist[name]=false;fn.call();},tm);
      }
    }
    
    this.synched = function(name,fn) {
    
      function requestSync() {
        if (self.onsync) return;
        setAnimationFrame(function(){
          self.onsync = false;
          for(name in self.synclist){
            var fn = self.synclist[name];
            if (fn) fn.call(self);
            self.synclist[name] = false;
          }
        });
        self.onsync = true;
      };    
    
      self.synclist[name] = fn;
      requestSync();
      return name;
    };
    
    this.unsynched = function(name) {
      if (self.synclist[name]) self.synclist[name] = false;
    }
    
    this.css = function(el,pars) {  // save & set
      for(var n in pars) {
        self.saved.css.push([el,n,el.css(n)]);
        el.css(n,pars[n]);
      }
    };
    
    this.scrollTop = function(val) {
      return (typeof val == "undefined") ? self.getScrollTop() : self.setScrollTop(val);
    };

    this.scrollLeft = function(val) {
      return (typeof val == "undefined") ? self.getScrollLeft() : self.setScrollLeft(val);
    };
    
// derived by by Dan Pupius www.pupius.net
    BezierClass = function(st,ed,spd,p1,p2,p3,p4) {
      this.st = st;
      this.ed = ed;
      this.spd = spd;
      
      this.p1 = p1||0;
      this.p2 = p2||1;
      this.p3 = p3||0;
      this.p4 = p4||1;
      
      this.ts = (new Date()).getTime();
      this.df = this.ed-this.st;
    };
    BezierClass.prototype = {
      B2:function(t){ return 3*t*t*(1-t) },
      B3:function(t){ return 3*t*(1-t)*(1-t) },
      B4:function(t){ return (1-t)*(1-t)*(1-t) },
      getNow:function(){
        var nw = (new Date()).getTime();
        var pc = 1-((nw-this.ts)/this.spd);
        var bz = this.B2(pc) + this.B3(pc) + this.B4(pc);
        return (pc<0) ? this.ed : this.st+Math.round(this.df*bz);
      },
      update:function(ed,spd){
        this.st = this.getNow();
        this.ed = ed;
        this.spd = spd;
        this.ts = (new Date()).getTime();
        this.df = this.ed-this.st;
        return this;
      }
    };
    
    if (this.ishwscroll) {  
    // hw accelerated scroll
      this.doc.translate = {x:0,y:0,tx:"0px",ty:"0px"};
      
      //this one can help to enable hw accel on ios6 http://indiegamr.com/ios6-html-hardware-acceleration-changes-and-how-to-fix-them/
      if (cap.hastranslate3d&&cap.isios) this.doc.css("-webkit-backface-visibility","hidden");  // prevent flickering http://stackoverflow.com/questions/3461441/      
      
      //derived from http://stackoverflow.com/questions/11236090/
      function getMatrixValues() {
        var tr = self.doc.css(cap.trstyle);
        if (tr&&(tr.substr(0,6)=="matrix")) {
          return tr.replace(/^.*\((.*)\)$/g, "$1").replace(/px/g,'').split(/, +/);
        }
        return false;
      }
      
      this.getScrollTop = function(last) {
        if (!last) {
          var mtx = getMatrixValues();
          if (mtx) return (mtx.length==16) ? -mtx[13] : -mtx[5];  //matrix3d 16 on IE10
          if (self.timerscroll&&self.timerscroll.bz) return self.timerscroll.bz.getNow();
        }
        return self.doc.translate.y;
      };

      this.getScrollLeft = function(last) {
        if (!last) {
          var mtx = getMatrixValues();          
          if (mtx) return (mtx.length==16) ? -mtx[12] : -mtx[4];  //matrix3d 16 on IE10
          if (self.timerscroll&&self.timerscroll.bh) return self.timerscroll.bh.getNow();
        }
        return self.doc.translate.x;
      };
      
      if (document.createEvent) {
        this.notifyScrollEvent = function(el) {
          var e = document.createEvent("UIEvents");
          e.initUIEvent("scroll", false, true, window, 1);
          el.dispatchEvent(e);
        };
      }
      else if (document.fireEvent) {
        this.notifyScrollEvent = function(el) {
          var e = document.createEventObject();
          el.fireEvent("onscroll");
          e.cancelBubble = true; 
        };
      }
      else {
        this.notifyScrollEvent = function(el,add) {}; //NOPE
      }
      
      if (cap.hastranslate3d&&self.opt.enabletranslate3d) {
        this.setScrollTop = function(val,silent) {
          self.doc.translate.y = val;
          self.doc.translate.ty = (val*-1)+"px";
          self.doc.css(cap.trstyle,"translate3d("+self.doc.translate.tx+","+self.doc.translate.ty+",0px)");          
          if (!silent) self.notifyScrollEvent(self.win[0]);
        };
        this.setScrollLeft = function(val,silent) {          
          self.doc.translate.x = val;
          self.doc.translate.tx = (val*-1)+"px";
          self.doc.css(cap.trstyle,"translate3d("+self.doc.translate.tx+","+self.doc.translate.ty+",0px)");          
          if (!silent) self.notifyScrollEvent(self.win[0]);
        };
      } else {
        this.setScrollTop = function(val,silent) {
          self.doc.translate.y = val;
          self.doc.translate.ty = (val*-1)+"px";
          self.doc.css(cap.trstyle,"translate("+self.doc.translate.tx+","+self.doc.translate.ty+")");
          if (!silent) self.notifyScrollEvent(self.win[0]);          
        };
        this.setScrollLeft = function(val,silent) {        
          self.doc.translate.x = val;
          self.doc.translate.tx = (val*-1)+"px";
          self.doc.css(cap.trstyle,"translate("+self.doc.translate.tx+","+self.doc.translate.ty+")");
          if (!silent) self.notifyScrollEvent(self.win[0]);
        };
      }
    } else {
    // native scroll
      this.getScrollTop = function() {
        return self.docscroll.scrollTop();
      };
      this.setScrollTop = function(val) {        
        return self.docscroll.scrollTop(val);
      };
      this.getScrollLeft = function() {
        return self.docscroll.scrollLeft();
      };
      this.setScrollLeft = function(val) {
        return self.docscroll.scrollLeft(val);
      };
    }
    
    this.getTarget = function(e) {
      if (!e) return false;
      if (e.target) return e.target;
      if (e.srcElement) return e.srcElement;
      return false;
    };
    
    this.hasParent = function(e,id) {
      if (!e) return false;
      var el = e.target||e.srcElement||e||false;
      while (el && el.id != id) {
        el = el.parentNode||false;
      }
      return (el!==false);
    };
    
    function getZIndex() {
      var dom = self.win;
      if ("zIndex" in dom) return dom.zIndex();  // use jQuery UI method when available
      while (dom.length>0) {        
        if (dom[0].nodeType==9) return false;
        var zi = dom.css('zIndex');        
        if (!isNaN(zi)&&zi!=0) return parseInt(zi);
        dom = dom.parent();
      }
      return false;
    };
    
//inspired by http://forum.jquery.com/topic/width-includes-border-width-when-set-to-thin-medium-thick-in-ie
    var _convertBorderWidth = {"thin":1,"medium":3,"thick":5};
    function getWidthToPixel(dom,prop,chkheight) {
      var wd = dom.css(prop);
      var px = parseFloat(wd);
      if (isNaN(px)) {
        px = _convertBorderWidth[wd]||0;
        var brd = (px==3) ? ((chkheight)?(self.win.outerHeight() - self.win.innerHeight()):(self.win.outerWidth() - self.win.innerWidth())) : 1; //DON'T TRUST CSS
        if (self.isie8&&px) px+=1;
        return (brd) ? px : 0; 
      }
      return px;
    };
    
    this.getOffset = function() {
      if (self.isfixed) return {top:parseFloat(self.win.css('top')),left:parseFloat(self.win.css('left'))};
      if (!self.viewport) return self.win.offset();
      var ww = self.win.offset();
      var vp = self.viewport.offset();
      return {top:ww.top-vp.top+self.viewport.scrollTop(),left:ww.left-vp.left+self.viewport.scrollLeft()};
    };
    
    this.updateScrollBar = function(len) {
      if (self.ishwscroll) {
        self.rail.css({height:self.win.innerHeight()});
        if (self.railh) self.railh.css({width:self.win.innerWidth()});
      } else {
        var wpos = self.getOffset();
        var pos = {top:wpos.top,left:wpos.left};
        pos.top+= getWidthToPixel(self.win,'border-top-width',true);
        var brd = (self.win.outerWidth() - self.win.innerWidth())/2;
        pos.left+= (self.rail.align) ? self.win.outerWidth() - getWidthToPixel(self.win,'border-right-width') - self.rail.width : getWidthToPixel(self.win,'border-left-width');
        
        var off = self.opt.railoffset;
        if (off) {
          if (off.top) pos.top+=off.top;
          if (self.rail.align&&off.left) pos.left+=off.left;
        }
        
				if (!self.locked) self.rail.css({top:pos.top,left:pos.left,height:(len)?len.h:self.win.innerHeight()});
				
				if (self.zoom) {				  
				  self.zoom.css({top:pos.top+1,left:(self.rail.align==1) ? pos.left-20 : pos.left+self.rail.width+4});
			  }
				
				if (self.railh&&!self.locked) {
					var pos = {top:wpos.top,left:wpos.left};
					var y = (self.railh.align) ? pos.top + getWidthToPixel(self.win,'border-top-width',true) + self.win.innerHeight() - self.railh.height : pos.top + getWidthToPixel(self.win,'border-top-width',true);
					var x = pos.left + getWidthToPixel(self.win,'border-left-width');
					self.railh.css({top:y,left:x,width:self.railh.width});
				}
		
				
      }
    };
    
    this.doRailClick = function(e,dbl,hr) {

      var fn,pg,cur,pos;
      
//      if (self.rail.drag&&self.rail.drag.pt!=1) return;
      if (self.locked) return;
//      if (self.rail.drag) return;

//      self.cancelScroll();       
      
      self.cancelEvent(e);
      
      if (dbl) {
        fn = (hr) ? self.doScrollLeft : self.doScrollTop;
        cur = (hr) ? ((e.pageX - self.railh.offset().left - (self.cursorwidth/2)) * self.scrollratio.x) : ((e.pageY - self.rail.offset().top - (self.cursorheight/2)) * self.scrollratio.y);
        fn(cur);
      } else {
//        console.log(e.pageY);
        fn = (hr) ? self.doScrollLeftBy : self.doScrollBy;
        cur = (hr) ? self.scroll.x : self.scroll.y;
        pos = (hr) ? e.pageX - self.railh.offset().left : e.pageY - self.rail.offset().top;
        pg = (hr) ? self.view.w : self.view.h;        
        (cur>=pos) ? fn(pg) : fn(-pg);
      }
    
    }
    
    self.hasanimationframe = (setAnimationFrame);
    self.hascancelanimationframe = (clearAnimationFrame);
    
    if (!self.hasanimationframe) {
      setAnimationFrame=function(fn){return setTimeout(fn,15-Math.floor((+new Date)/1000)%16)}; // 1000/60)};
      clearAnimationFrame=clearInterval;
    } 
    else if (!self.hascancelanimationframe) clearAnimationFrame=function(){self.cancelAnimationFrame=true};
    
    this.init = function() {

      self.saved.css = [];
      
      if (cap.isie7mobile) return true; // SORRY, DO NOT WORK!
      if (cap.isoperamini) return true; // SORRY, DO NOT WORK!
      
      if (cap.hasmstouch) self.css((self.ispage)?$("html"):self.win,{'-ms-touch-action':'none'});
      
      self.zindex = "auto";
      if (!self.ispage&&self.opt.zindex=="auto") {
        self.zindex = getZIndex()||"auto";
      } else {
        self.zindex = self.opt.zindex;
      }
      
      if (!self.ispage&&self.zindex!="auto") {
        if (self.zindex>globalmaxzindex) globalmaxzindex=self.zindex;
      }
      
      if (self.isie&&self.zindex==0&&self.opt.zindex=="auto") {  // fix IE auto == 0
        self.zindex="auto";
      }
      
/*      
      self.ispage = true;
      self.haswrapper = true;
//      self.win = $(window);
      self.docscroll = $("body");
//      self.doc = $("body");
*/
      
      if (!self.ispage || (!cap.cantouch && !cap.isieold && !cap.isie9mobile)) {
      
        var cont = self.docscroll;
        if (self.ispage) cont = (self.haswrapper)?self.win:self.doc;
        
        if (!cap.isie9mobile) self.css(cont,{'overflow-y':'hidden'});      
        
        if (self.ispage&&cap.isie7) {
          if (self.doc[0].nodeName=='BODY') self.css($("html"),{'overflow-y':'hidden'});  //IE7 double scrollbar issue
          else if (self.doc[0].nodeName=='HTML') self.css($("body"),{'overflow-y':'hidden'});  //IE7 double scrollbar issue
        }
        
        if (cap.isios&&!self.ispage&&!self.haswrapper) self.css($("body"),{"-webkit-overflow-scrolling":"touch"});  //force hw acceleration
        
        var cursor = $(document.createElement('div'));
        cursor.css({
          position:"relative",top:0,"float":"right",width:self.opt.cursorwidth,height:"0px",
          'background-color':self.opt.cursorcolor,
          border:self.opt.cursorborder,
          'background-clip':'padding-box',
          '-webkit-border-radius':self.opt.cursorborderradius,
          '-moz-border-radius':self.opt.cursorborderradius,
          'border-radius':self.opt.cursorborderradius
        });   
        
        cursor.hborder = parseFloat(cursor.outerHeight() - cursor.innerHeight());        
        self.cursor = cursor;        
        
        var rail = $(document.createElement('div'));
        rail.attr('id',self.id);
        rail.addClass('nicescroll-rails');
        
        var v,a,kp = ["left","right"];  //"top","bottom"
        for(var n in kp) {
          a=kp[n];
          v = self.opt.railpadding[a];
          (v) ? rail.css("padding-"+a,v+"px") : self.opt.railpadding[a] = 0;
        }
        
        rail.append(cursor);
        
        rail.width = Math.max(parseFloat(self.opt.cursorwidth),cursor.outerWidth()) + self.opt.railpadding['left'] + self.opt.railpadding['right'];
        rail.css({width:rail.width+"px",'zIndex':self.zindex,"background":self.opt.background,cursor:"default"});        
        
        rail.visibility = true;
        rail.scrollable = true;
        
        rail.align = (self.opt.railalign=="left") ? 0 : 1;
        
        self.rail = rail;
        
        self.rail.drag = false;
        
        var zoom = false;
        if (self.opt.boxzoom&&!self.ispage&&!cap.isieold) {
          zoom = document.createElement('div');          
          self.bind(zoom,"click",self.doZoom);
          self.zoom = $(zoom);
          self.zoom.css({"cursor":"pointer",'z-index':self.zindex,'backgroundImage':'url('+scriptpath+'zoomico.png)','height':18,'width':18,'backgroundPosition':'0px 0px'});
          if (self.opt.dblclickzoom) self.bind(self.win,"dblclick",self.doZoom);
          if (cap.cantouch&&self.opt.gesturezoom) {
            self.ongesturezoom = function(e) {
              if (e.scale>1.5) self.doZoomIn(e);
              if (e.scale<0.8) self.doZoomOut(e);
              return self.cancelEvent(e);
            };
            self.bind(self.win,"gestureend",self.ongesturezoom);             
          }
        }
        
// init HORIZ

        self.railh = false;

        if (self.opt.horizrailenabled) {

          self.css(cont,{'overflow-x':'hidden'});

          var cursor = $(document.createElement('div'));
          cursor.css({
            position:"relative",top:0,height:self.opt.cursorwidth,width:"0px",
            'background-color':self.opt.cursorcolor,
            border:self.opt.cursorborder,
            'background-clip':'padding-box',
            '-webkit-border-radius':self.opt.cursorborderradius,
            '-moz-border-radius':self.opt.cursorborderradius,
            'border-radius':self.opt.cursorborderradius
          });   
          
          cursor.wborder = parseFloat(cursor.outerWidth() - cursor.innerWidth());
          self.cursorh = cursor;
          
          var railh = $(document.createElement('div'));
          railh.attr('id',self.id+'-hr');
          railh.addClass('nicescroll-rails');
          railh.height = Math.max(parseFloat(self.opt.cursorwidth),cursor.outerHeight());
          railh.css({height:railh.height+"px",'zIndex':self.zindex,"background":self.opt.background});
          
          railh.append(cursor);
          
          railh.visibility = true;
          railh.scrollable = true;
          
          railh.align = (self.opt.railvalign=="top") ? 0 : 1;
          
          self.railh = railh;
          
          self.railh.drag = false;
          
        }
        
//        
        
        if (self.ispage) {
          rail.css({position:"fixed",top:"0px",height:"100%"});
          (rail.align) ? rail.css({right:"0px"}) : rail.css({left:"0px"});
          self.body.append(rail);
          if (self.railh) {
            railh.css({position:"fixed",left:"0px",width:"100%"});
            (railh.align) ? railh.css({bottom:"0px"}) : railh.css({top:"0px"});
            self.body.append(railh);
          }
        } else {          
          if (self.ishwscroll) {
            if (self.win.css('position')=='static') self.css(self.win,{'position':'relative'});
            var bd = (self.win[0].nodeName == 'HTML') ? self.body : self.win;
            if (self.zoom) {
              self.zoom.css({position:"absolute",top:1,right:0,"margin-right":rail.width+4});
              bd.append(self.zoom);
            }
            rail.css({position:"absolute",top:0});
            (rail.align) ? rail.css({right:0}) : rail.css({left:0});
            bd.append(rail);
            if (railh) {
              railh.css({position:"absolute",left:0,bottom:0});
              (railh.align) ? railh.css({bottom:0}) : railh.css({top:0});
              bd.append(railh);
            }
          } else {
            self.isfixed = (self.win.css("position")=="fixed");
            var rlpos = (self.isfixed) ? "fixed" : "absolute";
            
            if (!self.isfixed) self.viewport = self.getViewport(self.win[0]);
            if (self.viewport) {
              self.body = self.viewport;              
              if ((/relative|absolute/.test(self.viewport.css("position")))==false) self.css(self.viewport,{"position":"relative"});
            }            
            
            rail.css({position:rlpos});
            if (self.zoom) self.zoom.css({position:rlpos});
            self.updateScrollBar();
            self.body.append(rail);
            if (self.zoom) self.body.append(self.zoom);
            if (self.railh) {
              railh.css({position:rlpos});
              self.body.append(railh);           
            }
          }
          
          if (cap.isios) self.css(self.win,{'-webkit-tap-highlight-color':'rgba(0,0,0,0)','-webkit-touch-callout':'none'});  // prevent grey layer on click
          
					if (cap.isie&&self.opt.disableoutline) self.win.attr("hideFocus","true");  // IE, prevent dotted rectangle on focused div
					if (cap.iswebkit&&self.opt.disableoutline) self.win.css({"outline":"none"});
//          if (cap.isopera&&self.opt.disableoutline) self.win.css({"outline":"0"});  // Opera to test [TODO]
          
        }
        
        if (self.opt.autohidemode===false) {
          self.autohidedom = false;
          self.rail.css({opacity:self.opt.cursoropacitymax});          
          if (self.railh) self.railh.css({opacity:self.opt.cursoropacitymax});
        }
        else if (self.opt.autohidemode===true) {
          self.autohidedom = $().add(self.rail);          
          if (cap.isie8) self.autohidedom=self.autohidedom.add(self.cursor);
          if (self.railh) self.autohidedom=self.autohidedom.add(self.railh);
          if (self.railh&&cap.isie8) self.autohidedom=self.autohidedom.add(self.cursorh);
        }
        else if (self.opt.autohidemode=="scroll") {
          self.autohidedom = $().add(self.rail);
          if (self.railh) self.autohidedom=self.autohidedom.add(self.railh);
        }
        else if (self.opt.autohidemode=="cursor") {
          self.autohidedom = $().add(self.cursor);
          if (self.railh) self.autohidedom=self.autohidedom.add(self.cursorh);
        }
        else if (self.opt.autohidemode=="hidden") {
          self.autohidedom = false;
          self.hide();
          self.locked = false;
        }
        
        if (cap.isie9mobile) {

          self.scrollmom = new ScrollMomentumClass2D(self);        

          /*
          var trace = function(msg) {
            var db = $("#debug");
            if (isNaN(msg)&&(typeof msg != "string")) {
              var x = [];
              for(var a in msg) {
                x.push(a+":"+msg[a]);
              }
              msg ="{"+x.join(",")+"}";
            }
            if (db.children().length>0) {
              db.children().eq(0).before("<div>"+msg+"</div>");
            } else {
              db.append("<div>"+msg+"</div>");
            }
          }
          window.onerror = function(msg,url,ln) {
            trace("ERR: "+msg+" at "+ln);
          }
*/          
  
          self.onmangotouch = function(e) {
            var py = self.getScrollTop();
            var px = self.getScrollLeft();
            
            if ((py == self.scrollmom.lastscrolly)&&(px == self.scrollmom.lastscrollx)) return true;
//            $("#debug").html('DRAG:'+py);

            var dfy = py-self.mangotouch.sy;
            var dfx = px-self.mangotouch.sx;            
            var df = Math.round(Math.sqrt(Math.pow(dfx,2)+Math.pow(dfy,2)));            
            if (df==0) return;
            
            var dry = (dfy<0)?-1:1;
            var drx = (dfx<0)?-1:1;
            
            var tm = +new Date();
            if (self.mangotouch.lazy) clearTimeout(self.mangotouch.lazy);
            
            if (((tm-self.mangotouch.tm)>80)||(self.mangotouch.dry!=dry)||(self.mangotouch.drx!=drx)) {
//              trace('RESET+'+(tm-self.mangotouch.tm));
              self.scrollmom.stop();
              self.scrollmom.reset(px,py);
              self.mangotouch.sy = py;
              self.mangotouch.ly = py;
              self.mangotouch.sx = px;
              self.mangotouch.lx = px;
              self.mangotouch.dry = dry;
              self.mangotouch.drx = drx;
              self.mangotouch.tm = tm;
            } else {
              
              self.scrollmom.stop();
              self.scrollmom.update(self.mangotouch.sx-dfx,self.mangotouch.sy-dfy);
              var gap = tm - self.mangotouch.tm;              
              self.mangotouch.tm = tm;
              
//              trace('MOVE:'+df+" - "+gap);
              
              var ds = Math.max(Math.abs(self.mangotouch.ly-py),Math.abs(self.mangotouch.lx-px));
              self.mangotouch.ly = py;
              self.mangotouch.lx = px;
              
              if (ds>2) {
                self.mangotouch.lazy = setTimeout(function(){
//                  trace('END:'+ds+'+'+gap);                  
                  self.mangotouch.lazy = false;
                  self.mangotouch.dry = 0;
                  self.mangotouch.drx = 0;
                  self.mangotouch.tm = 0;                  
                  self.scrollmom.doMomentum(30);
                },100);
              }
            }
          }
          
          var top = self.getScrollTop();
          var lef = self.getScrollLeft();
          self.mangotouch = {sy:top,ly:top,dry:0,sx:lef,lx:lef,drx:0,lazy:false,tm:0};
          
          self.bind(self.docscroll,"scroll",self.onmangotouch);
        
        } else {
        
          if (cap.cantouch||self.istouchcapable||self.opt.touchbehavior||cap.hasmstouch) {
          
            self.scrollmom = new ScrollMomentumClass2D(self);
          
            self.ontouchstart = function(e) {
              if (e.pointerType&&e.pointerType!=2) return false;
              
              if (!self.locked) {
              
                if (cap.hasmstouch) {
                  var tg = (e.target) ? e.target : false;
                  while (tg) {
                    var nc = $(tg).getNiceScroll();
                    if ((nc.length>0)&&(nc[0].me == self.me)) break;
                    if (nc.length>0) return false;
                    if ((tg.nodeName=='DIV')&&(tg.id==self.id)) break;
                    tg = (tg.parentNode) ? tg.parentNode : false;
                  }
                }
              
                self.cancelScroll();
                
                var tg = self.getTarget(e);
                
                if (tg) {
                  var skp = (/INPUT/i.test(tg.nodeName))&&(/range/i.test(tg.type));
                  if (skp) return self.stopPropagation(e);
                }
                
                if (!("clientX" in e) && ("changedTouches" in e)) {
                  e.clientX = e.changedTouches[0].clientX;
                  e.clientY = e.changedTouches[0].clientY;
                }
                
                if (self.forcescreen) {
                  var le = e;
                  var e = {"original":(e.original)?e.original:e};
                  e.clientX = le.screenX;
                  e.clientY = le.screenY;    
                }
                
                self.rail.drag = {x:e.clientX,y:e.clientY,sx:self.scroll.x,sy:self.scroll.y,st:self.getScrollTop(),sl:self.getScrollLeft(),pt:2,dl:false};
                
                if (self.ispage||!self.opt.directionlockdeadzone) {
                  self.rail.drag.dl = "f";
                } else {
                
                  var view = {
                    w:$(window).width(),
                    h:$(window).height()
                  };
                  
                  var page = {
                    w:Math.max(document.body.scrollWidth,document.documentElement.scrollWidth),
                    h:Math.max(document.body.scrollHeight,document.documentElement.scrollHeight)
                  }
                  
                  var maxh = Math.max(0,page.h - view.h);
                  var maxw = Math.max(0,page.w - view.w);                
                
                  if (!self.rail.scrollable&&self.railh.scrollable) self.rail.drag.ck = (maxh>0) ? "v" : false;
                  else if (self.rail.scrollable&&!self.railh.scrollable) self.rail.drag.ck = (maxw>0) ? "h" : false;
                  else self.rail.drag.ck = false;
                  if (!self.rail.drag.ck) self.rail.drag.dl = "f";
                }
                
                if (self.opt.touchbehavior&&self.isiframe&&cap.isie) {
                  var wp = self.win.position();
                  self.rail.drag.x+=wp.left;
                  self.rail.drag.y+=wp.top;
                }
                
                self.hasmoving = false;
                self.lastmouseup = false;
                self.scrollmom.reset(e.clientX,e.clientY);
                if (!cap.cantouch&&!this.istouchcapable&&!cap.hasmstouch) {
                  
                  var ip = (tg)?/INPUT|SELECT|TEXTAREA/i.test(tg.nodeName):false;
                  if (!ip) {
                    if (!self.ispage&&cap.hasmousecapture) tg.setCapture();                   
//                  return self.cancelEvent(e);
                    return (self.opt.touchbehavior) ? self.cancelEvent(e) : self.stopPropagation(e);
                  }
                  if (/SUBMIT|CANCEL|BUTTON/i.test($(tg).attr('type'))) {
                    pc = {"tg":tg,"click":false};
                    self.preventclick = pc;
                  }
                  
                }
              }
              
            };
            
            self.ontouchend = function(e) {
              if (e.pointerType&&e.pointerType!=2) return false;
              if (self.rail.drag&&(self.rail.drag.pt==2)) {
                self.scrollmom.doMomentum();
                self.rail.drag = false;
                if (self.hasmoving) {
                  self.hasmoving = false;
                  self.lastmouseup = true;
                  self.hideCursor();
                  if (cap.hasmousecapture) document.releaseCapture();
                  if (!cap.cantouch) return self.cancelEvent(e);
                }                            
              }                        
              
            };
            
            var moveneedoffset = (self.opt.touchbehavior&&self.isiframe&&!cap.hasmousecapture);
            
            self.ontouchmove = function(e,byiframe) {
              
              if (e.pointerType&&e.pointerType!=2) return false;
    
              if (self.rail.drag&&(self.rail.drag.pt==2)) {
                if (cap.cantouch&&(typeof e.original == "undefined")) return true;  // prevent ios "ghost" events by clickable elements
              
                self.hasmoving = true;

                if (self.preventclick&&!self.preventclick.click) {
                  self.preventclick.click = self.preventclick.tg.onclick||false;                
                  self.preventclick.tg.onclick = self.onpreventclick;
                }

                var ev = $.extend({"original":e},e);
                e = ev;
                
                if (("changedTouches" in e)) {
                  e.clientX = e.changedTouches[0].clientX;
                  e.clientY = e.changedTouches[0].clientY;
                }                
                
                if (self.forcescreen) {
                  var le = e;
                  var e = {"original":(e.original)?e.original:e};
                  e.clientX = le.screenX;
                  e.clientY = le.screenY;      
                }
                
                var ofx = ofy = 0;
                
                if (moveneedoffset&&!byiframe) {
                  var wp = self.win.position();
                  ofx=-wp.left;
                  ofy=-wp.top;
                }                
                
                var fy = e.clientY + ofy;
                var my = (fy-self.rail.drag.y);
                var fx = e.clientX + ofx;
                var mx = (fx-self.rail.drag.x);
                
                var ny = self.rail.drag.st-my;
                
                if (self.ishwscroll&&self.opt.bouncescroll) {
                  if (ny<0) {
                    ny = Math.round(ny/2);
//                    fy = 0;
                  }
                  else if (ny>self.page.maxh) {
                    ny = self.page.maxh+Math.round((ny-self.page.maxh)/2);
//                    fy = 0;
                  }
                } else {
                  if (ny<0) {ny=0;fy=0}
                  if (ny>self.page.maxh) {ny=self.page.maxh;fy=0}
                }
                  
                if (self.railh&&self.railh.scrollable) {
                  var nx = self.rail.drag.sl-mx;
                  
                  if (self.ishwscroll&&self.opt.bouncescroll) {                  
                    if (nx<0) {
                      nx = Math.round(nx/2);
//                      fx = 0;
                    }
                    else if (nx>self.page.maxw) {
                      nx = self.page.maxw+Math.round((nx-self.page.maxw)/2);
//                      fx = 0;
                    }
                  } else {
                    if (nx<0) {nx=0;fx=0}
                    if (nx>self.page.maxw) {nx=self.page.maxw;fx=0}
                  }
                
                }
                
                var grabbed = false;
                if (self.rail.drag.dl) {
                  grabbed = true;
                  if (self.rail.drag.dl=="v") nx = self.rail.drag.sl;
                  else if (self.rail.drag.dl=="h") ny = self.rail.drag.st;                  
                } else {
                  var ay = Math.abs(my);
                  var ax = Math.abs(mx);
                  var dz = self.opt.directionlockdeadzone;
                  if (self.rail.drag.ck=="v") {    
                    if (ay>dz&&(ax<=(ay*0.3))) {
                      self.rail.drag = false;                      
                      return true;
                    }
                    else if (ax>dz) {
                      self.rail.drag.dl="f";                      
                      $("body").scrollTop($("body").scrollTop());  // stop iOS native scrolling (when active javascript has blocked)
                    }
                  }
                  else if (self.rail.drag.ck=="h") {
                    if (ax>dz&&(ay<=(ax*0.3))) {
                      self.rail.drag = false;                      
                      return true;
                    }
                    else if (ay>dz) {                      
                      self.rail.drag.dl="f";
                      $("body").scrollLeft($("body").scrollLeft());  // stop iOS native scrolling (when active javascript has blocked)
                    }
                  }  
                }
                
                self.synched("touchmove",function(){
                  if (self.rail.drag&&(self.rail.drag.pt==2)) {
                    if (self.prepareTransition) self.prepareTransition(0);
                    if (self.rail.scrollable) self.setScrollTop(ny);
                    self.scrollmom.update(fx,fy);
                    if (self.railh&&self.railh.scrollable) {
                      self.setScrollLeft(nx);
                      self.showCursor(ny,nx);
                    } else {
                      self.showCursor(ny);
                    }
                    if (cap.isie10) document.selection.clear();
                  }
                });
                
                if (cap.ischrome&&self.istouchcapable) grabbed=false;  //chrome touch emulation doesn't like!
                if (grabbed) return self.cancelEvent(e);
              }
              
            };
          
          }
          
          self.onmousedown = function(e,hronly) {    
            if (self.rail.drag&&self.rail.drag.pt!=1) return;
            if (self.locked) return self.cancelEvent(e);            
            self.cancelScroll();              
            self.rail.drag = {x:e.clientX,y:e.clientY,sx:self.scroll.x,sy:self.scroll.y,pt:1,hr:(!!hronly)};
            var tg = self.getTarget(e);
            if (!self.ispage&&cap.hasmousecapture) tg.setCapture();
            if (self.isiframe&&!cap.hasmousecapture) {
              self.saved["csspointerevents"] = self.doc.css("pointer-events");
              self.css(self.doc,{"pointer-events":"none"});
            }
            return self.cancelEvent(e);
          };
          
          self.onmouseup = function(e) {
            if (self.rail.drag) {
              if (cap.hasmousecapture) document.releaseCapture();
              if (self.isiframe&&!cap.hasmousecapture) self.doc.css("pointer-events",self.saved["csspointerevents"]);
              if(self.rail.drag.pt!=1)return;
              self.rail.drag = false;
              //if (!self.rail.active) self.hideCursor();
              return self.cancelEvent(e);
            }
          };        
          
          self.onmousemove = function(e) {
            if (self.rail.drag) {
              if(self.rail.drag.pt!=1)return;
              
              if (cap.ischrome&&e.which==0) return self.onmouseup(e);
              
              self.cursorfreezed = true;
                  
              if (self.rail.drag.hr) {
                self.scroll.x = self.rail.drag.sx + (e.clientX-self.rail.drag.x);
                if (self.scroll.x<0) self.scroll.x=0;
                var mw = self.scrollvaluemaxw;
                if (self.scroll.x>mw) self.scroll.x=mw;
              } else {                
                self.scroll.y = self.rail.drag.sy + (e.clientY-self.rail.drag.y);
                if (self.scroll.y<0) self.scroll.y=0;
                var my = self.scrollvaluemax;
                if (self.scroll.y>my) self.scroll.y=my;
              }
              
              self.synched('mousemove',function(){
                if (self.rail.drag&&(self.rail.drag.pt==1)) {
                  self.showCursor();
                  if (self.rail.drag.hr) self.doScrollLeft(Math.round(self.scroll.x*self.scrollratio.x),self.opt.cursordragspeed);
                  else self.doScrollTop(Math.round(self.scroll.y*self.scrollratio.y),self.opt.cursordragspeed);
                }
              });
              
              return self.cancelEvent(e);
            } 
/*              
            else {
              self.checkarea = true;
            }
*/              
          };          
         
          if (cap.cantouch||self.opt.touchbehavior) {
          
            self.onpreventclick = function(e) {
              if (self.preventclick) {
                self.preventclick.tg.onclick = self.preventclick.click;
                self.preventclick = false;            
                return self.cancelEvent(e);
              }
            }
          
//            self.onmousedown = self.ontouchstart;            
//            self.onmouseup = self.ontouchend;
//            self.onmousemove = self.ontouchmove;

            self.bind(self.win,"mousedown",self.ontouchstart);  // control content dragging

            self.onclick = (cap.isios) ? false : function(e) { 
              if (self.lastmouseup) {
                self.lastmouseup = false;
                return self.cancelEvent(e);
              } else {
                return true;
              }
            }; 
            
            if (self.opt.grabcursorenabled&&cap.cursorgrabvalue) {
              self.css((self.ispage)?self.doc:self.win,{'cursor':cap.cursorgrabvalue});            
              self.css(self.rail,{'cursor':cap.cursorgrabvalue});
            }
            
          } else {

            function checkSelectionScroll(e) {
              if (!self.selectiondrag) return;
              
              if (e) {
                var ww = self.win.outerHeight();
                var df = (e.pageY - self.selectiondrag.top);
                if (df>0&&df<ww) df=0;
                if (df>=ww) df-=ww;
                self.selectiondrag.df = df;                
              }
              if (self.selectiondrag.df==0) return;
              
              var rt = -Math.floor(self.selectiondrag.df/6)*2;              
//              self.doScrollTop(self.getScrollTop(true)+rt);
              self.doScrollBy(rt);
              
              self.debounced("doselectionscroll",function(){checkSelectionScroll()},50);
            }
            
            if ("getSelection" in document) {  // A grade - Major browsers
              self.hasTextSelected = function() {  
                return (document.getSelection().rangeCount>0);
              }
            } 
            else if ("selection" in document) {  //IE9-
              self.hasTextSelected = function() {
                return (document.selection.type != "None");
              }
            } 
            else {
              self.hasTextSelected = function() {  // no support
                return false;
              }
            }            
            
            self.onselectionstart = function(e) {
              if (self.ispage) return;
              self.selectiondrag = self.win.offset();
            }
            self.onselectionend = function(e) {
              self.selectiondrag = false;
            }
            self.onselectiondrag = function(e) {              
              if (!self.selectiondrag) return;
              if (self.hasTextSelected()) self.debounced("selectionscroll",function(){checkSelectionScroll(e)},250);
            }
            
            
          }
          
          if (cap.hasmstouch) {
            self.css(self.rail,{'-ms-touch-action':'none'});
            self.css(self.cursor,{'-ms-touch-action':'none'});
            
            self.bind(self.win,"MSPointerDown",self.ontouchstart);
            self.bind(document,"MSPointerUp",self.ontouchend);
            self.bind(document,"MSPointerMove",self.ontouchmove);
            self.bind(self.cursor,"MSGestureHold",function(e){e.preventDefault()});
            self.bind(self.cursor,"contextmenu",function(e){e.preventDefault()});
          }

          if (this.istouchcapable) {  //desktop with screen touch enabled
            self.bind(self.win,"touchstart",self.ontouchstart);
            self.bind(document,"touchend",self.ontouchend);
            self.bind(document,"touchcancel",self.ontouchend);
            self.bind(document,"touchmove",self.ontouchmove);            
          }
          
          self.bind(self.cursor,"mousedown",self.onmousedown);
          self.bind(self.cursor,"mouseup",self.onmouseup);

          if (self.railh) {
            self.bind(self.cursorh,"mousedown",function(e){self.onmousedown(e,true)});
            self.bind(self.cursorh,"mouseup",function(e){
              if (self.rail.drag&&self.rail.drag.pt==2) return;
              self.rail.drag = false;
              self.hasmoving = false;
              self.hideCursor();
              if (cap.hasmousecapture) document.releaseCapture();
              return self.cancelEvent(e);
            });
          }
		
          if (self.opt.cursordragontouch||!cap.cantouch&&!self.opt.touchbehavior) {

            self.rail.css({"cursor":"default"});
            self.railh&&self.railh.css({"cursor":"default"});          
          
            self.jqbind(self.rail,"mouseenter",function() {
              if (self.canshowonmouseevent) self.showCursor();
              self.rail.active = true;
            });
            self.jqbind(self.rail,"mouseleave",function() { 
              self.rail.active = false;
              if (!self.rail.drag) self.hideCursor();
            });
            
            if (self.opt.sensitiverail) {
              self.bind(self.rail,"click",function(e){self.doRailClick(e,false,false)});
              self.bind(self.rail,"dblclick",function(e){self.doRailClick(e,true,false)});
              self.bind(self.cursor,"click",function(e){self.cancelEvent(e)});
              self.bind(self.cursor,"dblclick",function(e){self.cancelEvent(e)});
            }

            if (self.railh) {
              self.jqbind(self.railh,"mouseenter",function() {
                if (self.canshowonmouseevent) self.showCursor();
                self.rail.active = true;
              });          
              self.jqbind(self.railh,"mouseleave",function() { 
                self.rail.active = false;
                if (!self.rail.drag) self.hideCursor();
              });
              
              if (self.opt.sensitiverail) {
                self.bind(self.railh, "click", function(e){self.doRailClick(e,false,true)});
                self.bind(self.railh, "dblclick", function(e){self.doRailClick(e, true, true) });
                self.bind(self.cursorh, "click", function (e) { self.cancelEvent(e) });
                self.bind(self.cursorh, "dblclick", function (e) { self.cancelEvent(e) });
              }
              
            }
          
          }
    
          if (!cap.cantouch&&!self.opt.touchbehavior) {

            self.bind((cap.hasmousecapture)?self.win:document,"mouseup",self.onmouseup);            
            self.bind(document,"mousemove",self.onmousemove);
            if (self.onclick) self.bind(document,"click",self.onclick);
            
            if (!self.ispage&&self.opt.enablescrollonselection) {
              self.bind(self.win[0],"mousedown",self.onselectionstart);
              self.bind(document,"mouseup",self.onselectionend);
              self.bind(self.cursor,"mouseup",self.onselectionend);
              if (self.cursorh) self.bind(self.cursorh,"mouseup",self.onselectionend);
              self.bind(document,"mousemove",self.onselectiondrag);
            }

						if (self.zoom) {
							self.jqbind(self.zoom,"mouseenter",function() {
								if (self.canshowonmouseevent) self.showCursor();
								self.rail.active = true;
							});          
							self.jqbind(self.zoom,"mouseleave",function() { 
								self.rail.active = false;
								if (!self.rail.drag) self.hideCursor();
							});
						}

          } else {
            
            self.bind((cap.hasmousecapture)?self.win:document,"mouseup",self.ontouchend);
            self.bind(document,"mousemove",self.ontouchmove);
            if (self.onclick) self.bind(document,"click",self.onclick);
            
            if (self.opt.cursordragontouch) {
              self.bind(self.cursor,"mousedown",self.onmousedown);
              self.bind(self.cursor,"mousemove",self.onmousemove);
              self.cursorh&&self.bind(self.cursorh,"mousedown",self.onmousedown);
              self.cursorh&&self.bind(self.cursorh,"mousemove",self.onmousemove);
            }
          
          }
						
					if (self.opt.enablemousewheel) {
						if (!self.isiframe) self.bind((cap.isie&&self.ispage) ? document : self.win /*self.docscroll*/ ,"mousewheel",self.onmousewheel);
						self.bind(self.rail,"mousewheel",self.onmousewheel);
						if (self.railh) self.bind(self.railh,"mousewheel",self.onmousewheelhr);
					}						
						
          if (!self.ispage&&!cap.cantouch&&!(/HTML|BODY/.test(self.win[0].nodeName))) {
            if (!self.win.attr("tabindex")) self.win.attr({"tabindex":tabindexcounter++});
            
            self.jqbind(self.win,"focus",function(e) {
              domfocus = (self.getTarget(e)).id||true;
              self.hasfocus = true;
              if (self.canshowonmouseevent) self.noticeCursor();
            });
            self.jqbind(self.win,"blur",function(e) {
              domfocus = false;
              self.hasfocus = false;
            });
            
            self.jqbind(self.win,"mouseenter",function(e) {
              mousefocus = (self.getTarget(e)).id||true;
              self.hasmousefocus = true;
              if (self.canshowonmouseevent) self.noticeCursor();
            });
            self.jqbind(self.win,"mouseleave",function() {
              mousefocus = false;
              self.hasmousefocus = false;
            });
            
          };
          
        }  // !ie9mobile
        
        //Thanks to http://www.quirksmode.org !!
        self.onkeypress = function(e) {
          if (self.locked&&self.page.maxh==0) return true;
          
          e = (e) ? e : window.e;
          var tg = self.getTarget(e);
          if (tg&&/INPUT|TEXTAREA|SELECT|OPTION/.test(tg.nodeName)) {
            var tp = tg.getAttribute('type')||tg.type||false;            
            if ((!tp)||!(/submit|button|cancel/i.tp)) return true;
          }
          
          if (self.hasfocus||(self.hasmousefocus&&!domfocus)||(self.ispage&&!domfocus&&!mousefocus)) {
            var key = e.keyCode;
            
            if (self.locked&&key!=27) return self.cancelEvent(e);

            var ctrl = e.ctrlKey||false;
            var shift = e.shiftKey || false;
            
            var ret = false;
            switch (key) {
              case 38:
              case 63233: //safari
                self.doScrollBy(24*3);
                ret = true;
                break;
              case 40:
              case 63235: //safari
                self.doScrollBy(-24*3);
                ret = true;
                break;
              case 37:
              case 63232: //safari
                if (self.railh) {
                  (ctrl) ? self.doScrollLeft(0) : self.doScrollLeftBy(24*3);
                  ret = true;
                }
                break;
              case 39:
              case 63234: //safari
                if (self.railh) {
                  (ctrl) ? self.doScrollLeft(self.page.maxw) : self.doScrollLeftBy(-24*3);
                  ret = true;
                }
                break;
              case 33:
              case 63276: // safari
                self.doScrollBy(self.view.h);
                ret = true;
                break;
              case 34:
              case 63277: // safari
                self.doScrollBy(-self.view.h);
                ret = true;
                break;
              case 36:
              case 63273: // safari                
                (self.railh&&ctrl) ? self.doScrollPos(0,0) : self.doScrollTo(0);
                ret = true;
                break;
              case 35:
              case 63275: // safari
                (self.railh&&ctrl) ? self.doScrollPos(self.page.maxw,self.page.maxh) : self.doScrollTo(self.page.maxh);
                ret = true;
                break;
              case 32:
                if (self.opt.spacebarenabled) {
                  (shift) ? self.doScrollBy(self.view.h) : self.doScrollBy(-self.view.h);
                  ret = true;
                }
                break;
              case 27: // ESC
                if (self.zoomactive) {
                  self.doZoom();
                  ret = true;
                }
                break;
            }
            if (ret) return self.cancelEvent(e);
          }
        };
        
        if (self.opt.enablekeyboard) self.bind(document,(cap.isopera&&!cap.isopera12)?"keypress":"keydown",self.onkeypress);
        
        self.bind(window,'resize',self.lazyResize);
        self.bind(window,'orientationchange',self.lazyResize);
        
        self.bind(window,"load",self.lazyResize);
		
        if (cap.ischrome&&!self.ispage&&!self.haswrapper) { //chrome void scrollbar bug - it persists in version 26
          var tmp=self.win.attr("style");
					var ww = parseFloat(self.win.css("width"))+1;
          self.win.css('width',ww);
          self.synched("chromefix",function(){self.win.attr("style",tmp)});
        }
        
        
// Trying a cross-browser implementation - good luck!

        self.onAttributeChange = function(e) {
          self.lazyResize(250);
        }
        
        if (!self.ispage&&!self.haswrapper) {
          // redesigned MutationObserver for Chrome18+/Firefox14+/iOS6+ with support for: remove div, add/remove content
          if (clsMutationObserver !== false) {
            self.observer = new clsMutationObserver(function(mutations) {            
              mutations.forEach(self.onAttributeChange);
            });
            self.observer.observe(self.win[0],{childList: true, characterData: false, attributes: true, subtree: false});
            
            self.observerremover = new clsMutationObserver(function(mutations) {
               mutations.forEach(function(mo){
                 if (mo.removedNodes.length>0) {
                   for (var dd in mo.removedNodes) {
                     if (mo.removedNodes[dd]==self.win[0]) return self.remove();
                   }
                 }
               });
            });
            self.observerremover.observe(self.win[0].parentNode,{childList: true, characterData: false, attributes: false, subtree: false});
            
          } else {        
            self.bind(self.win,(cap.isie&&!cap.isie9)?"propertychange":"DOMAttrModified",self.onAttributeChange);            
            if (cap.isie9) self.win[0].attachEvent("onpropertychange",self.onAttributeChange); //IE9 DOMAttrModified bug
            self.bind(self.win,"DOMNodeRemoved",function(e){
              if (e.target==self.win[0]) self.remove();
            });
          }
        }
        
//

        if (!self.ispage&&self.opt.boxzoom) self.bind(window,"resize",self.resizeZoom);
        if (self.istextarea) self.bind(self.win,"mouseup",self.lazyResize);
        
        self.checkrtlmode = true;
        self.lazyResize(30);
        
      }
      
      if (this.doc[0].nodeName == 'IFRAME') {
        function oniframeload(e) {
          self.iframexd = false;
          try {
            var doc = 'contentDocument' in this ? this.contentDocument : this.contentWindow.document;
            var a = doc.domain;            
          } catch(e){self.iframexd = true;doc=false};
          
          if (self.iframexd) {
            if ("console" in window) console.log('NiceScroll error: policy restriced iframe');
            return true;  //cross-domain - I can't manage this        
          }
          
          self.forcescreen = true;
          
          if (self.isiframe) {            
            self.iframe = {
              "doc":$(doc),
              "html":self.doc.contents().find('html')[0],
              "body":self.doc.contents().find('body')[0]
            };
            self.getContentSize = function(){
              return {
                w:Math.max(self.iframe.html.scrollWidth,self.iframe.body.scrollWidth),
                h:Math.max(self.iframe.html.scrollHeight,self.iframe.body.scrollHeight)
              }
            }            
            self.docscroll = $(self.iframe.body);//$(this.contentWindow);
          }
          
          if (!cap.isios&&self.opt.iframeautoresize&&!self.isiframe) {
            self.win.scrollTop(0); // reset position
            self.doc.height("");  //reset height to fix browser bug
            var hh=Math.max(doc.getElementsByTagName('html')[0].scrollHeight,doc.body.scrollHeight);
            self.doc.height(hh);          
          }
          self.lazyResize(30);
          
          if (cap.isie7) self.css($(self.iframe.html),{'overflow-y':'hidden'});
          //self.css($(doc.body),{'overflow-y':'hidden'});
          self.css($(self.iframe.body),{'overflow-y':'hidden'});
          
          if (cap.isios&&self.haswrapper) {
            self.css($(doc.body),{'-webkit-transform':'translate3d(0,0,0)'});  // avoid iFrame content clipping - thanks to http://blog.derraab.com/2012/04/02/avoid-iframe-content-clipping-with-css-transform-on-ios/
            
            console.log(1);
            
          }
          
          if ('contentWindow' in this) {
            self.bind(this.contentWindow,"scroll",self.onscroll);  //IE8 & minor
          } else {          
            self.bind(doc,"scroll",self.onscroll);
          }                    
          
          if (self.opt.enablemousewheel) {
            self.bind(doc,"mousewheel",self.onmousewheel);
          }
          
          if (self.opt.enablekeyboard) self.bind(doc,(cap.isopera)?"keypress":"keydown",self.onkeypress);
          
          if (cap.cantouch||self.opt.touchbehavior) {
            self.bind(doc,"mousedown",self.ontouchstart);
            self.bind(doc,"mousemove",function(e){self.ontouchmove(e,true)});
            if (self.opt.grabcursorenabled&&cap.cursorgrabvalue) self.css($(doc.body),{'cursor':cap.cursorgrabvalue});
          }
          
          self.bind(doc,"mouseup",self.ontouchend);
          
          if (self.zoom) {
            if (self.opt.dblclickzoom) self.bind(doc,'dblclick',self.doZoom);
            if (self.ongesturezoom) self.bind(doc,"gestureend",self.ongesturezoom);             
          }
        };
        
        if (this.doc[0].readyState&&this.doc[0].readyState=="complete"){
          setTimeout(function(){oniframeload.call(self.doc[0],false)},500);
        }
        self.bind(this.doc,"load",oniframeload);
        
      }
      
    };
    
    this.showCursor = function(py,px) {
      if (self.cursortimeout) {
        clearTimeout(self.cursortimeout);
        self.cursortimeout = 0;
      }
      if (!self.rail) return;
      if (self.autohidedom) {
        self.autohidedom.stop().css({opacity:self.opt.cursoropacitymax});
        self.cursoractive = true;
      }
      
      if (!self.rail.drag||self.rail.drag.pt!=1) {      
        if ((typeof py != "undefined")&&(py!==false)) {
          self.scroll.y = Math.round(py * 1/self.scrollratio.y);
        }
        if (typeof px != "undefined") {
          self.scroll.x = Math.round(px * 1/self.scrollratio.x);
        }
      }
      
      self.cursor.css({height:self.cursorheight,top:self.scroll.y}); 
      if (self.cursorh) {
        (!self.rail.align&&self.rail.visibility) ? self.cursorh.css({width:self.cursorwidth,left:self.scroll.x+self.rail.width}) : self.cursorh.css({width:self.cursorwidth,left:self.scroll.x});
        self.cursoractive = true;
      }
      
      if (self.zoom) self.zoom.stop().css({opacity:self.opt.cursoropacitymax});      
    };
    
    this.hideCursor = function(tm) {
      if (self.cursortimeout) return;
      if (!self.rail) return;
      if (!self.autohidedom) return;
      self.cursortimeout = setTimeout(function() {
         if (!self.rail.active||!self.showonmouseevent) {
           self.autohidedom.stop().animate({opacity:self.opt.cursoropacitymin});
           if (self.zoom) self.zoom.stop().animate({opacity:self.opt.cursoropacitymin});
           self.cursoractive = false;
         }
         self.cursortimeout = 0;
      },tm||self.opt.hidecursordelay);
    };
    
    this.noticeCursor = function(tm,py,px) {
      self.showCursor(py,px);
      if (!self.rail.active) self.hideCursor(tm);
    };
        
    this.getContentSize = 
      (self.ispage) ?
        function(){
          return {
            w:Math.max(document.body.scrollWidth,document.documentElement.scrollWidth),
            h:Math.max(document.body.scrollHeight,document.documentElement.scrollHeight)
          }
        }
      : (self.haswrapper) ?
        function(){
          return {
            w:self.doc.outerWidth()+parseInt(self.win.css('paddingLeft'))+parseInt(self.win.css('paddingRight')),
            h:self.doc.outerHeight()+parseInt(self.win.css('paddingTop'))+parseInt(self.win.css('paddingBottom'))
          }
        }
      : function() {        
        return {
          w:self.docscroll[0].scrollWidth,
          h:self.docscroll[0].scrollHeight
        }
      };
  
    this.onResize = function(e,page) {
    
	  if (!self.win) return false;
	
      if (!self.haswrapper&&!self.ispage) {
        if (self.win.css('display')=='none') {
          if (self.visibility) self.hideRail().hideRailHr();
          return false;
        } else {          
          if (!self.hidden&&!self.visibility) self.showRail().showRailHr();
        }        
      }

      var premaxh = self.page.maxh;
      var premaxw = self.page.maxw;

      var preview = {h:self.view.h,w:self.view.w};   
      
      self.view = {
        w:(self.ispage) ? self.win.width() : parseInt(self.win[0].clientWidth),
        h:(self.ispage) ? self.win.height() : parseInt(self.win[0].clientHeight)
      };
      
      self.page = (page) ? page : self.getContentSize();
      
      self.page.maxh = Math.max(0,self.page.h - self.view.h);
      self.page.maxw = Math.max(0,self.page.w - self.view.w);
      
      if ((self.page.maxh==premaxh)&&(self.page.maxw==premaxw)&&(self.view.w==preview.w)) {
        // test position        
        if (!self.ispage) {
          var pos = self.win.offset();
          if (self.lastposition) {
            var lst = self.lastposition;
            if ((lst.top==pos.top)&&(lst.left==pos.left)) return self; //nothing to do            
          }
          self.lastposition = pos;
        } else {
          return self; //nothing to do
        }
      }
      
      if (self.page.maxh==0) {
        self.hideRail();        
        self.scrollvaluemax = 0;
        self.scroll.y = 0;
        self.scrollratio.y = 0;
        self.cursorheight = 0;
        self.setScrollTop(0);
        self.rail.scrollable = false;
      } else {       
        self.rail.scrollable = true;
      }
      
      if (self.page.maxw==0) {
        self.hideRailHr();
        self.scrollvaluemaxw = 0;
        self.scroll.x = 0;
        self.scrollratio.x = 0;
        self.cursorwidth = 0;
        self.setScrollLeft(0);
        self.railh.scrollable = false;
      } else {        
        self.railh.scrollable = true;
      }
  
      self.locked = (self.page.maxh==0)&&(self.page.maxw==0);
      if (self.locked) {
				if (!self.ispage) self.updateScrollBar(self.view);
			  return false;
		  }

      if (!self.hidden&&!self.visibility) {
        self.showRail().showRailHr();
      }      
      else if (!self.hidden&&!self.railh.visibility) self.showRailHr();
      
      if (self.istextarea&&self.win.css('resize')&&self.win.css('resize')!='none') self.view.h-=20;      

      self.cursorheight = Math.min(self.view.h,Math.round(self.view.h * (self.view.h / self.page.h)));
      self.cursorheight = (self.opt.cursorfixedheight) ? self.opt.cursorfixedheight : Math.max(self.opt.cursorminheight,self.cursorheight);

      self.cursorwidth = Math.min(self.view.w,Math.round(self.view.w * (self.view.w / self.page.w)));
      self.cursorwidth = (self.opt.cursorfixedheight) ? self.opt.cursorfixedheight : Math.max(self.opt.cursorminheight,self.cursorwidth);
      
      self.scrollvaluemax = self.view.h-self.cursorheight-self.cursor.hborder;
      
      if (self.railh) {
        self.railh.width = (self.page.maxh>0) ? (self.view.w-self.rail.width) : self.view.w;
        self.scrollvaluemaxw = self.railh.width-self.cursorwidth-self.cursorh.wborder;
      }
      
      if (self.checkrtlmode&&self.railh) {
        self.checkrtlmode = false;
        if (self.opt.rtlmode&&self.scroll.x==0) self.setScrollLeft(self.page.maxw);
      }
      
      if (!self.ispage) self.updateScrollBar(self.view);
      
      self.scrollratio = {
        x:(self.page.maxw/self.scrollvaluemaxw),
        y:(self.page.maxh/self.scrollvaluemax)
      };
     
      var sy = self.getScrollTop();
      if (sy>self.page.maxh) {
        self.doScrollTop(self.page.maxh);
      } else {     
        self.scroll.y = Math.round(self.getScrollTop() * (1/self.scrollratio.y));
        self.scroll.x = Math.round(self.getScrollLeft() * (1/self.scrollratio.x));
        if (self.cursoractive) self.noticeCursor();     
      }      
      
      if (self.scroll.y&&(self.getScrollTop()==0)) self.doScrollTo(Math.floor(self.scroll.y*self.scrollratio.y));
      
      return self;
    };
    
    this.resize = self.onResize;
    
    this.lazyResize = function(tm) {   // event debounce
      tm = (isNaN(tm)) ? 30 : tm;
      self.delayed('resize',self.resize,tm);
      return self;
    }
   
// modified by MDN https://developer.mozilla.org/en-US/docs/DOM/Mozilla_event_reference/wheel
    function _modernWheelEvent(dom,name,fn,bubble) {      
      self._bind(dom,name,function(e){
        var  e = (e) ? e : window.event;
        var event = {
          original: e,
          target: e.target || e.srcElement,
          type: "wheel",
          deltaMode: e.type == "MozMousePixelScroll" ? 0 : 1,
          deltaX: 0,
          deltaZ: 0,
          preventDefault: function() {
            e.preventDefault ? e.preventDefault() : e.returnValue = false;
            return false;
          },
          stopImmediatePropagation: function() {
            (e.stopImmediatePropagation) ? e.stopImmediatePropagation() : e.cancelBubble = true;
          }
        };
            
        if (name=="mousewheel") {
          event.deltaY = - 1/40 * e.wheelDelta;
          e.wheelDeltaX && (event.deltaX = - 1/40 * e.wheelDeltaX);
        } else {
          event.deltaY = e.detail;
        }

        return fn.call(dom,event);      
      },bubble);
    };     
   
    this._bind = function(el,name,fn,bubble) {  // primitive bind
      self.events.push({e:el,n:name,f:fn,b:bubble,q:false});
      if (el.addEventListener) {
        el.addEventListener(name,fn,bubble||false);
      }
      else if (el.attachEvent) {
        el.attachEvent("on"+name,fn);
      }
      else {
        el["on"+name] = fn;        
      }        
    };
   
    this.jqbind = function(dom,name,fn) {  // use jquery bind for non-native events (mouseenter/mouseleave)
      self.events.push({e:dom,n:name,f:fn,q:true});
      $(dom).bind(name,fn);
    }
   
    this.bind = function(dom,name,fn,bubble) {  // touch-oriented & fixing jquery bind
      var el = ("jquery" in dom) ? dom[0] : dom;
      
      if (name=='mousewheel') {
        if ("onwheel" in self.win) {            
          self._bind(el,"wheel",fn,bubble||false);
        } else {            
          var wname = (typeof document.onmousewheel != "undefined") ? "mousewheel" : "DOMMouseScroll";  // older IE/Firefox
          _modernWheelEvent(el,wname,fn,bubble||false);
          if (wname=="DOMMouseScroll") _modernWheelEvent(el,"MozMousePixelScroll",fn,bubble||false);  // Firefox legacy
        }
      } 
      else if (el.addEventListener) {
        if (cap.cantouch && /mouseup|mousedown|mousemove/.test(name)) {  // touch device support
          var tt=(name=='mousedown')?'touchstart':(name=='mouseup')?'touchend':'touchmove';
          self._bind(el,tt,function(e){
            if (e.touches) {
              if (e.touches.length<2) {var ev=(e.touches.length)?e.touches[0]:e;ev.original=e;fn.call(this,ev);}
            } 
            else if (e.changedTouches) {var ev=e.changedTouches[0];ev.original=e;fn.call(this,ev);}  //blackberry
          },bubble||false);
        }
        self._bind(el,name,fn,bubble||false);
        if (cap.cantouch && name=="mouseup") self._bind(el,"touchcancel",fn,bubble||false);
      }
      else {
        self._bind(el,name,function(e) {
          e = e||window.event||false;
          if (e) {
            if (e.srcElement) e.target=e.srcElement;
          }
          if (!("pageY" in e)) {
            e.pageX = e.clientX + document.documentElement.scrollLeft;
            e.pageY = e.clientY + document.documentElement.scrollTop; 
          }
          return ((fn.call(el,e)===false)||bubble===false) ? self.cancelEvent(e) : true;
        });
      } 
    };
    
    this._unbind = function(el,name,fn,bub) {  // primitive unbind
      if (el.removeEventListener) {
        el.removeEventListener(name,fn,bub);
      }
      else if (el.detachEvent) {
        el.detachEvent('on'+name,fn);
      } else {
        el['on'+name] = false;
      }
    };
    
    this.unbindAll = function() {
      for(var a=0;a<self.events.length;a++) {
        var r = self.events[a];        
        (r.q) ? r.e.unbind(r.n,r.f) : self._unbind(r.e,r.n,r.f,r.b);
      }
    };
    
    // Thanks to http://www.switchonthecode.com !!
    this.cancelEvent = function(e) {
      var e = (e.original) ? e.original : (e) ? e : window.event||false;
      if (!e) return false;      
      if(e.preventDefault) e.preventDefault();
      if(e.stopPropagation) e.stopPropagation();
      if(e.preventManipulation) e.preventManipulation();  //IE10
      e.cancelBubble = true;
      e.cancel = true;
      e.returnValue = false;
      return false;
    };

    this.stopPropagation = function(e) {
      var e = (e.original) ? e.original : (e) ? e : window.event||false;
      if (!e) return false;
      if (e.stopPropagation) return e.stopPropagation();
      if (e.cancelBubble) e.cancelBubble=true;
      return false;
    }
    
    this.showRail = function() {
      if ((self.page.maxh!=0)&&(self.ispage||self.win.css('display')!='none')) {
        self.visibility = true;
        self.rail.visibility = true;
        self.rail.css('display','block');
      }
      return self;
    };

    this.showRailHr = function() {
      if (!self.railh) return self;
      if ((self.page.maxw!=0)&&(self.ispage||self.win.css('display')!='none')) {
        self.railh.visibility = true;
        self.railh.css('display','block');
      }
      return self;
    };
    
    this.hideRail = function() {
      self.visibility = false;
      self.rail.visibility = false;
      self.rail.css('display','none');
      return self;
    };

    this.hideRailHr = function() {
      if (!self.railh) return self;
      self.railh.visibility = false;
      self.railh.css('display','none');
      return self;
    };
    
    this.show = function() {
      self.hidden = false;
      self.locked = false;
      return self.showRail().showRailHr();
    };

    this.hide = function() {
      self.hidden = true;
      self.locked = true;
      return self.hideRail().hideRailHr();
    };
    
    this.toggle = function() {
      return (self.hidden) ? self.show() : self.hide();
    };
    
    this.remove = function() {
      self.stop();
      if (self.cursortimeout) clearTimeout(self.cursortimeout);
      self.doZoomOut();
      self.unbindAll();     

      if (cap.isie9) self.win[0].detachEvent("onpropertychange",self.onAttributeChange); //IE9 DOMAttrModified bug
      
      if (self.observer !== false) self.observer.disconnect();
      if (self.observerremover !== false) self.observerremover.disconnect();      
      
      self.events = null;
      
      if (self.cursor) {
        self.cursor.remove();
      }
      if (self.cursorh) {
        self.cursorh.remove();
      }
      if (self.rail) {
        self.rail.remove();
      }
      if (self.railh) {
        self.railh.remove();
      }
      if (self.zoom) {
        self.zoom.remove();
      }
      for(var a=0;a<self.saved.css.length;a++) {
        var d=self.saved.css[a];
        d[0].css(d[1],(typeof d[2]=="undefined") ? '' : d[2]);
      }
      self.saved = false;      
      self.me.data('__nicescroll',''); //erase all traces
      
      // memory leak fixed by GianlucaGuarini - thanks a lot!
      // remove the current nicescroll from the $.nicescroll array & normalize array
      var lst = $.nicescroll;
      lst.each(function(i){
        if (!this) return;
        if(this.id === self.id) {
          delete lst[i];          
          for(var b=++i;b<lst.length;b++,i++) lst[i]=lst[b];
          lst.length--;
          if (lst.length) delete lst[lst.length];
        }
      });      
      
      for (var i in self) {
        self[i] = null;
        delete self[i];
      }
      
      self = null;
      
    };
    
    this.scrollstart = function(fn) {
      this.onscrollstart = fn;
      return self;
    }
    this.scrollend = function(fn) {
      this.onscrollend = fn;
      return self;
    }
    this.scrollcancel = function(fn) {
      this.onscrollcancel = fn;
      return self;
    }
    
    this.zoomin = function(fn) {
      this.onzoomin = fn;
      return self;
    }
    this.zoomout = function(fn) {
      this.onzoomout = fn;
      return self;
    }
    
    this.isScrollable = function(e) {      
      var dom = (e.target) ? e.target : e;
      if (dom.nodeName == 'OPTION') return true;
      while (dom&&(dom.nodeType==1)&&!(/BODY|HTML/.test(dom.nodeName))) {
        var dd = $(dom);
        var ov = dd.css('overflowY')||dd.css('overflowX')||dd.css('overflow')||'';
        if (/scroll|auto/.test(ov)) return (dom.clientHeight!=dom.scrollHeight);
        dom = (dom.parentNode) ? dom.parentNode : false;        
      }
      return false;
    };

    this.getViewport = function(me) {      
      var dom = (me&&me.parentNode) ? me.parentNode : false;
      while (dom&&(dom.nodeType==1)&&!(/BODY|HTML/.test(dom.nodeName))) {
        var dd = $(dom);
        var ov = dd.css('overflowY')||dd.css('overflowX')||dd.css('overflow')||'';
        if ((/scroll|auto/.test(ov))&&(dom.clientHeight!=dom.scrollHeight)) return dd;
        if (dd.getNiceScroll().length>0) return dd;
        dom = (dom.parentNode) ? dom.parentNode : false;
      }
      return false;
    };
    
    function execScrollWheel(e,hr,chkscroll) {
      var px,py;
      var rt = 1;
      
      if (e.deltaMode==0) {  // PIXEL
        px = -Math.floor(e.deltaX*(self.opt.mousescrollstep/(18*3)));
        py = -Math.floor(e.deltaY*(self.opt.mousescrollstep/(18*3)));
      }
      else if (e.deltaMode==1) {  // LINE
        px = -Math.floor(e.deltaX*self.opt.mousescrollstep);
        py = -Math.floor(e.deltaY*self.opt.mousescrollstep);
      }
      
      if (hr&&self.opt.oneaxismousemode&&(px==0)&&py) {  // classic vertical-only mousewheel + browser with x/y support 
        px = py;
        py = 0;
      }

      if (px) {
        if (self.scrollmom) {self.scrollmom.stop()}
        self.lastdeltax+=px;
        self.debounced("mousewheelx",function(){var dt=self.lastdeltax;self.lastdeltax=0;if(!self.rail.drag){self.doScrollLeftBy(dt)}},120);
      }
      if (py) {
        if (self.opt.nativeparentscrolling&&chkscroll&&!self.ispage&&!self.zoomactive) {
          if (py<0) {
            if (self.getScrollTop()>=self.page.maxh) return true;
          } else {
            if (self.getScrollTop()<=0) return true;
          }
        }
        if (self.scrollmom) {self.scrollmom.stop()}
        self.lastdeltay+=py;
        self.debounced("mousewheely",function(){var dt=self.lastdeltay;self.lastdeltay=0;if(!self.rail.drag){self.doScrollBy(dt)}},120);
      }
      
      e.stopImmediatePropagation();
      return e.preventDefault();
//      return self.cancelEvent(e);
    };
    
    this.onmousewheel = function(e) {          
      if (self.locked) {
        self.debounced("checkunlock",self.resize,250);
        return true;
      }
      if (self.rail.drag) return self.cancelEvent(e);
      
      if (self.opt.oneaxismousemode=="auto"&&e.deltaX!=0) self.opt.oneaxismousemode = false;  // check two-axis mouse support (not very elegant)
      
      if (self.opt.oneaxismousemode&&e.deltaX==0) {
        if (!self.rail.scrollable) {
          if (self.railh&&self.railh.scrollable) {
            return self.onmousewheelhr(e);
          } else {          
            return true;
          }
        }
      }
      
      var nw = +(new Date());
      var chk = false;
      if (self.opt.preservenativescrolling&&((self.checkarea+600)<nw)) {
//        self.checkarea = false;
        self.nativescrollingarea = self.isScrollable(e);
        chk = true;
      }
      self.checkarea = nw;
      if (self.nativescrollingarea) return true; // this isn't my business
//      if (self.locked) return self.cancelEvent(e);
      var ret = execScrollWheel(e,false,chk);
      if (ret) self.checkarea = 0;
      return ret;
    };

    this.onmousewheelhr = function(e) {
      if (self.locked||!self.railh.scrollable) return true;
      if (self.rail.drag) return self.cancelEvent(e);
      
      var nw = +(new Date());
      var chk = false;
      if (self.opt.preservenativescrolling&&((self.checkarea+600)<nw)) {
//        self.checkarea = false;
        self.nativescrollingarea = self.isScrollable(e); 
        chk = true;
      }
      self.checkarea = nw;
      if (self.nativescrollingarea) return true; // this isn't my business
      if (self.locked) return self.cancelEvent(e);

      return execScrollWheel(e,true,chk);
    };
    
    this.stop = function() {
      self.cancelScroll();
      if (self.scrollmon) self.scrollmon.stop();
      self.cursorfreezed = false;
      self.scroll.y = Math.round(self.getScrollTop() * (1/self.scrollratio.y));      
      self.noticeCursor();
      return self;
    };
    
    this.getTransitionSpeed = function(dif) {
      var sp = Math.round(self.opt.scrollspeed*10);
      var ex = Math.min(sp,Math.round((dif / 20) * self.opt.scrollspeed));
      return (ex>20) ? ex : 0;
    }
    
    if (!self.opt.smoothscroll) {
      this.doScrollLeft = function(x,spd) {  //direct
        var y = self.getScrollTop();
        self.doScrollPos(x,y,spd);
      }      
      this.doScrollTop = function(y,spd) {   //direct
        var x = self.getScrollLeft();
        self.doScrollPos(x,y,spd);
      }
      this.doScrollPos = function(x,y,spd) {  //direct
        var nx = (x>self.page.maxw) ? self.page.maxw : x;
        if (nx<0) nx=0;
        var ny = (y>self.page.maxh) ? self.page.maxh : y;
        if (ny<0) ny=0;
        self.synched('scroll',function(){
          self.setScrollTop(ny);
          self.setScrollLeft(nx);
        });
      }
      this.cancelScroll = function() {}; // direct
    } 
    else if (self.ishwscroll&&cap.hastransition&&self.opt.usetransition) {
      this.prepareTransition = function(dif,istime) {
        var ex = (istime) ? ((dif>20)?dif:0) : self.getTransitionSpeed(dif);        
        var trans = (ex) ? cap.prefixstyle+'transform '+ex+'ms ease-out' : '';
        if (!self.lasttransitionstyle||self.lasttransitionstyle!=trans) {
          self.lasttransitionstyle = trans;
          self.doc.css(cap.transitionstyle,trans);
        }
        return ex;
      };
      
      this.doScrollLeft = function(x,spd) {  //trans
        var y = (self.scrollrunning) ? self.newscrolly : self.getScrollTop();
        self.doScrollPos(x,y,spd);
      }      
      
      this.doScrollTop = function(y,spd) {   //trans
        var x = (self.scrollrunning) ? self.newscrollx : self.getScrollLeft();
        self.doScrollPos(x,y,spd);
      }
      
      this.doScrollPos = function(x,y,spd) {  //trans
   
        var py = self.getScrollTop();
        var px = self.getScrollLeft();        
      
        if (((self.newscrolly-py)*(y-py)<0)||((self.newscrollx-px)*(x-px)<0)) self.cancelScroll();  //inverted movement detection      
        
        if (self.opt.bouncescroll==false) {
          if (y<0) y=0;
          else if (y>self.page.maxh) y=self.page.maxh;
          if (x<0) x=0;
          else if (x>self.page.maxw) x=self.page.maxw;
        }
        
        if (self.scrollrunning&&x==self.newscrollx&&y==self.newscrolly) return false;
        
        self.newscrolly = y;
        self.newscrollx = x;
        
        self.newscrollspeed = spd||false;
        
        if (self.timer) return false;
        
        self.timer = setTimeout(function(){
        
          var top = self.getScrollTop();
          var lft = self.getScrollLeft();
          
          var dst = {};
          dst.x = x-lft;
          dst.y = y-top;
          dst.px = lft;
          dst.py = top;
          
          var dd = Math.round(Math.sqrt(Math.pow(dst.x,2)+Math.pow(dst.y,2)));          
          
//          var df = (self.newscrollspeed) ? self.newscrollspeed : dd;
          
          var ms = (self.newscrollspeed && self.newscrollspeed>1) ? self.newscrollspeed : self.getTransitionSpeed(dd);
          if (self.newscrollspeed&&self.newscrollspeed<=1) ms*=self.newscrollspeed;
          
          self.prepareTransition(ms,true);
          
          if (self.timerscroll&&self.timerscroll.tm) clearInterval(self.timerscroll.tm);    
          
          if (ms>0) {
          
            if (!self.scrollrunning&&self.onscrollstart) {
              var info = {"type":"scrollstart","current":{"x":lft,"y":top},"request":{"x":x,"y":y},"end":{"x":self.newscrollx,"y":self.newscrolly},"speed":ms};
              self.onscrollstart.call(self,info);
            }
            
            if (cap.transitionend) {
              if (!self.scrollendtrapped) {
                self.scrollendtrapped = true;
                self.bind(self.doc,cap.transitionend,self.onScrollEnd,false); //I have got to do something usefull!!
              }
            } else {              
              if (self.scrollendtrapped) clearTimeout(self.scrollendtrapped);
              self.scrollendtrapped = setTimeout(self.onScrollEnd,ms);  // simulate transitionend event
            }
            
            var py = top;
            var px = lft;
            self.timerscroll = {
              bz: new BezierClass(py,self.newscrolly,ms,0,0,0.58,1),
              bh: new BezierClass(px,self.newscrollx,ms,0,0,0.58,1)
            };            
            if (!self.cursorfreezed) self.timerscroll.tm=setInterval(function(){self.showCursor(self.getScrollTop(),self.getScrollLeft())},60);
            
          }
          
          self.synched("doScroll-set",function(){
            self.timer = 0;
            if (self.scrollendtrapped) self.scrollrunning = true;
            self.setScrollTop(self.newscrolly);
            self.setScrollLeft(self.newscrollx);
            if (!self.scrollendtrapped) self.onScrollEnd();
          });
          
          
        },50);
        
      };
      
      this.cancelScroll = function() {
        if (!self.scrollendtrapped) return true;        
        var py = self.getScrollTop();
        var px = self.getScrollLeft();
        self.scrollrunning = false;
        if (!cap.transitionend) clearTimeout(cap.transitionend);
        self.scrollendtrapped = false;
        self._unbind(self.doc,cap.transitionend,self.onScrollEnd);        
        self.prepareTransition(0);
        self.setScrollTop(py); // fire event onscroll
        if (self.railh) self.setScrollLeft(px);
        if (self.timerscroll&&self.timerscroll.tm) clearInterval(self.timerscroll.tm);
        self.timerscroll = false;
        
        self.cursorfreezed = false;

        //self.noticeCursor(false,py,px);
        self.showCursor(py,px);
        return self;
      };
      this.onScrollEnd = function() {                
        if (self.scrollendtrapped) self._unbind(self.doc,cap.transitionend,self.onScrollEnd);
        self.scrollendtrapped = false;        
        self.prepareTransition(0);
        if (self.timerscroll&&self.timerscroll.tm) clearInterval(self.timerscroll.tm);
        self.timerscroll = false;        
        var py = self.getScrollTop();
        var px = self.getScrollLeft();
        self.setScrollTop(py);  // fire event onscroll        
        if (self.railh) self.setScrollLeft(px);  // fire event onscroll left
        
        self.noticeCursor(false,py,px);     
        
        self.cursorfreezed = false;
        
        if (py<0) py=0
        else if (py>self.page.maxh) py=self.page.maxh;
        if (px<0) px=0
        else if (px>self.page.maxw) px=self.page.maxw;
        if((py!=self.newscrolly)||(px!=self.newscrollx)) return self.doScrollPos(px,py,self.opt.snapbackspeed);
        
        if (self.onscrollend&&self.scrollrunning) {
          var info = {"type":"scrollend","current":{"x":px,"y":py},"end":{"x":self.newscrollx,"y":self.newscrolly}};
          self.onscrollend.call(self,info);
        } 
        self.scrollrunning = false;
        
      };

    } else {

      this.doScrollLeft = function(x,spd) {  //no-trans
        var y = (self.scrollrunning) ? self.newscrolly : self.getScrollTop();
        self.doScrollPos(x,y,spd);
      }

      this.doScrollTop = function(y,spd) {  //no-trans
        var x = (self.scrollrunning) ? self.newscrollx : self.getScrollLeft();
        self.doScrollPos(x,y,spd);
      }

      this.doScrollPos = function(x,y,spd) {  //no-trans
        var y = ((typeof y == "undefined")||(y===false)) ? self.getScrollTop(true) : y;
      
        if  ((self.timer)&&(self.newscrolly==y)&&(self.newscrollx==x)) return true;
      
        if (self.timer) clearAnimationFrame(self.timer);
        self.timer = 0;      

        var py = self.getScrollTop();
        var px = self.getScrollLeft();
        
        if (((self.newscrolly-py)*(y-py)<0)||((self.newscrollx-px)*(x-px)<0)) self.cancelScroll();  //inverted movement detection
        
        self.newscrolly = y;
        self.newscrollx = x;
        
        if (!self.bouncescroll||!self.rail.visibility) {
          if (self.newscrolly<0) {
            self.newscrolly = 0;
          }
          else if (self.newscrolly>self.page.maxh) {
            self.newscrolly = self.page.maxh;
          }
        }
        if (!self.bouncescroll||!self.railh.visibility) {
          if (self.newscrollx<0) {
            self.newscrollx = 0;
          }
          else if (self.newscrollx>self.page.maxw) {
            self.newscrollx = self.page.maxw;
          }
        }

        self.dst = {};
        self.dst.x = x-px;
        self.dst.y = y-py;
        self.dst.px = px;
        self.dst.py = py;
        
        var dst = Math.round(Math.sqrt(Math.pow(self.dst.x,2)+Math.pow(self.dst.y,2)));
        
        self.dst.ax = self.dst.x / dst;
        self.dst.ay = self.dst.y / dst;
        
        var pa = 0;
        var pe = dst;
        
        if (self.dst.x==0) {
          pa = py;
          pe = y;
          self.dst.ay = 1;
          self.dst.py = 0;
        } else if (self.dst.y==0) {
          pa = px;
          pe = x;
          self.dst.ax = 1;
          self.dst.px = 0;
        }

        var ms = self.getTransitionSpeed(dst);
        if (spd&&spd<=1) ms*=spd;
        if (ms>0) {
          self.bzscroll = (self.bzscroll) ? self.bzscroll.update(pe,ms) : new BezierClass(pa,pe,ms,0,1,0,1);
        } else {
          self.bzscroll = false;
        }
        
        if (self.timer) return;
        
        if ((py==self.page.maxh&&y>=self.page.maxh)||(px==self.page.maxw&&x>=self.page.maxw)) self.checkContentSize();
        
        var sync = 1;
        
        function scrolling() {          
          if (self.cancelAnimationFrame) return true;
          
          self.scrollrunning = true;
          
          sync = 1-sync;
          if (sync) return (self.timer = setAnimationFrame(scrolling)||1);

          var done = 0;
          
          var sc = sy = self.getScrollTop();
          if (self.dst.ay) {            
            sc = (self.bzscroll) ? self.dst.py + (self.bzscroll.getNow()*self.dst.ay) : self.newscrolly;
            var dr=sc-sy;          
            if ((dr<0&&sc<self.newscrolly)||(dr>0&&sc>self.newscrolly)) sc = self.newscrolly;
            self.setScrollTop(sc);
            if (sc == self.newscrolly) done=1;
          } else {
            done=1;
          }
          
          var scx = sx = self.getScrollLeft();
          if (self.dst.ax) {            
            scx = (self.bzscroll) ? self.dst.px + (self.bzscroll.getNow()*self.dst.ax) : self.newscrollx;            
            var dr=scx-sx;
            if ((dr<0&&scx<self.newscrollx)||(dr>0&&scx>self.newscrollx)) scx = self.newscrollx;
            self.setScrollLeft(scx);
            if (scx == self.newscrollx) done+=1;
          } else {
            done+=1;
          }
          
          if (done==2) {
            self.timer = 0;
            self.cursorfreezed = false;
            self.bzscroll = false;
            self.scrollrunning = false;
            if (sc<0) sc=0;
            else if (sc>self.page.maxh) sc=self.page.maxh;
            if (scx<0) scx=0;
            else if (scx>self.page.maxw) scx=self.page.maxw;
            if ((scx!=self.newscrollx)||(sc!=self.newscrolly)) self.doScrollPos(scx,sc);
            else {
              if (self.onscrollend) {
                var info = {"type":"scrollend","current":{"x":sx,"y":sy},"end":{"x":self.newscrollx,"y":self.newscrolly}};
                self.onscrollend.call(self,info);
              }             
            } 
          } else {
            self.timer = setAnimationFrame(scrolling)||1;
          }
        };
        self.cancelAnimationFrame=false;
        self.timer = 1;

        if (self.onscrollstart&&!self.scrollrunning) {
          var info = {"type":"scrollstart","current":{"x":px,"y":py},"request":{"x":x,"y":y},"end":{"x":self.newscrollx,"y":self.newscrolly},"speed":ms};
          self.onscrollstart.call(self,info);
        }        

        scrolling();
        
        if ((py==self.page.maxh&&y>=py)||(px==self.page.maxw&&x>=px)) self.checkContentSize();
        
        self.noticeCursor();
      };
  
      this.cancelScroll = function() {        
        if (self.timer) clearAnimationFrame(self.timer);
        self.timer = 0;
        self.bzscroll = false;
        self.scrollrunning = false;
        return self;
      };
      
    }
    
    this.doScrollBy = function(stp,relative) {
      var ny = 0;
      if (relative) {
        ny = Math.floor((self.scroll.y-stp)*self.scrollratio.y)
      } else {        
        var sy = (self.timer) ? self.newscrolly : self.getScrollTop(true);
        ny = sy-stp;
      }
      if (self.bouncescroll) {
        var haf = Math.round(self.view.h/2);
        if (ny<-haf) ny=-haf
        else if (ny>(self.page.maxh+haf)) ny = (self.page.maxh+haf);
      }
      self.cursorfreezed = false;      

      py = self.getScrollTop(true);
      if (ny<0&&py<=0) return self.noticeCursor();      
      else if (ny>self.page.maxh&&py>=self.page.maxh) {
        self.checkContentSize();
        return self.noticeCursor();
      }
      
      self.doScrollTop(ny);
    };

    this.doScrollLeftBy = function(stp,relative) {
      var nx = 0;
      if (relative) {
        nx = Math.floor((self.scroll.x-stp)*self.scrollratio.x)
      } else {
        var sx = (self.timer) ? self.newscrollx : self.getScrollLeft(true);
        nx = sx-stp;
      }
      if (self.bouncescroll) {
        var haf = Math.round(self.view.w/2);
        if (nx<-haf) nx=-haf
        else if (nx>(self.page.maxw+haf)) nx = (self.page.maxw+haf);
      }
      self.cursorfreezed = false;    

      px = self.getScrollLeft(true);
      if (nx<0&&px<=0) return self.noticeCursor();      
      else if (nx>self.page.maxw&&px>=self.page.maxw) return self.noticeCursor();
      
      self.doScrollLeft(nx);
    };
    
    this.doScrollTo = function(pos,relative) {
      var ny = (relative) ? Math.round(pos*self.scrollratio.y) : pos;
      if (ny<0) ny=0
      else if (ny>self.page.maxh) ny = self.page.maxh;
      self.cursorfreezed = false;
      self.doScrollTop(pos);
    };
    
    this.checkContentSize = function() {      
      var pg = self.getContentSize();
      if ((pg.h!=self.page.h)||(pg.w!=self.page.w)) self.resize(false,pg);
    };
    
    self.onscroll = function(e) {    
      if (self.rail.drag) return;
      if (!self.cursorfreezed) {
        self.synched('scroll',function(){
          self.scroll.y = Math.round(self.getScrollTop() * (1/self.scrollratio.y));
          if (self.railh) self.scroll.x = Math.round(self.getScrollLeft() * (1/self.scrollratio.x));
          self.noticeCursor();
        });
      }
    };
    self.bind(self.docscroll,"scroll",self.onscroll);
    
    this.doZoomIn = function(e) {
      if (self.zoomactive) return;
      self.zoomactive = true;
      
      self.zoomrestore = {
        style:{}
      };
      var lst = ['position','top','left','zIndex','backgroundColor','marginTop','marginBottom','marginLeft','marginRight'];
      var win = self.win[0].style;
      for(var a in lst) {
        var pp = lst[a];
        self.zoomrestore.style[pp] = (typeof win[pp] != "undefined") ? win[pp] : '';        
      }
      
      self.zoomrestore.style.width = self.win.css('width');
      self.zoomrestore.style.height = self.win.css('height');
      
      self.zoomrestore.padding = {
        w:self.win.outerWidth()-self.win.width(),
        h:self.win.outerHeight()-self.win.height()
      };
      
      if (cap.isios4) {
        self.zoomrestore.scrollTop = $(window).scrollTop();
        $(window).scrollTop(0);
      }
      
      self.win.css({
        "position":(cap.isios4)?"absolute":"fixed",
        "top":0,
        "left":0,
        "z-index":globalmaxzindex+100,
        "margin":"0px"
      });
      var bkg = self.win.css("backgroundColor");      
      if (bkg==""||/transparent|rgba\(0, 0, 0, 0\)|rgba\(0,0,0,0\)/.test(bkg)) self.win.css("backgroundColor","#fff");
      self.rail.css({"z-index":globalmaxzindex+101});
      self.zoom.css({"z-index":globalmaxzindex+102});      
      self.zoom.css('backgroundPosition','0px -18px');
      self.resizeZoom();
      
      if (self.onzoomin) self.onzoomin.call(self);
      
      return self.cancelEvent(e);
    };

    this.doZoomOut = function(e) {
      if (!self.zoomactive) return;
      self.zoomactive = false;
      
      self.win.css("margin","");
      self.win.css(self.zoomrestore.style);
      
      if (cap.isios4) {
        $(window).scrollTop(self.zoomrestore.scrollTop);
      }
      
      self.rail.css({"z-index":self.zindex});
      self.zoom.css({"z-index":self.zindex});
      self.zoomrestore = false;
      self.zoom.css('backgroundPosition','0px 0px');
      self.onResize();
      
      if (self.onzoomout) self.onzoomout.call(self);
      
      return self.cancelEvent(e);
    };
    
    this.doZoom = function(e) {
      return (self.zoomactive) ? self.doZoomOut(e) : self.doZoomIn(e);
    };
    
    this.resizeZoom = function() {
      if (!self.zoomactive) return;

      var py = self.getScrollTop(); //preserve scrolling position
      self.win.css({
        width:$(window).width()-self.zoomrestore.padding.w+"px",
        height:$(window).height()-self.zoomrestore.padding.h+"px"
      });
      self.onResize();
      
      self.setScrollTop(Math.min(self.page.maxh,py));
    };
   
    this.init();
    
    $.nicescroll.push(this);

  };
  
// Inspired by the work of Kin Blas
// http://webpro.host.adobe.com/people/jblas/momentum/includes/jquery.momentum.0.7.js  
  
  
  var ScrollMomentumClass2D = function(nc) {
    var self = this;
    this.nc = nc;
    
    this.lastx = 0;
    this.lasty = 0;
    this.speedx = 0;
    this.speedy = 0;
    this.lasttime = 0;
    this.steptime = 0;
    this.snapx = false;
    this.snapy = false;
    this.demulx = 0;
    this.demuly = 0;
    
    this.lastscrollx = -1;
    this.lastscrolly = -1;
    
    this.chkx = 0;
    this.chky = 0;
    
    this.timer = 0;
    
    this.time = function() {
      return +new Date();//beautifull hack
    };
    
    this.reset = function(px,py) {
      self.stop();
      var now = self.time();
      self.steptime = 0;
      self.lasttime = now;
      self.speedx = 0;
      self.speedy = 0;
      self.lastx = px;
      self.lasty = py;
      self.lastscrollx = -1;
      self.lastscrolly = -1;
    };
    
    this.update = function(px,py) {
      var now = self.time();
      self.steptime = now - self.lasttime;
      self.lasttime = now;      
      var dy = py - self.lasty;
      var dx = px - self.lastx;
      var sy = self.nc.getScrollTop();
      var sx = self.nc.getScrollLeft();
      var newy = sy + dy;
      var newx = sx + dx;
      self.snapx = (newx<0)||(newx>self.nc.page.maxw);
      self.snapy = (newy<0)||(newy>self.nc.page.maxh);
      self.speedx = dx;
      self.speedy = dy;
      self.lastx = px;
      self.lasty = py;
    };
    
    this.stop = function() {
      self.nc.unsynched("domomentum2d");
      if (self.timer) clearTimeout(self.timer);
      self.timer = 0;
      self.lastscrollx = -1;
      self.lastscrolly = -1;
    };
    
    this.doSnapy = function(nx,ny) {
      var snap = false;
      
      if (ny<0) {
        ny=0;
        snap=true;        
      } 
      else if (ny>self.nc.page.maxh) {
        ny=self.nc.page.maxh;
        snap=true;
      }

      if (nx<0) {
        nx=0;
        snap=true;        
      } 
      else if (nx>self.nc.page.maxw) {
        nx=self.nc.page.maxw;
        snap=true;
      }
      
      if (snap) self.nc.doScrollPos(nx,ny,self.nc.opt.snapbackspeed);
    };
    
    this.doMomentum = function(gp) {
      var t = self.time();
      var l = (gp) ? t+gp : self.lasttime;

      var sl = self.nc.getScrollLeft();
      var st = self.nc.getScrollTop();
      
      var pageh = self.nc.page.maxh;
      var pagew = self.nc.page.maxw;
      
      self.speedx = (pagew>0) ? Math.min(60,self.speedx) : 0;
      self.speedy = (pageh>0) ? Math.min(60,self.speedy) : 0;
      
      var chk = l && (t - l) <= 60;
      
      if ((st<0)||(st>pageh)||(sl<0)||(sl>pagew)) chk = false;
      
      var sy = (self.speedy && chk) ? self.speedy : false;
      var sx = (self.speedx && chk) ? self.speedx : false;
      
      if (sy||sx) {
        var tm = Math.max(16,self.steptime); //timeout granularity
        
        if (tm>50) {  // do smooth
          var xm = tm/50;
          self.speedx*=xm;
          self.speedy*=xm;
          tm = 50;
        }
        
        self.demulxy = 0;

        self.lastscrollx = self.nc.getScrollLeft();
        self.chkx = self.lastscrollx;
        self.lastscrolly = self.nc.getScrollTop();
        self.chky = self.lastscrolly;
        
        var nx = self.lastscrollx;
        var ny = self.lastscrolly;
        
        var onscroll = function(){
          var df = ((self.time()-t)>600) ? 0.04 : 0.02;
        
          if (self.speedx) {
            nx = Math.floor(self.lastscrollx - (self.speedx*(1-self.demulxy)));
            self.lastscrollx = nx;
            if ((nx<0)||(nx>pagew)) df=0.10;
          }

          if (self.speedy) {
            ny = Math.floor(self.lastscrolly - (self.speedy*(1-self.demulxy)));
            self.lastscrolly = ny;
            if ((ny<0)||(ny>pageh)) df=0.10;
          }
          
          self.demulxy = Math.min(1,self.demulxy+df);
          
          self.nc.synched("domomentum2d",function(){

            if (self.speedx) {
              var scx = self.nc.getScrollLeft();
              if (scx!=self.chkx) self.stop();
              self.chkx=nx;
              self.nc.setScrollLeft(nx);
            }
          
            if (self.speedy) {
              var scy = self.nc.getScrollTop();
              if (scy!=self.chky) self.stop();          
              self.chky=ny;
              self.nc.setScrollTop(ny);
            }
            
            if(!self.timer) {
              self.nc.hideCursor();
              self.doSnapy(nx,ny);
            }
            
          });
          
          if (self.demulxy<1) {            
            self.timer = setTimeout(onscroll,tm);
          } else {
            self.stop();
            self.nc.hideCursor();
            self.doSnapy(nx,ny);
          }
        };
        
        onscroll();
        
      } else {
        self.doSnapy(self.nc.getScrollLeft(),self.nc.getScrollTop());
      }      
      
    }
    
  };

  
// override jQuery scrollTop
 
  var _scrollTop = jQuery.fn.scrollTop; // preserve original function
   
  jQuery.cssHooks["pageYOffset"] = {
    get: function(elem,computed,extra) {      
      var nice = $.data(elem,'__nicescroll')||false;
      return (nice&&nice.ishwscroll) ? nice.getScrollTop() : _scrollTop.call(elem);
    },
    set: function(elem,value) {
      var nice = $.data(elem,'__nicescroll')||false;    
      (nice&&nice.ishwscroll) ? nice.setScrollTop(parseInt(value)) : _scrollTop.call(elem,value);
      return this;
    }
  };
  
/*  
  $.fx.step["scrollTop"] = function(fx){    
    $.cssHooks["scrollTop"].set( fx.elem, fx.now + fx.unit );
  };
*/  
  
  jQuery.fn.scrollTop = function(value) {    
    if (typeof value == "undefined") {
      var nice = (this[0]) ? $.data(this[0],'__nicescroll')||false : false;
      return (nice&&nice.ishwscroll) ? nice.getScrollTop() : _scrollTop.call(this);
    } else {      
      return this.each(function() {
        var nice = $.data(this,'__nicescroll')||false;
        (nice&&nice.ishwscroll) ? nice.setScrollTop(parseInt(value)) : _scrollTop.call($(this),value);
      });
    }
  }

// override jQuery scrollLeft
 
  var _scrollLeft = jQuery.fn.scrollLeft; // preserve original function
   
  $.cssHooks.pageXOffset = {
    get: function(elem,computed,extra) {
      var nice = $.data(elem,'__nicescroll')||false;
      return (nice&&nice.ishwscroll) ? nice.getScrollLeft() : _scrollLeft.call(elem);
    },
    set: function(elem,value) {
      var nice = $.data(elem,'__nicescroll')||false;    
      (nice&&nice.ishwscroll) ? nice.setScrollLeft(parseInt(value)) : _scrollLeft.call(elem,value);
      return this;
    }
  };
  
/*  
  $.fx.step["scrollLeft"] = function(fx){
    $.cssHooks["scrollLeft"].set( fx.elem, fx.now + fx.unit );
  };  
*/  
 
  jQuery.fn.scrollLeft = function(value) {    
    if (typeof value == "undefined") {
      var nice = (this[0]) ? $.data(this[0],'__nicescroll')||false : false;
      return (nice&&nice.ishwscroll) ? nice.getScrollLeft() : _scrollLeft.call(this);
    } else {
      return this.each(function() {     
        var nice = $.data(this,'__nicescroll')||false;
        (nice&&nice.ishwscroll) ? nice.setScrollLeft(parseInt(value)) : _scrollLeft.call($(this),value);
      });
    }
  }
  
  var NiceScrollArray = function(doms) {
    var self = this;
    this.length = 0;
    this.name = "nicescrollarray";
  
    this.each = function(fn) {
      for(var a=0,i=0;a<self.length;a++) fn.call(self[a],i++);
      return self;
    };
    
    this.push = function(nice) {
      self[self.length]=nice;
      self.length++;
    };
    
    this.eq = function(idx) {
      return self[idx];
    };
    
    if (doms) {
      for(a=0;a<doms.length;a++) {
        var nice = $.data(doms[a],'__nicescroll')||false;
        if (nice) {
          this[this.length]=nice;
          this.length++;
        }
      };
    }
    
    return this;
  };
  
  function mplex(el,lst,fn) {
    for(var a=0;a<lst.length;a++) fn(el,lst[a]);
  };  
  mplex(
    NiceScrollArray.prototype,
    ['show','hide','toggle','onResize','resize','remove','stop','doScrollPos'],
    function(e,n) {
      e[n] = function(){
        var args = arguments;
        return this.each(function(){          
          this[n].apply(this,args);
        });
      };
    }
  );  
  
  jQuery.fn.getNiceScroll = function(index) {
    if (typeof index == "undefined") {
      return new NiceScrollArray(this);
    } else {      
      var nice = this[index]&&$.data(this[index],'__nicescroll')||false;
      return nice;
    }
  };
  
  jQuery.extend(jQuery.expr[':'], {
    nicescroll: function(a) {
      return ($.data(a,'__nicescroll'))?true:false;
    }
  });  
  
  $.fn.niceScroll = function(wrapper,opt) {        
    if (typeof opt=="undefined") {
      if ((typeof wrapper=="object")&&!("jquery" in wrapper)) {
        opt = wrapper;
        wrapper = false;        
      }
    }
    var ret = new NiceScrollArray();
    if (typeof opt=="undefined") opt = {};
    
    if (wrapper||false) {      
      opt.doc = $(wrapper);
      opt.win = $(this);
    }    
    var docundef = !("doc" in opt);   
    if (!docundef&&!("win" in opt)) opt.win = $(this);    
    
    this.each(function() {
      var nice = $(this).data('__nicescroll')||false;
      if (!nice) {
        opt.doc = (docundef) ? $(this) : opt.doc;
        nice = new NiceScrollClass(opt,$(this));        
        $(this).data('__nicescroll',nice);
      }
      ret.push(nice);
    });
    return (ret.length==1) ? ret[0] : ret;
  };
  
  window.NiceScroll = {
    getjQuery:function(){return jQuery}
  };
  
  if (!$.nicescroll) {
   $.nicescroll = new NiceScrollArray();
   $.nicescroll.options = _globaloptions;
  }
  
})( jQuery );
  /* Placeholders.js v3.0.2 */
(function(t){"use strict";function e(t,e,r){return t.addEventListener?t.addEventListener(e,r,!1):t.attachEvent?t.attachEvent("on"+e,r):void 0}function r(t,e){var r,n;for(r=0,n=t.length;n>r;r++)if(t[r]===e)return!0;return!1}function n(t,e){var r;t.createTextRange?(r=t.createTextRange(),r.move("character",e),r.select()):t.selectionStart&&(t.focus(),t.setSelectionRange(e,e))}function a(t,e){try{return t.type=e,!0}catch(r){return!1}}t.Placeholders={Utils:{addEventListener:e,inArray:r,moveCaret:n,changeType:a}}})(this),function(t){"use strict";function e(){}function r(){try{return document.activeElement}catch(t){}}function n(t,e){var r,n,a=!!e&&t.value!==e,u=t.value===t.getAttribute(V);return(a||u)&&"true"===t.getAttribute(D)?(t.removeAttribute(D),t.value=t.value.replace(t.getAttribute(V),""),t.className=t.className.replace(R,""),n=t.getAttribute(F),parseInt(n,10)>=0&&(t.setAttribute("maxLength",n),t.removeAttribute(F)),r=t.getAttribute(P),r&&(t.type=r),!0):!1}function a(t){var e,r,n=t.getAttribute(V);return""===t.value&&n?(t.setAttribute(D,"true"),t.value=n,t.className+=" "+I,r=t.getAttribute(F),r||(t.setAttribute(F,t.maxLength),t.removeAttribute("maxLength")),e=t.getAttribute(P),e?t.type="text":"password"===t.type&&M.changeType(t,"text")&&t.setAttribute(P,"password"),!0):!1}function u(t,e){var r,n,a,u,i,l,o;if(t&&t.getAttribute(V))e(t);else for(a=t?t.getElementsByTagName("input"):b,u=t?t.getElementsByTagName("textarea"):f,r=a?a.length:0,n=u?u.length:0,o=0,l=r+n;l>o;o++)i=r>o?a[o]:u[o-r],e(i)}function i(t){u(t,n)}function l(t){u(t,a)}function o(t){return function(){m&&t.value===t.getAttribute(V)&&"true"===t.getAttribute(D)?M.moveCaret(t,0):n(t)}}function c(t){return function(){a(t)}}function s(t){return function(e){return A=t.value,"true"===t.getAttribute(D)&&A===t.getAttribute(V)&&M.inArray(C,e.keyCode)?(e.preventDefault&&e.preventDefault(),!1):void 0}}function d(t){return function(){n(t,A),""===t.value&&(t.blur(),M.moveCaret(t,0))}}function g(t){return function(){t===r()&&t.value===t.getAttribute(V)&&"true"===t.getAttribute(D)&&M.moveCaret(t,0)}}function v(t){return function(){i(t)}}function p(t){t.form&&(T=t.form,"string"==typeof T&&(T=document.getElementById(T)),T.getAttribute(U)||(M.addEventListener(T,"submit",v(T)),T.setAttribute(U,"true"))),M.addEventListener(t,"focus",o(t)),M.addEventListener(t,"blur",c(t)),m&&(M.addEventListener(t,"keydown",s(t)),M.addEventListener(t,"keyup",d(t)),M.addEventListener(t,"click",g(t))),t.setAttribute(j,"true"),t.setAttribute(V,x),(m||t!==r())&&a(t)}var b,f,m,h,A,y,E,x,L,T,N,S,w,B=["text","search","url","tel","email","password","number","textarea"],C=[27,33,34,35,36,37,38,39,40,8,46],k="#ccc",I="placeholdersjs",R=RegExp("(?:^|\\s)"+I+"(?!\\S)"),V="data-placeholder-value",D="data-placeholder-active",P="data-placeholder-type",U="data-placeholder-submit",j="data-placeholder-bound",q="data-placeholder-focus",z="data-placeholder-live",F="data-placeholder-maxlength",G=document.createElement("input"),H=document.getElementsByTagName("head")[0],J=document.documentElement,K=t.Placeholders,M=K.Utils;if(K.nativeSupport=void 0!==G.placeholder,!K.nativeSupport){for(b=document.getElementsByTagName("input"),f=document.getElementsByTagName("textarea"),m="false"===J.getAttribute(q),h="false"!==J.getAttribute(z),y=document.createElement("style"),y.type="text/css",E=document.createTextNode("."+I+" { color:"+k+"; }"),y.styleSheet?y.styleSheet.cssText=E.nodeValue:y.appendChild(E),H.insertBefore(y,H.firstChild),w=0,S=b.length+f.length;S>w;w++)N=b.length>w?b[w]:f[w-b.length],x=N.attributes.placeholder,x&&(x=x.nodeValue,x&&M.inArray(B,N.type)&&p(N));L=setInterval(function(){for(w=0,S=b.length+f.length;S>w;w++)N=b.length>w?b[w]:f[w-b.length],x=N.attributes.placeholder,x?(x=x.nodeValue,x&&M.inArray(B,N.type)&&(N.getAttribute(j)||p(N),(x!==N.getAttribute(V)||"password"===N.type&&!N.getAttribute(P))&&("password"===N.type&&!N.getAttribute(P)&&M.changeType(N,"text")&&N.setAttribute(P,"password"),N.value===N.getAttribute(V)&&(N.value=x),N.setAttribute(V,x)))):N.getAttribute(D)&&(n(N),N.removeAttribute(V));h||clearInterval(L)},100)}M.addEventListener(t,"beforeunload",function(){K.disable()}),K.disable=K.nativeSupport?e:i,K.enable=K.nativeSupport?e:l}(this);
/* Overthrow */
var doc=this.document,docElem=doc.documentElement,enabledClassName="overthrow-enabled",canBeFilledWithPoly="ontouchmove" in doc,nativeOverflow="WebkitOverflowScrolling" in docElem.style||"msOverflowStyle" in docElem.style||(!canBeFilledWithPoly&&this.screen.width>800)||(function(){var b=this.navigator.userAgent,a=b.match(/AppleWebKit\/([0-9]+)/),d=a&&a[1],c=a&&d>=534;return(b.match(/Android ([0-9]+)/)&&RegExp.$1>=3&&c||b.match(/ Version\/([0-9]+)/)&&RegExp.$1>=0&&this.blackberry&&c||b.indexOf("PlayBook")>-1&&c&&!b.indexOf("Android 2")===-1||b.match(/Firefox\/([0-9]+)/)&&RegExp.$1>=4||b.match(/wOSBrowser\/([0-9]+)/)&&RegExp.$1>=233&&c||b.match(/NokiaBrowser\/([0-9\.]+)/)&&parseFloat(RegExp.$1)===7.3&&a&&d>=533)})();window.overthrow={};window.overthrow.enabledClassName=enabledClassName;window.overthrow.addClass=function(){if(docElem.className.indexOf(window.overthrow.enabledClassName)===-1){docElem.className+=" "+window.overthrow.enabledClassName}};window.overthrow.removeClass=function(){docElem.className=docElem.className.replace(window.overthrow.enabledClassName,"")};window.overthrow.set=function(){if(nativeOverflow){window.overthrow.addClass()}};window.overthrow.canBeFilledWithPoly=canBeFilledWithPoly;window.overthrow.forget=function(){window.overthrow.removeClass()};window.overthrow.support=nativeOverflow?"native":"none";window.overthrow.scrollIndicatorClassName="overthrow";var doc=this.document,docElem=doc.documentElement,nativeOverflow=window.overthrow.support==="native",canBeFilledWithPoly=window.overthrow.canBeFilledWithPoly,configure=window.overthrow.configure,set=window.overthrow.set,forget=window.overthrow.forget,scrollIndicatorClassName=window.overthrow.scrollIndicatorClassName;window.overthrow.closest=function(b,a){return !a&&b.className&&b.className.indexOf(scrollIndicatorClassName)>-1&&b||window.overthrow.closest(b.parentNode)};var enabled=false;window.overthrow.set=function(){set();if(enabled||nativeOverflow||!canBeFilledWithPoly){return}window.overthrow.addClass();enabled=true;window.overthrow.support="polyfilled";window.overthrow.forget=function(){forget();enabled=false;if(doc.removeEventListener){doc.removeEventListener("touchstart",b,false)}};var d,h=[],a=[],g,j,i=function(){h=[];g=null},e=function(){a=[];j=null},f,c=function(n){f=d.querySelectorAll("textarea, input");for(var m=0,l=f.length;m<l;m++){f[m].style.pointerEvents=n}},k=function(m,n){if(doc.createEvent){var o=(!n||n===undefined)&&d.parentNode||d.touchchild||d,l;if(o!==d){l=doc.createEvent("HTMLEvents");l.initEvent("touchend",true,true);d.dispatchEvent(l);o.touchchild=d;d=o;o.dispatchEvent(m)}}},b=function(t){if(window.overthrow.intercept){window.overthrow.intercept()}i();e();d=window.overthrow.closest(t.target);if(!d||d===docElem||t.touches.length>1){return}c("none");var u=t,l=d.scrollTop,p=d.scrollLeft,v=d.offsetHeight,m=d.offsetWidth,q=t.touches[0].pageY,s=t.touches[0].pageX,w=d.scrollHeight,r=d.scrollWidth,n=function(A){var x=l+q-A.touches[0].pageY,y=p+s-A.touches[0].pageX,B=x>=(h.length?h[0]:0),z=y>=(a.length?a[0]:0);if((x>0&&x<w-v)||(y>0&&y<r-m)){A.preventDefault()}else{k(u)}if(g&&B!==g){i()}if(j&&z!==j){e()}g=B;j=z;d.scrollTop=x;d.scrollLeft=y;h.unshift(x);a.unshift(y);if(h.length>3){h.pop()}if(a.length>3){a.pop()}},o=function(x){c("auto");setTimeout(function(){c("none")},450);d.removeEventListener("touchmove",n,false);d.removeEventListener("touchend",o,false)};d.addEventListener("touchmove",n,false);d.addEventListener("touchend",o,false)};doc.addEventListener("touchstart",b,false)};window.overthrow.set();
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

                    var content = CUtils.element(CObjectsHandler.contentId);
                    if(cache.easingTo===0){
                        utils.klass.remove(doc.body, 'snapjs-right');
                        utils.klass.remove(doc.body, 'snapjs-left');
                        CUtils.removeClass(content,'unreachable');
                        CPullToRefresh.enable();
                    }
                    else{
                        CUtils.addClass(content,'unreachable');
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
                    // Disable pulling.
                    CPullToRefresh.disable();

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
                    if (CPullToRefresh.inPull)
                        return;
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
                    if (CPullToRefresh.inPull){
                        action.drag.endDrag(e);
                        return;
                    }

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
/*
 * routie - a tiny hash router
 * v0.3.2
 * http://projects.jga.me/routie
 * copyright Greg Allen 2013
 * MIT License
*/
(function(w) {

  var routes = [];
  var map = {};
  var reference = "routie";
  var oldReference = w[reference];

  var Route = function(path, name) {
    this.name = name;
    this.path = path;
    this.keys = [];
    this.fns = [];
    this.params = {};
    this.regex = pathToRegexp(this.path, this.keys, false, false);

  };

  Route.prototype.addHandler = function(fn) {
    this.fns.push(fn);
  };

  Route.prototype.removeHandler = function(fn) {
    for (var i = 0, c = this.fns.length; i < c; i++) {
      var f = this.fns[i];
      if (fn == f) {
        this.fns.splice(i, 1);
        return;
      }
    }
  };

  Route.prototype.run = function(params) {
    for (var i = 0, c = this.fns.length; i < c; i++) {
      this.fns[i].apply(this, params);
    }
  };

  Route.prototype.match = function(path, params){
    var m = this.regex.exec(path);

    if (!m) return false;


    for (var i = 1, len = m.length; i < len; ++i) {
      var key = this.keys[i - 1];

      var val = ('string' == typeof m[i]) ? decodeURIComponent(m[i]) : m[i];

      if (key) {
        this.params[key.name] = val;
      }
      params.push(val);
    }

    return true;
  };

  Route.prototype.toURL = function(params) {
    var path = this.path;
    for (var param in params) {
      path = path.replace('/:'+param, '/'+params[param]);
    }
    path = path.replace(/\/:.*\?/g, '/').replace(/\?/g, '');
    if (path.indexOf(':') != -1) {
      throw new Error('missing parameters for url: '+path);
    }
    return path;
  };

  var pathToRegexp = function(path, keys, sensitive, strict) {
    if (path instanceof RegExp) return path;
    if (path instanceof Array) path = '(' + path.join('|') + ')';
    path = path
      .concat(strict ? '' : '/?')
      .replace(/\/\(/g, '(?:/')
      .replace(/\+/g, '__plus__')
      .replace(/(\/)?(\.)?:(\w+)(?:(\(.*?\)))?(\?)?/g, function(_, slash, format, key, capture, optional){
        keys.push({ name: key, optional: !! optional });
        slash = slash || '';
        return '' + (optional ? '' : slash) + '(?:' + (optional ? slash : '') + (format || '') + (capture || (format && '([^/.]+?)' || '([^/]+?)')) + ')' + (optional || '');
      })
      .replace(/([\/.])/g, '\\$1')
      .replace(/__plus__/g, '(.+)')
      .replace(/\*/g, '(.*)');
    return new RegExp('^' + path + '$', sensitive ? '' : 'i');
  };

  var addHandler = function(path, fn) {
    var s = path.split(' ');
    var name = (s.length == 2) ? s[0] : null;
    path = (s.length == 2) ? s[1] : s[0];

    if (!map[path]) {
      map[path] = new Route(path, name);
      routes.push(map[path]);
    }
    map[path].addHandler(fn);
  };

  var routie = function(path, fn) {
    if (typeof fn == 'function') {
      addHandler(path, fn);
      routie.reload();
    } else if (typeof path == 'object') {
      for (var p in path) {
        addHandler(p, path[p]);
      }
      routie.reload();
    } else if (typeof fn === 'undefined') {
      routie.navigate(path);
    }
  };

  routie.lookup = function(name, obj) {
    for (var i = 0, c = routes.length; i < c; i++) {
      var route = routes[i];
      if (route.name == name) {
        return route.toURL(obj);
      }
    }
  };

  routie.remove = function(path, fn) {
    var route = map[path];
    if (!route)
      return;
    route.removeHandler(fn);
  };

  routie.removeAll = function() {
    map = {};
    routes = [];
  };

  routie.navigate = function(path, options) {
    options = options || {};
    var silent = options.silent || false;

    if (silent) {
      removeListener();
    }
    setTimeout(function() {
      window.location.hash = path;

      if (silent) {
        setTimeout(function() { 
          addListener();
        }, 1);
      }

    }, 1);
  };

  routie.noConflict = function() {
    w[reference] = oldReference;
    return routie;
  };

  var getHash = function() {
    return window.location.hash.substring(1);
  };

  var checkRoute = function(hash, route) {
    var params = [];
    if (route.match(hash, params)) {
      route.run(params);
      return true;
    }
    return false;
  };

  var hashChanged = routie.reload = function() {
    var hash = getHash();
    for (var i = 0, c = routes.length; i < c; i++) {
      var route = routes[i];
      if (checkRoute(hash, route)) {
        return;
      }
    }
  };

  var addListener = function() {
    if (w.addEventListener) {
      w.addEventListener('hashchange', hashChanged, false);
    } else {
      w.attachEvent('onhashchange', hashChanged);
    }
  };

  var removeListener = function() {
    if (w.removeEventListener) {
      w.removeEventListener('hashchange', hashChanged);
    } else {
      w.detachEvent('onhashchange', hashChanged);
    }
  };
  addListener();

  w[reference] = routie;
   
})(window);
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
    if (str === 'undefined')
        str = 'null';

    var iso8061 = date2obj ? /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/ : false;

    return JSON.parse(str, function (key, value) {
        if (value === undefined)
            value = null;
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
