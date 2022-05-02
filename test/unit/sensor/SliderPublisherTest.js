const assert = require('assert');

// Sinon library for mocking
// Allows for fake timers, which might be useful in future testing
const sinon = require('sinon');

// JSDOM for simulating browser environment
var { JSDOM } = require('jsdom');
var { window } = new JSDOM(``, {});
//var { document } = window;

// Module to test
var SliderPublisher = require('../../../src/sensors/SliderPublisher.js');

// define JSDOM window in global scope, if not already defined
global.window = global.window || window;

// define dummy ROSLIB in global scope
global.ROSLIB = {
    Topic: function() {
        this.publish = function(msg) {}
    },
    Message: function(msg) {
        this.msg = msg
    }
}
describe("SliderPublisher", function() {
    describe("#constructor(topic slider)", function() {
        /* helper functions for checking whether correct error is raised */
        function expectInvalidSlider(error) {
            assert(error instanceof TypeError);
            assert(error.message === 'slider argument was not of type HTMLInputElement'
                || error.message === 'slider argument does not have type slider');

            return true;
        }

        /* test for slider verification */
        it('should reject an undefined slider', function() {
            assert.throws(
                () => {
                    new SliderPublisher(new ROSLIB.Topic(), undefined);
                },
                expectInvalidSlider
            );
        });
        it('should reject any slider argument that is not an HTML Input Element', function() {
            assert.throws(
                () => {
                    new SliderPublisher(new ROSLIB.Topic(), "not a button");
                },
                expectInvalidSlider
            );
        });
        it('should reject any slider argument that does not have field type set to slider', function() {
            assert.throws(
                () => {
                    new SliderPublisher(new ROSLIB.Topic(), "not a button");
                },
                expectInvalidSlider
            );
        });

        /* tests for topic verification */
        /* functionality should probably be moved into superclass SensorPublisher */
        // it('should reject an undefined topic', function() {
        //     assert.throws(
        //         () => {
        //             new ButtonPublisher(undefined, document.createElement('button'));
        //         },
        //         expectInvalidTopic
        //     );
        // });
        // it('should reject any topic argument that is not a ROSLIB.Topic instance', function() {
        //     assert.throws(
        //         () => {
        //             new ButtonPublisher('not a topic', document.createElement('button'));
        //         },
        //         expectInvalidTopic
        //     );
        // });

        // it('should accept a ROSLIB.Topic and an HTML Button as arguments', function() {
        //     var publisher;
        //     const button = document.createElement('button');

        //     assert.doesNotThrow(
        //         () => {
        //             publisher = new ButtonPublisher(new ROSLIB.Topic(), button);
        //         },
        //         (error) => {
        //             return false;
        //         }
        //     );

        //     assert.equal(publisher.button, button);
        // });
    })
});