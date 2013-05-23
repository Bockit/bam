{
    "baseUrl": ".",
    "name": "lib/almond-0.2.5",
    "findNestedDependencies": true,
    "include": ["cs!src/main"],
    "paths": {
        "coffee-script": "lib/coffee-script-1.6.2.min",
        "cs": "lib/require-cs-0.4.3",
        "backbone": "lib/backbone-1.0.0",
        "jquery": "lib/jquery-1.9.1",
        "underscore": "lib/underscore-1.4.4"
    },
    "shim": {
        "underscore": {
            "exports": "_"
        },
        "backbone": {
            "deps": ["underscore", "jquery"],
            "exports": "Backbone"
        }
    },
    "optimize": "none",
    "out": "build/bam.js",
    "exclude": ["coffee-script"],
    "stubModules": ["cs"],
    "wrap": {
        "startFile": "src/start.frag",
        "endFile": "src/end.frag"
    }
}