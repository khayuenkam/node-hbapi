var nconf = require('nconf')

nconf
  .argv()
  .env()
  .file('config.json')
  .defaults({
    targetHost: 'http://hypebeast.com',
    cacheExp: 60*30
  });

var express = require('express');
var winston = require('winston');
var winst = require('winston-papertrail');
var http = require('http');
var request = require('request');
var dom = require('./lib/dom');
var app = express();

var host = nconf.get('targetHost');

app.use(express.compress());
app.use(express.logger({
  stream: {
    write: function(msg, encoding) {
      winston.info(msg);
    }
  }
}));

app.get('/robots.txt', function(req, res) {
  res.end('User-agent: *\nDisallow: /');
});

app.get('/', function(req, res) {
  res.type('application/json');
  res.json({
    name: 'node-hbapi',
    description: 'Unofficial Hypebeast API',
    version: "0,0,1",
    projectUrl: "https://github.com/khayuenkam/node-hbapi/",
    author: "khayuen <khayuen@gmail.com>",
    process: {
      version: process.versions,
      memoryUsage: process.memoryUsage()
    }
  });
});

var regex = /^\/(news|style|arts|design|music|entertainment|lifestyle|tech|editorial|hypebeast-videos){1}(\/page\/[0-9]+)?$/

app.get(regex, function(req, res) {
  var url = host + req.path;

  request(url, function(err, response, body) {
    if (err) { return; }

    dom.page(body, function(error, data) {
      res.end();
    });
  });
});

app.get(/^\/(paper|magazine)$/, function(req, res) {
  console.log(req.path);
});

http.createServer(app, function(req, res) {
  
}).listen(4000);
