define(['backbone'], (Backbone) ->

    class Model extends Backbone.Model

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

)