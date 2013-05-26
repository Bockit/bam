{
    "baseUrl": ".",
    "name": "lib/require-2.1.6",
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
    },
    "optimize": "none",
    "out": "build/bam-amd.js",
    "exclude": ["coffee-script", "jquery", "backbone", "underscore"],
    "stubModules": ["cs"],
    "wrap": {
        "startFile": "src/fragments/standalone-start.frag",
        "endFile": "src/fragments/standalone-end.frag"
    }
}