const express = require('express')
const app = express()
const port  = process.env.PORT || 80;
const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://ciao:ciao@cluster0.zofui.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


app.get('/', (req, res) => {
  client.connect(err => {
    let dbo = client.db("myFirstDatabase");
    dbo.createCollection("customers", function(err, res) {
      if (err) throw err;
      console.log("Collection created!");
      res.send("collection created")
      db.close();
    });
    // perform actions on the collection object
    client.close();
  });
  
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
