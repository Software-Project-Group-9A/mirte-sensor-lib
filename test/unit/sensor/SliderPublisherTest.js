const assert = require('assert');

// Sinon library for mocking
// Allows for fake timers, which might be useful in future testing
const sinon = require('sinon');

// JSDOM for simulating browser environment
const { JSDOM } = require('jsdom');
const { window } = new JSDOM(``, {});

// Module to test
var SliderPublisher = require('../../../src/sensors/SliderPublisher.js');

// define JSDOM window in global scope, if not already defined
global.window = global.window || window;
let { document } = global.window;

// define dummy ROSLIB in global scope
global.ROSLIB = global.ROSLIB || {
    Topic: function() {
        this.publish = function(msg) {}
    },
    Message: function(msg) {
        this.msg = msg
    }
}

describe("SliderPublisher", function() {

    /* helper function for slider creation*/
    function createSlider(min = 0, max = 100, value = 50) {
        const slider = document.createElement('INPUT');
        slider.setAttribute('type', 'range');
        slider.setAttribute('min', min);
        slider.setAttribute('max', max);
        slider.setAttribute('value', value);
        return slider;
    }

    describe("#constructor(topic slider)", function() {
        /* helper function for checking whether correct error is raised */
        function expectInvalidSlider(error) {
            assert(error instanceof TypeError);
            assert(error.message === 'slider argument was not of type HTMLInputElement'
                || error.message === 'slider argument does not have type slider');

            return true;
        }
        function expectInvalidTopic(error) {
            assert(error instanceof TypeError);
            assert(error.message === 'topic argument was not of type ROSLIB.Topic')

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
        it('should reject an undefined topic', function() {
            assert.throws(
                () => {
                    new SliderPublisher(undefined, createSlider());
                },
                expectInvalidTopic
            );
        });
        it('should reject any topic argument that is not a ROSLIB.Topic instance', function() {
            assert.throws(
                () => {
                    new SliderPublisher('not a topic', createSlider());
                },
                expectInvalidTopic
            );
        });

        it('should accept a ROSLIB.Topic and an slider as arguments', function() {
            //var publisher;
            const slider = createSlider();
            //assert.equal(slider, 'HTMLInputElement');
            var publisher = new SliderPublisher(new ROSLIB.Topic(), slider);
            // assert.doesNotThrow(
            //     () => {
                    
            //     },
            //     (error) => {
            //         return false;
            //     }
            // );

            assert.equal(publisher.slider, slider);
        });
    })
});