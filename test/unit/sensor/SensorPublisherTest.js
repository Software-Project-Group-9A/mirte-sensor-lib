const assert = require('assert');

// Sinon library for mocking
// Allows for fake timers, which might be useful in future testing
const sinon = require('sinon');

// Module to test
var SensorPublisher = require('../../../src/sensors/SensorPublisher.js');


// dummy ROSLIB
global.ROSLIB = {
    Topic: function() {
        this.publish = function(msg) {}
    },
    Message: function(msg) {
        this.msg = msg
    }
}

describe("Test SensorPublisher", function() {
    describe("#constructor(topic)", function() {

        /* helper function for checking whether correct error is raised */
        function expectInvalidTopic(error) {
            assert(error instanceof TypeError);
            assert(error.message === 'topic argument was not of type ROSLIB.Topic')

            return true;
        }

        /* tests for topic verification */
        it('should reject an undefined topic', function() {
            assert.throws(
                () => {
                    new SensorPublisher(undefined);
                },
                expectInvalidTopic
            );
        });
        it('should reject any topic argument that is not a ROSLIB.Topic instance', function() {
            assert.throws(
                () => {
                    new SensorPublisher('not a topic');
                },
                expectInvalidTopic
            );
        });

        it('should accept a ROSLIB.Topic', function() {
            var publisher;
            var topic = new ROSLIB.Topic();

            assert.doesNotThrow(
                () => {
                    publisher = new SensorPublisher(topic);
                },
                (error) => {
                    return false;
                }
            );

            assert.equal(publisher.topic, topic);
        });
    });
});