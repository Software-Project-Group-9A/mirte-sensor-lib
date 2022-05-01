const assert = require('assert');

// us JSDOM to simulate browser environment
const { JSDOM } = require('jsdom');
const { window } = new JSDOM(``, {});
const { document } = window;

var ButtonPublisher = require('../../../src/sensors/ButtonPublisher.js');

console.log(window.HTMLButtonElement);

// define JSDOM window in global scope 
global.window = window;
global.ROSLIB = {
    Topic: function() {}
}

describe("Test ButtonPublisher", function() {
    describe("#constructor(topic, button)", function() {

        /* helper functions for checking whether correct error is raised */
        function expectInvalidButton(error) {
            assert(error instanceof TypeError);
            assert(error.message === 'button argument was not of type HTMLButtonElement')

            return true;
        }
        function expectInvalidTopic(error) {
            assert(error instanceof TypeError);
            assert(error.message === 'topic argument was not of type ROSLIB.Topic')

            return true;
        }

        /* test for button verification */
        it('should reject an undefined button', function() {
            assert.throws(
                () => {
                    new ButtonPublisher(new ROSLIB.Topic(), undefined);
                },
                expectInvalidButton
            );
        });
        it('should reject any button argument that is not an HTML Button', function() {
            assert.throws(
                () => {
                    new ButtonPublisher(new ROSLIB.Topic(), "not a button");
                },
                expectInvalidButton
            );
        });

        /* tests for topic verification */
        /* functionality should probably be moved into superclass SensorPublisher */
        it('should reject an undefined topic', function() {
            assert.throws(
                () => {
                    new ButtonPublisher(undefined, document.createElement('button'));
                },
                expectInvalidTopic
            );
        });
        it('should reject any topic argument that is not a ROSLIB.Topic instance', function() {
            assert.throws(
                () => {
                    new ButtonPublisher('not a topic', document.createElement('button'));
                },
                expectInvalidTopic
            );
        });

        it('should accept a ROSLIB.Topic and an HTML Button as arguments', function() {
            var sensorInstance;
            const button = document.createElement('button');

            assert.doesNotThrow(
                () => {
                    sensorInstance = new ButtonPublisher(new ROSLIB.Topic(), button);
                },
                (error) => {
                    return false;
                }
            );

            assert.equal(sensorInstance.button, button);
        });
    });
});