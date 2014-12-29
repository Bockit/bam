Backbone = require('./backbone')
{ map, any } = require('./underscore')

DEFAULT_CASTS =
    string: (v) -> v + ''
    int: (v) -> Math.floor(+v)
    number: (v) -> +v
    date: (v) -> new Date(v)
    boolean: (v) -> !!v

class Model extends Backbone.Model
    ###
    Allows derived get values. The format is:

    derived:
        foo:
            deps: ['bar', 'baz']
            value: (bar, baz) -> bar + ' ' + baz

    Your deps define which properties will be passed to the value function and
    in what order. They're also used to trigger change events for derived values
    i.e., if a dep changes the derived value will trigger a change too.
    ###
    derived: {}

    ###
    Allows casting specific keys. The format is:

    cast:
        timestamp: (v) -> moment(v)
        bar: 'string'
        baz: 'int'

    You can either provide your own function or use a provided basic cast. These
    include:

        * `'string'`: `(v) -> v + ''`
        * `'int'`: `(v) -> Math.floor(+v)`
        * `'number'`: `(v) -> +v`
        * `'date'`: `(v) -> new Date(v)`
        * `'boolean'`: (v) -> !!v

    Doesn't cast derived or null values.
    ###
    cast: {}

    ###
    Returns the model after this model in its collection. If it's not in a
    collection this will return null.
    ###
    next: -> @collection?.after(@) ? null

    ###
    Returns the model before this model in its collection. If it's not in a
    collection this will return null.
    ###
    prev: -> @collection?.before(@) ? null

    ###
    Returns a clone of the attributes object.
    ###
    getAttributes: ->
        return Backbone.$.extend(true, {}, @attributes)

    ###
    Override get to allow default value and derived values.
    ###
    get: (key, defaultValue) ->
        if @derived[key]
            ret = @_derive(derived[key])
        else
            ret = super(key)
        return if ret is undefined then defaultValue else ret

    ###
    Derive a value from a definition
    ###
    _derive: (definition) ->
        args = map(definition.deps, (key) => @get('key'))
        return definition.value(args...)

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

        for key, val of attrs
            continue if val is null
            if @cast[key] then attrs[key] = @_cast(val, @cast[key])

        # Do this before derived values so any events for what was actually set
        # are triggered before derived change events are fired.
        ret = super(attrs, options)

        for derived, definition of @derived
            changed = map(definition.deps, (key) -> attrs.hasOwnProperty(key))
            if any(changed)
                @trigger("change:#{derived}", @_derive(definition))


        return ret

    ###
    Take a value, and a casting definition and perform the cast
    ###
    _cast: (value, cast) ->
        try
            value = @_getCastFunc(cast)(value)
        catch error
            value = null
        finally
            return value

    ###
    Given a casting definition, return a function that should perform the cast
    ###
    _getCastFunc: (cast) ->
        if typeof cast is 'function' then return cast
        return DEFAULT_CASTS[cast] ? (v) -> v

module.exports = Model