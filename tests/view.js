var View = require('../view')
var $ = require('jquery')

function makeEl () {
    return $('<div></div>')
}

function makeView (ViewClass) {
    return new ViewClass({
        el : makeEl()
    })
}

module.exports = function (test) {
    test('View instantiation', function (t) {
        t.plan(1)

        var ClassNameView = View.extend({
            className: 'foo'
        })
        var cnv = makeView(ClassNameView)
        t.ok(cnv.$el.hasClass('foo'), 'className is added to element')

        t.end()
    })

    test('Setting parent', function (t) {
        t.plan(3)

        var parent = makeView(View)
        var child = makeView(View)

        child.setParent(parent)

        t.equal(child.parent, parent, 'Child has parent')
        t.equal(parent.children[0], child, 'Parent has child')
        t.equal(parent.children.length, 1, 'Parent only has 1 child')

        t.end()
    })

    test('Adding children', function (t) {
        t.plan(4)

        var parent = makeView(View)
        var child = makeView(View)
        var oldParent = makeView(View)

        oldParent.addChild(child)
        parent.addChild(child)

        t.equal(child.parent, parent, 'Child has correct parent')
        t.equal(parent.children[0], child, 'Latest parent has child')
        t.equal(parent.children.length, 1, 'Latest parent has 1 child')
        t.equal(oldParent.children.length, 0, 'Old parent has 0 children')

        t.end()
    })

    test('Removing children', function (t) {
        t.plan(2)

        var parent = makeView(View)
        var child = makeView(View)

        parent.addChild(child)
        parent.removeChild(child)

        t.equal(parent.children.length, 0, 'Parent has no children')
        t.equal(child.parent, null, 'Child has no parent')

        t.end()
    })

    test('Unsetting parent', function (t) {
        t.plan(2)

        var parent = makeView(View)
        var child = makeView(View)

        child.setParent(parent)
        child.unsetParent()

        t.equal(child.parent, null, 'Child has no parent')
        t.equal(parent.children.length, 0, 'Parent has no children')

        t.end()
    })

    test('Descendant checking', function (t) {
        t.plan(4)

        var one = makeView(View)
        var two = makeView(View)
        var three = makeView(View)
        var four = makeView(View)

        one.addChild(two)
        two.addChild(three)

        t.notOk(one.hasDescendant(one), 'Self is not a descendant')
        t.ok(one.hasDescendant(two), 'Children are descendants')
        t.ok(one.hasDescendant(three), 'nth level grandchildren are descended')
        t.notOk(one.hasDescendant(four), 'Outside views are not descendants')

        t.end()
    })

    test('Getting root', function (t) {
        t.plan(2)

        var one = makeView(View)
        var two = makeView(View)
        var three = makeView(View)

        one.addChild(two)
        two.addChild(three)

        t.equal(one.root(), one, 'Root is its own root')
        t.equal(three.root(), one, 'Correct root for grandchild')

        t.end()
    })

    test('Removal', function (t) {
        t.plan(3)

        var $root = $('<div><span></span></div>').appendTo('body')
        var called = false
        var ChildView = View.extend({
            remove: function () {
                called = true
                View.prototype.remove.call(this)
            }
        })

        var parent = new View({ el: $root })
        var child = new ChildView({ el: $root.find('span'), parent: parent })

        parent.remove()

        t.ok(called, 'Child remove was called')
        t.equal(parent.children.length, 0, 'Children were removed from parent')
        t.equal(child.parent, null, 'Parents were unset')

        t.end()
    })

    test('Bubbling events', function (t) {
        t.plan(4)

        var parent = makeView(View)
        var foo = new View({ el: makeEl(), namespace: 'foo' })
        var bar = new View({ el: makeEl(), namespace: 'bar' })

        parent.addChild(foo)
        foo.addChild(bar)

        var count = 0
        parent.on('a', function () {
            count++
            t.equal(count, 1, 'Root only triggers once')
        })
        parent.trigger('a')

        parent.on('foo.b', function () {
            t.pass('Events bubble')
            t.pass('Namespace is added to events')
        })
        foo.trigger('b')

        parent.on('bar.c', function () {
            t.pass('Event bubble is not polluted by namespaces')
        })
        bar.trigger('c')
    })
}