const express = require('express')
var bodyParser = require('body-parser');
const app = express()
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
const port  = process.env.PORT || 80;
const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://ciao:ciao@cluster0.zofui.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
let dbo = client.db("myFirstDatabase");

app.post('/webhook', (req, res) => {
  var body=req.body
  client.connect(err => {
    dbo.collection("logs").insertOne(body, function(err, res) {
      if (err) throw err;
      console.log("1 document inserted");
      dbo.close();
    });
  });
  
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
