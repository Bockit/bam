var Collection = require('../collection')
var Model = require('../model')

module.exports = function(test) {
    test('Collection utilities', function(t) {
        t.plan(3)

        var c = new Collection([{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }])
        var second = c.get(2)
        var third = c.get(3)
        t.notEqual(c.models, c.all(), 'Return of .all() is referentially different to .models')
        t.equal(c.before(third), second, 'Before model')
        t.equal(c.after(second), third, 'After model')

        t.end()
    })
}