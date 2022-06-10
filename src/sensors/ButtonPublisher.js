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
   * @param {ROSLIB.Topic} topicName topic to which to publish button data
   * @param {HTMLButtonElement} button button of which to publish data
   */
  constructor(ros, topicName, button) {
    super(ros, topicName);

    if (!(button instanceof window.HTMLButtonElement)) {
      throw new TypeError('button argument was not of type HTMLButtonElement');
    }

    this.topic.messageType = 'std_msgs/Bool';

    /**
     * button of which to publish data
     */
    this.button = button;

    // Flag to check if button was already pressed
    let flag = false;

    /**
     * Callback for when button is pressed.
     * @param {Event} event event from callback
     */
    this.onMouseDown = function(event) {
      event.preventDefault();
      if (flag) {
        return;
      }
      flag = true;
      const msg = this.createBoolMsg(true);
      this.topic.publish(msg);
    }.bind(this);

    /**
     * Callback for when button is released.
     * @param {Event} event event from callback
     */
    this.onMouseUp = function(event) {
      event.preventDefault();
      if (!flag) {
        return;
      }
      flag = false;
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
    this.button.addEventListener('touchstart', this.onMouseDown);
    this.button.addEventListener('mouseup', this.onMouseUp);
    this.button.addEventListener('mouseleave', this.onMouseUp);
    this.button.addEventListener('touchend', this.onMouseUp);
    this.button.addEventListener('touchcancel', this.onMouseUp);
  }

  /**
   * Stop the publishing of data to ROS.
   */
  stop() {
    super.stop();
    this.button.removeEventListener('mousedown', this.onMouseDown);
    this.button.removeEventListener('touchstart', this.onMouseDown);
    this.button.removeEventListener('mouseup', this.onMouseUp);
    this.button.removeEventListener('mouseleave', this.onMouseUp);
    this.button.removeEventListener('touchend', this.onMouseUp);
    this.button.removeEventListener('touchcancel', this.onMouseUp);
  }

  /**
   * Deserializes a Slider stored in a config object, and returns the resulting publisher instance.
   * The returned instance is already started.
   * @param {ROSLIB.Ros} ros ros instance to which to resulting publisher will publish
   * @param {Object} config object with the following keys:
   * @param {string} config.name name of the publisher to create
   * @param {number} config.frequency name of the publisher to create
   * @param {HTMLElement} targetElement HTML element in which to generate necessary sensor UI elements
   * @return {GPSDeclinationPublisher} GPSDeclinationPublisher described in the provided config parameter
   */
  static readFromConfig(ros, config, targetElement) {
    // initialize button
    const button = window.document.createElement('button');
    button.innerHTML = config.name;

    // TODO: positioning
    // button.style = `position: absolute; left: ${config.x}%; top: ${config.y}%;`;

    targetElement.appendChild(button);

    const publisher = new ButtonPublisher(ros, '/mirte/phone_button/' + config.name, button, config.frequency);
    publisher.start();

    return publisher;
  }
}

module.exports = ButtonPublisher;
