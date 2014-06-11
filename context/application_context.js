var HashSanidator = require('../sanidator').HashSanidator
var _ = require('underscore')
var async = require('async')

/**
 * Middlewares
 */
var path = require('path')
var fs = require('fs')
var MIDDLEWARE_DIR = path.resolve(__dirname + '/middlewares');
var middlewaresFiles = fs.readdirSync(MIDDLEWARE_DIR)
var middlewares = {}
middlewaresFiles
    .filter(function (file) {
        return file.substr(-3) == '.js'
    })
    .each(function (name) {
        middlewares[name.substr(0, name.length - 3)] = require(MIDDLEWARE_DIR + '/' + name)
    })

/**
 * Default application context
 *
 * Adapters should be used to create this context based on
 * different setups
 */
var ApplicationContext = function (data, next) {

    this.data = _.clone(data)
    this.sanidator = new HashSanidator(this.data)
    this.ended = next.bind(this)

    this.errors = []

    // Object holding context execution data
    this.session = {}

    // Configurations
    this.logger = logger
    this.middlewares = middlewares

    this.finish = this.finish.bind(this)

    this._executed = false

}

ApplicationContext.prototype.execute = function (fn) {
    if (this._executed){
        this.error("Context has already executed a function")
        return
    }
    this._executed = true
    fn.call(this, this.data)
}

/**
 * State Control
 */

ApplicationContext.prototype.finish = function (err) {
    if (err){
        this.err(err)
    }
    this.ended(this.getErrors(), this.getResponse())
}

ApplicationContext.prototype.halt = function (err) {
    this.err.apply(this, arguments)
    this.finish()
}

/**
 * Response
 */
ApplicationContext.prototype.getResponse = function () {
    return null
}

/**
 * Validation
 */

ApplicationContext.prototype.validate = function () {
    if (this.hasErrors()) {
        this.finish()
        return false
    }
    return true
}

// We might have some errors attached to a data param or generic errors
ApplicationContext.prototype.hasErrors = function () {
    return this.errors.length || this.sanidator.hasErrors()
}

ApplicationContext.prototype.hasError = function (param) {
    return this.sanidator.hasError(param)
}

ApplicationContext.prototype.err = function (param, error) {
    if (!error) {
        var errorObj
        error = param

        // Error Identifier
        if (typeof error == 'string') {
            errorObj = new Error(error)
        }
        // Unknown error type
        else {
            errorObj = new Error(error && error.toString())
            error = 'unexpected_error'
            logger.error(errorObj.stack)
        }

        return this.errors.push(error)
    }
    // Parameter error
    else {
        this.sanidator.err(param, error)
    }
}

// Retrieves the error object which represents the error state
// for this context
ApplicationContext.prototype.getErrors = function (){
    return this.hasErrors() ? this.errors.concat(this.sanidator.getErrorsAsArray()) : null
}

ApplicationContext.prototype.rules = function () {
    this.sanidator.rules.apply(this.sanidator, arguments)
}

ApplicationContext.prototype.rule = function () {
    this.sanidator.rule.apply(this.sanidator, arguments)
}

/**
 * Async Flow
 */

ApplicationContext.prototype.series = function (fns, next) {
    async.series(this.bindFunctions(fns), next || this.finish)
}

ApplicationContext.prototype.waterfall = function (fns, next) {
    async.waterfall(this.bindFunctions(fns), next || this.finish)
}

ApplicationContext.prototype.bindFunctions = function (fns) {
    var self = this
    return fns.map(function (fn) {
        return fn.bind(self)
    })
}

/**
 * Middlewares
 */
ApplicationContext.prototype.middleware = function (name) {

    var middleware = this.middlewares[name];
    if (!middleware) {
        logger.error("Invalid middleware '%s'", name)
        return this.halt()
    }

    // Creates an async function to be executed
    var self = this
    var args = Array.prototype.slice.call(arguments, 1)
    return function (next) {
        middleware.apply(this, args.concat([next]))
    }

}

// Default validation middleware
ApplicationContext.prototype.validation = function (rules) {
    return function (next) {
        this.rules(rules)
        if (!this.validate()) return
        next()
    }
}

/**
 * Logging
 */
ApplicationContext.prototype.log = function () {
    this.logger.log.apply(this.logger, arguments)
}
ApplicationContext.prototype.warn = function () {
    this.logger.warn.apply(this.logger, arguments)
}
ApplicationContext.prototype.info = function () {
    this.logger.info.apply(this.logger, arguments)
}
ApplicationContext.prototype.error = function () {
    this.logger.error.apply(this.logger, arguments)
}
ApplicationContext.prototype.debug = function () {
    this.logger.debug.apply(this.logger, arguments)
}

module.exports = ApplicationContext