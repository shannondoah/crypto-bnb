const express = require('express');
const app = express();
const PORT = 8545;
const path = require('path');

app.use(express.static(__dirname));

app.set('view engine', 'pug')
app.set('views', __dirname + '/app/views');
app.locals.basedir = path.join(__dirname);

app.listen(PORT, function () {
    console.log('listening on port '+PORT)
})

app.get('/', function (req, res) {
  res.render('index', { title: 'AirM&B' })
})
