caf.localStorage =
{
    save: function(key,value)
    {
        window.localStorage.setItem(key,value);
    },
    get: function(key)
    {
        var value = window.localStorage.getItem(key);
        if (caf.utils.isEmpty(value)) return null;
        return value;
    },
    empty: function(key)
    {
        return caf.utils.isEmpty(window.localStorage.getItem(key));
    }
}
