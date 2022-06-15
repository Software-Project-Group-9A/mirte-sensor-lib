const IntervalPublisher = require('./IntervalPublisher.js');
const {positionElement} = require('../util/styleUtils');

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

    const msg = this.createInt32Msg(sliderValue);
    this.msg = msg;
    super.createSnapshot();
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
    const slider = window.document.createElement('input');
    slider.id = config.name;
    slider.type = 'range';
    slider.min = 0;
    slider.max = 100;

    positionElement(slider, targetElement, config.x, config.y, config.name);

    const publisher = new SliderPublisher(ros, '/mirte/phone_slider/' + config.name, slider, config.frequency);
    publisher.start();

    return publisher;
  }
}

module.exports = SliderPublisher;
