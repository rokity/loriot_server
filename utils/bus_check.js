const request = require('request')
const ascii_to_hex= require("./hextoascii").ascii_to_hex;

exports.busCheck = async (eui,appid,db) => {
    let payload_indici_mancanti="0b"
    let sensors = await db.collection("structures").findOne({ "sensors.eui": eui });
    sensors=sensors.sensors
    let detectors = null
    for (let i = 0; i < sensors.length; i++) {
        if (sensors[i].eui == eui) {
            detectors = sensors[i].detectors;
            break;
        }
    }   
    let _max=0;
    for(let i=0;i<detectors.length;i++)
    {
        if(detectors[i]["sensor_index"]>=_max)
            _max=detectors[i]["sensor_index"]
    }
    if((_max+1)!=detectors.length){
        //as in python I created the 'range' function to create an array of integers in a range
        let range = n => Array.from(Array(n).keys())
        let detectors_index = range((_max+1))
        for(let i=0;i<detectors.length;i++)
            detectors_index.pop(detectors[i]['sensor_index'])
        detectors_index.forEach(
            sensor_index => payload_indici_mancanti = payload_indici_mancanti + `${ascii_to_hex(sensor_index)}`)
        console.log("buscheck payload_indici_mancanti",payload_indici_mancanti)
    }
    else{
        let new_values = {$set: {"sensors.$.confirmed":true}}
        await db.collection("structures").updateOne({ "sensors.eui": eui }, new_values)
    }
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