const IntervalPublisher = require('./IntervalPublisher.js');

/**
 * SliderPublisher publishes the state of an HTML slider element.
 * This state is published every time the slider is moved.
 *
 * The data resulting from the button interactions is published as a
 * ROS std_msgs/Int message. The int contained within this message
 * ranges from 0.0 to 1.0.
 */
class SliderPublisher extends IntervalPublisher {
  /**
   * Creates a new ButtonPublisher.
   * @param {ROSLIB.Ros} ros a ROS instance to publish to
   * @param {ROSLIB.Topic} topicname topic to which to publish slider data
   * @param {HTMLInputElement} slider slider of which to publish data, must have type 'range'
   */
  constructor(ros, topicname, slider) {
    super(ros, topicname);

    if (!(slider instanceof window.HTMLInputElement)) {
      throw new TypeError('slider argument was not of type HTMLInputElement');
    }

    if (slider.type !== 'range') {
      throw new TypeError('slider argument does not have type range');
    }

    /**
     * slider of which to publish data
     */
    this.slider = slider;

    // Value to prevent double messages
    this.oldValue = null;
  }

  /**
   * Creates a new ROS std_msgs/Int32 message, containing the supplied integer value.
   * @param {Number} num to include in message
   * @return {ROSLIB.Message} a new ROS std_msgs/Int32 message, containing the supplied boolean value.
   */
  createInt32Msg(num) {
    return new ROSLIB.Message({
      data: num,
    });
  }

  /**
     * Captures sensor-data at current timeframe and
     * publishes this to the topic instantly.
     */
  createSnapshot() {
    const sliderValue = parseInt(this.slider.value);

    if (sliderValue === this.oldValue) {
      return;
    }

    this.oldValue = sliderValue;

    const msg = this.createInt32Msg(sliderValue);
    this.topic.publish(msg);
  }
}

module.exports = SliderPublisher;
