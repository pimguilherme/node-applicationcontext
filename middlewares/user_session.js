

module.exports = function (next) {

    var req = this.req
    if (!req){
        logger.error("Expected Express req")
        return this.halt('request_expected')
    }

    // Copying user from Express' context
    this.session.user = this.req.user
    next()

}