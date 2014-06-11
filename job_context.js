var util = require('util')
var ApplicationContext = require('./application_context.js')

var JobContext = function (job, next) {
    this.job = job
    var data = typeof job.data == 'object' ? job.data : {0: job.data}
    ApplicationContext.call(this, data, next)
}

util.inherits(JobContext, ApplicationContext)

module.exports = JobContext