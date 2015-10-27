/* Default grunt file configuration */
/* global module */

var collapse = require('bundle-collapser/plugin');

module.exports = function (grunt) {
    // Project configuration
    'use strict';

    // Get or Default environment
    var argEnv = grunt.option('env');
    if (argEnv === 'prod') {
        argEnv = 'prod';
    } else if (argEnv === 'dev') {
        argEnv = 'dev';
    } else {
        argEnv = 'local';
    }
    console.log('ENVIRONMENT: ', argEnv);

    // Set environment in config file
    grunt.file.write('src/config/env.json', '{"current":"' + argEnv + '"}');

    var deployment = grunt.file.readJSON('deployment.json');

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
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
        copy: {
            main: {
                cwd: 'pages/',
                src: '**',
                expand: true,
                dest: 'dist/'
            }
        },
        environments: {
            options: {
                local_path: 'dist',
                username: deployment.ec2.username,
                privateKey: require('fs').readFileSync(deployment.ec2.privateKeyPath),
                releases_to_keep: '3',
                current_symlink: 'v1',
                debug: true
            },
            dev1: {
                options: {
                    host: deployment.ec2.host1,
                    deploy_path: '/var/www/cdn.digitru.st/dev/'
                }
            },
            dev2: {
                options: {
                    host: deployment.ec2.host2,
                    deploy_path: '/var/www/cdn.digitru.st/dev'
                }
            },
            prod1: {
                options: {
                    host: deployment.ec2.host1,
                    deploy_path: '/var/www/cdn.digitru.st/prod'
                }
            },
            prod2: {
                options: {
                    host: deployment.ec2.host2,
                    deploy_path: '/var/www/cdn.digitru.st/prod'
                }
            },
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
    grunt.loadNpmTasks('grunt-ssh-deploy');

    grunt.event.on('watch', function (action, filepath, target) {
        grunt.log.writeln(target + ': ' + filepath + ' has ' + action);
    });

    // Register tasks
    grunt.registerTask('default', ['copy:main', 'browserify', 'strip_code', 'uglify', 'karma']);
    grunt.registerTask('nokarma', ['copy:main', 'browserify', 'strip_code', 'uglify']);

    // Deployment tasks
    if (argEnv === 'prod') {
        grunt.registerTask('deploy-node1', ['default', 'ssh_deploy:prod1']);
        grunt.registerTask('deploy-node2', ['default', 'ssh_deploy:prod2']);
    } else if (argEnv === 'dev') {
        grunt.registerTask('deploy-node1', ['default', 'ssh_deploy:dev1']);
        grunt.registerTask('deploy-node2', ['default', 'ssh_deploy:dev2']);
    } else {
        var deployMissingEnv = function () {
            grunt.log.error('***************************************************');
            grunt.log.error('**');
            grunt.log.error('** Error: This task is missing --env');
            grunt.log.error('** Fix: Only able to deploy --env prod or --env dev');
            grunt.log.error('** See the deployment tasks in Gruntfile.js');
            grunt.log.error('**');
            grunt.log.error('** DID NOT DEPLOY');
            grunt.log.error('**');
            grunt.log.error('***************************************************');
        };
        grunt.registerTask('deploy-node1', deployMissingEnv);
        grunt.registerTask('deploy-node2', deployMissingEnv);
    }

    /*
        NOTE: Run "grunt watch --env local" while developing for auto-building with local env setting
    */
};
