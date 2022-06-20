const {positionElement} = require('../util/styleUtils.js');
const SensorPublisher = require('./SensorPublisher.js');

/**
 * TextPublisher publishes the text of an HTML input element.
 * By default it publishes data whenever the enter key is pressed, but
 * it can be configured sends the data every keypress.
 *
 * The data resulting from the text interactions is published as a
 * ROS std_msgs/String message.
 */
class TextPublisher extends SensorPublisher {
  /**
   * Creates a new TextPublisher.
   *
   * @param {ROSLIB.Ros} ros a ROS instance to publish to
   * @param {String} topicName name for the topic to publish data to
   * @param {HTMLInputElement} inputElement input element from which to publish data.
   * @param {Object} [options] configuration options.
   * @param {boolean} [options.onEnter=true] if true publishes on enter, else publishes every key press.
   * @param {boolean} [options.clearOnPublish=true] if false, does not clear the inputElement after publishing.
   */
  constructor(ros, topicName, inputElement, options) {
    super(ros, topicName);

    this.topic.messageType = 'std_msgs/String';

    // Set default options
    this.options = options === undefined ? {} : options;
    this.options.onEnter = this.options.onEnter === undefined ? true : this.options.onEnter;
    this.options.clearOnPublish = this.options.clearOnPublish === undefined ? true : this.options.clearOnPublish;

    if (!(inputElement instanceof window.HTMLInputElement)) {
      throw new TypeError('input element was not of type HTMLInputElement');
    }

    if (inputElement.getAttribute('type') !== null &&
      inputElement.getAttribute('type') !== 'text') {
      throw new TypeError('Input element has to have type attribute "text"');
    }

    /**
     * Input element of which to publish data
     */
    this.inputElement = inputElement;

    this.onInput = function() {
      this.publishMessage();
    }.bind(this);

    this.onKeyUp = function(event) {
      if (event.key === 'Enter') {
        this.publishMessage();
      }
    }.bind(this);
  }

  /**
   * TODO: should perhaps be it's own module, allong with other message objects
   * we might need in this project
   *
   * Creates a new ROS std_msgs/String message, containing the supplied text
   * value.
   * @param {boolean} str string containing the text
   * @return {ROSLIB.Message} a new ROS std_msgs/String message, containing the
   * supplied text value.
   */
  createStrMsg(str) {
    return new ROSLIB.Message({
      data: str,
    });
  }

  /**
   * Start the publishing of data to ROS.
   */
  start() {
    if (this.options.onEnter) {
      this.inputElement.addEventListener('keyup', this.onKeyUp);
    } else {
      this.inputElement.addEventListener('input', this.onInput);
    }

    super.start();
  }

  /**
   * Stop the publishing of data to ROS.
   */
  stop() {
    super.stop();

    if (this.options.onEnter) {
      this.inputElement.removeEventListener('keyup', this.onKeyUp);
    } else {
      this.inputElement.removeEventListener('input', this.onInput);
    }
  }

  /**
   * Reads text from inputElement and publishes it.
   */
  publishMessage() {
    const msg = new ROSLIB.Message({
      data: this.inputElement.value,
    });

    this.topic.publish(msg);

    if (this.options.clearOnPublish) {
      this.inputElement.value = '';
    }
  }

  /**
   * Deserializes a text input publisher stored in a config object, and returns the resulting publisher instance.
   * The returned instance is already started.
   * @param {ROSLIB.Ros} ros ros instance to which to resulting publisher will publish
   * @param {Object} config object with the following keys:
   * @param {string} config.name name of the publisher to create
   * @param {string} config.topicPath - path to location of topic of publisher.
   *  Publisher will publish to the topic topicPath/name
   * @param {HTMLElement} targetElement HTML element in which to generate necessary sensor UI elements
   * @return {GPSDeclinationPublisher} GPSDeclinationPublisher described in the provided config parameter
   */
  static readFromConfig(ros, config, targetElement) {
    const textInput = window.document.createElement('input');
    textInput.type = 'text';

    positionElement(textInput, targetElement, config.x, config.y, config.name);

    const topicName = config.topicPath + '/' + config.name;
    const publisher = new TextPublisher(ros, topicName, textInput);
    publisher.start();

    return publisher;
  }
}

module.exports = TextPublisher;
