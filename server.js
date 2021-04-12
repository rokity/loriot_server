const express = require('express')
const app = express()
app.use(express.json());
const port = process.env.PORT || 3000;
const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://ciao:ciao@cluster0.zofui.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
const nodo_digitale_eui="C0EE400001025558"
const hex_to_ascii = require("./utils/hextoascii.js");
var db;
client.connect(err => {
  db = client.db("myFirstDatabase");
  app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
  })
});

app.post('/webhook', (req, res) => {
  console.log(req.body)
  if(req.body['EUI']==nodo_digitale_eui){
    if(hex_to_ascii(req.body['data'])=='C')
      db.collection("logs").insertOne(req.body, function (err, res) {
        if (err) throw err;
        //After save message
        console.log("insert 1 row  on collection")
        
      });
  }else
  {
    return res.status(200)
  }
  
})


