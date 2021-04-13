const express = require('express')
const MongoClient = require('mongodb').MongoClient;
const hex_to_ascii = require("./utils/hextoascii.js").hex_to_ascii;
const getInfo = require("./utils/getinfo").getInfo;
const app = express()
app.use(express.json());
const port = process.env.PORT || 3000;
const uri = "mongodb+srv://ciao:ciao@cluster0.zofui.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
const nodo_digitale_eui = "C0EE400001025558"
const appid="BE7A2562"
var db;


client.connect(err => {
  db = client.db("myFirstDatabase");
  app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
  })
});

app.post('/webhook', (req, res) => {
  if(req.body['data'].substring(0,2)!="75")
  {
    if (req.body['EUI'] == nodo_digitale_eui) {
      if (hex_to_ascii(req.body['data']) == 'C') {
        //Accensione
        getInfo();
      }
      
      
    }
  } 

})


