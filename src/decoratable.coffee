define(
    ###
    Wraps methods in functions specified in the arguments. Takes the format:

        decorators:
            'hello': 'world'
            'foo': bar
            'render': ['depends', 'idle']
            'setup': [_.partial, 'stuff']

    'hello': 'world' - Looks for method this.hello and wraps it in
    this.world if this.world exists.

    'foo': bar - Wraps this.foo in function bar

    'render': ['depends', 'idle'] - Wraps method this.render in this.depends
    and passes 'idle' to the wrapping function. Any arguments after the
    first are passed into the wrapping function.

    'setup': [_.partial, 'stuff'] - Wraps method this.setup in _.parial, and
    passes 'stuff' to the wrapping function. Any arguments after the first
    are passed into the wrapping function.

    ###
    decorateMethods: (decorators) ->
        for key, value of decorators
            func = @[key]
            args = []

            if _.isString(value)
                decorator = @[value]

            else if _.isFunction(value)
                decorator = value

            else if _.isArray(value)

                if _.isString(value[0])
                    [name, args...] = value
                    decorator = @[name]

                else if _.isFunction(value[0])
                    [decorator, args...] = value

            args = [func].concat(args)
            @[key] = decorator.apply(func, args)
)
