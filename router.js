var Backbone = require('./backbone')
var querystring = require('querystring')
var _ = require('./underscore')
var extend = _.extend
var object = _.object
var isRegExp = _.isRegExp
var isFunction = _.isFunction
var zip = _.zip
var pluck = _.pluck
var sortBy = _.sortBy
var keys = _.keys
var difference = _.difference
var map = _.map

function getNames (string) {
    var ret = []
    ret.push.apply(ret, process(string, /(\(\?)?:\w+/g))
    ret.push.apply(ret, process(string, /\*\w+/g))
    return ret
}

function process (string, regex) {
    var matches = string.match(regex) || []
    var indexes = getIndexes(string, regex)
    return zip(matches, indexes)
}

function getIndexes (string, regex) {
    var ret = []
    while (regex.test(string)) {
        ret.push(regex.lastIndex)
    }
    return ret
}

function splice (source, from, to, replacement) {
    replacement = replacement || ''
    return source.slice(0, from) + replacement + source.slice(to)
}

module.exports = Backbone.Router.extend({
    /**
     * Override so our _routes object is unique to each router.
     * I hate this side of js.
     */
    constructor: function () {
        this._routes = {}
        Backbone.Router.prototype.constructor.apply(this, arguments)
    }

    /**
     * Override route to perform some subtle tweaks! Namely, storing raw string
     * routes for reverse routing and passing the name to the
     * buildRequest function
     */
  , route: function (route, name, callback) {
        var _this = this

        if (!isRegExp(route)) {
            this._routes[name] = route
            route = this._routeToRegExp(route)
        }
        if (isFunction(name)) {
            callback = name
            name = ''
        }
        if (!callback) callback = this[name]
        Backbone.history.route(route, function (fragment) {
            var req = _this._buildRequest(route, fragment, name)
            _this.execute(callback, req)
            _this.trigger.apply(_this, [ 'route:' + name, req ])
            _this.trigger('route', name, req)
            Backbone.history.trigger('route', _this, name, req)
        })
    }

    /**
     * Store names of parameters in a propery of route
     */
  , _routeToRegExp: function (route) {
        var ret = Backbone.Router.prototype._routeToRegExp.call(this, route)

        var names = getNames(route)
        ret.names = map(pluck(sortBy(names, '1'), '0'), function (s) {
            return s.slice(1)
        })

        return ret
    }

    /**
     * Create a request object. It should have the route name, named params as
     * keys with their values and a query object which is the query params, an
     * empty object if no query params available.
     */
  , _buildRequest: function (route, fragment, name) {
        var values = this._extractParameters(route, fragment)
        var query = fragment.split('?').slice(1).join('?')
        // Passes the query string as the last cell in the array. Get rid of it!
        // Only for non-regex routes, route.names doesn't exist in regex routes.
        if (route.names) {
            values = values.slice(0, -1)
        }
        names = route.names || map(values, function (v, i) {
            return i
        })

        var req = {
            // Regex routes aren't stored in @_routes and are what we want
            route: this._routes[name] || route
          , fragment: fragment
          , name: name
          , values: values
          , params: object(names, values)
          , query: querystring.parse(query)
        }

        return req
    }

    /**
     * No-op to stop the routes property being used.
     */
  , _bindRoutes: function () {}

    /**
     * Rather than the default backbone behaviour of applying the args to the
     * callback, call the callback with the request object.
     */
  , execute: function (callback, req) {
        if (callback) callback.call(this, req)
    }

    /**
     * Reverse a named route with a barebones request object.
     */
  , reverse: function (name, req) {
        var route = this._routes[name]
        if (!route) return null

        var ret = route
        var params = req.params || {}
        var query = req.query || {}
        var names = keys(params)

        // Step through the optional params
        var optionals = process(route, /\((.*?)\)/g).reverse()
        for (var i = 0; i < optionals.length; i++) {
            var optional = optionals[i][0]
            var lastIndex = optionals[i][1]

            // Get the named parameters
            var nameds = map(pluck(getNames(optional), '0', function (s) {
                return s.slice(1)
            }))

            // If there are no named parameters or we don't have all of them
            var diff = difference(nameds, names).length
            if (nameds.length === 0 || diff !== 0) {
                var route = splice(route, lastIndex - optional.length,
                    lastIndex)
            }
            else {
                var route = splice(route, lastIndex - optional.length,
                    lastIndex, optional.slice(1, -1))
            }
        }

        // Replace nameds
        nameds = getNames(route).reverse()
        for (var i = 0; i < nameds.length; i++) {
            var segment = nameds[i][0]
            var lastIndex = nameds[i][1]

            var value = params[segment.slice(1)]
            if (value === void 0) value = null
            if (value !== null) {
                route = splice(route, lastIndex - segment.length, lastIndex,
                    params[segment.slice(1)])
            }
        }

        // Query string
        query = querystring.stringify(query)
        if (query) route += '?' + query

        return route
    }
})