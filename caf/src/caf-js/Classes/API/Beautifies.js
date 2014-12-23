/**
 * Created by dvircn on 23/12/14.
 */
window.co = function(type,uname){ return new CBuilderObject(type || '',uname || ''); };
window.isEmpty = CUtils.isEmpty;
window.isNotEmpty = CUtils.isNotEmpty;
window.isString = CUtils.isString;
window.isArray = CUtils.isArray;
window.cobject = CObjectsHandler.object;
window.celement = CUtils.element;
window.crelativeObject = CObjectsHandler.relativeObject;
window.showDialog= CDialog.dialog;

