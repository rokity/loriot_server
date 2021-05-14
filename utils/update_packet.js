const request = require('request')
const appid = "BE7A2562"

exports.updatePacket = async (db, data, eui) => {
    const sampling_time = data.substring(2, 4) // il sampling_time è formatto in esadecimale come nella tabella 2.1.1 del documento
    const vcc = data.substring(4, 6)
    const add_delay = data.substring(6, 8)
    let sensors = await db.collection("structures").findOne({ "sensors.eui": eui });
    sensors = sensors.sensors
    let detectors=null;
    for (let i = 0; i < sensors.length; i++) {
        if (sensors[i].eui == eui) {
            if (sensors[i].userConfig.vcc != vcc || sensors[i].userConfig.sampling_time != sampling_time || sensors[i].userConfig.add_delay != add_delay) {
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
                        data: `D0${sensors[i].userConfig.sampling_time}${sensors[i].userConfig.add_delay}${sensors[i].userConfig.vcc}`,
                        appid: appid
                    }
                }, function (error, response, body) {
                    console.error("errore update package", error);
                    console.log('statusCode update package:', response && response.statusCode);
                    console.log('body update package:', body);
                })
            }
            detectors=sensors[i].detectors
            break;
        }
    }
if (data.length > 8) {
    //ci sono errori da gestire
    data = data.substring(8, data.length)
    const data_errors = data.length / 2
    for (let i = 0; i < data_errors; i++) {
        const byte_error = data.substring(0, 2)
        if (byte_error != "00") {
            const query = { "sensors.eui": eui };
            const new_values = { $set: { [`sensors.$.detectors.${i}.status`]: { value: "incorrect", code: byte_error } } }
            db.collection("structures").updateOne(query, new_values, (err, res) => { if (err) throw err });
        }
        if (data.length > 2) data = data.substring(2, 4)
    }
}
else {
    for(let i=0;i<detectors.length;i++)
    {
        if(detectors[i].status.value=="incorrect"){
            db.collection("structures").updateOne({ "sensors.eui": eui }, {
                $set:{[`sensors.$.detectors.${i}.status`]:{ value: "correct", code: "" }}
            }, (err, res) => { if (err) throw err });
        }
    }
}
}


