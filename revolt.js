var http = require('http');
var https = require('https');
var Stream = require('stream').Stream;
var url = require('url');
var Rx = require('Rx');
var Builder = require('./builder');

var Revolt = module.exports = function() {
  if (!(this instanceof Revolt)) {
    return new Revolt();
  }

  this.builder = new Builder();
  this.built = null;
};

Revolt.prototype.use = function(middleware) {
  this.builder.use(middleware);
  return this;
};

Revolt.prototype.build = function() {
  this.built = this.builder.build();
  return this;
};

Revolt.prototype.request = function(options) {
  var self = this;

  options = options || {};
  options.method = options.method || 'GET';
  options.headers = options.headers || {};

  var uri = options.uri || options.url;
  var parsed = url.parse(uri);

  if (uri) {
    options.hostname = parsed.hostname;
    options.port = parsed.port;
    options.path = parsed.path;
    options.auth = parsed.auth;
  };

  var mod = parsed.protocol === 'https:' ? https : http;

  self.builder.run(function(pipeline) {
    return pipeline.flatMap(function(env) {
      return Rx.Observable.create(function(observer) {
        var req = mod.request(env.request);

        req.on('error', function(err) {
          observer.onError(err);
        });

        req.on('response', function(res) {
          res.on('error', function(err) {
            observer.onError(err);
          });

          env.response = res;
          env.response.body = res;
          observer.onNext(env);
        });

        if (env.request.body) {
          if (env.request.body instanceof Stream) {
            req.pipe(env.request.body)
          } else {
            req.end(env.request.body);
          }
        } else {
          req.end();
        }
      });
    });
  });

  var env = {
    request: options,
    response: null,
    pipeline: function(event) {
      return self.builder.prepareAndBuild(event);
    }
  };

  self.build();

  return self.built.observe(env);
};

Revolt.prototype.get = function(requestUrl, options) {
  var options = {
    method: 'GET',
    uri: requestUrl
  };

  return this.request(options);
};

Revolt.prototype.head = function(requestUrl) {
  var options = {
    method: 'HEAD',
    uri: requestUrl
  };

  return this.request(options);
};


Revolt.prototype.post = function(requestUrl, data) {
  var options = {
    method: 'POST',
    uri: requestUrl,
    body: data
  };

  return this.request(options);
};

Revolt.prototype.put = function(requestUrl, data) {
  var options = {
    method: 'PUT',
    uri: requestUrl,
    body: data
  };

  return this.request(options);
};

Revolt.prototype.del = function(requestUrl) {
  var options = {
    method: 'DELETE',
    uri: requestUrl
  };

  return this.request(options);
};

Revolt.prototype.options = function(requestUrl) {
  var options = {
    method: 'OPTIONS',
    uri: requestUrl
  };

  return this.request(options);
};

Revolt.buffer = function(response) {
  return Rx.Node.fromStream(response)
    .reduce(function(acc, data) {
      acc.length += data.length;
      acc.buffers.push(data);

      return acc;
    }, { length: 0, buffers: [] })
    .map(function(body) {
      return Buffer.concat(body.buffers, body.length);
    })
};
