define(['backbone'], (Backbone) ->

    class Collection extends Backbone.Collection

        before: (model) ->
            index = @indexOf(model)
            
            if index is -1 or index is 0 then return null

            return @at(index - 1)

        after: (model) ->
            index = @indexOf(model)

            if index is -1 or index is @length - 1 then return null

            return @at(index + 1)

)