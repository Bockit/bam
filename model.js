// Generated by CoffeeScript 1.8.0
(function() {
  var Backbone, DEFAULT_CASTS, Model, any, map, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Backbone = require('./backbone');

  _ref = require('./underscore'), map = _ref.map, any = _ref.any;

  DEFAULT_CASTS = {
    string: function(v) {
      return v + '';
    },
    int: function(v) {
      return Math.floor(+v);
    },
    number: function(v) {
      return +v;
    },
    date: function(v) {
      return new Date(v);
    },
    boolean: function(v) {
      return !!v;
    }
  };

  Model = (function(_super) {
    __extends(Model, _super);

    function Model() {
      return Model.__super__.constructor.apply(this, arguments);
    }


    /*
    Allows derived get values. The format is:
    
    derived:
        foo:
            deps: ['bar', 'baz']
            value: (bar, baz) -> bar + ' ' + baz
    
    Your deps define which properties will be passed to the value function and
    in what order. They're also used to trigger change events for derived values
    i.e., if a dep changes the derived value will trigger a change too.
     */

    Model.prototype.derived = {};


    /*
    Allows casting specific keys. The format is:
    
    cast:
        timestamp: (v) -> moment(v)
        bar: 'string'
        baz: 'int'
    
    You can either provide your own function or use a provided basic cast. These
    include:
    
        * `'string'`: `(v) -> v + ''`
        * `'int'`: `(v) -> Math.floor(+v)`
        * `'number'`: `(v) -> +v`
        * `'date'`: `(v) -> new Date(v)`
        * `'boolean'`: (v) -> !!v
    
    Doesn't cast derived or null values.
     */

    Model.prototype.cast = {};


    /*
    Returns the model after this model in its collection. If it's not in a
    collection this will return null.
     */

    Model.prototype.next = function() {
      var _ref1, _ref2;
      return (_ref1 = (_ref2 = this.collection) != null ? _ref2.after(this) : void 0) != null ? _ref1 : null;
    };


    /*
    Returns the model before this model in its collection. If it's not in a
    collection this will return null.
     */

    Model.prototype.prev = function() {
      var _ref1, _ref2;
      return (_ref1 = (_ref2 = this.collection) != null ? _ref2.before(this) : void 0) != null ? _ref1 : null;
    };


    /*
    Returns a clone of the attributes object.
     */

    Model.prototype.getAttributes = function() {
      return Backbone.$.extend(true, {}, this.attributes);
    };


    /*
    Override get to allow default value and derived values.
     */

    Model.prototype.get = function(key, defaultValue) {
      var ret;
      if (this.derived[key]) {
        ret = this._derive(this.derived[key]);
      } else {
        ret = Model.__super__.get.call(this, key);
      }
      if (ret === void 0) {
        return defaultValue;
      } else {
        return ret;
      }
    };


    /*
    Derive a value from a definition
     */

    Model.prototype._derive = function(definition) {
      var args;
      args = map(definition.deps, (function(_this) {
        return function(key) {
          return _this.get(key);
        };
      })(this));
      return definition.value.apply(definition, args);
    };


    /*
    Override the set method to allow for casting as data comes in.
     */

    Model.prototype.set = function(key, val, options) {
      var attrs, changed, definition, derived, ret, _ref1;
      if (typeof key === 'object') {
        attrs = key;
        options = val;
      } else {
        attrs = {};
        attrs[key] = val;
      }
      for (key in attrs) {
        val = attrs[key];
        if (val === null) {
          continue;
        }
        if (this.cast[key]) {
          attrs[key] = this._cast(val, this.cast[key]);
        }
      }
      ret = Model.__super__.set.call(this, attrs, options);
      _ref1 = this.derived;
      for (derived in _ref1) {
        definition = _ref1[derived];
        changed = map(definition.deps, function(key) {
          return attrs.hasOwnProperty(key);
        });
        if (any(changed)) {
          this.trigger("change:" + derived, this._derive(definition));
        }
      }
      return ret;
    };


    /*
    Take a value, and a casting definition and perform the cast
     */

    Model.prototype._cast = function(value, cast) {
      var error;
      try {
        return value = this._getCastFunc(cast)(value);
      } catch (_error) {
        error = _error;
        return value = null;
      } finally {
        return value;
      }
    };


    /*
    Given a casting definition, return a function that should perform the cast
     */

    Model.prototype._getCastFunc = function(cast) {
      if (typeof cast === 'function') {
        return cast;
      }
      return DEFAULT_CASTS[cast];
    };

    return Model;

  })(Backbone.Model);

  module.exports = Model;

}).call(this);
