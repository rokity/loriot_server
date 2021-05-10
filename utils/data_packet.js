const HexToFloat32 = require("./hextoascii.js").HexToFloat32;
const hexToSignedInt= require('./hextoascii').hexToSignedInt

exports.dataPacket=(data,eui,db) =>
{
    let _sensor_index = parseInt(data.substring(0, 2))
    let _sensor_channel = parseInt(data.substring(2, 4))
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
            list_floats.push(HexToFloat32(float_channel).toString())    
        }     
        const data_packet={
            sensor_index:_sensor_index,            
            channelsData:list_floats,
            timestamp:_timestamp.toString(),
            eui:eui,
            date:new Date().toString()
        }
        const query={sensor_index:_sensor_index,eui:eui,timestamp:_timestamp.toString()}
        db.collection("digitals").findOne(query,(err,res)=>{
            if(err)throw err;
            if(res==null){
                db.collection("structures").findOne({"sensors.eui":eui},(err,res)=>{
                    if(err)throw err;
                    const sensors=res.sensors;
                    for(let i=0;i<sensors;i++){
                        if(sensors[i].eui==eui){
                            const detectors=sensors[i].detectors;
                            data_packet['detectorMsn']=detectors[_sensor_index].serial_number
                            const channels=detectors[_sensor_index].channels.length;
                            let channelsData=[]
                            for(let k=0;k<channels;k++){
                                if(list_floats[k]!=undefined && list_floats[k]!=null)
                                    channelsData[k]=list_floats[k]
                                else
                                    channelsData[k]=null
                            }
                            data_packet['channelsData']=channelsData
                            db.collection("digitals").insertOne(data_packet);
                        }
                    }
                });
            }
            else{
                data_packet.channelsData=res.channelsData.concat(data_packet.channelsData)
                db.collection("digitals").updateOne(query,{$set:{channelsData:data_packet.channelsData,date:new Date().toString()}});

            }
        })       
    }
    else{
        //with temparature
        db.collection("structures").findOne({"sensors.eui":eui},(err,res)=>{
            if(err)throw err;
            const sensors=res.sensors;
            let channels=0;
            let data_packet={
                sensor_index:_sensor_index,
                channelsData:[],
                timestamp:_timestamp.toString(),
                eui:eui,
                date:new Date().toString()}
            for(let i=0;i<sensors;i++){
                if(sensors[i].eui==eui){
                    const detectors=sensors[i].detectors;
                    data_packet['detectorMsn']=detectors[_sensor_index].serial_number
                    channels=detectors[_sensor_index].channels.length;
                    channels=channels-_sensor_channel
                }
            }
            for(let i=0;i<channels;i++){
                const float_channel=floats.substring(0,8)
                floats=floats.substring(8,floats.length)
                list_floats.push(HexToFloat32(float_channel).toString())  
            }
            const first_temperature=hexToSignedInt(floats.substring(0,2))
            const second_temperature=parseInt(floats.substring(2,4),16)
            const query={sensor_index:_sensor_index,eui:eui,timestamp:_timestamp.toString()}
            db.collection("digitals").findOne(query,(err,res)=>{
                if(err)throw err;
                if(res==null){
                    data_packet.channelsData=list_floats
                    db.collection("digitals").insertOne(data_packet)
                }
                else{
                    data_packet.channelsData=res.channelsData.concat(data_packet.channelsData)
                    db.collection("digitals").updateOne(query,{$set:{channelsData:data_packet.channelsData,date:new Date().toString()}});
                }
                let temperature_row={
                    eui:eui,
                    date:new Date().toString(),
                    temperature:`${first_temperature}.${second_temperature}`,
                    timestamp:_timestamp.toString(),
                }
                db.collection("temperatures").insertOne(temperature_row);
            }) 
            if(floats.length>0){
                _sensor_index=_sensor_index+1;
                for(let i=0;i<sensors;i++){
                    if(sensors[i].eui==eui){
                        const detectors=sensors[i].detectors;
                        data_packet['detectorMsn']=detectors[_sensor_index].serial_number
                        channels=detectors[_sensor_index].channels.length;                        
                    }
                }
                
            }
            
            
        });
        
        
        }
    }



