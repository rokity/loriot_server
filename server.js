const express = require('express')
const MongoClient = require('mongodb').MongoClient;
var mongo = require('mongodb');
const hex_to_ascii = require("./utils/hextoascii.js").hex_to_ascii;
const getInfo = require("./utils/get_info").getInfo;
const scanSensori = require("./utils/scan_sensori").scanSensori;

const app = express()
app.use(express.json());
const port = process.env.PORT || 3000;
const uri = "mongodb+srv://ciao:ciao@cluster0.zofui.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
const appid = "BE7A2562"
var db;

let flag_get_info = false;


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
  var new_values = { $push: { sensors: { eui: eui, detectors:[] } } };
  db.collection("structures").updateOne(query, new_values, (err, res) => {
    console.log(res)
  })
  return res.sendStatus(200)
})


