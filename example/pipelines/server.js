var argo = require('argo');
var revolt = require('../../revolt');

// server
argo()
  .use(function(handle) {
    handle('request', function(env, next) {
      var user;
      var password;

      if (env.request.headers['authorization']) {
        var token = env.request.headers['authorization'].split(/\s+/).pop();
        var auth = new Buffer(token, 'base64').toString();
        var parts = auth.split(':');

        user = parts[0];
        password = parts[1];
      }

      if (user === 'user' && password === 'password') {
        env.response.statusCode = 200;
        env.response.body = 'Hello there!';
      } else {
        env.response.statusCode = 401;
        env.response.setHeader('WWW-Authenticate', 'Basic realm="revolt"');
      }

      next(env);
    });
  })
  .listen(8082);

// successful client
revolt()
  .use(function(handle) {
    handle('auth', function(pipeline) {
      return pipeline.map(function(env) {
        var auth = new Buffer('user:password').toString('base64');
        env.request.headers['authorization'] = 'Basic ' + auth;

        return env;
      });
    });
  })
  .use(function(handle) {
    handle('request', function(pipeline) {
      return pipeline.flatMap(function(env) {
        return env.pipeline('auth').observe(env);
      });
    });
  })
  .get('http://localhost:8082')
  .flatMap(function(env) {
    return revolt.buffer(env.response)
      .map(function(data) {
        env.response.body = data.toString();
        return env;
      });
  })
  .subscribe(function(env) {
    console.log(env.response.body);
  });

// unauthorized client
revolt()
  .get('http://localhost:8082')
  .subscribe(function(env) {
    if (env.response.statusCode === 401) {
      console.log('Unauthorized!');
    }
  });
