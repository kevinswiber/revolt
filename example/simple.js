var Rx = require('rx');
var argo = require('../revolt');

argo()
  .get('http://zetta-cloud-2.herokuapp.com')
  .flatMap(function(env) {
    return argo.buffer(env.response)
      .map(function(data) {
        env.response.body = data.toString();
        return env;
      });
  })
  .subscribe(
    function(env) {
      console.log(env.response.body);
    });


