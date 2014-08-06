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
        var elm = document.getElementById(id);
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
                window.setTimeout(function(){caf.utils.addClass(elm,'hidden');},duration || 300);
            }
            else
            {
                caf.utils.addClass(elm,'hidden');
            }
            this.addClass(elm,outClass);
            this.removeClass(elm,showClass);
        }
    },
    isEmpty: function(obj)
    {
        return obj == undefined || obj == null || obj == '' || obj.toString()=='';
    },
    isString: function(variable)
    {
        return (typeof variable == 'string' || variable instanceof String)
            && variable.trim().indexOf("function")!=0;
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
        if (!caf.utils.hasClass(el, name)) { el.className += (el.className ? ' ' : '') +name; }
    },
    removeClass: function(el, name)
    {
        if (caf.utils.hasClass(el, name)) {
            el.className=el.className.replace(new RegExp('(\\s|^)'+name+'(\\s|$)'),' ').replace(/^\s+|\s+$/g, '');
        }
    },
    unbindEvent: function(elm,eventName,event)
    {
        if (!caf.utils.isEmpty(elm) && !caf.utils.isEmpty(event))
        {
            elm.removeEventListener(eventName,event);
        }
    },
    getPointerEvent: function(event) {
        return event.targetTouches ? event.targetTouches[0] : event;
    },
    openURL: function(url)
    {
        if (caf.platforms.isIOS())
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
    }
});



