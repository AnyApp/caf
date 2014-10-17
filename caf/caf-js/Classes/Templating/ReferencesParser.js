/**
 * Created by dvircn on 22/08/14.
 */
var CTemplator = Class({
    $singleton: true,
    parseReferences: function(object,json) {
        if (CUtils.isEmpty(json) || json.parseReferencesVisited === true /* Circular*/)
            return;
        json.parseReferencesVisited = true;
        for (var property in json) {
            if (json.hasOwnProperty(property) && property!='template') {
                if (typeof json[property] == "object"){
                    this.parseReferences(json[property]);
                }
                else if (typeof json[property] == 'string' || json[property] instanceof String){
                    // Evaluate dynamic data.
                    var evaluated   = this.replaceReferencesInString(json[property]);
                    json[property] = evaluated;
                }

            }
        }
        delete json.parseReferencesVisited;
    },
    parseLocalReference: function(str){
        return eval(str);
    },
    parseGlobalReference: function(str){
        return CGlobals.get(str);
    },
    parseDesignReference: function(str){
        return CDesignHandler.get(str);
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
            if (part.length>6 && part.substr(0,6) == '#this.')
                parts[i] = this.parseLocalReference(part.substr(1))       || null;
            else if (part.length>2 && part.substr(0,2) == '#.')
                parts[i] = this.parseRelativeReference(part.substr(1))    || null;
            else if (part.length>2 && part.substr(0,2) == '#/')
                parts[i] = this.parseRelativeObjectId(part.substr(1))     || null;
            else if (part.length>9 && part.substr(0,9) == '#globals.')
                parts[i] = this.parseGlobalReference(part.substr(9))     || null;
            else if (part.length>9 && part.substr(0,9) == '#designs.')
                parts[i] = this.parseDesignReference(part.substr(9))     || null;
        }
        // Filter out empty elements.
        parts = parts.filter(function(n){ return n != undefined && n!='' && n!=null });
        // Case of single variable - could be an object reference. Otherwise, String.
        if (parts.length==1)
            return parts[0];

        return parts.join(' ');
    }
    
});


