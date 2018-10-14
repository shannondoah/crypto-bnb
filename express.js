const express = require('express');
const app = express();
const PORT = 8545;

app.use(express.static(__dirname));

app.listen(PORT, function () {
    console.log('listening on port '+PORT)
})
