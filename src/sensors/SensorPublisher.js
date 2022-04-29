/**
 * Template for object that publishes sensor data to the provided ROS topic.
 */
class SensorPublisher {
    /**
     * Creates a new sensor publisher that publishes to the provided topic.
     * @param {Topic} topic a Topic from RosLibJS
     */
    constructor(topic) {
        this.topic = topic;
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

module.exports = SensorPublisher;