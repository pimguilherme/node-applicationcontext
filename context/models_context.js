var util = require('util')
var utils = require('../utils')
var ApplicationContext = require('./application_context.js')
var _ = require('underscore')

var ModelsContext = function (data, next) {

    this._response = {}
    this._extra = {}
    this._models = {}
    this._deletedModels = {}

    ApplicationContext.call(this, data, next)

}

util.inherits(ModelsContext, ApplicationContext)

// Builds the response from the current state
ModelsContext.prototype.getErrors = function () {
    return this.hasErrors() ? {generic: this.errors, data: this.sanidator.errors} : null
}


// Builds the response from the current state
ModelsContext.prototype.getResponse = function () {
    var payload = {
        response:this._response,
        models:{
            updated:this._models,
            deleted:this._deletedModels
        }
    }
    _.extend(payload, this._extra || {})
    return payload
}

// Model responses
ModelsContext.prototype.response = function (res) {

    this._response = res;

    if (utils.isModel(res)) {
        this.models(res)
    }

    // Converting model array into ids arary
    if (res instanceof Array && utils.isModel(res[0])) {
        this.models(res)
        res = _.pluck(res, '_id')
    }

    this._response = res
}


// Adds models to be packaged in the response
ModelsContext.prototype.models = function (models, name) {
    var self = this
    if (!models) return this
    if (models instanceof Array) {
        // Well, nothing to add
        if (!models.length) return this
        models.forEach(function (model) {
            self.models(model, name)
        })
    }
    // It's just a single model
    else {
        // Okay, let's index the models by their name
        name = name || models.constructor.modelName
        if (!name) return this.halt('missing_model_name')
        var modelsMap = this._models[name] || (this._models[name] = {})

        if (this.flattenModels) {
            models = models.toObject ? models.toObject() : models
        }

        // We alreay have such model registered, let's extend it
        if (modelsMap[models._id]) {
            _.extend(modelsMap[models._id], models)
        }
        // New model arriving!
        else {
            modelsMap[models._id] = models
        }
    }
    return this
}

// Adds information about models which were deleted from the system
ModelsContext.prototype.deleted = function (models) {
    var self = this, name
    if (!models) return this
    // We assume an array of models is homogeneous
    if (models instanceof Array) {
        // Well, nothing to add
        if (!models.length) return this
        models.forEach(function (model) {
            self.deleted(model)
        })
    }
    // It's just a single model
    else {
        // Okay, let's index the models by their name
        name = models.constructor.modelName
        if (!name) return this.halt('missing_model_name')
        var modelsMap = this._deletedModels[name] || (this._deletedModels[name] = {})
        modelsMap[models.id] = true
    }
    return this
}

// Extra data to be sent
ModelsContext.prototype.extra = function (data) {
    _.extend(this._extra || (this._extra = {}), data)
}

module.exports = ModelsContext