/*
 Used sources:
    https://dev.to/orkhanjafarovr/real-compass-on-mobile-browsers-with-javascript-3emi
    https://answers.ros.org/question/65971/how-can-i-publish-an-integer-and-string-int16-string-using-roslibjs/
*/

// Dependencies
const PermissionDeniedError = require('../error/PermissionDeniedError.js');
const IntervalPublisher = require('./IntervalPublisher.js');

/**
 * CompassPublisher publishes the rotation as a compass
 * By default it publishes data at the interval rate
 * from parrent class IntervalPublisher
 *
 * The data resulting from the interactions is published as a
 * ROS std_msgs/Int32 message.
 */
class CompassPublisher extends IntervalPublisher {
  /**
   * Creates a new sensor publisher that publishes to the provided topic.
   * @param {ROSLIB.Ros} ros a ROS instance to publish to
   * @param {String} topicName name for the topic to publish data to
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
    /*
    * Support for iOS
    * For DeviceOrientationEvent and DeviceMotionEvent to work on Safari on iOS 13 and up,
    * the user has to give permission through a user activation event.
    * Note: This will only work through either localhost or a secure connection (https).
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

    super.start();
  }

  /**
   * Adds a button to the document to ask for permission to use IMU sensor on iOS.
   */
  requestPermission() {
    const permbutton = window.document.createElement('button');
    permbutton.innerHTML = 'Request Motion Sensor Permission';
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
   * Puts the magnetic declination in a ROS message and publishes it
   */
  createSnapshot() {
    if (!this.orientationReady) {
      throw Error('Orientation is not read yet!');
    }

    const Compass = new ROSLIB.Message({
      data: this.alpha,
    });

    this.msg = Compass;
    super.createSnapshot();
  }

  /**
   * Deserializes a CompassPublisher stored in a config object,
   * and returns the resulting publisher instance.
   * The returned instance is already started.
   * @param {ROSLIB.Ros} ros ros instance to which to resulting publisher will publish
   * @param {Object} config object with the following keys:
   * @param {string} config.name - name of the publisher to create
   * @param {number} config.frequency - name of the publisher to create
   * @return {CompassPublisher} CompassPublisher described in the provided properties parameter
   */
  static readFromConfig(ros, config) {
    const topicName = 'mirte/phone_compass/' + config.name;
    const publisher = new CompassPublisher(ros, topicName);
    publisher.start();
    publisher.setPublishFrequency(config.frequency);

    return publisher;
  }
}

module.exports = CompassPublisher;
