/* Default grunt file configuration */
/* global module */

var collapse = require('bundle-collapser/plugin');

module.exports = function (grunt) {
    // Project configuration
    'use strict';
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        watch: {
            js: {
                files: ['src/**'],
                tasks: ['browserify', 'uglify']
            }
        },
        uglify: {
            my_target: {
                files: {
                    'dist/digitrust.min.js': ['<%= browserify.production.dest %>']
                }
            }
        },
        jsdoc: {
            dist: {
                src: ['src/modules/*.js'],
                options: {
                    destination: 'doc'
                }
            }
        },
        browserify: {
            production: {
                options: {
                    debug: false,
                    plugin: [collapse]
                },
                src: ['src/main.js'],
                dest: 'dist/digitrust.js'
            },
        },
        strip_code: {
            options: {
                start_comment: '__start-test-code__',
                end_comment: '__end-test-code__'
            },
            src: {
                src: 'dist/*.js'
            }
        },
        karma: {
            integration: {
                configFile: 'karma.conf.js',
                singleRun: true,
                browsers: ['PhantomJS']
            }
        }
    });

    // Load plugins
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-strip-code');
    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-jsdoc');

    // Register tasks
    grunt.registerTask('default', ['browserify', 'strip_code', 'uglify', 'karma']);
    grunt.registerTask('nokarma', ['browserify', 'strip_code', 'uglify']);
};
