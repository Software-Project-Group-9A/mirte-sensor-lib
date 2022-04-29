const SensorPublisher = require('./SensorPublisher.js');

class ButtonPublisher extends SensorPublisher {
    constructor(topic, button) {
        // super should verify validity of topic?
        super(topic);

        // verify that button is an HTML button element
        if (button === undefined || !(button instanceof window.HTMLButtonElement)) {
            throw 'error';
        }

        this.button = button;
    }

    /**
     * Callback for when error occurs while reading sensor data.
     * @param {*} event containing error info.
     */
    onError(event) {
        throw 'onError method not defined!';
    }

    /**
     * Callback for reading sensor data.
     * Should publish data to ROS topic.
     * @param {*} event object containing sensor data.
     */
    onReadData(event) {
        throw 'onReading method not defined!';
    }

    /**
     * Start the publishing of data to ROS.
     */
    start() {
        throw 'start method not defined!';
    }

    /**
     * Stops the publishing of data to ROS.
     */
    stop() {
        throw 'stop method not defined!';
    }

    /**
     * Sets the maximum frequency at which new data can be published.
     */
    setPublishFrequency() {
        throw 'setPublishFrequency method not defined!';
    }
}

module.exports = ButtonPublisher;