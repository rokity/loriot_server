const HexToFloat32 = require("./hextoascii.js").HexToFloat32;
const hexToSignedInt = require('./hextoascii').hexToSignedInt

exports.dataPacket = async (data, eui, db) => {
    while (data.length != 0) {
        let _sensor_index = parseInt(data.substring(0, 2))
        const _timestamp = new Date(parseInt(data.substring(4, 12), 16) * 1000)
        let sensors = await db.collection("structures").findOne({ "sensors.eui": eui });
        sensors=sensors['sensors']
        let detectors = null
        let data_packet = {
            sensor_index: _sensor_index,
            channelsData: [],
            timestamp: _timestamp.toString(),
            eui: eui,
            date: new Date().toString()
        }
        for (let i = 0; i < sensors.length; i++) {
            if (sensors[i].eui == eui)
            {
                detectors = sensors[i].detectors;
                break;
            }                
        }
        data_packet['detectorMsn'] = detectors[_sensor_index].serial_number
        let channels = detectors[_sensor_index].channels.length;
        const query = { sensor_index: _sensor_index, eui: eui, timestamp: _timestamp.toString() }
        data = data.substring(12, data.length)
        const digitals = await db.collection("digitals").findOne(query)
        if (digitals == null) {
            //there aren't detector data similar in the db with the same timestamp
            for (let i = 0; (i < channels) && (data.length != 0); i++) {
                if (data.length != 4) {
                    data_packet['channelsData'].push(HexToFloat32(data.substring(0, 8)).toString())
                    data = data.substring(8, data.length);
                }
            }
            if (data.length == 4 || data.length != 0) {
                const first_temperature = hexToSignedInt(data.substring(0, 2))
                const second_temperature = parseInt(data.substring(2, 4), 16) >=10 ? parseInt(data.substring(2, 4), 16) : `0${parseInt(data.substring(2, 4), 16)}`
                data = data.substring(4, data.length)
                const temperature_row = {
                    eui: eui,
                    date: new Date().toString(),
                    temperature: `${first_temperature}.${second_temperature}`,
                    timestamp: _timestamp.toString(),
                }
                db.collection("temperatures").insertOne(temperature_row);
            }
            db.collection("digitals").insertOne(data_packet);
        }
        else {
            channels = channels - digitals.channelsData.length
            data_packet.channelsData = digitals.channelsData
            for (let i = 0; i < channels || data.length != 0; i++) {
                if (data.length != 4) {
                    data_packet['channelsData'].push(HexToFloat32(data.substring(0, 8)).toString())
                    data = data.substring(8, data.length);
                }
            }
            if (data.length == 4 || data.length != 0) {
                const first_temperature = hexToSignedInt(data.substring(0, 2))
                const second_temperature = parseInt(data.substring(2, 4), 16) >=10 ? parseInt(data.substring(2, 4), 16) : `0${parseInt(data.substring(2, 4), 16)}`
                data = data.substring(4, data.length)
                const temperature_row = {
                    eui: eui,
                    date: new Date().toString(),
                    temperature: `${first_temperature}.${second_temperature}`,
                    timestamp: _timestamp.toString(),
                }
                db.collection("temperatures").insertOne(temperature_row);
            }
            db.collection("digitals").updateOne(query, { $set: { channelsData: data_packet.channelsData, date: new Date().toString() } });
        }

    }


}



