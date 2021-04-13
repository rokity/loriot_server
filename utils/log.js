exports.mongo_log=(db,data) =>{
    db.collection("logs").insertOne(data, function (err, res) {
        if (err) throw err;
        //After save message
        console.log("insert 1 row  on collection")
      });
}