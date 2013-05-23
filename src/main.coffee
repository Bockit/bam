# Bam is a library by James Hiscock

define([
    'cs!src/view'
    'cs!src/model'
    'cs!src/collection'

    'cs!src/tabularview'
], (
    View
    Model
    Collection

    TabularView
) ->
        View: View
        Model: Model
        Collection: Collection

        TabularView: TabularView
)