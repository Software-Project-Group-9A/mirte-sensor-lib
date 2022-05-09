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
   * @param {ROSLIB.Topic} topic topic to which to publish text data
   * @param {HTMLInputElement} inputElement input element from which to
   * publish data
   * @param {object} options options:
   *  - onEnter: if true publishes on enter, else publishes every key press.
   */
  constructor(topic, inputElement, options) {
    super(topic);

    // Set default options
    this.options = options === undefined ? {} : options;
    this.options.onEnter = this.options.onEnter === undefined ? true :
                                                          this.options.onEnter;

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
      const msg = this.createStrMsg(this.inputElement.value);
      this.topic.publish(msg);
    }.bind(this);

    this.onKeyUp = function(event) {
      if (event.key === 'Enter') {
        const msg = this.createStrMsg(this.inputElement.value);
        this.topic.publish(msg);
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
