
exports.updatePacket=(data,eui,db) =>
{
    const sampling_time= data.substring(2,4) // il sampling_time è formatto in esadecimale come nella tabella 2.1.1 del documento
    const vcc = parseInt(data.substring(4,6),16)
    const add_delay= parseInt(data.substring(6,8),16)
    const query = {"sensors.eui":eui}
    db.collection("structures").findOne(query,(err,res)=>{
        if(err) throw err;
        if(res.userConfig.vcc!=vcc || res.userConfig.sampling_time!=sampling_time || res.userConfig.add_delay!=add_delay){
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
                    data: `D0${res.userConfig.sampling_time}${res.userConfig.add_delay.toString(16)}${res.userConfig.vcc.toString(16)}`,
                    appid: appid
                }
            }, function (error, response, body) {
                console.error('error:', error);
                console.log('statusCode:', response && response.statusCode);
                console.log('body:', body);
            })
        }
    });
    if(data.length>7){
        //ci sono errori da gestire
        const data_errors=data.substring(7,data.length)/2
        for(let i=0;i<data_errors.length;i++){
            const byte_error=data_errors.substring(7+(i*2),9+(i*2))
            if(byte_error!="00"){
                const query={"sensors.eui":eui};
                const new_values ={$set:{[`sensors.$.detectors.${i}`]: {value:"incorrect",code:byte_error}} }
                db.collection("structures").updateOne(query,new_values, function (err, res) {
                    if (err) throw err;
                    //After save message
                    console.log("insert 1 row  on collection")
                });
            }
        }
    }

}


