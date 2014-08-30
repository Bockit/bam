!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.Bam=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

},{}],2:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

// If obj.hasOwnProperty has been overridden, then calling
// obj.hasOwnProperty(prop) will break.
// See: https://github.com/joyent/node/issues/1707
function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

module.exports = function(qs, sep, eq, options) {
  sep = sep || '&';
  eq = eq || '=';
  var obj = {};

  if (typeof qs !== 'string' || qs.length === 0) {
    return obj;
  }

  var regexp = /\+/g;
  qs = qs.split(sep);

  var maxKeys = 1000;
  if (options && typeof options.maxKeys === 'number') {
    maxKeys = options.maxKeys;
  }

  var len = qs.length;
  // maxKeys <= 0 means that we should not limit keys count
  if (maxKeys > 0 && len > maxKeys) {
    len = maxKeys;
  }

  for (var i = 0; i < len; ++i) {
    var x = qs[i].replace(regexp, '%20'),
        idx = x.indexOf(eq),
        kstr, vstr, k, v;

    if (idx >= 0) {
      kstr = x.substr(0, idx);
      vstr = x.substr(idx + 1);
    } else {
      kstr = x;
      vstr = '';
    }

    k = decodeURIComponent(kstr);
    v = decodeURIComponent(vstr);

    if (!hasOwnProperty(obj, k)) {
      obj[k] = v;
    } else if (isArray(obj[k])) {
      obj[k].push(v);
    } else {
      obj[k] = [obj[k], v];
    }
  }

  return obj;
};

var isArray = Array.isArray || function (xs) {
  return Object.prototype.toString.call(xs) === '[object Array]';
};

},{}],3:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

var stringifyPrimitive = function(v) {
  switch (typeof v) {
    case 'string':
      return v;

    case 'boolean':
      return v ? 'true' : 'false';

    case 'number':
      return isFinite(v) ? v : '';

    default:
      return '';
  }
};

module.exports = function(obj, sep, eq, name) {
  sep = sep || '&';
  eq = eq || '=';
  if (obj === null) {
    obj = undefined;
  }

  if (typeof obj === 'object') {
    return map(objectKeys(obj), function(k) {
      var ks = encodeURIComponent(stringifyPrimitive(k)) + eq;
      if (isArray(obj[k])) {
        return map(obj[k], function(v) {
          return ks + encodeURIComponent(stringifyPrimitive(v));
        }).join(sep);
      } else {
        return ks + encodeURIComponent(stringifyPrimitive(obj[k]));
      }
    }).join(sep);

  }

  if (!name) return '';
  return encodeURIComponent(stringifyPrimitive(name)) + eq +
         encodeURIComponent(stringifyPrimitive(obj));
};

var isArray = Array.isArray || function (xs) {
  return Object.prototype.toString.call(xs) === '[object Array]';
};

function map (xs, f) {
  if (xs.map) return xs.map(f);
  var res = [];
  for (var i = 0; i < xs.length; i++) {
    res.push(f(xs[i], i));
  }
  return res;
}

