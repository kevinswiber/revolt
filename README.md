# revolt

A reactive, pipelined HTTP client.

* Add common request/response pipeline handlers.
* Use reactive programming to consume responses.

## Install

```
npm install revolt
```

## Example

```js
var revolt = require('../revolt');

revolt()
  .use(function(handle) {
    handle('request', function(pipeline) {
      return pipeline.map(function(env) {
        var auth = new Buffer('user:password').toString('base64');
        env.options.headers['authorization'] = 'Basic ' + auth;

        return env;
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
  .subscribe(
    function(env) {
      console.log(env.response.body);
    });
```
