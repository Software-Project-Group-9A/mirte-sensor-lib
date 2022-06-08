// Assumptions:
// A non-set timer is no problem.

// To check:
// Use on IOS with requesting permission

// Dependencies
const IntervalPublisher = require('./IntervalPublisher.js');
const PermissionDeniedError = require('../error/PermissionDeniedError.js');
const MathUtils = require('../util/MathUtils.js');

/**
 * Object that publishes IMU sensor data to the provided ROS topic.
 * Uses the following great example:
 * {@link http://wiki.ros.org/roslibjs/Tutorials/Publishing%20video%20and%20IMU%20data%20with%20roslibjs}
 */
class IMUPublisher extends IntervalPublisher {
  /**
     * Creates a new sensor publisher that publishes to the provided topic.
     * @param {ROSLIB.Ros} ros a ROS instance to publish to
     * @param {ROSLIB.Topic} topicName a Topic from RosLibJS
     * @param {Number} hz a standard frequency for this type of object.
     */
  constructor(ros, topicName, hz = 5) {
    // Frequency 5 used by estimation, could be further researched in the future.
    super(ros, topicName, hz);

    this.topic.messageType = 'sensor_msgs/Imu';

    // Flags used to detect whether callbacks
    // have been invoked.
    this.orientationReady = false;
    this.motionReady = false;

    // Default values
    this.alpha = 0; // [0, 360)
    this.beta = 0; // [-180, 180)
    this.gamma = 0; // [-90, 90)

    this.valpha = 0;
    this.vbeta = 0;
    this.vgamma = 0;

    /*
    * Support for iOS
    * For DeviceOrientationEvent and DeviceMotionEvent to work on Safari on iOS 13 and up,
    * the user has to give permission through a user activation event.
    * Note: This will only work through either localhost or a secure connection (https).
    */
    if (!window.MSStream && /iPad|iPhone|iPod|Macintosh/.test(window.navigator.userAgent)) {
      this.requestPermission();
    }
    // If user is not on iOS, sensor data can be read as normal.
    window.addEventListener('deviceorientation', (event) => {
      if (event.isTrusted) {
        this.onReadOrientation.bind(this)(event);
      }
    });
    if (window.DeviceMotionEvent) {
      window.addEventListener('devicemotion', (event) => {
        if (event.isTrusted) {
          this.onReadMotion.bind(this)(event);
        }
      });
    } else {
      window.alert('acceleration not supported!');
    }
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
     * Callback for reading orientation data.
     * @param {*} event object containing sensor data.
     */
  onReadOrientation(event) {
    this.alpha = parseFloat(event.alpha);
    this.beta = parseFloat(event.beta);
    this.gamma = parseFloat(event.gamma);
    this.orientationReady = true;
  }

  /**
     * Callback for reading motion data.
     * @param {*} event object containing sensor data.
     */
  onReadMotion(event) {
    const rotation = event.rotationRate;
    const acceleration = event.acceleration;

    // Read acceleration
    this.x = acceleration.x;
    this.y = acceleration.y;
    this.z = acceleration.z;

    // Read rotation
    this.valpha = rotation.alpha;
    this.vbeta = rotation.beta;
    this.vgamma = rotation.gamma;

    this.motionReady = true;
  }

  /**
     * Create snapshot creates snapshot of IMU data and publishes this as a
     * ROS message to this.
     * Resource used:
     * {@link http://wiki.ros.org/roslibjs/Tutorials/Publishing%20video%20and%20IMU%20data%20with%20roslibjs}
     */
  createSnapshot() {
    // Convert rotation into quaternion.
    const alphaRad = ((this.alpha + 360) / 360 * 2 * Math.PI) % (2 * Math.PI);
    const betaRad = ((this.beta + 360) / 360 * 2 * Math.PI) % (2 * Math.PI);
    const gammaRad = ((this.gamma + 360) / 360 * 2 * Math.PI) % (2 * Math.PI);

    // Create Quaternion based on device orientation
    const q = MathUtils.quatFromEuler(betaRad, gammaRad, alphaRad);

    // Create imuMessage in ROS's IMU-message format.
    // For definition of message type see following source:
    // http://docs.ros.org/en/lunar/api/sensor_msgs/html/msg/Imu.html
    const imuMessage = new ROSLIB.Message(
        {
          header: {
            frame_id: 'world',
          },
          orientation: {
            x: q.x,
            y: q.y,
            z: q.z,
            w: q.w,
          },
          // According to the definition of this message,
          // an undefined asset should have value -1 at index 0 of it's covariance matrix
          orientation_covariance: [this.orientationReady ? 0 : -1, 0, 0, 0, 0, 0, 0, 0, 0],
          angular_velocity: {
            x: this.vbeta,
            y: this.vgamma,
            z: this.valpha,
          },
          // Idem for acceleration and rotation.
          angular_velocity_covariance: [this.motionReady ? 0 : -1, 0, 0, 0, 0, 0, 0, 0, 0],
          linear_acceleration: {
            x: this.x,
            y: this.y,
            z: this.z,
          },
          linear_acceleration_covariance: [this.motionReady ? 0 : -1, 0, 0, 0, 0, 0, 0, 0, 0],
        }
    );

    // Publish message on designated topic.
    this.msg = imuMessage;
    super.createSnapshot();
  }
}

module.exports = IMUPublisher;
