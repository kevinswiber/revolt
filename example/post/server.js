var Rx = require('rx');
var argo = require('argo');
var revolt = require('../../revolt');
var buffer = revolt.buffer;

argo()
  .post('^/test/post$', function(handle) {
    handle('request', function(env, next) {
      env.request.getBody(function(err, body) {
        env.response.body = body.toString().toUpperCase();
        next(env);
      });
    });
  })
  .listen(8102, function() {
    console.log('Simple POST server started...');
  });

var client = revolt()
  .post('http://localhost:8102/test/post', 'Hello there!!!')
  .flatMap(function(env) {
    return buffer(env.response); 
  })
  .map(function(data) {
    return data.toString();
  })
  .subscribe(function(data) {
    console.log('Received:', data);
  });
