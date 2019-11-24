const ExampleNetwork = require('./exampleNetwork');
app.post('/api/sell', function(req, res) {
        var data = req.body.data;
        var exampleNetwork = new ExampleNetwork('admin');
        exampleNetwork.init().then(function(data) {
          return exampleNetwork.sell(data)
        }).then(function (data) {
          res.status(200).json(data)
        }).catch(function(err) {
          res.status(500).json({error: err.toString()})
        })
})