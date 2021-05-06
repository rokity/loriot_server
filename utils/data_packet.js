const HexToFloat32 = require("./hextoascii.js").HexToFloat32;

exports.dataPacket=(data,eui,db) =>
{
    const _sensor_index = parseInt(data.substring(0, 2))
    const _sensor_channel = parseInt(data.substring(2, 4))
    const _timestamp = new Date(parseInt(data.substring(4, 12),16)*1000)
    let floats = data.substring(12, data.length)
    if((floats.length%8)==0)
    {
        //without temparature
        let i=0;
        let list_floats=[]
        while(floats.length!=0){
            const float_channel=floats.substring(0,8)
            floats=floats.substring(8,floats.length)
            const data_packet={sensor_index:_sensor_index,
                sensor_channel:_sensor_channel+(i),
                value:HexToFloat32(float_channel).toString(),
                timestamp_sensor:_timestamp.toString(),
                eui:eui,
                timestamp_server:new Date().toString()}
            db.collection("digitals").insertOne(data_packet);    
        }     
        
    }
    else{
        //with temparature
        const first_temperature=parseInt(floats.substring(floats.length-4,floats.length-2),16)
        const second_temperature=parseInt(floats.substring(floats.length-2,floats.length),16)
        floats=floats.substring(0,floats.length-4)
        let i=0;
        let list_floats=[]
        while(floats.length!=0){
            const float_channel=floats.substring(0,8)
            floats=floats.substring(8,floats.length)
            const data_packet={sensor_index:_sensor_index,
                sensor_channel:_sensor_channel+(i),
                value:HexToFloat32(float_channel).toString(),
                temperature:`${first_temperature}.${second_temperature}`,
                timestamp_sensor:_timestamp.toString(),
                eui:eui,
                timestamp_server:new Date().toString()}
            db.collection("digitals").insertOne(data_packet);
        }   
    }
}


