var assert = require('assert');
var TestSensor = require('../../src/sensors/TestSensor.js');
var SensorPublisher = require('../../src/sensors/SensorPublisher.js');

describe("Test SensorPublisher", function() {
    describe("#printTopic()", function() {
        it('should return its topic', function() {
            var sensorInstance = new SensorPublisher("testTopic");

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