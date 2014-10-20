/**
 * Created by dvircn on 06/08/14.
 */
var CNetwork = Class({
    $singleton: true,
    send: function(url,data,callback,errorHandler){
        $.ajax({
            type: 'POST',
            async: true,
            url: url,
            data: JSONfn.stringify(data), //Data sent to server
            contentType: 'application/json', // content type sent to server
            dataType: 'json', //Expected data format from server
            processdata: true, //True or False
            crossDomain: true,
            success: function (data, textStatus, xmlHttp) {
                if (callback) callback(data); // callback
            },
            error: function(e) {
                CLog.error('Request Error at: '+url);
                CLog.error(e.statusText);
                if (errorHandler) errorHandler();
            }  // When Service call fails
        });
    },
    request: function(url,data,callback,errorHandler){
        this.send(url,data,callback,errorHandler);
    },
    downloadText: function(filename, text) {
        var pom = document.createElement('a');
        pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
        pom.setAttribute('download', filename);
        pom.click();
    }

});