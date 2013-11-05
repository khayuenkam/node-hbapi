var nconf = require('nconf')

nconf
  .argv()
  .env()
  .file('config.json');

var express = require('express');
var winston = require('winston');
var http = require('http');
var request = require('request');
var stringify = require('json-stringify-safe');
var dom = require('./lib/dom');
var Redis = require('./lib/redis');

var host = 'http://hypebeast.com';
var httpPort = nconf.get('port')
  , TTL = nconf.get('cacheExp');

// Redis
var redis = Redis({
  url: nconf.get('redis:url'),
  debug: nconf.get('redis:debug')
});

var errorHander = function(res, err) {
  var errorMsg = err.message || JSON.parse(stringify(err));

  winston.error(errorMsg);

  if (!res.headerSent) {
    res.jsonp({
      error: errorMsg
    });
  }
}

var app = express();
app.set('trust proxy', true);

app.use(express.compress());
app.use(express.logger({
  stream: {
    write: function(msg, encoding) {
      winston.info(msg);
    },
  },
  format: 'path=:url status=:status ip=:remote-addr response-ms=:response-time user-agent=:user-agent referrer=:referrer'
}));

app.use(function(req, res, next) {
  res.setHeader('Cache-Control', 'public, max-age=' + TTL);
  next();
});

// Timeout
app.use(function(req, res, next) {
  var timeout = setTimeout(function() {
    winston.error('Server timeout: ' + req.url);
    res.send(504);
  }, 15000);

  res.on('header', function() {
    clearTimeout(timeout);
  });

  next();
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
        if (err) { 
          errorHandler(res, err);
          return; 
        }

        dom.page(body, function(error, data) {
          if (error) { 
            errorHandler(res, error);
            return; 
          }

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
        if (err) { 
          errorHandler(res, err);
          return; 
        }

        dom.publication(body, function(error , data) {
          if (error) {
            errorHandler(res, error);
            return;
          }

          redis.set(req.path, data, TTL);
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
        if (err) { 
          errorHandler(res, err);
          return;
        }

        dom.detail(body, function(error , data) {
          if (error) {
            errorHandler(res, error);
            return;
          }

          redis.set(req.path, data, TTL);
          res.jsonp(data);
        })
      });
    }
  });
});

http.createServer(app, function(req, res) {

}).listen(httpPort);

process.on('uncaughtException', function (err) {
  winston.error((new Date).toUTCString() + 'uncaughtException: ' + err.message);
  process.exit(1);
});
