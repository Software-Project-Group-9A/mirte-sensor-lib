const SensorPublisher = require('./SensorPublisher.js');

/**
 * CheckboxPublisher publishes the state of an HTML checkbox.
 * This state is published every time the checkbox changes state,
 * from checked to unchecked, and vice versa.
 *
 * The data resulting from the button interactions is published as a
 * ROS std_msgs/Bool message. The boolean contained within this message
 * is set to true when the checkbox is checked, and false otherwise.
 */
class CheckboxPublisher extends SensorPublisher {
  /**
   * Creates a new ButtonPublisher.
   * @param {ROSLIB.Ros} ros a ROS instance to publish to
   * @param {ROSLIB.Topic} topicName topic to which to publish button data
   * @param {HTMLElement} checkbox checkbox of which to publish data
   */
  constructor(ros, topicName, checkbox) {
    super(ros, topicName);

    if (!(checkbox instanceof window.HTMLElement && checkbox.type && checkbox.type === 'checkbox')) {
      throw new TypeError('button argument was not of type HTMLButtonElement');
    }

    this.topic.messageType = 'std_msgs/Bool';

    /**
     * button of which to publish data
     */
    this.checkbox = checkbox;
  }

  /**
     * Callback for when checkbox state changes.
     * @param {Event} event event from callback
     */
  change(event) {
    if (event.target.checked) {
      this.publishBoolMsg(true);
    } else {
      this.publishBoolMsg(false);
    }
  }


  /**
   * Creates and publishes a new ROS std_msgs/Bool message, containing the supplied boolean value.
   * @param {boolean} bool boolean to include in message
   */
  publishBoolMsg(bool) {
    console.log(bool);
    const msg = new ROSLIB.Message({
      data: bool,
    });
    this.topic.publish(msg);
  }

  /**
   * Start the publishing of data to ROS.
   */
  start() {
    super.start();

    this.checkbox.addEventListener('change', (event) => {
      this.change(event);
    });
  }

  /**
   * Stop the publishing of data to ROS.
   */
  stop() {
    super.stop();
    this.checkbox.removeEventListener('change', (event) => {
      this.change(event);
    });
  }
}

module.exports = CheckboxPublisher;
