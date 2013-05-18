Bam
=====

*B.A.M*

Introduction
------------

Bam is a library intended to aid in the development of webapps. It uses Backbone as a base for its classes, adding methods and classes for common tasks.

There are two core ideas to Bam; firstly that controllers for a webapp can be arranged in a tree-like data structure and secondly that views are finite state machines.

Each state is a verb saying what the view is doing, this verb corresponds to a method name to call once a state is changed. Also, each state can have its own events to apply.

Another guiding principle is that at a library level, every view will receive an element passed into the constructor, such that `this.el` already belongs inside the node of the parent view, or in the case of the root view, the node of the DOM. What this means is that without changing things, a view should always be able to assume its `el` property is in the DOM. A view can then choose to do what it wants to before filling that el, we just find that having the el in the DOM first prevents a whole range of cross-browser bugs to do with dimension calculation.

Usage
-----

#### Adding to the page

#### Examples

API
---

