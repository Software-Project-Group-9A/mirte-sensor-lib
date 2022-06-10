/**
 * VERY IMPORTANT: This feature is not fully suported over all browsers
 * To enable in Chrome, go to: chrome://flags/
 * There enable: "Generic Sensor Extra Classes"
 */


// Dependencies
const IntervalPublisher = require('./IntervalPublisher.js');
const NotSupportedError = require('../error/NotSupportedError');

/**
 * AmbientLightPublisher publishes the amount of lux the
 * camera receives
 * By default it publishes data at the interval rate
 * from parrent class IntervalPublisher
 *
 * The data resulting from the interactions is published as a
 * ROS std_msgs/Int32 message.
 */
class AmbientLightPublisher extends IntervalPublisher {
  /**
   * Creates a new sensor publisher that publishes the amount of lux
   * the camera receives
   * @param {ROSLIB.Ros} ros a ROS instance to publish to
   * @param {ROSLIB.Topic} topicName a Topic from RosLibJS
   * @param {Number} hz a frequency to be called
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
    super.start();

    this.sensor.addEventListener('reading', (event) => {
      this.light = this.sensor.illuminance;
    });
    this.sensor.start();
  }

  /**
   * Stops the publishing of data to ROS.
   */
  stop() {
    super.stop();

    this.sensor.stop();

    this.sensor.removeEventListener('reading', (event) => {});
  }

  /**
   * Puts the declination
   * in a ROS message and publishes it
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
