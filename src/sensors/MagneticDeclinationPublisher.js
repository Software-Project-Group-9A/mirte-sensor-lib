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
   * @param {Topic} topic a Topic from RosLibJS
   */
  constructor(topic) {
    super(topic);

    this.topic = topic;

    // First need to detect first device orientation.
    this.orientationReady = false;

    // Prevents double message publishing
    this.oldCompass = null;

    // No support for IOS yet
    window.addEventListener('deviceorientation', (event) => {
      this.onReadOrientation(event);
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
     * Callback for reading orientation data.
     * context of object that called callback.
     *
     * @param {DeviceOrientationEvent} event object containing sensor data.
     */
  onReadOrientation(event) {
    this.alpha = event.alpha;
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
    const compass = Math.abs(this.alpha - 360);
    // Check if compass changed
    if (compass === this.oldCompass) {
      return;
    }

    this.oldCompass = compass;

    const MagneticDeclinationMessage = new ROSLIB.Message({
      data: compass,
    });

    this.topic.publish(MagneticDeclinationMessage);
  }
}

module.exports = MagneticDeclinationPublisher;
