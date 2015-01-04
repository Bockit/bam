var Backbone = require('./backbone')
var _ = require('underscore')
var without = _.without
var difference = _.difference
var indexOf = _.indexOf

module.exports = Backbone.View.extend({
    // Parent View
    parent: null

    // Child views, is initialised as an array
  , children: null

    // The prefix to use for root view state change events
  , namespace: ''

    /**
     * Ensure the classname is applied, then set the parent and children if any
     * are passed in. Does the normal backbone constructor and then does the
     * first state change.
     */
  , constructor: function (options) {
        options = options || {}
        this.children = []

        if (options.className) this.className = options.className
        if (options.namespace) this.namespace = options.namespace
        if (options.el) this._ensureClass(options.el)
        if (options.parent) this.setParent(options.parent)
        if (options.children && options.children.length) {
            this.addChildren(options.children)
        }

        return Backbone.View.prototype.constructor.call(this, options)
    }

    /**
     * Used to ensure that the className property of the view is applied
     * to an el passed in as an option.
     */
  , _ensureClass: function (el, className) {
        className = className || this.className
        Backbone.$(el).addClass(className)
    }

    /**
     * Adds a list of views as children of this view.
     */
  , addChildren: function (views) {
        for (var i = 0; i < views.length; i++) {
            this.addChild(views[i])
        }
    }

    /**
     * Adds a view as a child of this view.
     */
  , addChild: function (view) {
        if (view.parent) view.unsetParent()
        this.children.push(view)
        view.parent = this
    }

    /**
     * Sets the parent view.
     */
  , setParent: function (parent) {
        if (this.parent) this.unsetParent()
        this.parent = parent
        this.parent.children.push(this)
    }

    /**
     * Unsets the parent view
     */
  , unsetParent: function () {
        if (!this.parent) return
        this.parent.removeChild(this)
    }

    /**
     * Parent and Child accessors.
     */
  , hasParent: function () {
        return !!this.parent
    }
  , getParent: function () {
        return this.parent
    }

  , hasChildren: function () {
        return !!this.children.length
    }
  , getChildren: function () {
        return this.children
    }

  , hasChild: function (view) {
        return indexOf(this.children, view) >= 0
    }

  , hasDescendant: function (view) {
        // First check for direct descendants
        if (this.hasChild(view)) return true

        for (var i = 0; i < this.children.length; i++) {
            if (this.children[i].hasDescendant(view)) return true
        }

        return false
    }

    /**
     * Removing children
     */
  , removeChild: function (child) {
        this.children = without(this.children, child)
        child.parent = null
    }

  , removeChildren: function (children) {
        for (var i = 0; i < children.length; i++) {
            this.removeChild(children[i])
        }
    }

    /**
     * Gets the root view for a particular view. Can be itself.
     */
  , root: function () {
        var root = this
        while (root.hasParent()) {
            root = root.getParent()
        }
        return root
    }

    /**
     * Calls remove on all child views before removing itself
     */
  , remove: function () {
        this.children.forEach(function (child) {
            child.remove()
        })
        this.children = []
        this.parent = null
        this.off()
        this.undelegateEvents()
        Backbone.View.prototype.remove.call(this)
    }

    /**
     * Calls trigger on the root() object with the namespace added, and also on
     * itself withou the namespace.
     */
  , trigger: function () {
        var args = Array.prototype.slice.call(arguments)

        // Trigger the local event
        Backbone.View.prototype.trigger.apply(this, args)

        // Add namespace to the name in args array
        if (this.namespace) args[0] = this.namespace + '.' + args[0]

        // Trigger the root namespaced event
        if (this.parent) this.parent._bubbleTrigger.apply(this.parent, args)
    }

    /**
     * Used when bubbling to prevent namespace pollution
     * as it goes up the chain.
     */
  , _bubbleTrigger: function() {
        var args = Array.prototype.slice.call(arguments)
        Backbone.View.prototype.trigger.apply(this, args)
        if (this.parent) this.parent._bubbleTrigger.apply(this.parent, args)
    }
})