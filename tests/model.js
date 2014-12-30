var Collection = require('../collection')
var Model = require('../model')

module.exports = function (test) {
    test('Model utilities', function (t) {
        t.plan(8)
        var one = new Model()
        var two = new Model()
        var c = new Collection([ one, two ])

        t.equal(one.next(), two, '.next() when in a collection')
        t.equal(two.prev(), one, '.prev() when in a collection')
        t.equal(one.prev(), null, '.prev() when in a collection and first')
        t.equal(two.next(), null, '.next() when in a collection and last')

        var m = new Model()
        t.equal(m.next(), null, '.next() when not in a collection')
        t.equal(m.prev(), null, '.prev() when not in a collection')
        t.notEqual(m.attributes, m.getAttributes(), '.getAttributes() referentially different to .attributes')
        t.equal(m.get('foo', 'a'), 'a', 'Default value for get')

        t.end()
    })

    test('Model casting', function (t) {
        t.plan(7)

        var Caster = Model.extend({
            cast: {
                'string': 'string'
              , 'int': 'int'
              , 'number': 'number'
              , 'date': 'date'
              , 'boolean': 'boolean'
              , 'function': function (val) {
                    return 42
                }
            }
        })

        var m = new Caster({
            'string': 1
          , 'int': '1.8828'
          , 'number': '1.9'
          , 'date': 0
          , 'boolean': 1
          , 'function': 'foo'
        })

        t.equal(typeof m.get('string'), 'string', 'Cast to string')
        t.equal(typeof m.get('int'), 'number', 'Cast int to number')
        t.equal(String(m.get('int')).indexOf('.'), -1, 'Int has no decimal place')
        t.equal(typeof m.get('number'), 'number', 'Cast to number')
        t.equal(typeof m.get('date'), 'object', 'Cast to date')
        t.equal(typeof m.get('boolean'), 'boolean', 'Cast to boolean')
        t.equal(m.get('function'), 42, 'Custom cast function')

        t.end()
    })

    test('Derived values', function (t) {
        t.plan(3)

        var Deriver = Model.extend({
            derived: {
                'foo': {
                    deps: [ 'bar', 'baz' ]
                  , value: function (bar, baz) {
                        return bar + ' ' + baz
                    }
                }
            }
        })

        var m = new Deriver({
            bar: 'a'
          , baz: 'b'
        })
        var called = false
        m.on('change:foo', function() {
            called = true
        })

        t.equal(m.get('foo'), 'a b', 'Get derived values')
        m.set('bar', 'b')
        t.ok(called, 'Derived value change events fire')
        t.equal(m.get('foo'), 'b b', 'Derived values change as deps change')

        t.end()
    })
}