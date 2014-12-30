var Backbone = require('../backbone')
var Router = require('../router')

module.exports = function (test) {

    test('Routing', function (t) {
        // We can only call Backbone.history.start() once, so we have to do this
        // giant ugly router thing that can test everything.
        var called = {
            basic: 0
          , params: 0
          , optional: 0
          , paramsAndOptional: 0
          , queryString: 0
          , regex: 0
        }

        var TestRouter = Router.extend({
            initialize: function () {
                this.route('basic', 'basic', this.basic)
                this.route('params/:foo', 'params', this.params)
                this.route('optional(/:foo)', 'optional', this.optional)
                this.route('params-and-optional(/:foo)/:bar', 'paramsAndOptional', this.paramsAndOptional)
                this.route('query-string', 'queryString', this.queryString)
                this.route(/regex\/(\w+)\/(\w+)/, 'regex', this.regex)
            }

          , basic: function (req) {
                if (called.basic) return t.fail('Basic called more than once')
                called.basic++

                t.pass('Basic route matched')
                t.equal(req.fragment, 'basic', 'Fragment added to request object')
                t.equal(req.name, 'basic', 'Name added to request object')
                t.equal(req.values.length, 0, 'No values in basic route')
            }

          , params: function (req) {
                if (called.params) return t.fail('Params called more than once')
                called.params++

                t.pass('Params route matched')
                t.equal(req.params.foo, 'a', 'Params added to req object')
                t.deepEqual(req.values, [ 'a' ], 'Values added to req object')
            }

          , optional: function (req) {
                called.optional++

                // First time no :foo
                if (called.optional === 1) {
                    t.pass('Optional called without :foo parameter')
                    t.equal(req.params.foo, null, 'No value for :foo when not present in Optional')
                }
                // Second time yes :foo
                else if (called.optional === 2) {
                    t.pass('Optional called with :foo parameter')
                    t.equal(req.params.foo, 'a', 'Params added to req object')
                }
                else {
                    t.fail('Optional called more than twice')
                }
            }

          , paramsAndOptional: function (req) {
                called.paramsAndOptional++

                // First time no :foo
                if (called.paramsAndOptional === 1) {
                    t.pass('ParamAndOptional called without :foo parameter')
                    t.equal(req.params.foo, null, 'No value for :foo when not present in ParamsAndOptional')
                    t.equal(req.params.bar, 'b', 'Skip optional param when adding to req.params')
                }
                // Second time yes :foo
                else if (called.paramsAndOptional === 2) {
                    t.pass('ParamAndOptional called with :foo parameter')
                    t.equal(req.params.foo, 'a', 'ParamAndOptional :foo param added to req object')
                    t.equal(req.params.bar, 'b', 'ParamAndOptional :bar param added to req object')
                }
                else {
                    t.fail('Optional called more than twice')
                }
            }

          , queryString: function (req) {
                if (called.queryString) return t.fail('QueryString called more than once')
                called.queryString++

                t.equal(req.query.foo, 'a', 'Query string parsed')
                t.equal(req.query.bar, 'b c', 'Encoded query params are decoded')
            }

          , regex: function (req) {
                if (called.regex) return t.fail('Regex called more than once')
                called.regex++

                t.pass('Regex called')
                t.deepEqual(req.values, [ 'a', 'b' ])
            }

        })

        t.plan(21)

        router = new TestRouter()
        Backbone.history.start({ pushState: false })

        router.navigate('basic', { trigger: true })
        router.navigate('params/a', { trigger: true })
        router.navigate('optional', { trigger: true })
        router.navigate('optional/a', { trigger: true })
        router.navigate('params-and-optional/b', { trigger: true })
        router.navigate('params-and-optional/a/b', { trigger: true })
        router.navigate('query-string?foo=a&bar=b%20c', { trigger: true })
        router.navigate('regex/a/b', { trigger: true })

        // Cleanup for refreshing the local test page
        router.navigate('')

        t.end()
    })
}