Bam
=====

*B.A.M*

Introduction
------------

Bam is a library intended to aid in the development of webapps. It uses Backbone as a base for its classes, adding methods and classes for common tasks.

There are two core ideas to Bam; firstly that views for a webapp can be arranged in a tree-like data structure and secondly that views are finite state machines.

API
---

Each Model, Collection and View inherits everything from Backbone's Model, Collection and View.

#### Bam.View

A Bam View is a tree and, separately, a finite state machine. The tree helps with the heirarchy of components, and the finite state machine helps with transferring user interactions and data changes into interface actions.

#### Bam.Model

Models have everything a Backbone Model has, with a couple of utility functions for accessing models before and after them in a collection.


###### next()

If the model is in a collection, this will return the model at the index directl after the index of this model. I.e., if you are the 2nd model in a collection it will return the third.

If the model is not in a collection it will return `null`. If the model is the last model in a collection it will also return `null`.


###### prev()

`prev()` works the same as `next()`. The difference it just moves the other direction. If the model is the first in a collection then `prev()` will return `null`.


#### Bam.Collection

Collections hevae everything a Backbone Collection has, with a couple of utility functions for getting the models before and after other models in the collection.


###### before(model)

Gets the model before the model `model` in the collection. Ideally used in a collection with a comparator so there is some kind of sort order.

Returns `null` if the model doesn't exist in the collection or if the model is the first in the collection.


###### after(model)

Same as `before(model)` but looks for the model afterwards.

Returns `null` if the model doesn't exist in the collection or if the model is the last in the collection.


Usage
-----

#### Adding to the page

#### Examples

API
---


TODO
----

* Documentation
* BAM! logo
* Change from `eventPrefix` to `namespace`
