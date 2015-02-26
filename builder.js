var RxPipeline = require('./rx_pipeline');

var Builder = module.exports = function() {
  this.app = null;
  this._middleware = [];
  this._pipelines = {
    request: [],
    upgrade: [],
    response: [] 
  };
  this._errorHandler = null;
};

Builder.prototype.use = function(handler) {
  this._middleware.push(handler);
};

Builder.prototype.run = function(app) {
  this.app = app;
};

Builder.prototype._buildHandler = function eventedBuildHandler(event, options, handler) {
  if (event === 'error') {
    if (typeof options === 'function') {
      this._errorHandler = options;
    }
  }

  if (!(event in this._pipelines)) {
    this._pipelines[event] = [];
  }

  if (typeof options === 'function') {
    handler = options;
    options = null;
  }

  var pipe = {
    options: options,
    handler: handler
  };

  this._pipelines[event].push(pipe);
};

Builder.prototype.build = function() {
  this._pipelines.request = [];
  this._pipelines.response = [];

  var handle = this._buildHandler.bind(this);

  this._middleware.forEach(function(middleware) {
    middleware(handle);
  });

  var requestPipeline = this._preparePipeline(this._pipelines.request);
  var responsePipeline = this._preparePipeline(this._pipelines.response.reverse());

  var pipes = requestPipeline.concat([this.app]).concat(responsePipeline);

  return new RxPipeline(pipes);
};

Builder.prototype.prepareAndBuild = function(event) {
  if (!this._pipelines[event]) {
    return;
  }

  var pipes = this._preparePipeline(this._pipelines[event]);
  return new RxPipeline(pipes);
};

Builder.prototype._preparePipeline = function(pipeline) {
  var pre = [];
  var pipes = [];
  var post = [];

  pipeline.forEach(function(pipe) {
    if (pipe.options && pipe.options.affinity) {
      if (pipe.options.affinity === 'hoist') {
        pre.push(pipe.handler);
      } else if (pipe.options.affinity === 'sink') {
        post.push(pipe.handler);
      } else {
        pipes.push(pipe.handler);
      }
    } else {
      pipes.push(pipe.handler);
    }
  });

  return pre.concat(pipes).concat(post);
};
