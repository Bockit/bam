Bam
=====

![Build status](https://api.travis-ci.org/Bockit/bam.svg?branch=master)

Bam is automatically tested in IE9-10, and the latest versions of other browsers. It has been used in production in IE7, IE8 and many previous versions of other browsers.

Introduction
------------

Bam is an extension to Backbone. It extends the core Backbone classes with common utility functions and a some new functionality:

* View heirarchy
    * Parent/child relationships
    * Event bubbling
* Derived values in models
* Typecasting in models
* Improving the router
    * Request objects to callbacks
    * Named params
    * Query string parsing
    * Reverse routing

Over time, Bam's philosophy has changed from all extensions you may want to only those extensions that can't be achieved as standalone modules.

Beyond the new functionality and utility methods added to the classes they still function the same as the original Backbone classes. With the exception of the Router. 

Usage
-----

You can install from npm and use whatever commonjs build system you'd like to import it. Browserify is recommended because it requires `querystring`.

`npm install bamjs`

If you're not using npm a [UMD module is available][umd_module].

View Heirarchy
--------------

The view heirarchy allows traversal and event bubbling. A view can be added as a parent or a child.

```javascript
var one = new View()
var two = new View()

view1.setParent(view2)
```

```javascript
var one = new View()
var two = new View()
view2.addChild(view1)
```

Adding a child view will automatically set the child's parent view to yourself. Similarly, setting a parent view will automatically add yourself as a child of the parent.

You can construct a view with a parent:

```javascript
var one = new View()
var two = new View({ parent: one })
```

Also with children:

```javascript
var two = new View()
var one = new View({ children: [ two ] })
```

#### Traversal

You can access parents and children with simple traversal functions.

```javascript
one.hasParent() //Boolean: If you have a parent
one.getParent() //View: Your parent
one.hasChildren() //Boolean: If you have any children
one.getChildren() //Array: All your children
one.hasChild(two) //Boolean: if any child is the view
one.hasDescendant(two) //Boolean: if any child or child's child is the view
two.root() //View: your root view, or youself if you are the root view
```

#### Removal

To help with cleanup, `view.remove()` will do a depth-first traversal calling remove on all children and grandchildren before finally removing itself.

#### Event Bubbling

Events triggered on one view bubble through each parent view before finally stopping on root.

```javascript
var root = new View()
var child = new View({ parent: root })
child.trigger('foo') // 'foo' will also trigger on the parent view.
```

If you have concerns about event names clashing you can add the namespace property to your views either at construction with the options object or at definition with the View prototype.

This helps reduce the need to propagate events manually, and also gives you a common event bus for all views within a view tree. Even if two views belong on completely separate branches, they share the same root element.

Model Derived Values
--------------------

Models can define derived values. Derived values are model properties that exist as a result of passing other values through a function. They are accessed with the get function like other Model attributes and trigger change events when their dependencies change.

#### Definition

Edit `model.derived` to define derived values.

```javascript
var MyModel = Model.extend({
    derived: {
        'foo': {
            deps: [ 'bar', 'baz' ],
            value: function(bar, baz) {
                return 'bar' + ', ' + 'baz' + '!'
            }
        }
    }
})
```

### Access

Derived values cannot be set, only accessed. All dependencies are passed in-order to the value function per calculation and if any of the are changed, a change event will also be fired for the derived value.

Using the definition from before:

```javascript
var m = new MyModel({
    bar: 'Hello',
    baz: 'world'
})

m.get('foo') //'Hello, world!'

m.on('change:foo', function(value) {
    console.log(value)
})

m.set('baz', 'developer') //
```

When `baz` is set to `'developer'`, the `change:foo` event fires and `'Hello, developer!'` will be logged to the console.

Model Casting
-------------

When setting values Bam Models will first check if the key exists in a defined casts object. If it does it'll apply the appropriate cast to the value before setting it.

```javascript
var MyModel = Model.extend({
    cast: {
        foo: 'string',
        bar: 'int',
        baz: 'date'
    }
})

var m = new MyModel({
    foo: true,
    bar: 4.11,
    baz: '2012-01-01'
})

m.get('foo') //'true'
m.get('bar') //4
m.get('baz') //Sun Jan 01 2012 11:00:00 GMT+1100 (EST)
```

Bam provides the following defaults: `'string'`, `'int'`, `'number'`, `'date'` and `'boolean'`. You can provide your own by setting the cast value to a function which takes a value and returns a new value.

```javascript
var MyModel = Model.extend({
    cast: {
        foo: function(v) {
            return 42
        }
    }
})
```

In this example, any value that's set as `'foo'` will be turned into the Number 42.

Router Changes
--------------

The goals for the router were to:

* Add named route params
* Automatically handle query string parameters
* Allow reverse routing

Because this model doesn't lend itself to the style of callbacks you normally get in Backbone, i.e., parameters are applied to the callback in-order Bam will instead call your router callbacks with a request object as the single argument.

Request objects are just normal javascript objects. If you had a route named `'foo'` with definition `:foo(/:bar)/:baz`:

```javascript
var MyRouter = Router.extend({
    initialize: function() {
        this.route(':foo(/:bar)/:baz', 'foo', this.fooBar)
    },
    fooBar: function(req) {
        // Do something with req
    }
})
```

and it was matched by the fragment `one/two?name=bam` then you'd get the following request object as the callback to `MyRouter.fooBar`:

```javascript
{
    route: ':foo(/:bar)/:baz',
    fragment: 'one/two?name=bam',
    name: 'foo',
    values: [ 'one', 'two' ],
    params: {
        foo: 'one',
        bar: null,
        baz: 'two'
    },
    query: {
        name: 'bam'
    }
}
```

* `route`: The route that was matched.
* `fragment`: The fragment that was matched to the route.
* `name`: The name of the route.
* `values`: The values of the params in the order they appeared in the fragment.
* `params`: The route params that were matched as `key: value` pairs of the object. If an optional param wasn't matched, it will be `null`.
* `query`: The query string parsed to an object. If no query was specified then it will be an empty object.

The request object will be passed to the route callback as its only argument.

### Reverse routing

Bam routes have a method called `reverse` which takes a route name and a request-like object and will return a fragment that would match that route and request object.

```javascript
var MyRouter = Router.extend({
    initialize: function() {
        this.route(':foo(/:bar)/:baz', 'foo', this.fooBar)
    },
    fooBar: function(req) {
        // Do something with req
    }
})

var r = new MyRouter()
r.reverse('foo', {
    params: {
        foo: 'one'
        baz: 'two'
    },
    query: {
        name: 'bam'
    }
})// 'one/two?name=bam'
```

### Regex Routes

If you use regex routes, the names of params will be their indexes in the values array.

You cannot reverse regex routes.

### Routes property

In normal backbone Routers you can define routes as a property of your Router class. Because the name is important for reverse routing this has been disabled in Bam Routers.

Api
---

See the [wiki][wiki] for the full API.

Changelog
---------
* **2.0.4** - Collection.all now correctly returns the models array
* **2.0.3** - Fixed bug in reverse routing introduced by CS -> JS
* **2.0.2** - Fixed bug in reverse routing introduced by CS -> JS

* **2.0.0** - Subtle breaking changes made during the port from CS to JS. Not catching errors and returning null when cast functions in models throw errors.

[wiki]: https://github.com/bockit/bam/wiki
[umd_module]: https://github.com/bockit/bam/wiki