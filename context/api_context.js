var util = require('util')
var utils = require('../utils')
var ParentContext = require('./models_context')
var _ = require('underscore')

var APIContext = function (modelName, data, next) {
    this.model = models[modelName]
    ParentContext.call(this, data, next)
}

util.inherits(APIContext, ParentContext)


module.exports = APIContext