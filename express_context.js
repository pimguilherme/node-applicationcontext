var util = require('util')
var ParentContext = require('./models_context.js')

var ExpressContext = function (req, res, next) {
    this.res = res
    this.req = req

    ParentContext.call(
        this,
        req.params,
        function (err, response){
            if (err){
                this.res.status(404)
                this.res.send(err)
            } else {
                this.res.status(200)
                this.res.send(response)
            }
        }
    )
}

util.inherits(ExpressContext, ParentContext)

module.exports = ExpressContext