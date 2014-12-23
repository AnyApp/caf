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
    isNotEmpty: function(obj)
    {
        return !CUtils.isEmpty(obj);
    },
    isString: function(variable)
    {
        return (typeof variable == 'string' || variable instanceof String);
    },
    isArray: function(variable){
        return Object.prototype.toString.call( variable ) === '[object Array]';
    },
    isFunction: function(variable){
        return typeof(variable) == "function";
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
    },
    /**
     * Convert an image
     * to a base64 string
     * @param  {String}   url
     * @param  {Function} callback
     * @param  {String}   [outputFormat=image/png]
     */
    convertImgToBase64: function(url, callback, outputFormat){
        var canvas = document.createElement('CANVAS'),
            ctx = canvas.getContext('2d'),
            img = new Image;
        img.crossOrigin = 'Anonymous';
        img.onload = function(){
            var dataURL;
            canvas.height = img.height;
            canvas.width = img.width;
            ctx.drawImage(img, 0, 0);
            dataURL = canvas.toDataURL(outputFormat);
            callback.call(this, dataURL);
            canvas = null;
        };
        img.src = url;
    },
    deepFind: function(obj, path) {
        var paths = path.split('.')
            , current = obj
            , i;

        for (i = 0; i < paths.length; ++i) {
            if (current[paths[i]] == undefined) {
                return undefined;
            } else {
                current = current[paths[i]];
            }
        }
        return current;
    }




});



