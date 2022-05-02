var assert = require('assert');
var TestSensor = require('../../src/sensors/TestSensor.js');
var CameraPublisher = require('../../src/sensors/CameraPublisher.js');

describe("Test SensorPublisher", function() {
    describe("#printTopic()", function() {
        it('should return its topic', function() {
            var sensorInstance = new CameraPublisher("testTopic");

            assert.equal(sensorInstance.topic, "testTopic");
        });
    });
});

describe("Test Sensor", function() {
    describe("#printTopic()", function() {
        it('should return its topic', function() {
            var sensorInstance = new TestSensor("testTopic", "abc");

            assert.equal(sensorInstance.topic, "testTopic");
            assert.equal(sensorInstance.test, "abc");
        });
    });
});