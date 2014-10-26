/**
 * Created by dvircn on 15/08/14.
 */
var CVideo = Class(CObject,{
    $statics: {
        DEFAULT_DESIGN: {
            classes: "",
            border: {all:0}
        },
        DEFAULT_LOGIC: {
        }

    },

    constructor: function(values) {
        if (CUtils.isEmpty(values)) return;
        // Merge Defaults.
        CObject.setObjectDefaults(values,CVideo);

        // Invoke parent's constructor
        CVideo.$super.call(this, values);

        this.data.src = values.data.src || '';
    },
    youtubeParse: function(url){
        var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
        var match = url.match(regExp);
        if (match&&match[7].length==11){
            return match[7];
        }else{
            return null;
        }
    },
    vimeoParse: function(url){
        var regExp = /^.*(vimeo\.com\/)((channels\/[A-z]+\/)|(groups\/[A-z]+\/videos\/))?([0-9]+)/;
        var parseUrl = url.match(regExp);
        if (CUtils.isEmpty(parseUrl) || parseUrl.length<6)
            return null;
        else
            return parseUrl[5];
    },
    /**
     *  Build Object.
     */
    prepareBuild: function(data){
        var youtubeId = this.youtubeParse(this.data.src);
        var vimeoId = this.vimeoParse(this.data.src);
        var url = '';
        if (!CUtils.isEmpty(youtubeId))
            url = 'http://www.youtube.com/embed/'+youtubeId;
        else if (!CUtils.isEmpty(vimeoId))
            url = '//player.vimeo.com/video/'+vimeoId;
        else
            url = 'incorrect';
        // Prepare this element - wrap it's children.
        return CVideo.$superp.prepareBuild.call(this,{
            tag: 'iframe',
            attributes: ['src="'+url+'"','frameborder="0"','webkitallowfullscreen',
                'mozallowfullscreen','allowfullscreen']
        });
    }


});

