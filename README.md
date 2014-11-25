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
  .get('http://zetta-cloud-2.herokuapp.com')
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
