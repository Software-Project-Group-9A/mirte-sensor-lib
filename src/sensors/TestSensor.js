const SensorPublisher = require('./SensorPublisher.js');

class TestSensor extends SensorPublisher {
    constructor(topic, test) {
        super(topic);
        this.test = test;
    }
}
TestSensor.prototype.__proto__ = SensorPublisher.prototype;

module.exports = TestSensor;