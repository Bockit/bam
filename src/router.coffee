Backbone = require('./backbone')
querystring = require('querystring')
_ = require('./underscore')
{ extend, object, isRegExp, isFunction, zip, pluck, sortBy, keys } = _
{ difference, map } = _

getNames = (string) ->
    ret = []
    ret.push.apply(ret, process(string, /(\(\?)?:\w+/g))
    ret.push.apply(ret, process(string, /\*\w+/g))
    return ret

process = (string, regex) ->
    matches = string.match(regex) ? []
    indexes = getIndexes(string, regex)
    return zip(matches, indexes)

getIndexes = (string, regex) ->
    ret = []
    while regex.test(string)
        ret.push(regex.lastIndex)
    return ret

splice = (source, from, to, replacement='') ->
    return source.slice(0, from) + replacement + source.slice(to)

class Router extends Backbone.Router

    ###
    Override so our _routes object is unique to each router.
    I hate this side of js.
    ###
    constructor: (args...) ->
        @_routes = {}
        super(args...)

    ###
    Override route to perform some subtle tweaks! Namely, storing raw string
    routes for reverse routing and passing the name to the buildRequest function
    ###
    route: (route, name, callback) ->
        unless isRegExp(route)
            @_routes[name] = route
            route = @_routeToRegExp(route)
        if isFunction(name)
            callback = name
            name = ''
        unless callback then callback = @[name]
        Backbone.history.route(route, (fragment) =>
            req = @_buildRequest(route, fragment, name)
            @execute(callback, req)
            @trigger.apply(@, ['route:' + name, req])
            @trigger('route', name, req)
            Backbone.history.trigger('route', @, name, req)
        )

    ###
    Store names of parameters in a propery of route
    ###
    _routeToRegExp: (route) ->
        ret = super(route)

        names = getNames(route)
        ret.names = map(pluck(sortBy(names, '1'), '0'), (s) -> s.slice(1))

        return ret

    ###
    Create a request object. It should have the route name, named params as
    keys with their values and a query object which is the query params, an
    empty object if no query params available.
    ###
    _buildRequest: (route, fragment, name) ->
        values = @_extractParameters(route, fragment)
        query = fragment.split('?').slice(1).join('?')
        # Passes the query string as the last cell in the array. Get rid of it!
        # Only for non-regex routes
        if (route.names)
            values = values.slice(0, -1)
        names = route.names ? map(values, (v, i) -> return i)

        req =
            # Regex routes aren't stored in @_routes and are what we want anyway
            route: @_routes[name] ? route
            fragment: fragment
            name: name
            values: values
            params: object(names, values)
            query: querystring.parse(query)

        return req

    ###
    No-op to stop the routes propery being used
    ###
    _bindRoutes: ->

    ###
    Rather than the default backbone behaviour of applying the args to the
    callback, call the callback with the request object.
    ###
    execute: (callback, req) ->
        if callback then callback.call(@, req)

    ###
    Reverse a named route with a barebones request object.
    ###
    reverse: (name, req) ->
        route = @_routes[name]
        return null unless route
        ret = route
        params = req.params ? {}
        query = req.query ? {}
        names = keys(params)

        # Step through optional params
        optionals = process(route, /\((.*?)\)/g).reverse()
        for [optional, lastIndex] in optionals
            # Get the named parameters
            nameds = map(pluck(getNames(optional), '0'), (s) -> s.slice(1))

            # If there are no named parameters or we don't have all of them
            diff = difference(nameds, names).length
            if nameds.length is 0 or diff isnt 0
                route = splice(route, lastIndex - optional.length, lastIndex)

            # Remove the parens
            else
                route = splice(route, lastIndex - optional.length, lastIndex,
                    optional.slice(1, -1))

        # Replace nameds
        nameds = getNames(route).reverse()
        for [segment, lastIndex] in nameds
            value = params[segment.slice(1)] ? null
            if value isnt null
                route = splice(route, lastIndex - segment.length, lastIndex,
                    params[segment.slice(1)])

        # Query string
        query = querystring.stringify(query)
        if query then route += '?' + query

        return route








module.exports = Router