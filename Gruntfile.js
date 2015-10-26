/* Default grunt file configuration */
/* global module */

var collapse = require('bundle-collapser/plugin');

module.exports = function (grunt) {
    // Project configuration
    'use strict';

    // Get or Default environment
    var argEnv = grunt.option('env');
    if (argEnv === 'local') {
        argEnv = 'local';
    } else if (argEnv === 'dev') {
        argEnv = 'dev';
    } else if (argEnv === 'funky') {
        argEnv = 'funky';
    } else {
        argEnv = 'prod';
    }

    console.log('ENVIRONMENT: ', argEnv);

    // Set environment in config file
    grunt.file.write('src/config/env.json', '{"current":"' + argEnv + '"}');

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        deployment: grunt.file.readJSON('deployment-config.json'),
        watch: {
            js: {
                files: ['src/**'],
                tasks: ['browserify', 'strip_code', 'uglify'],
                options: {
                    atBegin: true
                }
            },
            html: {
                files: ['pages/**'],
                tasks: ['copy:main'],
                options: {
                    atBegin: true
                }
            }
        },
        uglify: {
            my_target: {
                files: {
                    'dist/digitrust.min.js': ['<%= browserify.client.dest %>'],
                    'dist/digitrust-server.min.js': ['<%= browserify.server.dest %>']
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
            client: {
                options: {
                    debug: false,
                    plugin: [collapse]
                },
                src: ['src/client.js'],
                dest: 'dist/digitrust.js'
            },
            server: {
                options: {
                    debug: false,
                    plugin: [collapse]
                },
                src: ['src/server.js'],
                dest: 'dist/digitrust-server.js'
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
        },
        aws_s3: {
            options: {
                accessKeyId: '<%= deployment.AWSAccessKeyId %>',
                secretAccessKey: '<%= deployment.AWSSecretKey %>',
                region: 'us-west-2'
            },
            deploy: {
                options: {
                    bucket: '<%= deployment.bucket %>',
                    access: 'public-read',
                    params: {
                        CacheControl: 'max-age=86400, public'
                    }
                },
                files: [
                    {
                        expand: true,
                        cwd: 'dist',
                        src: ['digitrust.js', 'digitrust.min.js', 'digitrust-server.js', 'digitrust-server.min.js'],
                        dest: argEnv + '/v1/'
                    },
                    {
                        expand: true,
                        cwd: 'pages',
                        src: ['dt.html', 'info.html', 'redirect.html', 'p3p.xml', 'p3p_full.xml'],
                        dest: argEnv + '/v1/'
                    }
                ]
            }
        },
        copy: {
            main: {
                cwd: 'pages/',
                src: '**',
                expand: true,
                dest: 'dist/'
            }
        }
    });

    // Load plugins
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-strip-code');
    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-jsdoc');
    grunt.loadNpmTasks('grunt-aws-s3');

    grunt.event.on('watch', function (action, filepath, target) {
        grunt.log.writeln(target + ': ' + filepath + ' has ' + action);
    });

    // Register tasks
    grunt.registerTask('default', ['copy:main', 'browserify', 'strip_code', 'uglify', 'karma']);
    grunt.registerTask('nokarma', ['copy:main', 'browserify', 'strip_code', 'uglify']);
    // Deploy to prod: grunt deploy --env prod
    // Deploy to dev: grunt deploy
    grunt.registerTask('deploy', ['default', 'aws_s3']);
    // NOTE: Run "grunt watch" while developing for auto-building
};
