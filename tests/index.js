var test = require('tape')

// Working with Backbone and jQuery in a commonjs environment is fun
require('../backbone').$ = require('jquery')

require('./collection')(test)
require('./model')(test)
require('./router')(test)
require('./view')(test)