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
      throw new EvalError('slider argument does not have type range');
    }

    /**
     * slider of which to publish data
     */
    this.slider = slider;

    /**
     * Callback for when slider is adjusted.
     */
    // should this be throttled?
    this.onInput = function() {
      const sliderValue = parseInt(this.slider.value);
      const msg = this.createInt32Msg(sliderValue);
      this.topic.publish(msg);
    }.bind(this);
  }

  /**
   * Creates a new ROS std_msgs/Int32 message, containing the supplied integer value.
   * @param {number} num to include in message
   * @return {ROSLIB.MEssage} a new ROS std_msgs/Int32 message, containing the supplied boolean value.
   */
  createInt32Msg(num) {
    return new ROSLIB.Message({
      data: num,
    });
  }

  /**
   * Start the publishing of data to ROS.
   */
  start() {
    this.slider.addEventListener('input', this.onInput);
  }

  /**
   * Stop the publishing of data to ROS.
   */
  stop() {
    this.slider.removeEventListener('input', this.onInput);
  }
}

module.exports = SliderPublisher;
