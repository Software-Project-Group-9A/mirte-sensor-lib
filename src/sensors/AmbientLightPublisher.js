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
 * ROS std_msgs/float64 message.
 */
class AmbientLightPublisher extends IntervalPublisher {
  /**
   * Creates a new sensor publisher that publishes the amount of lux
   * the camera receives
   * @param {Topic} topic a Topic from RosLibJS
   * @param {Number} hz a frequency to be called
   */
  constructor(topic, hz = 1) {
    // check support for API
    if (!('AmbientLightSensor' in window)) {
      throw new NotSupportedError('Unable to create AmbientLightSensor, ' +
          'AmbientLight API not supported');
    }
    super(topic, hz);

    this.topic = topic;

    this.oldLight = -1;
    this.light = -1;

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
   * Callback for when error occurs while reading sensor data.
   * @param {Error} event containing error info.
   */
  onError(event) {
    console.log('Error: ' + event);
    throw Error('ERROR!');
  }

  /**
   * Puts the declination
   * in a ROS message and publishes it
   */
  createSnapshot() {
    if (this.oldLight === this.light) {
      return;
    }

    this.oldLight = this.light;

    const AmbientLightMessage = new ROSLIB.Message({
      data: this.light,
    });

    this.topic.publish(AmbientLightMessage);
  }
}

module.exports = AmbientLightPublisher;
