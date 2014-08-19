/**
 * Created by dvircn on 19/08/14.
 */
var CColorsGenerator =
{
    getColorObject: function(name,value){
        return {name: name,value:value};
    },
    colors: [
        ['Navy','001F3F'],
        ['Blue','0074D9'],
        ['Aqua','7FDBFF'],
        ['Teal','39CCCC'],
        ['Olive','3D9970'],
        ['Green','2ECC40'],
        ['Lime','01FF70'],
        ['Yellow','FFDC00'],
        ['Orange','FF851B'],
        ['Red','FF4136'],
        ['Maroon','85144B'],
        ['Fuchsia','F012BE'],
        ['Purple','B10DC9'],
        ['Gray','AAAAAA']
    ],
    levels:[100,90,80,70,60,50,40,30,20,15,10],
    generate:function(){
        var t = "";
        var html = ""
        for (var c in this.colors){
            var name = this.colors[c][0];
            var value = this.colors[c][1];
            for (var level in this.levels){
                var res = this.setBrightness(value,this.levels[level]);
                var className = ".bg"+name+level;
                t += className+"{\n\t"+"background-color: "+res+";\n}\n"
                html+='<div style="width:9%;height:100px;display:inline-block;background-color: '+res+'"><span style="direction:ltr;color: #000000;background-color: #cccccc">'+name+level+'</span></span></div>'
            }
        }
        this.log(t);
        document.body.innerHTML = html;
    },
    HSVtoRGB: function(h, s, v) {
        var r, g, b;
        var i;
        var f, p, q, t;

        // Make sure our arguments stay in-range
        h = Math.max(0, Math.min(360, h));
        s = Math.max(0, Math.min(100, s));
        v = Math.max(0, Math.min(100, v));

        // We accept saturation and value arguments from 0 to 100 because that's
        // how Photoshop represents those values. Internally, however, the
        // saturation and value are calculated from a range of 0 to 1. We make
        // That conversion here.
        s /= 100;
        v /= 100;

        if(s == 0) {
            // Achromatic (grey)
            r = g = b = v;
            return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
        }

        h /= 60; // sector 0 to 5
        i = Math.floor(h);
        f = h - i; // factorial part of h
        p = v * (1 - s);
        q = v * (1 - s * f);
        t = v * (1 - s * (1 - f));

        switch(i) {
            case 0:
                r = v;
                g = t;
                b = p;
                break;

            case 1:
                r = q;
                g = v;
                b = p;
                break;

            case 2:
                r = p;
                g = v;
                b = t;
                break;

            case 3:
                r = p;
                g = q;
                b = v;
                break;

            case 4:
                r = t;
                g = p;
                b = v;
                break;

            default: // case 5:
                r = v;
                g = p;
                b = q;
        }

        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    },
    rgb2hsv: function(red, grn, blu) {
        var x, val, f, i, hue, sat, val;
        red/=255;
        grn/=255;
        blu/=255;
        x = Math.min(Math.min(red, grn), blu);
        val = Math.max(Math.max(red, grn), blu);
        if (x==val){
            return({h:undefined, s:0, v:val*100});
        }
        f = (red == x) ? grn-blu : ((grn == x) ? blu-red : red-grn);
        i = (red == x) ? 3 : ((grn == x) ? 5 : 1);
        hue = Math.floor((i-f/(val-x))*60)%360;
        sat = Math.floor(((val-x)/val)*100);
        val = Math.floor(val*100);
        return({h:hue, s:sat, v:val});
    },
    setBrightness: function(rgbcode, brightness) {
        var r = CColorsGenerator.hexToRgb(rgbcode).r,
            g = CColorsGenerator.hexToRgb(rgbcode).g,
            b = CColorsGenerator.hexToRgb(rgbcode).b,
            HSB = CColorsGenerator.rgb2hsv(r, g, b),
            RGB;

        RGB = CColorsGenerator.HSVtoRGB(HSB.h, HSB.s, brightness);

        rgbcode = '#'
            + CColorsGenerator.convertToTwoDigitHexCodeFromDecimal(RGB[0])
            + CColorsGenerator.convertToTwoDigitHexCodeFromDecimal(RGB[1])
            + CColorsGenerator.convertToTwoDigitHexCodeFromDecimal(RGB[2]);

        return rgbcode;
    },
    convertToTwoDigitHexCodeFromDecimal: function(decimal){
        var code = Math.round(decimal).toString(16);

        (code.length > 1) || (code = '0' + code);
        return code;
    },
    hexToRgb:function(hex) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    },
    log: function(s){
        window.console.log(s);
    }
}

CColorsGenerator.generate();