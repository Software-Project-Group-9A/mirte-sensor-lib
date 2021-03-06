const SensorPublisher = require('./SensorPublisher.js');
const {positionElement} = require('../util/styleUtils.js');

/**
 * CheckboxPublisher publishes the state of an HTML checkbox.
 * This state is published every time the checkbox changes state,
 * from checked to unchecked, and vice versa.
 *
 * The data resulting from the checkbox interactions is published as a
 * ROS std_msgs/Bool message. The boolean contained within this message
 * is set to true when the checkbox is checked, and false otherwise.
 */
class CheckboxPublisher extends SensorPublisher {
  /**
   * Creates a new checkboxPublisher.
   * @param {ROSLIB.Ros} ros a ROS instance to publish to
   * @param {String} topicName topic to which to publish checkbox data
   * @param {HTMLElement} checkbox checkbox of which to publish data
   */
  constructor(ros, topicName, checkbox) {
    super(ros, topicName);

    if (!(checkbox instanceof window.HTMLElement && checkbox.type && checkbox.type === 'checkbox')) {
      throw new TypeError('checkbox argument was not a HTML checkbox');
    }

    this.topic.messageType = 'std_msgs/Bool';

    /**
     * checkbox of which to publish data
     */
    this.checkbox = checkbox;

    /**
     * Callback for when checkbox state changes.
     * @param {Event} event event from callback
     */
    this.change = function(event) {
      if (event.target.checked) {
        this.publishBoolMsg(true);
      } else {
        this.publishBoolMsg(false);
      }
    }.bind(this);
  }

  /**
   * Start the publishing of data to ROS.
   */
  start() {
    this.checkbox.addEventListener('change', this.change);

    super.start();
  }

  /**
   * Stop the publishing of data to ROS.
   */
  stop() {
    super.stop();

    this.checkbox.removeEventListener('change', this.change);
  }

  /**
   * Creates and publishes a new ROS std_msgs/Bool message, containing the supplied boolean value.
   * @param {boolean} bool boolean to include in message
   */
  publishBoolMsg(bool) {
    const msg = new ROSLIB.Message({
      data: bool,
    });
    this.topic.publish(msg);
  }

  /**
   * Deserializes a Checkbox stored in a config object, and returns the resulting publisher instance.
   * The returned instance is already started.
   * @param {ROSLIB.Ros} ros ros instance to which to resulting publisher will publish
   * @param {Object} config object with the following keys:
   * @param {string} config.name name of the publisher to create
   * @param {string} config.topicPath - path to location of topic of publisher.
   *  Publisher will publish to the topic topicPath/name
   * @param {number} config.x distance from right side of container
   * @param {number} config.y distance from top side of container
   * @param {HTMLElement} targetElement HTML element in which to generate necessary sensor UI elements
   * @return {GPSDeclinationPublisher} GPSDeclinationPublisher described in the provided config parameter
   */
  static readFromConfig(ros, config, targetElement) {
    // initialize checkbox
    const checkbox = window.document.createElement('input');
    checkbox.type = 'checkbox';

    positionElement(checkbox, targetElement, config.x, config.y, config.name);

    const publisher = new CheckboxPublisher(ros, config.topicPath + '/' + config.name, checkbox);
    publisher.start();

    return publisher;
  }
}

module.exports = CheckboxPublisher;
