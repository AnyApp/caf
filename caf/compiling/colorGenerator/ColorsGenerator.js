/**
 * Created by dvircn on 19/08/14.
 */
var CColorsGenerator =
{
    getColorObject: function(name,value){
        return {name: name,value:value};
    },
    colors: [
//        ['LightRed','FF535D'],
//        ['Red','FF1E30'],
//        ['DarkRed','FF4136'],
//        ['LightPink','FF38AE'],
//        ['Pink','e91e63'],
//        ['DarkPink','f50057'],
//        ['Purple','9c27b0'],
//        ['DeepPurple','673ab7'],
//        ['Indigo','3949ab'],
//        ['Blue','2a36b1'],
//        ['LightBlue','03a9f4'],
//        ['Cyan','00bcd4'],
//        ['Teal','009688'],
//        ['DarkGreen','01FF70'],
//        ['Green','259b24'],
//        ['LightGreen','8bc34a'],
//        ['Lime','cddc39'],
//        ['Yellow','ffeb3b'],
//        ['Amber','ffc107'],
//        ['Orange','ff9800'],
//        ['DeepOrange','ff5722'],
//        ['Brown','795548'],
//        ['Gray','9e9e9e'],
//        ['BlueGray','607d8b']
        ['Gray','9e9e9e'],
        ['BlueGray','607d8b'],
        ['BrownA','F6AA88'],
        ['BrownB','F6B188'],
        ['BrownC','F6B788'],
        ['BrownD','7B4F2E'],
        ['BrownE','AC4B3C'],
        ['BrownF','AC533C'],
        ['BrownG','AC5C3C'],
        ['BrownH','AC643C'],
        ['BrownI','AC6D3C'],
        ['BrownJ','AC753C'],
        ['BrownK','AC7F3C'],
        ['BrownL','AC873C'],
        ['YellowA','AC8F3C'],
        ['YellowB','AC8F3C'],
        ['YellowC','ACA03C'],
        ['YellowD','ACA93C'],
        ['YellowE','DABD00'],
        ['GreenA','98A73A'],
        ['GreenB','88A339'],
        ['GreenC','7AA038'],
        ['GreenD','619936'],
        ['GreenE','3F8F32'],
        ['GreenF','2E8340'],
        ['GreenG','2B7C4E'],
        ['GreenH','2A7854'],
        ['GreenI','009E3B'],
        ['GreenJ','009458'],
        ['TealA','0A796A'],
        ['TealB','28745B'],
        ['TealC','266E62'],
        ['TealD','246868'],
        ['TealE','275E6B'],
        ['BlueA','0C6677'],
        ['BlueB','10557B'],
        ['BlueC','14447E'],
        ['BlueD','193083'],
        ['BlueE','29576D'],
        ['BlueF','2C4F70'],
        ['BlueG','2E4872'],
        ['BlueH','304473'],
        ['BlueI','323E75'],
        ['PurpleA','333B76'],
        ['PurpleB','373578'],
        ['PurpleC','3A3477'],
        ['PurpleD','403276'],
        ['PurpleE','453175'],
        ['PurpleF','4C2F74'],
        ['PurpleG','522D73'],
        ['PurpleH','5A2B72'],
        ['PurpleI','612971'],
        ['PurpleM','740A64'],
        ['PurpleN','630B6C'],
        ['PurpleO','560D6D'],
        ['PurpleP','47106F'],
        ['PinkA','6F266F'],
        ['PinkB','5B2647'],
        ['PinkC','7E2B69'],
        ['PinkD','7E2B69'],
        ['PinkE','892F62'],
        ['PinkD','8D315E'],
        ['PinkG','923359'],
        ['PinkH','993552'],
        ['PinkI','9D364D'],
        ['PinkJ','CA014F'],
        ['PinkK','7E0B59'],
        ['PinkL','BA006D'],
        ['PinkM','A3028A'],
        ['RedA','9B131A'],
        ['RedB','B01722'],
        ['RedC','A70319'],
        ['RedD','AC030C'],
        ['RedE','AF0C03'],
        ['OrangeA','DA2D00'],
        ['OrangeB','DA4700']
    ],
    levels:[100,95,90,85,80,75,70,65,60,55,50,45,40,35,30,25,20,15,10,5,2],
    generate:function(){
        var t = "";
        var html = ""
        for (var c in this.colors){
            var name = this.colors[c][0];
            var value = this.colors[c][1];
            for (var level in this.levels){
                var res = this.setBrightness(value,this.levels[level]);
                t += ".bg"+name+level+"\t{ "+"background-color: "+res+"; \t}\n"
                t += ".bc"+name+level+"\t{ "+"border-color: "+res+"; \t\t}\n"
                t += ".c"+name+level+" \t{ "+"color: "+res+"; \t\t\t\t}\n"
                html+='<div style="width:4.2857142857142857142857142857143%;margin-right:0.47619047619047619047619047619048%;margin-top:2px;height:100px;display:inline-block;background-color: '+res+'"><span style="direction:ltr;color: #000000;font-size:12px;">'+name+level+'</span></span></div>'
            }
        }
        this.log(t);
        document.body.innerHTML = html;
        if (window.location.hash == '#download')
            CNetwork.downloadText('colors.css',t);
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