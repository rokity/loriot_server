exports.hex_to_ascii=(hexx) =>
{
    var hex = hexx.toString();//force conversion
    var str = '';
    for (var i = 0; i < hex.length; i += 2)
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    return str;
}


exports.ascii_to_hex=(s)=>{
    var a = s.toString(16);
    if ((a.length % 2) > 0) {
        a = "0" + a;
    }
    return a;
}


exports.HexToFloat32 = (str) => {
    var int = parseInt(str, 16);
    if (int > 0 || int < 0) {
        var sign = (int >>> 31) ? -1 : 1;
        var exp = (int >>> 23 & 0xff) - 127;
        var mantissa = ((int & 0x7fffff) + 0x800000).toString(2);
        var float32 = 0
        for (i = 0; i < mantissa.length; i += 1) { float32 += parseInt(mantissa[i]) ? Math.pow(2, exp) : 0; exp-- }
        return (float32 * sign);
    } else return 0
}

exports.hexToSignedInt=(hex) => {
    if (hex.length % 2 != 0) {
        hex = "0" + hex;
    }
    var num = parseInt(hex, 16);
    var maxVal = Math.pow(2, hex.length / 2 * 8);
    if (num > maxVal / 2 - 1) {
        num = num - maxVal
    }
    return num;
}