var pipeworks = require('pipeworks');

var Builder = module.exports = function() {
  this.app = null;
  this._middleware = [];
  this._pipelineMap = {
    request: null,
    response: null
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

  if (!(event in this._pipelineMap)) {
    this._pipelineMap[event] = pipeworks();
  }

  this._pipelineMap[event].fit(options, handler);
};

Builder.prototype.build = function() {
  this._pipelineMap.request = pipeworks();
  this._pipelineMap.response = pipeworks();

  var handle = this._buildHandler.bind(this);

  this._middleware.forEach(function(middleware) {
    middleware(handle);
  });

  var appPipeline = pipeworks().fit(this.app);

  var pipeline = this._pipelineMap.request
    .join(appPipeline)
    .join(this._pipelineMap.response.reverse());

  if (this._errorHandler) {
    pipeline.fault(this._errorHandler);
  }

  return pipeline.build();
};
