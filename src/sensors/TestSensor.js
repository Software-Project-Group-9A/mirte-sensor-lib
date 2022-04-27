const SensorPublisher = require('./SensorPublisher.js');

class TestSensor extends SensorPublisher {
    constructor(topic, test) {
        super(topic);
        this.test = test;
    }
}

module.exports = TestSensor;