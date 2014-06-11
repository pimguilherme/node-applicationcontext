var util = require('util')
var ApplicationContext = require('./application_context.js')

var CommandContext = function (program, next) {
    this.commandName = program.args[0]
    ApplicationContext.call(this, program.args.slice(1), next)
}

util.inherits(CommandContext, ApplicationContext)

module.exports = CommandContext