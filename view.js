// Generated by CoffeeScript 1.6.3
(function() {
  var Backbone, Decoratable, View, _,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __slice = [].slice;

  Backbone = require('backbone');

  _ = require('underscore');

  Decoratable = require('./decoratable.js');

  View = (function(_super) {
    __extends(View, _super);

    /*
    Inline functionality to mixin classes
    
    `@::mixin(ClassName)` is how you do it.
    */


    View.prototype.mixin = function(Class) {
      var key, value, _ref, _results;
      _ref = Class.prototype;
      _results = [];
      for (key in _ref) {
        value = _ref[key];
        _results.push(this[key] = value);
      }
      return _results;
    };

    View.prototype.mixin(Decoratable);

    View.prototype.parent = null;

    View.prototype.children = null;

    View.prototype.namespace = '';

    View.prototype.initialState = null;

    View.prototype.state = null;

    View.prototype.priorState = null;

    /*
    Ensure the classname is applied, then set the parent and children if any
    are passed in. Does the normal backbone constructor and then does the
    first state change.
    */


    function View(options) {
      var _ref, _ref1;
      this.children = [];
      this.funcQueue = [];
      this.decorateMethods(this.decorators);
      if (options.el) {
        this.ensureClass(options.el, options.className);
      }
      if (options.parent) {
        this.setParent(options.parent);
      }
      if ((_ref = options.children) != null ? _ref.length : void 0) {
        this.addChildren();
      }
      View.__super__.constructor.call(this, options);
      this.initialState = (_ref1 = options.initialState) != null ? _ref1 : this.initialState;
      this.changeState(this.initialState);
    }

    /*
    Used to ensure that the className property of the view is applied to an
    el passed in as an option.
    */


    View.prototype.ensureClass = function(el, className) {
      var existing, wanted, _ref;
      if (className == null) {
        className = this.className;
      }
      if (!className) {
        return;
      }
      wanted = (_ref = className != null ? className.split(/\s+/) : void 0) != null ? _ref : [];
      existing = el.className.split(/\s+/);
      return el.className = _.uniq(existing.concat(wanted)).join(' ');
    };

    /*
    Adds a list of views as children of this view.
    */


    View.prototype.addChildren = function(views, silent) {
      var _this = this;
      if (silent == null) {
        silent = false;
      }
      return _.each(views, function(view) {
        return _this.addChild(view, silent);
      });
    };

    /*
    Adds a view as a child of this view.
    */


    View.prototype.addChild = function(view, silent) {
      if (silent == null) {
        silent = false;
      }
      this.children.push(view);
      if (!silent) {
        return this.trigger('addchild', {
          view: view
        });
      }
    };

    /*
    Sets the parent element of the view.
    
    Not sure if this will be useful but why not?
    */


    View.prototype.setParent = function(parent, silent) {
      if (silent == null) {
        silent = false;
      }
      this.parent = parent;
      if (!silent) {
        this.trigger('setparent', {
          parent: parent
        });
      }
      return this.parent.addChild(this);
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

    View.prototype.removeChild = function(child) {
      return this.children = _.without(this.children, child);
    };

    View.prototype.removeChildren = function(children) {
      return this.children = _.difference(this.children, children);
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
    Iterates over each child view
    */


    View.prototype.eachChild = function(func) {
      return _.each(this.children, func);
    };

    /*
    Performs a map on all the child views
    */


    View.prototype.mapChildren = function(func) {
      return _.map(this.children, func);
    };

    /*
    Invokes the function 'funcName' on all child views.
    */


    View.prototype.invokeChildren = function() {
      var args, funcName;
      funcName = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      return _.invoke.apply(_, [this.children, funcName].concat(__slice.call(args)));
    };

    /*
    Calls trigger on the root() object with the namespace added, and also on
    itself without the namespace.
    */


    View.prototype.trigger = function() {
      var args, name;
      name = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      args.unshift(name);
      Backbone.View.prototype.trigger.apply(this, args.slice());
      args[0] = this.namespace + '.' + name;
      return Backbone.View.prototype.trigger.apply(this.root(), args.slice());
    };

    /*
    Calls remove on all child views before removing itself
    */


    View.prototype.remove = function() {
      this.invokeChildren('remove');
      this.children = [];
      this.parent = null;
      return View.__super__.remove.call(this);
    };

    /*
    Replaces trigger with a version that calls itself and then calls on root
    */


    /*
    Change state from one to another.
    
    First calls the transition method if it exists
    Fires the transition event
    
    Then changes the state, calling the state action method if it exists
    Fires the changestate event
    */


    View.prototype.changeState = function(state, options) {
      var pkg, success, trans, _ref,
        _this = this;
      trans = this.calcTransition(this.state, state);
      if (trans) {
        success = _.all(_.map(trans, function(t) {
          return (t != null ? t.call(_this, _this.state, state, options) : void 0) !== false;
        }));
      }
      if (success === false) {
        return false;
      }
      pkg = {
        from: this.state,
        to: state,
        options: options,
        view: this
      };
      this.trigger('transition', pkg);
      this.priorState = this.state;
      this.state = state;
      if (_.isFunction(this[(_ref = this.states) != null ? _ref[state] : void 0])) {
        this[this.states[state]](options);
      }
      pkg = {
        state: this.state,
        options: options,
        view: this
      };
      this.trigger('changestate', pkg);
      this.trigger('changestate.' + state, pkg);
      this.undelegateEvents();
      this.delegateEvents(this.calcEvents(state));
      this.processFuncQueue(this.funcQueue, this.state);
      return true;
    };

    /*
    Sugar method for changeState
    */


    View.prototype.become = function(state, options) {
      return this.changeState(state, options);
    };

    /*
    Given a state from and to, figure out what transition applies.
    
    First we look for a direct match transition, i.e.:
    
        from 'loading', to 'idle'
    
    If we don't get a match on that, we'll step through the list of
    transitions in order, looking for the first transition that matches.
    
    '*' matches any state including null for initial state change.
    
    '*!idle' will match anything, except idle. Exceptions can be chained
    like so: '*!idle!errored'. If you want to exclude a null state, you can
    still do '*!null' as Bam coerces states to strings before comparing them
    to wildcard exclusions.
    */


    View.prototype.calcTransition = function(from, to) {
      var key, t, transitions,
        _this = this;
      if (!this.transitions) {
        return null;
      }
      transitions = this.transitions[from + ' ' + to];
      if (!transitions) {
        key = _.chain(this.transitions).keys().filter(function(t) {
          var s;
          s = t.split(' ');
          return _this.matchStateRule(from, s[0]) && _this.matchStateRule(to, s[1]);
        }).first().value();
        transitions = this.transitions[key];
      }
      if (_.isFunction(transitions)) {
        return [transitions];
      }
      if (_.isString(transitions)) {
        return (function() {
          var _i, _len, _ref, _results;
          _ref = transitions.split(' ');
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            t = _ref[_i];
            _results.push(this[t]);
          }
          return _results;
        }).call(this);
      }
      if (_.isArray(transitions)) {
        return _.map(transition, function(t) {
          if (_.isFunction(t)) {
            return t;
          } else {
            return this[t];
          }
        });
      }
    };

    /*
    Matches a state with a state rule. Exact matches are true, * is true,
    in the case of *!foo!bar anything except foo or bar matches. You can
    have an unlimited number of exclusions.
    */


    View.prototype.matchStateRule = function(state, rule) {
      var excludes;
      if (state === null) {
        state = 'null';
      }
      if (state === rule) {
        return true;
      }
      if (rule === '*') {
        return true;
      }
      if (rule[0] === '*') {
        excludes = rule.split('!').slice(1);
        return !_.contains(excludes, '' + state);
      }
      return false;
    };

    /*
    Creates a new events object, from this.events and this.`state`_events
    */


    View.prototype.calcEvents = function(state) {
      var events;
      events = {};
      if (this.events) {
        events = _.extend(events, this.events);
      }
      if (state !== null) {
        if (this[state + '_events']) {
          events = _.extend(events, this[state + '_events']);
        }
      }
      return events;
    };

    /*
    Central point to add delayed functions to the function queue. Used when
    we want a method to have to wait for a state to be, or not be, to run.
    */


    View.prototype.addFuncToQueue = function(func, args, rule) {
      return this.funcQueue.push({
        func: func,
        args: args,
        rule: rule
      });
    };

    /*
    Goes through each function in the function queue, matching its state
    rule against the current state and runs it if appropriate. Running a
    a function from the function queue will remove it from the queue.
    */


    View.prototype.processFuncQueue = function(queue, state) {
      var fn, i, _results;
      i = 0;
      _results = [];
      while (i < queue.length) {
        if (this.matchStateRule(state, queue[i].rule)) {
          fn = queue.splice(i, 1)[0];
          _results.push(fn.func.apply(this, fn.args));
        } else {
          _results.push(i++);
        }
      }
      return _results;
    };

    /*
    Wraps a function to make it wait for a state before it executes. Does so
    by adding it to a queue
    */


    View.prototype.waitForState = function(func, state) {
      return function() {
        if (this.matchStateRule(this.state, state)) {
          return func.apply(this, arguments);
        }
        return this.addFuncToQueue(func, arguments, state);
      };
    };

    /*
    Waits for a state by adding to the funcQueue, but it will remove any
    previously queued versions of the decorated function. This means it will
    only execute the last queued decorated function call when the state rule
    becomes matched. If it is matched already, then it'll just execute
    immediately.
    */


    View.prototype.waitForStateDoOnce = function(func, state) {
      var queued;
      queued = null;
      return function() {
        var wrapped;
        if (this.matchStateRule(this.state, state)) {
          return func.apply(this, arguments);
        }
        if (queued !== null) {
          Array.remove(this.funcQueue, queued);
        }
        wrapped = function() {
          queued = null;
          return func.apply(this, arguments);
        };
        return queued = this.addFuncToQueue(wrapped, arguments, state) - 1;
      };
    };

    return View;

  })(Backbone.View);

  module.exports = View;

}).call(this);
