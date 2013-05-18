# Bam is a library by James Hiscock

define([
    'cs!src/app'

    'cs!src/view'
    'cs!src/model'
    'cs!src/collection'

    'cs!src/modularview'
    'cs!src/tabularview'
], (
    App

    View
    Model
    Collection

    ModularView
    TabularView
) ->
    return {
        App: App

        View: View
        Model: Model
        Collection: Collection

        ModularView: ModularView
        TabularView: TabularView
    }
)