var objectKeys = Object.keys || function (obj) {
  var res = [];
  for (var key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) res.push(key);
  }
  return res;
};

},{}],4:[function(require,module,exports){
'use strict';

exports.decode = exports.parse = require('./decode');
exports.encode = exports.stringify = require('./encode');

},{"./decode":2,"./encode":3}],5:[function(require,module,exports){
module.exports = require('backbone');



},{"backbone":1}],6:[function(require,module,exports){
var Backbone, Collection,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Backbone = require('backbone');

Collection = (function(_super) {
  __extends(Collection, _super);

  function Collection() {
    return Collection.__super__.constructor.apply(this, arguments);
  }


  /*
  Returns the model at the index immediately before the passed in model
  instance. If the model instance is the first model in the collection, or
  the model instance does not exist in the collection, this will return
  null.
   */

  Collection.prototype.before = function(model) {
    var index;
    index = this.indexOf(model);
    if (index === -1 || index === 0) {
      return null;
    }
    return this.at(index - 1);
  };


  /*
  Returns the model at the index immediately after the passed in model
  instance. If the model instance is the last model in the collection, or
  the model instance does not exist in the collection, this will return
  null.
   */

  Collection.prototype.after = function(model) {
    var index;
    index = this.indexOf(model);
    if (index === -1 || index === this.length - 1) {
      return null;
    }
    return this.at(index + 1);
  };


  /*
  Convenience function for getting an array of all the models in a
  collection
   */

  Collection.prototype.all = function() {
    return this.models.slice();
  };

  return Collection;

})(Backbone.Collection);

module.exports = Collection;



},{"backbone":1}],7:[function(require,module,exports){
var Bam;

module.exports = Bam = {
  Backbone: require('./backbone'),
  Router: require('./router'),
  View: require('./view'),
  Model: require('./model'),
  Collection: require('./collection')
};



},{"./backbone":5,"./collection":6,"./model":8,"./router":9,"./view":10}],8:[function(require,module,exports){
var Backbone, DEFAULT_CASTS, Model, any, map, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Backbone = require('backbone');

_ref = require('underscore'), map = _ref.map, any = _ref.any;

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
    var _ref1;
    return (_ref1 = this.collection) != null ? _ref1.after(this) : void 0;
  };


  /*
  Returns the model before this model in its collection. If it's not in a
  collection this will return null.
   */

  Model.prototype.prev = function() {
    var _ref1;
    return (_ref1 = this.collection) != null ? _ref1.before(this) : void 0;
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
      ret = this._derive(derived[key]);
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
        return _this.get('key');
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
    var _ref1;
    if (typeof cast === 'function') {
      return cast;
    }
    return (_ref1 = DEFAULT_CASTS[cast]) != null ? _ref1 : function(v) {
      return v;
    };
  };

  return Model;

})(Backbone.Model);

