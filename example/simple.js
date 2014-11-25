var revolt = require('../revolt');

revolt()
  .use(function(handle) {
    handle('request', function(env, next) {
      var auth = new Buffer('user:password').toString('base64');
      env.options.headers['authorization'] = 'Basic ' + auth;
      next(env);
    });
  })
  .get('http://localhost:3000')
  .flatMap(function(env) {
    return revolt.buffer(env.response)
      .map(function(data) {
        env.response.body = data.toString();
        return env;
      });
  })
  .subscribe(
    function(env) {
      console.log(env.response.body);
    });


