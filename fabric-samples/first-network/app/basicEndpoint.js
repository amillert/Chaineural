const express = require('express')
const app = express()
var bodyParser = require('body-parser')//Attach the middleware
app.use( bodyParser.json() );
app.post('/api/sell', function (req, res) {
  // ...
})