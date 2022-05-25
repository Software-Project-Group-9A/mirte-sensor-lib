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
   */
  constructor(topic) {
    // check support for API
    if (!('AmbientLightSensor' in window)) {
      throw new NotSupportedError('Unable to create AmbientLightSensor, ' +
          'AmbientLight API not supported');
    }

    super(topic);

    this.topic = topic;

    this.lightReady = false;
    this.light = 0;
  }

  /**
   * Start the publishing of data to ROS with frequency of <freq> Hz.
   */
  start() {
    super.start();

    window.addEventListener('reading', (event) => {
      this.onReadAmbientLight(this.illuminance);
    });
  }

  /**
   * Stops the publishing of data to ROS.
   */
  stop() {
    super.stop();
    window.removeEventListener('reading', (event) => {
      this.onReadAmbientLight(event);
    });
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
     * Callback for reading ambient light.
     * context of object that called callback.
     *
     * @param {Number} illuminance brightness
     */
  onReadAmbientLight(illuminance) {
    console.log(illuminance);
    this.light = illuminance;
    this.lightReady = true;
  }

  /**
   * Puts the declination
   * in a ROS message and publishes it
   */
  createSnapshot() {
    if (!(this.lightReady)) {
      throw Error('AmbientLight is not read yet!');
    }

    const AmbientLightMessage = new ROSLIB.Message({
      data: this.light,
    });

    this.topic.publish(AmbientLightMessage);
  }
}

module.exports = AmbientLightPublisher;
