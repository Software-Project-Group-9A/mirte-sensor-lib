const SensorPublisher = require('./SensorPublisher.js');

/**
 * ButtonPublisher publishes the state of an HTML button element.
 * This state is published every time the button changes state,
 * from pressed to unpressed, and vice versa.
 *
 * The data resulting from the button interactions is published as a
 * ROS std_msgs/Bool message. The boolean contained within this message
 * is set to true when the button is pressed, and false otherwise.
 */
class ButtonPublisher extends SensorPublisher {
  /**
   * Creates a new ButtonPublisher.
   * @param {ROSLIB.Ros} ros a ROS instance to publish to
   * @param {ROSLIB.Topic} topicname topic to which to publish button data
   * @param {HTMLButtonElement} button button of which to publish data
   */
  constructor(ros, topicname, button) {
    super(ros, topicname);

    if (!(button instanceof window.HTMLButtonElement)) {
      throw new TypeError('button argument was not of type HTMLButtonElement');
    }

    this.topic = new ROSLIB.Topic({
      ros: this.ros,
      name: this.topicname,
      messageType: 'std_msgs/Bool',
    });

    /**
     * button of which to publish data
     */
    this.button = button;

    /**
     * Callback for when button is pressed.
     */
    this.onMouseDown = function() {
      const msg = this.createBoolMsg(true);
      this.topic.publish(msg);
    }.bind(this);

    /**
     * Callback for when button is released.
     */
    this.onMouseUp = function() {
      const msg = this.createBoolMsg(false);
      this.topic.publish(msg);
    }.bind(this);
  }

  /**
   * Creates a new ROS std_msgs/Bool message, containing the supplied boolean value.
   * @param {boolean} bool boolean to include in message
   * @return {ROSLIB.Message} a new std_msgs/Bool message, containing the supplied boolean value.
   */
  createBoolMsg(bool) {
    return new ROSLIB.Message({
      data: bool,
    });
  }

  /**
   * Start the publishing of data to ROS.
   */
  start() {
    super.start();
    this.button.addEventListener('mousedown', this.onMouseDown);
    this.button.addEventListener('mouseup', this.onMouseUp);
  }

  /**
   * Stop the publishing of data to ROS.
   */
  stop() {
    super.stop();
    this.button.removeEventListener('mousedown', this.onMouseDown);
    this.button.removeEventListener('mouseup', this.onMouseUp);
  }
}

module.exports = ButtonPublisher;
