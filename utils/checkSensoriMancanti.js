const request = require('request');
const ascii_to_hex= require("./hextoascii").ascii_to_hex;


exports.checkSensoriMancanti =  async (db, _sensor_index,eui,appid) => {
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
    else
    {
        //as in python I created the 'range' function to create an array of integers in a range
        let range = n => Array.from(Array(n).keys())
        let detectors_index = range((_sensor_index+1))
        for(let i=0;i<detectors.length;i++)
            detectors_index.pop(detectors[i]['sensor_index'])
        detectors_index.forEach(
            sensor_index => payload_indici_mancanti = payload_indici_mancanti + `${ascii_to_hex(sensor_index)}`)
        console.log("nella scan c'è un sensore mancante",payload_indici_mancanti)
        request.post({
            url: 'https://eu1.loriot.io/1/rest',
            headers: {
                'Authorization': 'Bearer vnolYgAAAA1ldTEubG9yaW90LmlvDiJiwQnkwkVoNcNP-ZepCA==',
                'Cache-Control': 'no-cache',
                'Content-Type': 'application/json'
            }
            , json: {
                cmd: 'tx',
                EUI: eui,
                port: 2,
                confirmed: false,
                data: payload_indici_mancanti,
                appid: appid
            }
        }, function (error, response, body) {
            console.error('error:', error);
            console.log('statusCode:', response && response.statusCode);
            console.log('body:', body);
        })
    }
};