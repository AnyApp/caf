/**
 * Created by dvircn on 17/08/14.
 */
var CData = Class({
    $singleton: true,

    value: function(data,deep){
        if (deep === true && data.isDynamicData !== true) {
            var parsedData = CUtils.clone(data);
            CData.deepValueParse(parsedData);
            return parsedData;
        }
        if (data.isDynamicData === true)
            return CData.parseReference(data.source);
        return data;
    },
    deepValueParse: function(obj) {
        if (CUtils.isEmpty(obj) || obj.parseReferencesVisited === true /* Circular*/)
            return;
        obj.parseReferencesVisited = true;
        for (var property in obj) {
            if (!obj.hasOwnProperty(property) || CUtils.isEmpty(obj[property]))
                continue;
            if (obj[property].isDynamicData === true)
                obj[property] = CData.parseReference(obj[property].source);
            else if (typeof obj[property] == "object")
                CData.deepValueParse(obj[property]);
        }
        delete obj.parseReferencesVisited;
    },
    // Scan and decide which parsing to do
    parseReference: function(str,workingObject){
        var value = str;
        // Check if is dynamic reference.
        if (str.length>1 && str[0] == '&'){
            var source = str.substring(1);
            return new CDynamicData(source);
        }

        if (str.length>5 && str.substr(0,5) == 'this.')
            value = CData.parseLocalReference(workingObject,str.substr(5)) || null;
        else if (str.length>1 && str.substr(0,1) == '.')
            value = CData.parseRelativeReference(workingObject,str)  || null;
        else if (str.length>1 && str.substr(0,1) == '/')
            value = CData.parseRelativeObjectId(workingObject,str)   || null;
        else if (str.length>8 && str.substr(0,8) == 'globals.')
            value = CData.parseGlobalReference(str.substr(8))        || null;
        else if (str.length>9 && str.substr(0,9) == 'lstorage.')
            value = CData.parseLocalStorageReference(str.substr(9))  || null;
        else if (str.length>4 && str.substr(0,4) == 'ldb.')
            value = CData.parseLocalDBReference(str.substr(4))  || null;
        else if (str.length>5 && str.substr(0,5) == 'page.')
            value = CData.parsePageReference(str.substr(5))          || null;
        else if (str.length>8 && str.substr(0,8) == 'designs.')
            value = CData.parseDesignReference(str.substr(8))        || null;

        return value;
    },
    parseLocalReference: function(workingObject,str){
        return eval('workingObject.'+str);
    },
    parseGlobalReference: function(str){
        return CGlobals.getDeep(str) || null;
    },
    parseLocalStorageReference: function(str){
        return CLocalStorage.get(str) || null;
    },
    parseLocalDBReference: function(str){
        var parts   = str.split('.');
        if (parts.length <2) // Not Enough Arguments
            return null;
        var type    = parts[0] || '';
        var method  = parts[1] || '';
        var element = parts[2] || '';
        if (method == 'scheme')
            return CLocalDB.getTypeScheme(type);
        else if (method == 'data')
            return CLocalDB.getTypeData(type);
        else if (method == 'array')
            return CLocalDB.getTypeDataAsArray(type);
        else if (method == 'element')
            return CLocalDB.get(type,element);
        return null;
    },
    parsePageReference: function(str){
        return CPageData.getDeep(str) || null;
    },
    parseDesignReference: function(str){
        return CDesignHandler.get(str) || null;
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
    }

});
