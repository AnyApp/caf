/**
 * CAF - Codletech Application Framework.
 * Dependencies:
 * - overthrow.js
 */
var caf = {}
caf.path = '';

caf.init = function(path)
{
    caf.path = path;
    caf.ui.attributes.initAttributes();
    caf.ui.forms.init();
}

caf.log = function(msg)
{
    window.console.log(msg);
}












/**
 * Libraries
 */








