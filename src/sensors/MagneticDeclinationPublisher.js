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
   * @param {Topic} topic a Topic from RosLibJS
   */
  constructor(topic) {
    super(topic);

    this.topic = topic;

    // First need to detect first device orientation.
    this.orientationReady = false;

    // Prevents double message publishing
    this.oldCompass = null;

    /*
    * Support for iOS
    * For DeviceOrientationEvent to work on Safari on iOS 13 and up, the user has to give permission
    * through a user activation event, such as a button press.
    */
    const isIOS = !window.MSStream && /iPad|iPhone|iPod|Macintosh/.test(window.navigator.userAgent);
    if (isIOS) {
      // Add a button that requests permission for sensor use on press
      this.requestPermission();
    } else {
      // If user is not on iOS, sensor data can be read as normal.
      window.addEventListener('deviceorientation', (event) => {
        this.onReadOrientation(event);
      });
    }
  }

  /**
   * Adds a button to the document to ask for permission to use IMU sensor on iOS.
   */
  requestPermission() {
    const permbutton = window.document.createElement('button');
    permbutton.setAttribute('id', 'permission');
    permbutton.innerHTML = 'requestPermission';
    permbutton.addEventListener('click', () => {
      if (typeof(window.DeviceOrientationEvent.requestPermission) === 'function') {
        // if permission, Enable callback for deviceOrientationEvent
        window.DeviceOrientationEvent.requestPermission().then((response) => {
          if (response==='granted') {
            window.addEventListener('deviceorientation', (event) => {
              this.onReadOrientation(event);
            });
          } else {
            throw new PermissionDeniedError('No permission granted for Device Orientation');
          }
        });
      } else {
        throw new Error('requestPermission for iOS is not a function!');
      }
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
    this.alpha = Math.abs(event.alpha - 360);
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
