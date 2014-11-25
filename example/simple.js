var revolt = require('../revolt');

revolt()
  .get('http://google.com')
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


