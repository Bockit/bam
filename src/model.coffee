Backbone = require('backbone')
_ = require('underscore')
$ = require('jquery-browserify')

Decoratable = require('./decoratable.js')

module.exports = Model

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