const SensorPublisher = require('./SensorPublisher.js');

/**
 * ButtonPublisher publishes the state of an HTML button element.
 * 
 * The data resulting from the button interactions is published as a
 * ROS std_msgs/Bool message. The boolean contained within this message
 * is set to true when the button is pressed, and false otherwise.
 */
class ButtonPublisher extends SensorPublisher {
    constructor(topic, button) {
        super(topic);
        
        // TODO: super should verify validity of topic?
        if (!(topic instanceof ROSLIB.Topic)) {
            throw new TypeError('topic argument was not of type ROSLIB.Topic');
        }
        this.topic = topic;

        if (!(button instanceof window.HTMLButtonElement)) {
            throw new TypeError('button argument was not of type HTMLButtonElement');
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
     * Creates a new ROS std_msgs/Bool message, containing the supplied boolean value.
     * @param {boolean} bool 
     * @returns a new ROS std_msgs/Bool message, containing the supplied boolean value.
     */
    // TODO: should perhaps be it's own module, allong with other message objects we might need in this project
    createBoolMsg(bool) {
        return new ROSLIB.Message({
            bool: bool
        });
    }

    /**
     * Callback for reading sensor data.
     * Should publish data to ROS topic.
     * @param {*} event object containing sensor data.
     */
    onMouseDown() {
        const msg = this.createBoolMsg(true);
        this.topic.publish(msg);
    }

    onMouseUp() {
        const msg = this.createBoolMsg(false);
        this.topic.publish(msg);
    }

    /**
     * Start the publishing of data to ROS.
     */
    start() {
        this.button.addEventListener('mousedown', this.onMouseDown.bind(this));
        this.button.addEventListener('mouseup', this.onMouseUp.bind(this));
    }

    /**
     * Stops the publishing of data to ROS.
     */
    stop() {
        this.button.removeEventListener('mousedown', this.onMouseDown);
        this.button.removeEventListener('mouseup', this.onMouseUp);
    }

    /**
     * Sets the maximum frequency at which new data can be published.
     */
    setPublishFrequency() {
        throw 'setPublishFrequency method not defined!';
    }
}

module.exports = ButtonPublisher;