const unit_measure = require('./unit_measure').unit_measure;
const hex_to_ascii = require("./hextoascii.js").hex_to_ascii;
const checkSensoriMancanti = require("./checkSensoriMancanti.js").checkSensoriMancanti;

exports.scanSensori = async (db, data, eui) => {
    let sensors = await db.collection("structures").findOne({ "sensors.eui": eui });
    sensors = sensors.sensors
    let id_configuration = null
    let detectors = null
    let confirmed=false;
    for (let i = 0; i < sensors.length; i++) {
        if (sensors[i].eui == eui) {
            detectors = sensors[i].detectors;
            confirmed=sensors[i].confirmed;
            if (sensors[i]['id_configuration'] != null && sensors[i]['id_configuration'] != undefined)
                id_configuration = sensors[i].id_configuration
            break;
        }
    }
    while (data.length != 0) {
        let _sensor_index = parseInt(data.substring(0, 2))
        console.log("_sensor_index", _sensor_index)
        let sn1 = hex_to_ascii(data.substring(2, 4))
        let sn2 = data.substring(4, 6)
        let sn3 = data.substring(6, 8)
        let sn4 = data.substring(8, 10)
        let _serial_number = `${sn1}${sn2}${sn3}${sn4}`
        let num_ch = parseInt(data.substring(10, 12))
        let _channels = []
        for (let i = 0; i < num_ch; i++) {
            _unit = unit_measure[parseInt(data.substring(12 + (2 * i), 14 + (2 * i)), 16)]
            _channels.push({ "name": `CH.${i + 1}`, unit: _unit })
        }
        data = data.substring(12 + (2 * num_ch), data.length)
        //Check if detector index already exist, if not exist it'll create
        
        let crc=null
        if(data.length==4)
            crc = data.substring(0, 4)
        if (confirmed == false) {
            let new_value = {
                $push: {
                    "sensors.$.detectors": {
                        sensor_index: _sensor_index,
                        serial_number: _serial_number,
                        status: { value: "correct", code: "" },
                        channels: _channels
                    }
                },
            }
            if (crc != null) 
                new_value["$set"] = { "sensors.$.crc": crc }
            
            await db.collection("structures").updateOne({ "sensors.eui": eui }, new_value);
        }
        else {
            console.log("update sensori , crc diverso")
            let old_configuration = {
                "id_configuration": id_configuration,
                "old_configuration": detectors
            }
            id_configuration++
            let new_values = {
                $set: {
                    'sensors.$.detectors': [{
                        sensor_index: _sensor_index,
                        serial_number: _serial_number,
                        status: { value: "correct", code: "" },
                        channels: _channels
                    }],
                    "sensors.$.id_configuration": id_configuration,
                    "sensors.$.crc": crc,
                    "sensors.$.confirmed":false
                },
                $push: {
                    "sensors.$.old_configurations": old_configuration
                }
            }
            await db.collection("structures").updateOne({ "sensors.eui": eui }, new_values)

        }
        if (data.length == 4) {
            data = ""
            checkSensoriMancanti(db,_sensor_index, eui, crc)
        }
    }

}