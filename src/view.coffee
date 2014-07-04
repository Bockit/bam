Backbone = require('backbone')
_ = require('underscore')

Decoratable = require('./decoratable.js')

class View extends Backbone.View

    ###
    Inline functionality to mixin classes

    `@::mixin(ClassName)` is how you do it.
    ###
    mixin: (Class) ->
        for key, value of Class::
            @[key] = value

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
        @funcQueue = []

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
        if el.jQuery then return el.addClass(className)

        if not className then return
        wanted = className?.split(/\s+/) ? []

        switch typeof el.className
            when 'string'
                existing = el.className?.split(/\s+/) ? []
                el.className = _.uniq(existing.concat(wanted)).join(' ')
            when 'object'
                # SVG Element or child
                existing = el.className?.baseVal?.split(/\s+/) ? []
                el.className?.baseVal = _.uniq(existing.concat(wanted)).join(' ')

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

        @parent.addChild(@)

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
    Calls trigger on the root() object with the namespace added, and also on
    itself without the namespace.
    ###
    trigger: (name, args...) ->
        # Add name to args array
        args.unshift(name)

        # Trigger the local event
        Backbone.View::trigger.apply(@, args.slice())

        # Add namespace to the name in args array
        args[0] = @namespace + '.' + name

        # Trigger the root namespaced event
        Backbone.View::trigger.apply(@root(), args.slice())


    ###
    Calls remove on all child views before removing itself
    ###
    remove: ->
        @invokeChildren('remove')
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
        trans = @calcTransition(@state, state)

        if trans
            success = _.all(_.map(trans, (t) =>
                return t?.call(@, @state, state, options) isnt false
            ))

        if success is false then return false

        pkg = from: @state, to: state, options: options, view: @
        @trigger('transition', pkg)

        # Change state
        @priorState = @state
        @state = state

        if _.isFunction(@[@states?[state]]) then @[@states[state]](options)

        pkg = state: @state, options: options, view: @
        @trigger('changestate', pkg)
        @trigger('changestate.' + state, pkg)

        # Bind new events
        @undelegateEvents()
        @delegateEvents(@calcEvents(state))

        # Run any queued functions
        @processFuncQueue(@funcQueue, @state)

        return true

    ###
    Sugar method for changeState
    ###
    become: (state, options) -> @changeState(state, options)

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
        unless @transitions then return null
        # Look for a specific transition first
        transitions = @transitions[from + ' ' + to]
        # Go through in order, looking for a wildcard transition to match.
        unless transitions
            key = _.chain(@transitions)
                .keys()
                .filter((t) =>
                    s = t.split(' ')
                    return @matchStateRule(from, s[0]) and
                        @matchStateRule(to, s[1])
                )
                .first()
                .value()

            transitions = @transitions[key]

        # Allow functions, space separated strings pointing to functions on
        # self, arrays of functions, and arrays of strings pointing to
        # functions on self.
        if _.isFunction(transitions) then return [transitions]
        if _.isString(transitions)
            return (@[t] for t in transitions.split(' '))
        if _.isArray(transitions)
            return _.map(transition, (t) ->
                return if _.isFunction(t) then t else @[t]
            )

    ###
    Matches a state with a state rule. Exact matches are true, * is true,
    in the case of *!foo!bar anything except foo or bar matches. You can
    have an unlimited number of exclusions.
    ###
    matchStateRule: (state, rule) ->
        if state is null then state = 'null'
        if state is rule then return true # 'loading' === 'loading'
        if rule is '*' then return true # 'Staight wildcard'

        # Starts with wildcard
        if rule[0] is '*'
            excludes = rule.split('!').slice(1)

            return not _.contains(excludes, '' + state)

        # No match
        return false

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

    ###
    Central point to add delayed functions to the function queue. Used when
    we want a method to have to wait for a state to be, or not be, to run.
    ###
    addFuncToQueue: (func, args, rule) ->
        return @funcQueue.push(func: func, args: args, rule: rule)

    ###
    Goes through each function in the function queue, matching its state
    rule against the current state and runs it if appropriate. Running a
    a function from the function queue will remove it from the queue.
    ###
    processFuncQueue: (queue, state) ->
        i = 0
        while i < queue.length
            if @matchStateRule(state, queue[i].rule)
                fn = queue.splice(i, 1)[0]
                fn.func.apply(@, fn.args)
            else
                i++

    ###
    Wraps a function to make it wait for a state before it executes. Does so
    by adding it to a queue
    ###
    waitForState: (func, state) ->
        return ->
            if @matchStateRule(@state, state)
                return func.apply(@, arguments)

            @addFuncToQueue(func, arguments, state)

    ###
    Waits for a state by adding to the funcQueue, but it will remove any
    previously queued versions of the decorated function. This means it will
    only execute the last queued decorated function call when the state rule
    becomes matched. If it is matched already, then it'll just execute
    immediately.
    ###
    waitForStateDoOnce: (func, state) ->
        queued = null
        return ->
            if @matchStateRule(@state, state)
                return func.apply(@, arguments)

            if queued isnt null then @funcQueue = _.without(@funcQueue, queued)

            wrapped = ->
                queued = null
                func.apply(@, arguments)

            queued = @addFuncToQueue(wrapped, arguments, state) - 1

module.exports = View