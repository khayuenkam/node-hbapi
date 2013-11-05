var redis = require('redis');
var winston = require('winston');

var Redis = function(options) {
  if (options.debug) { redis.debug_mode = true; }

  var redisUrl = options.url;

  if (redisUrl) {
    var url = require('url').parse(redisUrl);
    var redisClient = redis.createClient(url.port, url.hostname);
    redisClient.auth(url.auth.split(':')[1]);
  } else {
    var redisClient = redis.createClient();
  }

  redisClient.on('connect', function() {
    winston.info('Connected to redis server');
  });

  redisClient.on('error', function(err) {
    winston.error(err.toString() ? err.toString() : err);
  });

  return {
    set: function(key, value, ttl) {
      if (!redisClient.connected) { return; }

      var strValue = JSON.stringify(value);

      if (ttl) {
        redisClient.setex(key, ttl, strValue);
      } else {
        redisClient.set(key, strValue);
      }
    },
    get: function(key, cb) {
      if (!redisClient.connected) { return; }

      redisClient.get(key, function(err, strValue) {
        if (err) {
          cb(err);
          return;
        }

        try {
          var value = JSON.parse(strValue);
          cb(null, value);
        } catch(e) {
          cb(e);
        }
      });
    }
  };
};

module.exports = Redis;
