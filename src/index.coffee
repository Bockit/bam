###
Convenience entry point if someone just wants to `require('bam')`
###

module.exports =
    Collection: require('./collection.js')
    Model: require('./model.js')
    View: require('./view.js')
    Decoratable: require('./decoratable.js')