# Bam is a library by James Hiscock

define([
    'cs!src/app'

    'cs!src/view'
    'cs!src/model'
    'cs!src/collection'

    'cs!src/tabularview'
], (
    App

    View
    Model
    Collection

    TabularView
) ->
    return {
        App: App

        View: View
        Model: Model
        Collection: Collection

        TabularView: TabularView
    }
)