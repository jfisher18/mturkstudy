const express = require('express');
const app = express();
var port = process.env.PORT || 3000;
var http = require('http').createServer(app);

var path = require('path');


app.use(express.static('.'))

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname , 'viz.html'));
})

app.post('/submitdata', (req, res) => {

})

http.listen(port, () => console.log(`Listening on port ${port}!`))
