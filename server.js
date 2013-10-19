var conf = require('conf')

var express = require('express');
var http = require('http');
var app = express();

app.get('/', function(req, res) {
  res.type('application/json');
  res.json({
    name: 'node-hbapi',
    description: 'Unofficial Hypebeast API',
    version: "0,0,1",
    projectUrl: "https://github.com/khayuen/node-hbapi/",
    author: "khayuen"
    process: {
      version: process.versions,
      memoryUsage: process.memoryUsage()
    }
  });
});

http.createServer(app, function(req, res) {
  
}).listen(4000);
