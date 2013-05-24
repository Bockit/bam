define(['backbone', 'jquery', 'underscore'], (Backbone, $, _) ->

    class View extends Backbone.View

        parent: null
        children: null
        eventPrefix: ''

        initialState: null
        state: null
        priorState: null

        events: null
        # setup_events: null

        # states:
        #     'setup': 'setup'

        # transitions:
        #     from: null, to: setup, func: 'nullToSetup'


        ###
        Ensure the classname is applied, then set the parent and children if any
        are passed in. Does the normal backbone constructor and then does the
        first state change.
        ###
        constructor: (options) ->
            @children = []

            if options.el then @ensureClass(options.el, options.className)
            if options.parent then @setParent(options.parent)
            if options.children?.length then @addChildren()

            @root = @getRoot()

            super(options)

            @initialState = options.initialState ? @initialState
            @changeState(@initialState)

        ###
        Used to ensure that the className property of the view is applied to an
        el passed in as an option.
        ###
        ensureClass: (el, className=@className) ->
            $(el).addClass(className)

        ###
        Adds a list of views as children of this view.
        ###
        addChildren: (views, silent=false) ->
            _.each(views, (view) => @addChild(view, silent))

        ###
        Adds a view as a child of this view.
        ###
        addChild: (view, silent=false) ->
            @children.push(view)

            unless silent then @trigger('addchild', view: view)

        ###
        Sets the parent element of the view.

        Not sure if this will be useful but why not?
        ###
        setParent: (parent, silent=false) ->
            @parent = parent

            unless silent then @trigger('setparent', parent: parent)

        ###
        Parent and Child accessors.
        ###
        hasParent: -> !!@parent
        getParent: -> @parent
        hasChildren: -> @children.length
        getChildren: -> @children
        removeChild: (child) -> @children = _.without(@children, child)
        removeChildren: (children) ->
            @children = _.difference(@children, children)

        ###
        Gets the root view for a particular view. Can be itself.
        ###
        getRoot: ->
            root = @
            root = root.getParent() while root.hasParent()

            return root

        ###
        Iterates over each child view
        ###
        each: (func) -> _.each(@children, func)

        ###
        Performs a map on all the child views
        ###
        map: (func) -> _.map(@children, func)

        ###
        Invokes the function 'funcName' on all child views.
        ###
        invoke: (funcName) -> _.invoke(@children, funcName)

        ###
        Calls remove on all child views before removing itself
        ###
        remove: ->
            @invoke('remove')
            @children = []
            @parent = null
            super()

        ###
        Change state from one to another.

        First calls the transition method if it exists
        Fires the transition event

        Then changes the state, calling the state action method if it exists
        Fires the changestate event
        ###
        changeState: (state, options) ->
            # Transition
            tran = @calcTransition(@state, state)

            if tran and _.isFunction(@[tran.func])
                success = @[tran.func](@state, state, options)
            else
                success = true

            if sucess is false then return false

            @root.trigger(@eventPrefix + 'transition', {
                from: @state
                to: state
                options: options
            })


            # Change state
            @priorState = @state
            @state = state

            if _.isFunction(@[@states[state]]) then @[@states[state]](options)

            @root.trigger(@eventPrefix + 'changestate', {
                state: @state
                options: options
            })


            # Bind new events
            @undelegateEvents()
            @delegateEvents(@calcEvents(state))

            return true

        become: (state) -> @changeState(state)

        calcTransition: (from, to) ->
            # Look for a specific transition first
            transition = _.findWhere(@transitions, from: from, to: to)

            # Go through in order, looking for a wildcard transition to match.
            unless transition
                transition = _.first(_.filter(@transitions, (t) ->
                    return (t.from is from or t.from is '*') and
                           (t.to is to or t.to is '*')
                ))

            return transition

        ###
        Creates a new events object, from this.events and this.`state`_events
        ###
        calcEvents: (state) ->
            events = {}
            if @events then events = _.extend(events, @events)
            unless state is null
                if @[state + '_events']
                    events = _.extend(events, @[state + '_events'])

            return events
)