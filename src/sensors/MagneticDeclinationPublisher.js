/*
 Used sources:
    https://dev.to/orkhanjafarovr/real-compass-on-mobile-browsers-with-javascript-3emi
    https://answers.ros.org/question/65971/how-can-i-publish-an-integer-and-string-int16-string-using-roslibjs/
*/

// Dependencies
const PermissionDeniedError = require('../error/PermissionDeniedError.js');
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
   */
  constructor(ros, topicName) {
    super(ros, topicName);

    this.topic.messageType = 'std_msgs/Int32';

    // First need to detect first device orientation.
    this.orientationReady = false;

    // Prevents double message publishing
    this.oldCompass = null;
  }

  /**
   * Start the publishing of data to ROS with frequency of <freq> Hz.
   */
  start() {
    super.start();

    /*
    * Support for iOS
    * For DeviceOrientationEvent to work on Safari on iOS 13 and up, the user has to give permission
    * through a user activation event, such as a button press.
    */
    if (!window.MSStream && /iPad|iPhone|iPod|Macintosh/.test(window.navigator.userAgent)) {
      // request permission for sensor use
      this.requestPermission();
    }
    // If user is not on iOS, sensor data can be read as normal.
    window.addEventListener('deviceorientationabsolute', (event) => {
      if (event.isTrusted) {
        this.onReadOrientation(event);
      }
    }, true);
  }

  /**
   * Adds a button to the document to ask for permission to use IMU sensor on iOS.
   */
  requestPermission() {
    const permbutton = window.document.createElement('button');
    permbutton.innerHTML = 'requestPermission';
    permbutton.addEventListener('click', () => {
      if (typeof(window.DeviceOrientationEvent.requestPermission()) === 'function' ||
      typeof(window.DeviceMotionEvent.requestPermission()) === 'function') {
        throw new Error('requestPermission for device orientation or device motion on iOS is not a function!');
      }

      // If permission is granted, Enable callback for deviceOrientationEvent and remove permissions button
      window.DeviceOrientationEvent.requestPermission().then((response) => {
        if (response==='granted') {
          permbutton.remove();
          return true;
        } else {
          throw new PermissionDeniedError('No permission granted for Device Orientation');
        }
      });
    });

    window.document.body.appendChild(permbutton);
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
    const compass = this.alpha;
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
