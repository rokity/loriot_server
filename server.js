const express = require('express')
const MongoClient = require('mongodb').MongoClient;
var mongo = require('mongodb');
const getInfo = require("./utils/get_info").getInfo;
const scanSensori = require("./utils/scan_sensori").scanSensori;
const busCheck = require("./utils/bus_check").busCheck;
const updatePacket= require('./utils/update_packet').updatePacket;
const dataPacket= require("./utils/data_packet").dataPacket;

const app = express()
app.use(express.json());
const port = process.env.PORT || 3000;
const uri = "mongodb+srv://ciao:ciao@cluster0.zofui.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
const appid = "BE7A2562"
var db;


client.connect(err => {
  db = client.db("myFirstDatabase");
  app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
  })
});


app.post('/webhook', (req, res) => {
  const data = req.body['data']
  if(data!=null){
    if (data == '43') getInfo(req.body['EUI'], appid); //Accensione
    else if (data.length > 12 && parseInt(data.substring(0, 2)) > -1 && parseInt(data.substring(0, 2)) < 30) scanSensori(db, data, req.body['EUI'])     //Scansione Sensori   
    else if (data == '62') busCheck(req.body['EUI'], appid);
    else if (data.substring(0,2)=="75") updatePacket(data,eui,db)
    else if (parseInt(data.substring(0, 2)) > -1 && parseInt(data.substring(0, 2)) < 30 && parseInt(data.substring(2, 4)) < 30 &&  parseInt(data.substring(2, 4)) > -1)  dataPacket(data,eui,db)
  }
  return res.sendStatus(200)
})

app.post('/insert_structure', (req, res) => {
  const name = req.body['name']
  const address = req.body['address']
  const installDate = req.body['installDate']
  const coordinates = req.body['coordinates']
  const fddEnabled = req.body['fddEnabled']
  const type = req.body['type']
  const userConfig = req.body['userConfig']
  const spans = req.body["spans"]
  const sensors = req.body["sensors"]
  const structure = {
    name: name, address: address, installDate: installDate, coordinates: coordinates, fddEnabled: fddEnabled,
    type: type, userConfig: userConfig, spans: spans, sensors: sensors
  }
  db.collection("structures").insertOne(structure, function (err, res) {
    if (err) throw err;
    //After save message
    console.log("insert 1 row  on collection")
  });
  return res.sendStatus(200)
})


app.post('/insert_sensor', (req, res) => {
  const eui = req.body['eui']
  const structure_id = req.body["structure_id"]
  var _id = new mongo.ObjectID(structure_id);
  const query = { "_id": _id }
  var new_values = { $push: { sensors: { eui: eui ,type:"digital", detectors:[] } } };
  db.collection("structures").updateOne(query, new_values, (err, res) => {
    console.log(res)
  })
  return res.sendStatus(200)
})


app.post('/setup_digital_configuration',(req,res)=>{
    const query = {"sensors.eui":req.body['eui']}
    var new_values = { $set: { sensors: { eui: req.body['eui'] , userConfig :
       { sampling_time : req.body['sampling_time'] , vcc : req.body['vcc'] , add_delay: req.body['add_delay']} } } };
    db.collection("structures").updateOne(query, new_values, (err, res) => {
      console.log(res)
    })
    return res.sendStatus(200)
});


app.get('/reset', (req, res) => {
  if(req.query.eui!=undefined && req.query.eui!=null)
  {
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
      console.error('error:', error);
      console.log('statusCode:', response && response.statusCode);
      console.log('body:', body);
  })
  }
})


app.get('/true_reset', (req, res) => {
  if(req.query.eui!=undefined && req.query.eui!=null)
  {
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
      console.error('error:', error);
      console.log('statusCode:', response && response.statusCode);
      console.log('body:', body);
  })
  }
})


app.get('/change_settings', (req, res) => {
  if(req.query.sampling_time!=undefined && req.query.sampling_time!=null 
    && req.query.delay!=undefined && req.query.delay!=null 
    && req.query.vcc!=undefined && req.query.vcc!=null
    && req.query.eui!=undefined && req.query.eui!=null)
  {
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
          data: `D0${req.query.sampling_time}${req.query.delay}${req.query.vcc}`,
          appid: appid
      }
  }, function (error, response, body) {
      console.error('error:', error);
      console.log('statusCode:', response && response.statusCode);
      console.log('body:', body);
  })
  }
})

