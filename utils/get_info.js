const request = require('request')

exports.getInfo = (nodo_digitale_eui,appid) => {
    console.log("get_info")
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
            data: "0c0303ffff1f010c",
            appid: appid
        }
    }, function (error, response, body) {
        console.error('error:', error);
        console.log('statusCode:', response && response.statusCode);
        console.log('body:', body);
        
    })
}