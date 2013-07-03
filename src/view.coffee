define([
    'backbone'
    'jquery'
    'underscore'

    'cs!src/decoratable'
], (
    Backbone
    $
    _

    Decoratable
) ->

    class View extends Backbone.View
        @::mixin(Decoratable)


        # Parent View
        parent: null

        # Child views, is initialised as an array
        children: null

        # The prefix to use for root view state change events
        namespace: ''

        # The initial state to change to after construction
        initialState: null

        # The current state of the view
        state: null

        # The previous state of the view
        priorState: null

        ###
        Ensure the classname is applied, then set the parent and children if any
        are passed in. Does the normal backbone constructor and then does the
        first state change.
        ###
        constructor: (options) ->


            @children = []
            @funcQueues = {}

            @decorateMethods(@decorators)

            if options.el then @ensureClass(options.el, options.className)
            if options.parent then @setParent(options.parent)
            if options.children?.length then @addChildren()

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
            view.setParent(@)

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
        root: ->
            root = @
            root = root.getParent() while root.hasParent()

            return root

        ###
        Iterates over each child view
        ###
        eachChild: (func) -> _.each(@children, func)

        ###
        Performs a map on all the child views
        ###
        mapChildren: (func) -> _.map(@children, func)

        ###
        Invokes the function 'funcName' on all child views.
        ###
        invokeChildren: (funcName, args...) ->
            return _.invoke(@children, funcName, args...)

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

            if success is false then return false

            pkg = from: @state, to: state, options: options
            @trigger('transition', pkg)
            @root().trigger(@namespace + '.transition', pkg)


            # Change state
            @priorState = @state
            @state = state

            if _.isFunction(@[@states[state]]) then @[@states[state]](options)

            pkg = state: @state, options: options
            @trigger('changestate', pkg)
            @root().trigger(@namespace + '.changestate', pkg)



            # Bind new events
            @undelegateEvents()
            @delegateEvents(@calcEvents(state))

            return true

        ###
        Sugar method for changeState
        ###
        become: (state) -> @changeState(state)

        ###
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
        ###
        calcTransition: (from, to) ->
            # Look for a specific transition first
            transition = _.findWhere(@transitions, from: from, to: to)

            matchState = (state, rule) ->
                unless rule then return false # null, empty string
                if state is rule then return true # 'loading' === 'loading'
                if rule is '*' then return true # 'Staight wildcard'

                # Starts with wildcard
                if rule[0] is '*'
                    excludes = rule.split('!').slice(1)

                    return not _.contains(excludes, '' + state)

                # No match
                return false



            # Go through in order, looking for a wildcard transition to match.
            unless transition
                transition = _.first(_.filter(@transitions, (t) ->
                    return matchState(from, t.from) and matchState(to, t.to)
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


        mixin: (Class) ->
            for key, value of Class
                @::[key] = value
)