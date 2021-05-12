const express = require('express')
const MongoClient = require('mongodb').MongoClient;
var mongo = require('mongodb');
const request = require('request')
const dotenv = require('dotenv');
dotenv.config();

const getInfo = require("./utils/get_info").getInfo;
const scanSensori = require("./utils/scan_sensori").scanSensori;
const busCheck = require("./utils/bus_check").busCheck;
const updatePacket = require('./utils/update_packet').updatePacket;
const dataPacket = require("./utils/data_packet").dataPacket;


const app = express()
app.use(express.json());
//Solitamente l'uri di un db mongo è mongodb:// , questo è un caso particolare perchè mi sto collegando ad una DNS seed list
const uri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASW}@${process.env.MONGO_HOST}/${process.env.MONGO_DB}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
const appid = process.env.APPID;
let db;


client.connect(err => {
  db = client.db(process.env.MONGO_DB);
  let server = app.listen(process.env.PORT || 5000, () => {
    console.log(`Example app listening at http://${process.env.HOST}:${process.env.PORT}`)
  })
  server.setTimeout(500000)
});


app.post('/webhook', (req, res) => {
  res.sendStatus(200)
  res.end()
  if (req.body['cmd'] == "rx") {
    const data = req.body['data']
    const eui = req.body['EUI']
    if (data != null) {
      //Accensione e richiesta scan sensori
      if (data == '43') getInfo(eui, appid);
      //Scansione Sensori
      else if (data.length > 12 && parseInt(data.substring(0, 2)) > -1 && parseInt(data.substring(0, 2)) < 30 && parseInt(data.substring(2, 4)) > 12) scanSensori(db, data, eui)
      //Bus Check, dopo CRC
      else if (data == '62') busCheck(eui, appid);
      //Pacchetto Update
      else if (data.substring(0, 2) == "75") updatePacket(db, data, eui)
      // Pacchetto Dati
      else if (parseInt(data.substring(0, 2)) > -1 && parseInt(data.substring(0, 2)) < 11 && parseInt(data.substring(2, 4)) < 30 && parseInt(data.substring(2, 4)) > -1) dataPacket(db, data, eui)
    }
  }
})

//Per inserire una struttura, dove risiede il nodo digitale
app.post('/insert_structure', (req, res) => {
  const structure = {
    name: req.body['name'], address: req.body['address'], installDate: req.body['installDate'],
    coordinates: req.body['coordinates'], fddEnabled: req.body['fddEnabled'],
    type: req.body['type'], userConfig: req.body['userConfig'], spans: req.body["spans"],
    sensors: req.body["sensors"]
  }
  db.collection("structures").insertOne(structure, (err, _res) => {
     if (err) throw err 
     else{
      res.sendStatus(200)
      res.end();
     }});
})

//Per creare un sensore/nodo digitale, dato un codice EUI e le userConfig (sampling_time,vcc,add_delay)
app.post('/insert_sensor', (req, res) => {
  const query = { "_id": new mongo.ObjectID(req.body["structure_id"]) }
  const new_values = {
    $push: {
      sensors: {
        eui: req.body['eui'], type: "digital", detectors: [],
        userConfig: { sampling_time: req.body['sampling_time'], vcc: req.body['vcc'], add_delay: req.body['add_delay'] }
      },
    }
  };
  db.collection("structures").updateOne(query, new_values, (err, _res) => {
     if (err) throw err 
     else{
      res.sendStatus(200)
      res.end()
     }
    })
  
})

//Reset Nodo Digitale 
app.get('/reset', (req, res) => {
  if (req.query.eui != undefined && req.query.eui != null) {
    request.post({
      url: 'https://eu1.loriot.io/1/rest',
      headers: {
        'Authorization': 'Bearer vnolYgAAAA1ldTEubG9yaW90LmlvDiJiwQnkwkVoNcNP-ZepCA==',
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/json'
      }
      , json: {
        cmd: 'tx',
        EUI: req.query.eui,
        port: 2,
        confirmed: false,
        data: "80",
        appid: appid
      }
    }, function (error, response, body) {
      if (error) throw error;
      else {
        res.sendStatus(200)
        res.end()
      }
    })
  }
})

//True Reset Nodo Digitale
app.get('/true_reset', (req, res) => {
  if (req.query.eui != undefined && req.query.eui != null) {
    request.post({
      url: 'https://eu1.loriot.io/1/rest',
      headers: {
        'Authorization': 'Bearer vnolYgAAAA1ldTEubG9yaW90LmlvDiJiwQnkwkVoNcNP-ZepCA==',
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/json'
      }
      , json: {
        cmd: 'tx',
        EUI: req.query.eui,
        port: 2,
        confirmed: false,
        data: "81",
        appid: appid
      }
    }, function (error, response, body) {
      if (error) throw error;
      else {
        res.sendStatus(200)
        res.end()
      }
    })
  }
})

//Per cambiare le impostazioni di un nodo digitale (sampling_time,vcc,add_delay) , runtime
app.post('/change_settings', (req, res) => {
  if (req.body.sampling_time != undefined && req.body.sampling_time != null
    && req.body.add_delay != undefined && req.body.add_delay != null
    && req.body.vcc != undefined && req.body.vcc != null
    && req.body.eui != undefined && req.body.eui != null) {
    request.post({
      url: 'https://eu1.loriot.io/1/rest',
      headers: {
        'Authorization': 'Bearer vnolYgAAAA1ldTEubG9yaW90LmlvDiJiwQnkwkVoNcNP-ZepCA==',
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/json'
      }
      , json: {
        cmd: 'tx',
        EUI: req.body.eui,
        port: 2,
        confirmed: false,
        data: `D0${req.body.sampling_time}${req.body.add_delay}${req.body.vcc}`,
        appid: appid
      }
    }, function (error, response, body) {
      if (error) {
        res.send(error)
        res.sendStatus(500)
        res.end()
        throw error;
      }
      else {
        const new_values = {
          $set: {
            "sensors.$.userConfig":
              { sampling_time: req.body['sampling_time'], vcc: req.body['vcc'], add_delay: req.body['add_delay'] }
          }
        }
        db.collection("structures").updateOne({ "sensors.eui": req.body.eui }, new_values, (err, _res) => {
          if (err) {
            res.send(err)
            res.sendStatus(500)
            res.end()
            throw err;
          }
          else {
            res.sendStatus(200)
            res.end();
          }
        })
      }
    })
  }
})

