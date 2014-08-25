Bam
=====

*B.A.M*

Introduction
------------

Bam is an extension to Backbone. It extends the core Backbone classes with common utility functions and a some new functionality:

* View heirarchy
    * Parent/child relationships
    * Event bubbling
* Derived values in models

Over time, Bam's philosophy has changed from all extensions you may want to only those extensions that can't be achieved as standalone modules.

When reading the rest, remember that you get everything else Backbone gives you for each class.

View Heirarchy
--------------

The view heirarchy allows traversal and event bubbling. A view can be added as a parent or a child.

``` javascript
var one = new View()
var two = new View()

view1.setParent(view2)
```

``` javascript
var one = new View()
var two = new View()
view2.addChild(view1)
```

Adding a child view will automatically set the child's parent view to yourself. Similarly, setting a parent view will automatically add yourself as a child of the parent.

You can construct a view with a parent:

``` javascript
var one = new View()
var two = new View({ parent: one })
```

Also with children:

``` javascript
var two = new View()
var one = new View({ children: [ two ] })
```

#### Traversal

You can access parents and children with simple traversal functions.

``` javascript
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

```
var root = new View()
var child = new View({ parent: root })
child.trigger('foo') // 'foo' will also trigger on the parent view.
```

If you have concerns about event names clashing, you add the namespace property to your views either at construction with the options object or at definition with the View prototype.

This helps reduce the need to propagate events manually, and also gives you a common event bus for all views within a view tree. Even if two views belong on completely separate branches, they share the same root element.

Derived Values
--------------

Derived values in models let you define model properties that exist as a result of passing other values through a function. They are accessed with the key function like other Model attributes and trigger change events when their dependencies change.

#### Definition
