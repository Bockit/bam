Backbone = require('backbone')
Decoratable = require('./decoratable.js')

class Collection extends Backbone.Collection

    ###
    Inline functionality to mixin classes

    `@::mixin(ClassName)` is how you do it.
    ###
    mixin: (Class) ->
        for key, value of Class::
            @[key] = value

    @::mixin(Decoratable)

    ###
    Returns the model at the index immediately before the passed in model
    instance. If the model instance is the first model in the collection, or
    the model instance does not exist in the collection, this will return
    null.
    ###
    before: (model) ->
        index = @indexOf(model)
        if index is -1 or index is 0 then return null
        return @at(index - 1)

    ###
    Returns the model at the index immediately after the passed in model
    instance. If the model instance is the last model in the collection, or
    the model instance does not exist in the collection, this will return
    null.
    ###
    after: (model) ->
        index = @indexOf(model)
        if index is -1 or index is @length - 1 then return null
        return @at(index + 1)

    ###
    Convenience function for getting an array of all the models in a
    collection
    ###
    all: -> @models.slice()

module.exports = Collection