module.exports = Model;



},{"backbone":1,"underscore":1}],9:[function(require,module,exports){
var Backbone, Router, difference, extend, getIndexes, getNames, isFunction, isRegExp, keys, map, object, pluck, process, querystring, sortBy, splice, zip, _,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  __slice = [].slice;

Backbone = require('backbone');

querystring = require('querystring');

_ = require('underscore');

extend = _.extend, object = _.object, isRegExp = _.isRegExp, isFunction = _.isFunction, zip = _.zip, pluck = _.pluck, sortBy = _.sortBy, keys = _.keys;

difference = _.difference, map = _.map;

getNames = function(string) {
  var ret;
  ret = [];
  ret.push.apply(ret, process(string, /(\(\?)?:\w+/g));
  ret.push.apply(ret, process(string, /\*\w+/g));
  return ret;
};

process = function(string, regex) {
  var indexes, matches, _ref;
  matches = (_ref = string.match(regex)) != null ? _ref : [];
  indexes = getIndexes(string, regex);
  return zip(matches, indexes);
};

getIndexes = function(string, regex) {
  var ret;
  ret = [];
  while (regex.test(string)) {
    ret.push(regex.lastIndex);
  }
  return ret;
};

splice = function(source, from, to, replacement) {
  if (replacement == null) {
    replacement = '';
  }
  return source.slice(0, from) + replacement + source.slice(to);
};

Router = (function(_super) {
  __extends(Router, _super);


  /*
  Override so our _routes object is unique to each router. I hate this side of
  js.
   */

  function Router() {
    var args;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    this._routes = {};
    Router.__super__.constructor.apply(this, args);
  }


  /*
  Override route to perform some subtle tweaks! Namely, storing raw string
  routes for reverse routing and passing the name to the buildRequest function
   */

  Router.prototype.route = function(route, name, callback) {
    if (!isRegExp(route)) {
      this._routes[name] = route;
      route = this._routeToRegExp(route);
    }
    if (isFunction(name)) {
      callback = name;
      name = '';
    }
    if (!callback) {
      callback = this[name];
    }
    return Backbone.history.route(route, (function(_this) {
      return function(fragment) {
        var req;
        req = _this._buildRequest(route, fragment, name);
        _this.execute(callback, req);
        _this.trigger.apply(_this, ['route:' + name, req]);
        _this.trigger('route', name, req);
        return Backbone.history.trigger('route', _this, name, req);
      };
    })(this));
  };


  /*
  Store names of parameters in a propery of route
   */

  Router.prototype._routeToRegExp = function(route) {
    var names, ret;
    ret = Router.__super__._routeToRegExp.call(this, route);
    names = getNames(route);
    ret.names = map(pluck(sortBy(names, '1'), '0'), function(s) {
      return s.slice(1);
    });
    return ret;
  };


  /*
  Create a request object. It should have the route name, named params as
  keys with their values and a query object which is the query params, an
  empty object if no query params available.
   */

  Router.prototype._buildRequest = function(route, fragment, name) {
    var names, query, req, values, _ref, _ref1;
    values = this._extractParameters(route, fragment);
    query = fragment.split('?').slice(1).join('?');
    if (values[values.length - 1] === query) {
      values = values.slice(0, -1);
    }
    names = (_ref = route.names) != null ? _ref : map(values, function(v, i) {
      return i;
    });
    req = {
      route: (_ref1 = this._routes[name]) != null ? _ref1 : route,
      fragment: fragment,
      name: name,
      values: values,
      params: object(names, values),
      query: querystring.parse(query)
    };
    return req;
  };


  /*
  No-op to stop the routes propery being used
   */

  Router.prototype._bindRoutes = function() {};


  /*
  Rather than the default backbone behaviour of applying the args to the
  callback, call the callback with the request object.
   */

  Router.prototype.execute = function(callback, req) {
    if (callback) {
      return callback.call(this, req);
    }
  };


  /*
  Reverse a named route with a barebones request object.
   */

  Router.prototype.reverse = function(name, req) {
    var diff, lastIndex, nameds, names, optional, optionals, params, query, ret, route, segment, value, _i, _j, _len, _len1, _ref, _ref1, _ref2, _ref3, _ref4;
    route = this._routes[name];
    if (!route) {
      return null;
    }
    ret = route;
    params = (_ref = req.params) != null ? _ref : {};
    query = (_ref1 = req.query) != null ? _ref1 : {};
    names = keys(params);
    optionals = process(route, /\((.*?)\)/g).reverse();
    for (_i = 0, _len = optionals.length; _i < _len; _i++) {
      _ref2 = optionals[_i], optional = _ref2[0], lastIndex = _ref2[1];
      nameds = map(pluck(getNames(optional), '0'), function(s) {
        return s.slice(1);
      });
      diff = difference(nameds, names).length;
      if (nameds.length === 0 || diff !== 0) {
        route = splice(route, lastIndex - optional.length, lastIndex);
      } else {
        route = splice(route, lastIndex - optional.length, lastIndex, optional.slice(1, -1));
      }
    }
    nameds = getNames(route).reverse();
    for (_j = 0, _len1 = nameds.length; _j < _len1; _j++) {
      _ref3 = nameds[_j], segment = _ref3[0], lastIndex = _ref3[1];
      value = (_ref4 = params[segment.slice(1)]) != null ? _ref4 : null;
      if (value !== null) {
        route = splice(route, lastIndex - segment.length, lastIndex, params[segment.slice(1)]);
      }
    }
    query = querystring.stringify(query);
    if (query) {
      route += '?' + query;
    }
    return route;
  };

  return Router;

})(Backbone.Router);

module.exports = Router;



},{"backbone":1,"querystring":4,"underscore":1}],10:[function(require,module,exports){
var Backbone, View, difference, without, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
  __slice = [].slice;

Backbone = require('backbone');

_ref = require('underscore'), without = _ref.without, difference = _ref.difference;

View = (function(_super) {
  __extends(View, _super);

  View.prototype.parent = null;

  View.prototype.children = null;

  View.prototype.namespace = '';


  /*
  Ensure the classname is applied, then set the parent and children if any
  are passed in. Does the normal backbone constructor and then does the
  first state change.
   */

  function View(options) {
    var _ref1;
    this.children = [];
    if (options.className) {
      this.className = options.className;
    }
    if (options.namespace) {
      this.namespace = options.namespace;
    }
    if (options.el) {
      this._ensureClass(options.el);
    }
    if (options.parent) {
      this.setParent(options.parent);
    }
    if ((_ref1 = options.children) != null ? _ref1.length : void 0) {
      this.addChildren(options.children);
    }
    View.__super__.constructor.call(this, options);
  }


  /*
  Used to ensure that the className property of the view is applied to an
  el passed in as an option.
   */

  View.prototype._ensureClass = function(el, className) {
    if (className == null) {
      className = this.className;
    }
    return Backbone.$(el).addClass(className);
  };


  /*
  Adds a list of views as children of this view.
   */

  View.prototype.addChildren = function(views) {
    var view, _i, _len, _results;
    _results = [];
    for (_i = 0, _len = views.length; _i < _len; _i++) {
      view = views[_i];
      _results.push(this.addChild(view));
    }
    return _results;
  };


  /*
  Adds a view as a child of this view.
   */

  View.prototype.addChild = function(view) {
    if (view.parent) {
      view.unsetParent();
    }
    this.children.push(view);
    return view.parent = this;
  };


  /*
  Sets the parent view.
   */

  View.prototype.setParent = function(parent) {
    if (this.parent) {
      this.unsetParent();
    }
    this.parent = parent;
    return this.parent.children.push(this);
  };


  /*
  Unsets the parent view.
   */

  View.prototype.unsetParent = function() {
    if (!this.parent) {
      return;
    }
    return this.parent.removeChild(this);
  };


  /*
  Parent and Child accessors.
   */

  View.prototype.hasParent = function() {
    return !!this.parent;
  };

  View.prototype.getParent = function() {
    return this.parent;
  };

  View.prototype.hasChildren = function() {
    return this.children.length;
  };

  View.prototype.getChildren = function() {
    return this.children;
  };

  View.prototype.hasChild = function(view) {
    return __indexOf.call(this.children, view) >= 0;
  };

  View.prototype.hasDescendant = function(view) {
    var child, _i, _len, _ref1;
    if (__indexOf.call(this.children, view) >= 0) {
      return true;
    }
    _ref1 = this.children;
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      child = _ref1[_i];
      if (child.hasDescendant(view)) {
        return true;
      }
    }
    return false;
  };

  View.prototype.removeChild = function(child) {
    this.children = without(this.children, child);
    return child.parent = null;
  };

  View.prototype.removeChildren = function(children) {
    var child, _i, _len, _ref1, _results;
    _ref1 = this.children;
    _results = [];
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      child = _ref1[_i];
      _results.push(this.removeChild(child));
    }
    return _results;
  };


  /*
  Gets the root view for a particular view. Can be itself.
   */

  View.prototype.root = function() {
    var root;
    root = this;
    while (root.hasParent()) {
      root = root.getParent();
    }
    return root;
  };


  /*
  Calls remove on all child views before removing itself
   */

  View.prototype.remove = function() {
    this.children.forEach(function(child) {
      return child.remove();
    });
    this.children = [];
    this.parent = null;
    this.off();
    this.undelegateEvents();
    return View.__super__.remove.call(this);
  };


  /*
  Calls trigger on the root() object with the namespace added, and also on
  itself without the namespace.
   */

  View.prototype.trigger = function() {
    var args;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    Backbone.View.prototype.trigger.apply(this, args);
    if (this.namespace) {
      args[0] = this.namespace + '.' + args[0];
    }
    if (this.parent) {
      return this.parent.trigger.apply(this.parent, args);
    }
  };

  return View;

})(Backbone.View);

module.exports = View;



},{"backbone":1,"underscore":1}]},{},[7])(7)
});