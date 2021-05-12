const request = require('request')

exports.getInfo = async (db,nodo_digitale_eui, appid) => {
    let sensor = await db.collection("structures").findOne({ "sensors.eui": nodo_digitale_eui });
    sensor = sensor['sensors']
    for (let i = 0; i < sensor.length; i++) {
        if (sensor[i].eui == nodo_digitale_eui) {
            sensor = sensor[i];
            break;
        }
    }
    if(sensor['crc']==null || sensor['crc']==undefined)
    {
        sensor['crc']="ffff"
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
            EUI: nodo_digitale_eui,
            port: 2,
            confirmed: false,
            data: `0c${sensor['get_info']['InitDel']}${sensor['get_info']['IncrDel']}${sensor['crc']}${sensor['get_info']['HighestAddr']}${sensor['userConfig']['sampling_time']}${sensor['userConfig']['vcc']}`,
            appid: appid
        }
    }, function (error, response, body) {
        console.error('error:', error);
        console.log('statusCode:', response && response.statusCode);
        console.log('body:', body);

    })
}
        
      
    
