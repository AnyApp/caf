/**
 * Created by dvircn on 06/08/14.
 */
var CLocalDB = Class({
    $singleton: true,
    base: 'cldb/',
    typeURI: function(type){
        return CLocalDB.base+type;
    },
    getTypeScheme: function(type){
        var scheme = CLocalStorage.get(CLocalDB.typeURI(type));
        if (!CUtils.isEmpty(scheme)) // Exist
            return scheme;
        // Create
        scheme = {
            type: type,
            data: {},
            index: 0
        };
        CLocalStorage.save(CLocalDB.typeURI(type),scheme);
        return scheme;
    },
    getTypeData: function(type){
        return CLocalDB.getTypeScheme(type).data;
    },
    getTypeDataAsArray: function(type){
        return _.values(CLocalDB.getTypeScheme(type).data);
    },
    saveScheme: function(type,scheme){
        CLocalStorage.save(CLocalDB.typeURI(type),scheme);
    },
    saveData: function(type,data){
        var scheme = CLocalDB.getTypeScheme(type);
        scheme.data = data;
        CLocalStorage.save(CLocalDB.typeURI(type),scheme);
    },
    clearTypeData: function(type){
        CLocalDB.saveData(type,{});
    },
    add: function(type,rowData){
        var scheme = CLocalDB.getTypeScheme(type);
        scheme.index = scheme.index + 1;
        rowData.id = scheme.index;
        scheme.data[scheme.index] = rowData;
        CLocalDB.saveScheme(type,scheme);
        return scheme.index;
    },
    update: function(type,id,rowData){
        var data = CLocalDB.getTypeData(type);
        var returned = true;
        // Doesn't exist
        if (CUtils.isEmpty(data[id])){
            returned = CLocalDB.add(type,rowData);
            data = CLocalDB.getTypeData(type);
        }
        else // Update
            data[id] = rowData;
        CLocalDB.saveData(type,data);
        return returned;
    },
    remove: function(type,id){
        var data = CLocalDB.getTypeData(type);
        // Doesn't exist
        if (CUtils.isEmpty(data[id]))
            return false;
        delete data[id];
        CLocalDB.saveData(type,data);
        return true;
    },
    get: function(type,id){
        var data = CLocalDB.getTypeData(type);
        // Doesn't exist
        if (CUtils.isEmpty(data[id]))
            return null;
        return data[id];
    },
    empty: function(type,id){
        var data = CLocalDB.getTypeData(type);
        // Doesn't exist
        return CUtils.isEmpty(data[id]);
    }

});


