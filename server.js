const express = require('express')
const MongoClient = require('mongodb').MongoClient;
const hex_to_ascii = require("./utils/hextoascii.js").hex_to_ascii;
const request= require('request')
const app = express()
app.use(express.json());
const port = process.env.PORT || 3000;
const uri = "mongodb+srv://ciao:ciao@cluster0.zofui.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
const nodo_digitale_eui = "C0EE400001025558"
var db;

const headerLoriotAPI = {
  url: 'https://eu1.loriot.io/1/rest',
  headers: {
    'Authorization': 'Bearer vnolYgAAAA1ldTEubG9yaW90LmlvDiJiwQnkwkVoNcNP-ZepCA==',
    'Cache-Control':'no-cache',
    'Content-Type': 'application/json'
  }
};

client.connect(err => {
  db = client.db("myFirstDatabase");
  app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
  })
});

app.post('/webhook', (req, res) => {
  if (req.body['EUI'] == nodo_digitale_eui) {
    if (hex_to_ascii(req.body['data']) == 'C') {
      //Accensione
      request.post(headerLoriotAPI, {json:{cmd:'tx',EUI:"C0EE400001025558",port:2,confirmed:false,data:"0c0303ffff06010c",
      appid:"BE7A2562"}},function(error, response, body){
        console.error('error:', error);
        console.log('statusCode:', response && response.statusCode);
        console.log('body:', body);
      })

    }
    // db.collection("logs").insertOne(req.body, function (err, res) {
    //   if (err) throw err;
    //   //After save message
    //   console.log("insert 1 row  on collection")

    // });
  }

})


