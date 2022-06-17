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
   * @param {String} topicName name for the topic to publish data to
   * @param {HTMLInputElement} slider slider of which to publish data, must have type 'range'
   * @param {Number} hz a standard frequency for this type of object.
   */
  constructor(ros, topicName, slider, hz = 8) {
    super(ros, topicName, hz);

    if (!(slider instanceof window.HTMLInputElement)) {
      throw new TypeError('slider argument was not of type HTMLInputElement');
    }

    if (slider.type !== 'range') {
      throw new TypeError('slider argument does not have type range');
    }

    this.topic.messageType = 'std_msgs/Int32';

    /**
     * slider of which to publish data
     */
    this.slider = slider;
  }

  /**
     * Captures sensor-data at current timeframe and
     * publishes this to the topic instantly.
     */
  createSnapshot() {
    const sliderValue = parseInt(this.slider.value);

    const msg = new ROSLIB.Message({
      data: sliderValue,
    });
    this.msg = msg;
    super.createSnapshot();
  }
}

module.exports = SliderPublisher;
