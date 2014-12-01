var Rx = require('rx');

var RxPipeline = module.exports = function(pipes) {
  this.pipes = pipes || [];
};

RxPipeline.prototype.observe = function(context) {
  if (!this.pipes.length) {
    return;
  }

  var origin = Rx.Observable.fromArray([context]);
  var latest = origin;

  this.pipes.forEach(function(pipe) {
    latest = pipe(latest);
  });

  return latest;
};
