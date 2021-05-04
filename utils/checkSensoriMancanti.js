const unit_measure = require('./unit_measure').unit_measure;
const hex_to_ascii = require("./hextoascii.js").hex_to_ascii;
const request = require('request');
const ascii_to_hex= require("./hextoascii").ascii_to_hex;
const appid = "BE7A2562"


exports.checkSensoriMancanti =  async (db, _sensor_index,eui, crc) => {
    let payload_indici_mancanti="62"
    for(let i=(_sensor_index-1);i>-1;i--){
        await db.collection("structures").findOne({"sensors.eui":eui,"sensors.detectors.sensor_index":i},(err,res)=>{
            if (err) throw err;
            if(res==null){
                payload_indici_mancanti=payload_indici_mancanti+`${ascii_to_hex(i)}`
            }
        })
    }
    if(payload_indici_mancanti.length>2){
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