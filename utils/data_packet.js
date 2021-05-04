const hex_to_ascii = require("./hextoascii.js").hex_to_ascii;

exports.dataPacket=(data,eui,db) =>
{
    const _sensor_index = parseInt(data.substring(0, 2))
    const _sensor_channel = parseInt(data.substring(2, 4))
    const timestamp = parseInt(data.substring(data.substring(4, 12)))
    const float1 = parseFloat(data.substring(data.substring(12, 20)))
    console.log(_sensor_index)
    console.log(_sensor_channel)
    console.log(timestamp)
    console.log(float1)
}


