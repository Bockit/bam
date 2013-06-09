define(['backbone'], (Backbone) ->

    class Model extends Backbone.Model

        next: -> @collection?.after(@)
        prev: -> @collection?.before(@)

)