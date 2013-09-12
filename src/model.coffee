Backbone = require('backbone')
_ = require('underscore')
$ = require('jquery-browserify')

Decoratable = require('./decoratable.js')

class Model extends Backbone.Model

    ###
    Inline functionality to mixin classes

    `@::mixin(ClassName)` is how you do it.
    ###
    mixin: (Class) ->
        for key, value of Class::
            @[key] = value

    @::mixin(Decoratable)

    ###
    Returns the model after this model in its collection. If it's not in a
    collection this will return null.
    ###
    next: -> @collection?.after(@)

    ###
    Returns the model before this model in its collection. If it's not in a
    collection this will return null.
    ###
    prev: -> @collection?.before(@)

    ###
    Override the set method to allow for casting as data comes in.
    ###
    set: (key, val, options) ->
        if typeof key is 'object'
            attrs = key
            options = val
        else
            attrs = {}
            attrs[key] = val

        if @types
            attrs[key] = @cast(val, @types[key]) for key, val of attrs

        return super(attrs, options)

    ###
    Take a value, and a casting definition and perform the cast
    ###
    cast: (value, cast) ->
        try
            value = @getCastFunc(cast)(value)
        catch error
            value = null
        finally
            return value

    ###
    Given a casting definition, return a function that should perform the cast
    ###
    getCastFunc: (cast) ->
        if _.isFunction(cast) then return cast

        return switch cast
            when 'string' then (v) -> '' + v
            when 'integer' then (v) -> Math.floor(+v)
            when 'float' then (v) -> +v
            when 'boolean' then (v) -> !!v

module.exports = Model