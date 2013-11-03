var nconf = require('nconf')

nconf
  .argv()
  .env()
  .file('config.json')
  .defaults({
    //redisUrl: 'redis://USERNAME:PASSWORD@HOST:PORT
    targetHost: 'http://hypebeast.com',
    cacheExp: 60*15
  });

var express = require('express');
var winston = require('winston');
var winst = require('winston-papertrail');
var http = require('http');
var request = require('request');
var dom = require('./lib/dom');
var Redis = require('./lib/redis');
var app = express();

var host = nconf.get('targetHost');
var TTL = nconf.get('cacheExp');

app.use(express.compress());
app.use(express.logger({
  stream: {
    write: function(msg, encoding) {
      winston.info(msg);
    }
  }
}));

var redis = Redis({
  url: nconf.get('redisUrl'),
  onConnect: function() {
    winston.info('Connected to redis server');
  },
  onError: function() {
    winston.error(err.toString() ? err.toString() : err);
  }
});

app.get('/favicon.ico', function(req, res) {
  res.send(204);
});

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

  redis.get(req.path, function(err, result) {
    if (result) {
      res.jsonp(result);
    } else {
      request(url, function(err, response, body) {
        if (err) { return; }

        dom.page(body, function(error, data) {
          redis.set(req.path, data, TTL);
          res.jsonp(data);
        });
      });
    }
  });
});

app.get(/^\/(paper|magazine)$/, function(req, res) {
  var url = host + req.path;

  redis.get(req.path, function(err, result) {
    if (result) {
      res.jsonp(result);
    } else {
      request(url, function(err, response, body) {
        if (err) { return; }

        dom.publication(body, function(error , data) {
          redis.set(req.path, data, 60*60*24);
          res.jsonp(data);
        })
      });
    }
  });
});

app.get(/^\/[0-9]{4}\/([1-9]|1[0-2])\/[0-9a-zA-Z-]+$/, function(req, res) {
  var url = host + req.path;

  redis.get(req.path, function(err, result) {
    if (result) {
      res.jsonp(result);
    } else {
      request(url, function(err, response, body) {
        if (err) { return; }

        dom.detail(body, function(error , data) {
          redis.set(req.path, data, TTL);
          res.jsonp(data);
        })
      });
    }
  });
});

http.createServer(app, function(req, res) {
}).listen(4000);
