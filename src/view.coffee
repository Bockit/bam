Backbone = require('backbone')
{ without, difference } = require('underscore')

class View extends Backbone.View

    # Parent View
    parent: null

    # Child views, is initialised as an array
    children: null

    # The prefix to use for root view state change events
    namespace: ''

    ###
    Ensure the classname is applied, then set the parent and children if any
    are passed in. Does the normal backbone constructor and then does the
    first state change.
    ###
    constructor: (options) ->
        @children = []

        if options.className then @className = options.className
        if options.namespace then @namespace = options.namespace
        if options.el then @_ensureClass(options.el)
        if options.parent then @setParent(options.parent)
        if options.children?.length then @addChildren(options.children)

        super(options)

    ###
    Used to ensure that the className property of the view is applied to an
    el passed in as an option.
    ###
    _ensureClass: (el, className=@className) ->
        Backbone.$(el).addClass(className)

    ###
    Adds a list of views as children of this view.
    ###
    addChildren: (views) ->
        for view in views
            @addChild(view)

    ###
    Adds a view as a child of this view.
    ###
    addChild: (view) ->
        if view.parent then view.unsetParent()
        @children.push(view)
        view.parent = @

    ###
    Sets the parent view.
    ###
    setParent: (parent) ->
        if @parent then @unsetParent()
        @parent = parent
        @parent.children.push(@)

    ###
    Unsets the parent view.
    ###
    unsetParent: ->
        return unless @parent
        @parent.removeChild(@)

    ###
    Parent and Child accessors.
    ###
    hasParent: -> !!@parent
    getParent: -> @parent

    hasChildren: -> @children.length
    getChildren: -> @children

    hasChild: (view) -> view in @children
    hasDescendant: (view) ->
        # First check for direct descendants
        if view in @children then return true

        for child in @children
            if child.hasDescendant(view) then return true

        return false

    removeChild: (child) ->
        @children = without(@children, child)
        child.parent = null

    removeChildren: (children) ->
        for child in @children
            @removeChild(child)

    ###
    Gets the root view for a particular view. Can be itself.
    ###
    root: ->
        root = @
        root = root.getParent() while root.hasParent()
        return root

    ###
    Calls remove on all child views before removing itself
    ###
    remove: ->
        @children.forEach((child) -> child.remove())
        @children = []
        @parent = null
        @off()
        @undelegateEvents()
        super()

    ###
    Calls trigger on the root() object with the namespace added, and also on
    itself without the namespace.
    ###
    trigger: (args...) ->
        # Trigger the local event
        Backbone.View::trigger.apply(@, args)

        # Add namespace to the name in args array
        if @namespace then args[0] = @namespace + '.' + args[0]

        # Trigger the root namespaced event
        if @parent then @parent.trigger.apply(@parent, args)

module.exports = View