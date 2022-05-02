const SensorPublisher = require('./SensorPublisher.js');

/**
 * SliderPublisher publishes the state of an HTML slider element.
 * This state is published every time the slider is moved.
 * 
 * The data resulting from the button interactions is published as a
 * ROS std_msgs/Int message. The int contained within this message
 * ranges from 0.0 to 1.0.
 */
class SliderPublisher extends SensorPublisher {
    /**
     * Creates a new ButtonPublisher.
     * @param {ROSLIB.Topic} topic topic to which to publish slider data
     * @param {HTMLInputElement} slider slider of which to publish data, must have type 'range'
     */
    constructor(topic, slider) {
        super(topic);

        if (!(slider instanceof window.HTMLInputElement)) {
            throw new TypeError('slider argument was not of type HTMLInputElement');
        }

        if (slider.type !== 'range') {
            throw new EvalError('slider argument does not have type slider');
        }

        /**
         * slider of which to publish data
         */
        this.slider = slider;

        /**
         * Callback for when button is pressed.
         */
        this.onMouseDown = function() {
            const msg = this.createBoolMsg(true);
            this.topic.publish(msg);
        }.bind(this);
    }

    /**
     * Creates a new ROS std_msgs/Bool message, containing the supplied boolean value.
     * @param {boolean} bool boolean to include in message
     * @returns a new ROS std_msgs/Bool message, containing the supplied boolean value.
     */
    // TODO: should perhaps be it's own module, allong with other message objects we might need in this project
    createBoolMsg(bool) {
        return new ROSLIB.Message({
            data: bool
        });
    }

    createTopic(topicName, rosInstance) {
        return new ROSLIB.Topic({
            name: topicName,
            ros: rosInstance,
            messageType: 'std_msgs/Bool'
        });
    }

    /**
     * Start the publishing of data to ROS.
     */
    start() {
        this.button.addEventListener('mousedown', this.onMouseDown);
        this.button.addEventListener('mouseup', this.onMouseUp);
    }

    /**
     * Stop the publishing of data to ROS.
     */
    stop() {
        this.button.removeEventListener('mousedown', this.onMouseDown);
        this.button.removeEventListener('mouseup', this.onMouseUp);
    }
}

module.exports = SliderPublisher;