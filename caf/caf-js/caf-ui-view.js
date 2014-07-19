/**
 *  Create new button.
 * @param elm
 * @constructor
 */
caf.ui.view = function(id)
{
    var elm = document.getElementById(id);
    // Case element creation needed.
    if (caf.utils.isEmpty(id) || caf.utils.isEmpty(elm))
    {
        var ul = document.createElement('ul');
        ul.innerHTML = '<div id="'+id+'"></div>';
        elm = ul.firstChild;
    }

    var View =
    {
        id: id,
        mElement: elm,
        mElementString:'',
        mText: '',
        mClass: '',
        mActiveClass: '',
        mActiveClassRemove: '',
        mIconName:'',
        mOnClickFunctions: Array(),
        mOnClickEvent: null,
        mOnTouchStartEvent: null,
        mOnTouchEndEvent: null,
        mOnTouchMoveEvent: null,
        mDoStopPropogation: false,
        touchData: {
            startX:-100000,
            startY:-100000,
            lastX:-200000,
            lastY:-200000
        },
        clear: function()
        {
            this.mElementString='',
                this.mText= '',
                this.mClass= '',
                this.mActiveClass= '',
                this.mActiveClassRemove= '',
                this.mIconName='',
                this.mOnClickFunctions= Array(),
                this.mOnClickEvent= null,
                this.mOnTouchStartEvent= null,
                this.mOnTouchEndEvent= null,
                this.mOnTouchMoveEvent= null,
                this.mDoStopPropogation= false,
                this.touchData= {
                    startX:-100000,
                    startY:-100000,
                    lastX:-200000,
                    lastY:-200000
                }
        },
        needUpdate: function(elm)
        {
            return this.mElementString != caf.utils.getElementDef(elm);
        },
        cacheElement:function()
        {
            this.mElementString = caf.utils.getElementDef(this.mElement);
        },
        activeClass: function(className)
        {
            this.mActiveClass = className;
            return this;
        },
        activeClassRemove: function(className)
        {
            this.mActiveClassRemove = className;
            return this;
        },
        onClick: function(func)
        {
            this.mClass += ' pointer ';
            this.mOnClickFunctions.push(func);
            return this;
        },
        text: function(text)
        {
            this.mText = text;
            return this;
        },
        iconOnly: function(name){
            this.mClass += ' iconOnly ';
            this.mIconName = name;
            return this;
        },
        iconRight: function(name,size){
            size = size || 'm';
            this.mClass += ' '+size+'IconRight borderBox';
            this.mIconName = name;
            return this;
        },
        iconLeft: function(name,size){
            size = size || 'm';
            this.mClass += ' '+size+'IconLeft borderBox';
            this.mIconName = name;
            return this;
        },
        doStopPropagation: function(doStop)
        {
            this.mDoStopPropogation = doStop;
        },
        build: function()
        {
            var result = caf.ui.buildView(this);
            this.cacheElement();
            return result;
        },
        refresh: function()
        {
            this.build();
        },
        applyAttributes: function()
        {
            caf.ui.attributes.applyAttributes(this);
        }
    };

    // Add the button to the views list.
    caf.ui.addView(View);

    return View;
}

