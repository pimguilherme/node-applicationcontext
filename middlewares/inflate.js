var async = require('async')
var mongoose = require('mongoose')

module.exports = function (map, next) {

    var fns = []
        , data = this.data
        , self = this

    this.debug("Inflating %s", JSON.stringify(map))

    // Normalization
    for (var name in map) {
        if (typeof map[name] == 'string') {
            map[name] = {
                name:map[name]
            }
        }
    }

    for (var name in map) {

        // The model is already loaded
        if (data[name] instanceof mongoose.Model) {
            continue;
        }

        // Inflation resources must be mongoIds
        this.rule(name, function (v) {
            this.notnull()
                .mongoId()
        })

        fns.push(
            (function (name) {
                var options = map[name]

                return function (next) {

                    var query = models[options.name].findById(data[name])
                    // Option to filter the query
                    if (options.filterQuery) {
                        options.filterQuery(query)
                    }

                    query.exec(function (err, doc) {
                        if (err) return self.err(err)
                        if (!doc) self.err(name, 'resource_not_found')
                        data[name] = doc
                        next()
                    })
                }

            })(name)
        )

    }

    if (!self.validate()) {
        return
    }

    async.parallel(
        fns,
        function (err) {
            if (err) return next(err)
            if (!self.validate()) return
            self.debug('Inflation ended')
            next()
        }
    )

}