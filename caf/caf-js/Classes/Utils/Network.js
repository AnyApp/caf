/**
 * Created by dvircn on 06/08/14.
 */
var CNetwork = Class({
    $singleton: true,
    requestsStates: {},
    initializeRequest: function(requestId,xmlhttp,url,data,callback,errorHandler){
        CNetwork.requestsStates[requestId] = false;
        xmlhttp.onreadystatechange = function(){
            if (xmlhttp.readyState == 4){
                if (xmlhttp.status == 200) {
                    var origData = xmlhttp.responseText;
                    if (CNetwork.requestsStates[requestId]===true || CUtils.isEmpty(origData))
                        return;
                    CNetwork.requestsStates[requestId] = true;

                    var data = null;
                    // If the response in JSON, Parse it.
                    try {
                        data = JSONfn.parse(origData);
                    } catch (e) {
                        data = origData;
                    }
                    if (!CUtils.isEmpty(callback)){
                        callback(data); // callback
                    }
                }
                else {
                    CLog.error('request error: ' + xmlhttp.responseText);
                    if (!CUtils.isEmpty(errorHandler)){
                        errorHandler(); // callback
                    }
                }
            }

        };
        xmlhttp.open("POST", url);
        xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    },
    send: function(url,data,callback,errorHandler){
        var xmlhttp = new XMLHttpRequest();
        CNetwork.initializeRequest(CNetwork.generateID(),xmlhttp,url,data,callback,errorHandler);
        xmlhttp.send(JSONfn.stringify(data));
    },
    request: function(url,data,callback,errorHandler){
        this.send(url,data,callback,errorHandler);
    },
    generateID: function() {
        return Math.random().toString(36).substring(2);
    }

});