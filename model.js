var Backbone = require('./backbone')
var _ = require('./underscore')
var map = _.map
var any = _.any

var DEFAULT_CASTS = {
    string: function (v) {
        return v + ''
    }
  , int: function (v) {
        return Math.floor(+v)
    }
  , number: function (v) {
        return +v
    }
  , date: function (v) {
        return new Date(v)
    }
  , boolean: function (v) {
        return !!v
    }
}

module.exports = Backbone.Model.extend({
    /**
     * Allows derived get values. The format is:
     *
     * derived:
     *     foo:
     *         deps: ['bar', 'baz']
     *         value: (bar, baz) -> bar + ' ' + baz
     *
     * Your deps define which properties will be passed to the value function
     * and in what order. They're also used to trigger change events for
     * derived values i.e., if a dep changes the derived value will
     * trigger a change too.
     */
    derived: {}

    /**
     * Allows casting specific keys. The format is:
     *
     * cast:
     *     timestamp: (v) -> moment(v)
     *     bar: 'string'
     *     baz: 'int'
     *
     * You can either provide your own function or use a provided basic cast.
     * The basic casts are provided by DEFAULT_CASTS and include `'string'`,
     * `'int'`, `'number'`, `'date'` and `'boolean'`.
     *
     * Doesn't cast derived or null values.
     */
  , cast: {}

    /**
     * Returns the model after this model in its collection. If it's not in a
     * collection this will return null.
     */
  , next: function () {
        var model = this.collection && this.collection.after(this)
        return model ? model : null
    }

    /**
     * Returns the model before this model in its collection. If it's not in a
     * collection this will return null.
     */
  , prev: function () {
        var model = this.collection && this.collection.before(this)
        return model ? model : null
    }

    /**
     * Returns a deep clone of the attributes object.
     */
  , getAttributes: function () {
        return Backbone.$.extend(true, {}, this.attributes)
    }

    /**
     * Override get to allow default value and derived values.
     */
  , get: function (key, defaultValue) {
        if (this.derived[key]) {
            var ret = this._derive(this.derived[key])
        }
        else {
            var ret = Backbone.Model.prototype.get.call(this, key)
        }
        return ret === void 0 ? defaultValue : ret
    }

    /**
     * Derive a value from a definition.
     */
  , _derive: function (definition) {
        var _this = this
        var args = map(definition.deps, function (key) {
            return _this.get(key)
        })
        return definition.value.apply(null, args)
    }

    /**
     * Override the set method to allow for casting as data comes in.
     */
  , set: function (key, val, options) {
        if (typeof key === 'object') {
            var attrs = key
            var options = val
        }
        else {
            var attrs = {}
            attrs[key] = val
        }

        for (k in attrs) {
            var val = attrs[k]
            if (!attrs.hasOwnProperty(k) || val === null) continue

            if (this.cast[k]) {
                attrs[k] = this._cast(val, this.cast[k])
            }
        }

        // Do this before derived values so any events for what was actually set
        // are triggered before derived change events are fired.
        var ret = Backbone.Model.prototype.set.call(this, attrs, options)

        for (derived in this.derived) {
            var definition = this.derived[derived]
            if (!this.derived.hasOwnProperty(derived)) continue

            var changed = map(definition.deps, function (key) {
                return attrs.hasOwnProperty(key)
            })
            if (any(changed)) {
                this.trigger('change:' + derived, this._derive(definition))
            }
        }
    }

    /**
     * Take a value, and a casting definition and perform the cast
     */
  , _cast: function (value, cast) {
        return this._getCastFunc(cast)(value)
    }

    /**
     * Given a casting definition, return a function
     * that should perform the cast
     */
  , _getCastFunc: function (cast) {
        if (typeof cast === 'function') return cast
        return DEFAULT_CASTS[cast]
    }
})