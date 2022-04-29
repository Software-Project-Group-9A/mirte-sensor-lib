/* TODO: cleanu-up tasks*/

var MIRTE_SENSOR_LIB = 'RosSensorLib';

module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        browserify: {
            dist: {
                src: ['src/RosSensorLib.js'],
                dest: 'build/' + MIRTE_SENSOR_LIB + '.js'
            }
        },
        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            files: [
                'Gruntfile.js',
                'src/**/*.js'
            ]
        },
        mochaTest: {
            test: {
                options: {
                    reporter: 'spec',
                    captureFile: 'build/report/mochaTest/results.txt',
                    noFail: false
                },
                src: ['test/**/*.js']
            }
        },
        uglify: {
            options: {
                report: 'min'
            },
            build: {
                src: 'build/' + MIRTE_SENSOR_LIB + '.js',
                dest: 'build/' + MIRTE_SENSOR_LIB + '.min.js'
            }
        },
        watch: {
            dev: {
                options: {
                    interrupt: true
                },
                files: [
                    'src/*.js',
                    'src/**/*.js'
                ],
                tasks: ['concat']
            },
            build_and_watch: {
                options: {
                    interrupt: true
                },
                files: [
                    'Gruntfile.js',
                    '.jshintrc',
                    'src/*.js',
                    'src/**/*.js'
                ],
                tasks: ['build']
            }
        },
        clean: {
            options: {
                force: true
            },
            doc: ['doc']
        },
        jsdoc: {
            doc: {
                src: [
                    'src/*.js',
                    'src/**/*.js'
                ],
                options: {
                    destination: 'doc'
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-jsdoc');
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-browserify');

    grunt.registerTask('test', ['mochaTest']);
    grunt.registerTask('dev', ['browserify', 'watch']);
    grunt.registerTask('build', ['browserify', 'jshint', 'uglify']);
    grunt.registerTask('build_and_watch', ['watch']);
    grunt.registerTask('doc', ['clean', 'jsdoc']);
};