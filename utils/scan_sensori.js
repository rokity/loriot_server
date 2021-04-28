const unit_measure = require('./unit_measure').unit_measure;
const hex_to_ascii = require("./hextoascii.js").hex_to_ascii;

exports.scanSensori = (db, data, eui) => {
    const _sensor_index = parseInt(data.substring(0, 2))
    const sn1 = hex_to_ascii(data.substring(2, 4))
    const sn2 = data.substring(4, 6)
    const sn3 = data.substring(6, 8)
    const sn4 = data.substring(8, 10)
    const _serial_number = `${sn1}${sn2}${sn3}${sn4}`
    const num_ch = parseInt(data.substring(10, 12))
    let _channels = []
    for (let i = 0; i < num_ch; i++) {
        _unit=unit_measure[parseInt(data.substring(12 + (2 * i), 14 + (2 * i)), 16)]
        _channels.push({"name":`CH.${i+1}`,unit:_unit})
    }
    //Check if detector index already exist
    db.collection("structures").findOne({"sensors.eui":eui,"sensors.detectors.sensor_index":_sensor_index},(err,res)=>{
        if (err) throw err;
        console.log(res)
        if(res==null){
            console.log("trovato")
            const sensors = {$push : {
                "sensors.$.detectors":{
                    sensor_index: _sensor_index,
                    serial_number: _serial_number,
                    channels:_channels
            }}}
        
            const query = {"sensors.eui":eui}
            db.collection("structures").updateOne(query,sensors, function (err, res) {
                if (err) throw err;
                //After save message
                console.log("insert 1 row  on collection")
            });
        }
    })
    
}