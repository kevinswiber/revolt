var Rx = require('rxjs');

var RxPipeline = module.exports = function(pipes) {
  this.pipes = pipes || [];
};

RxPipeline.prototype.observe = function(context) {
  if (!this.pipes.length) {
    return;
  }

  var origin = Rx.Observable.from([context]);
  var latest = origin;

  this.pipes.forEach(function(pipe) {
    latest = pipe(latest);
  });

  return latest;
};
