/**
 * Created by dvircn on 06/08/14.
 */
var CNetwork = Class({
    $singleton: true,
    send: function(url,data,callback,errorHandler,options){
        options = options || {};
        var requestOptions = {
            type: 'POST',
            async: true,
            url: url,
            data: JSONfn.stringify(data), //Data sent to server
            contentType: 'application/json', // content type sent to server
//            dataType: 'json', //Expected data format from server
            processdata: true, //True or False
            crossDomain: true,
            success: function (data, textStatus, xmlHttp) {
                if (!CUtils.isEmpty(options.prepareData))
                    data = options.prepareData(data);
                if (callback) callback(data); // callback
            },
            error: function(e) {
                CLog.error('Request Error at: '+url);
                CLog.log(e);
                if (errorHandler) errorHandler();
            }  // When Service call fails
        };
        // if option says to not stringify data.
        if (options.stringifyData === false)
            requestOptions.data = data;
        delete options.stringifyData;

        // Merge.
        for (var optionKey in options){
            if (options[optionKey] === null)
                delete requestOptions[optionKey];
            else
                requestOptions[optionKey] = options[optionKey];
        }

        $.ajax(requestOptions);
    },
    request: function(url,data,callback,errorHandler,options){
        this.send(url,data,callback,errorHandler,options);
    },
    downloadText: function(filename, text) {
        var pom = document.createElement('a');
        pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
        pom.setAttribute('download', filename);
        pom.click();
    }

});