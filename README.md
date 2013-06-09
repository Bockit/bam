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


#### Bam.Model



#### Bam.Collection

**`before(model)`**  
Gets the model before the model `model` in the collection. Ideally used in a collection with a comparator so there is some kind of sort order.

Returns null if the model doesn't exist in the collection or if the model is the first in the collection.

**`after(model)`**
Same as `before(model)` but looks for the model afterwards.

Returns null if the model doesn't exist in the collection or if the model is the last in the collection.

Usage
-----

#### Adding to the page

#### Examples

API
---

