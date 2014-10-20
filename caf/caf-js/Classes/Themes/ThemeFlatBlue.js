/**
 * Created by dvircn on 19/10/14.
 */
var CThemeFlatBlue = Class({
    $singleton: true,
    designs: {
        'left-menu-button': {
            paddingLeft:6,boxSizing:'borderBox',textAlign:'left',height:45, widthXS: 12,
            fontSize:16,color: CColor('Gray',2), marginTop:1, round: 0,
            active: { bgColor:CColor('Indigo',17),color: CColor('White') }
        }
    }
});

