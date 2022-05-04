const assert = require('assert');

// Sinon library for mocking
// Allows for fake timers, which might be useful in future testing
const sinon = require('sinon');

// JSDOM for simulating browser environment
const { JSDOM } = require('jsdom');
const { window } = new JSDOM(``, {});
const { document } = window;

// Module to test
var MagneticDeclinationPublisher = require('../../../src/sensors/MagneticDeclinationPublisher.js');

// define JSDOM window in global scope 
global.window = global.window || window;

// create spy for Topic
global.ROSLIB = {
    Topic: function() {
        this.publish = function(msg) {}
    },
    Message: function(msg) {
        this.msg = msg
    }
}

describe("Test MagneticDeclinationPublisher", function() {
    describe("#constructor(topic)", function() {

        /* helper functions for checking whether correct error is raised */
        function expectInvalidTopic(error) {
            assert(error instanceof TypeError);
            assert.equal(error.message, 'topic argument was not of type ROSLIB.Topic')

            return true;
        }

        it('should reject an undefined topic', function() {
            assert.throws(
                () => {
                    new MagneticDeclinationPublisher(undefined);
                },
                expectInvalidTopic
            );
        });
        it('should reject any topic argument that is not a ROSLIB.Topic instance', function() {
            assert.throws(
                () => {
                    new MagneticDeclinationPublisher('not a topic');
                },
                expectInvalidTopic
            );
        });

        it('should accept a ROSLIB.Topic', function() {
            var publisher;
            assert.doesNotThrow(
                () => {
                    publisher = new MagneticDeclinationPublisher(new ROSLIB.Topic());
                },
                (error) => {
                    return false;
                }
            );
        });
    });

    describe("#calcDegreeToPoint()", function() {
        it('should calculate the degree between point and current location',
        function() {
          const topic = sinon.spy(new ROSLIB.Topic());
          const publisher = sinon.spy(new MagneticDeclinationPublisher(topic));

          publisher.start();
          
          assert.equal(publisher.calcDegreeToPoint(21.422487, 39.826206), 180);
        });
    });

    describe("#locationHandler()", function() {
    
    });

    // describe("#onReadOrientation()", function() {
    
    // });

    // describe("#createSnapshot()", function() {
    
    // });

});