/*
 Used sources:
    https://dev.to/orkhanjafarovr/real-compass-on-mobile-browsers-with-javascript-3emi
    https://answers.ros.org/question/65971/how-can-i-publish-an-integer-and-string-int16-string-using-roslibjs/
*/

// Dependencies
const IntervalPublisher = require('./IntervalPublisher.js');

/**
 * MagneticDeclinationPublisher publishes the rotation as a compass
 * By default it publishes data at the interval rate
 * from parrent class IntervalPublisher
 *
 * The data resulting from the interactions is published as a
 * ROS std_msgs/Int32 message.
 */
class MagneticDeclinationPublisher extends IntervalPublisher {
  /**
   * Creates a new sensor publisher that publishes to the provided topic.
   * @param {ROSLIB.Ros} ros a ROS instance to publish to
   * @param {ROSLIB.Topic} topicName a Topic from RosLibJS
   * @param {Number} hz a standard frequency for this type of object.
   */
  constructor(ros, topicName, hz = 10) {
    super(ros, topicName, hz);

    this.topic.messageType = 'std_msgs/Int32';

    // First need to detect first device orientation.
    this.orientationReady = false;
  }

  /**
   * Start the publishing of data to ROS with frequency of <freq> Hz.
   */
  start() {
    super.start();

    // No support for IOS yet
    window.addEventListener('deviceorientationabsolute', (event) => {
      this.onReadOrientation(event);
    }, true);
  }

  /**
     * Callback for reading orientation data.
     * context of object that called callback.
     *
     * @param {DeviceOrientationEvent} event object containing sensor data.
     */
  onReadOrientation(event) {
    this.alpha = Math.round(Math.abs(event.alpha - 360));
    this.orientationReady = true;
  }

  /**
   * Puts the magnetic declination
   * in a ROS message and publishes it
   */
  createSnapshot() {
    if (!this.orientationReady) {
      throw Error('Orientation is not read yet!');
    }

    const MagneticDeclinationMessage = new ROSLIB.Message({
      data: this.alpha,
    });

    this.msg = MagneticDeclinationMessage;
    super.createSnapshot();
  }
}

module.exports = MagneticDeclinationPublisher;
