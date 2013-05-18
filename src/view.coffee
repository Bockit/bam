define(['backbone', 'jquery'], (Backbone, $) ->

    class View extends Backbone

        parent: null
        children: []
        eventPrefix: ''

        constructor: (options) ->
            if options.el then @ensureClass(options.el, options.className)
            if options.parent then @setParent(options.parent)
            if options.children?.length then @addChildren()

            super(options)

            # Ensure classnames are applied when elements are passed in rather
            # than created on the fly
            if options.el and @className
                (@$el.addClass(c) for c in @className.split(' '))

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
            @children.add(view)

            unless silent then @trigger(@eventPrefix + 'addchild', view)

        ###
        Sets the parent element of the view.

        Not sure if this will be useful but why not?
        ###
        setParent: (parent, silent=false) ->
            @parent = parent

            unless silent then @trigger(@eventPrefix + 'setparent', parent)

        ###
        Parent and Child accessors.
        ###
        hasParent: -> !!@parent
        getParent: -> @parent
        hasChildren: -> @children.length
        getChildren: -> @children

        each: (func) -> _.each(@children, func)
        
        ###
        Invokes the function 'funcName' on all child views.
        ###
        invoke: (funcName) -> _.invoke(@children, funcName)

        ###
        Calls remove on all child views before removing itself
        ###
        remove: -> 
            @invoke('remove')
            super()
)