// Dependencies
const IntervalPublisher = require('./IntervalPublisher.js');
const NotSupportedError = require('../error/NotSupportedError');

/**
 * <p> <b> This feature is not fully suported over all browsers
 * To enable in Chrome, go to: chrome://flags/
 * There enable: "Generic Sensor Extra Classes" </b> </p>
 *
 *
 * AmbientLightPublisher publishes the amount of lux the
 * camera receives
 * By default it publishes data at the interval rate
 * from parrent class IntervalPublisher
 *
 * The data resulting from the interactions is published as a
 * ROS std_msgs/Int32 message.
 *
 * @see Uses the following example:
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/AmbientLightSensor}
 */
class AmbientLightPublisher extends IntervalPublisher {
  /**
   * Creates a new sensor publisher that publishes the amount of lux
   * the camera receives
   * @param {ROSLIB.Ros} ros a ROS instance to publish to
   * @param {String} topicName name for the topic to publish data to
   * @param {Number} hz frequency for the publishing interval
   */
  constructor(ros, topicName, hz = 1) {
    // check support for API
    if (!(window.AmbientLightSensor)) {
      throw new NotSupportedError('Unable to create AmbientLightSensor, ' +
          'AmbientLight API not supported');
    }
    super(ros, topicName, hz);
    this.topic.messageType = 'std_msgs/Int32';

    this.sensor = new AmbientLightSensor();
  }

  /**
   * Start the publishing of data to ROS with frequency of <freq> Hz.
   */
  start() {
    this.sensor.addEventListener('reading', (event) => {
      this.light = this.sensor.illuminance;
    });
    this.sensor.start();

    super.start();
  }

  /**
   * Stops the publishing of data to ROS.
   */
  stop() {
    super.stop();

    this.sensor.stop();

    this.sensor.removeEventListener('reading', (event) => {
      this.light = this.sensor.illuminance;
    });
  }

  /**
   * Puts the light level detected by the ambient light sensor
   * in a ROS message and publishes it. The light level is given in lux.
   */
  createSnapshot() {
    const AmbientLightMessage = new ROSLIB.Message({
      data: this.light,
    });
    this.msg = AmbientLightMessage;
    super.createSnapshot();
  }
}

module.exports = AmbientLightPublisher;
