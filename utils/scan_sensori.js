const unit_measure=require('./unit_measure').unit_measure;
const hex_to_ascii = require("./hextoascii.js").hex_to_ascii;

exports.scanSensori = (db, data,eui) => {
    const _sensor_index = parseInt(data.substring(0, 2))
    const sn1 = hex_to_ascii(data.substring(2, 4))
    const sn2 = data.substring(4, 6)
    const sn3 = data.substring(6, 8)
    const sn4 = data.substring(8, 10)
    const _serial_number=`${sn1}${sn2}${sn3}${sn4}`
    // console.log("sensor_index", sensor_index)
    // console.log("sn1", sn1)
    // console.log("sn2", sn2)
    // console.log("sn3", sn3)
    // console.log("sn4", sn4)
    const num_ch = parseInt(data.substring(10, 12))
    // console.log("num_ch", num_ch)
    let _units = []
    for (let i = 0; i < num_ch; i++) {
        _units.push(unit_measure[parseInt(data.substring(12 + (2 * i), 14 + (2 * i)), 16)])
    }
    const sensor={eui:eui,created_on : new Date(),sensor_index:_sensor_index,
        serial_number:_serial_number,num_channels:num_ch,units:_units}
    db.collection("digitals").insertOne(sensor, function (err, res) {
        if (err) throw err;
        //After save message
        console.log("insert 1 row  on collection")
      });
}