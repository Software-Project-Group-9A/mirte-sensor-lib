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
   * @param {ROSLIB.Topic} topicName name for the topic to publish data to
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
   * Reads text from inputElement and publishes it.
   */
  publishMessage() {
    const msg = this.createStrMsg(this.inputElement.value);
    this.topic.publish(msg);

    if (this.options.clearOnPublish) {
      this.inputElement.value = '';
    }
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
    super.start();
    if (this.options.onEnter) {
      this.inputElement.addEventListener('keyup', this.onKeyUp);
    } else {
      this.inputElement.addEventListener('input', this.onInput);
    }
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
}

module.exports = TextPublisher;
