const request = require('request');
const ascii_to_hex= require("./hextoascii").ascii_to_hex;


exports.checkSensoriMancanti =  async (db, _sensor_index,eui) => {
    let payload_indici_mancanti="62"
    let sensors = await db.collection("structures").findOne({ "sensors.eui": eui });
    sensors=sensors.sensors
    let detectors = null
    for (let i = 0; i < sensors.length; i++) {
        if (sensors[i].eui == eui) {
            detectors = sensors[i].detectors;
            break;
        }
    }    
    if(detectors.length==(_sensor_index + 1)){
        let new_values = {$set: {"sensors.$.confirmed":true}}
        await db.collection("structures").updateOne({ "sensors.eui": eui }, new_values)
    }

};