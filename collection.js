var Backbone = require('./backbone')
var Model = require('./model')

module.exports = Backbone.Collection.extend({
    model: Model

    /**
     * Returns the model at the index immediately before the passed in model
     * instance. If the model instance is the first model in the collection, or
     * the model instance does not exist in the collection, this will return
     * null.
     */
  , before: function (model) {
        var index = this.indexOf(model)
        if (index === -1 || index === 0) return null
        return this.at(index - 1)
    }

    /**
     * Returns the model at the index immediately after the passed in model
     * instance. If the model instance is the last model in the collection, or
     * the model instance does not exist in the collection, this will return
     * null.
     */
  , after: function (model) {
        var index = this.indexOf(model)
        if (index === -1 || index === this.length - 1) return null
        return this.at(index + 1)
    }

    /**
     * Convenience function for getting an array of all the models in a
     * collection
     */
  , all: function () {
        return this.models.slice()
    }
})