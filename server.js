const express = require('express')
const app = express()
const PORT = process.env.PORT || 80;
app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
