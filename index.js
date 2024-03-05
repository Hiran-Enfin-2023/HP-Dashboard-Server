var express    = require('express');
var app        = express();
var https      = require('https');
var http       = require('http');
var fs         = require('fs');
var bodyParser = require('body-parser')
var cors = require('cors');
require("dotenv").config();
var  config  = JSON.parse(fs.readFileSync('./config.json'));
var options = {
    key : fs.readFileSync(config.key),
    cert: fs.readFileSync(config.cert),
    ca: [fs.readFileSync(config.ca)]
};
//var server = https.createServer(options,app).listen(config.port);
app.use(express.static('public'));
app.use(cors())
const port = process.env.PORT || 3000;
http.createServer(app).listen(port);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
var request = require('request');
var url = require('url');

app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, DELETE, PATCH');
    res.header('Access-Control-Allow-Headers', 'origin, content-type, Auth-Token');
    if (req.method == 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});
console.log('SERVER LISTENING AT '+ port);
require('./apis/rest.js').init(app,config);

    