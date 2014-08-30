caf.net =
{
    send: function(url,data,callback)
    {
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function()
        {
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200)
            {
                var data = xmlhttp.responseText;
                // If the response in JSON, Parse it.
                try {
                    data = JSON.parse(data);
                } catch (e) {}
                if (!caf.utils.isEmpty(callback))
                {
                    callback(data); // callback
                }
            }
        };
        xmlhttp.open("POST", url);
        xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xmlhttp.send(JSON.stringify(data));
    },
    request: function(url,data,callback)
    {
        this.send(url,data,callback);
    }
}

