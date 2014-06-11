module.exports = function (next) {
    if (!(this.data.model instanceof this.model)){
        return this.halt('resource_not_found')
    } else {
        next()
    }
}