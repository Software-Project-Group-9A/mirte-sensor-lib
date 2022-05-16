// Assumptions:
// A non-set timer is no problem.
// A covariance matrix can be set to all zeroes.

// To check:
// Use on IOS with requesting permission

// Dependencies
const THREE = require('three');
const IntervalPublisher = require('./IntervalPublisher.js');

/**
 * Object that publishes IMU sensor data to the provided ROS topic.
 * Uses the following great example:
 * {@link http://wiki.ros.org/roslibjs/Tutorials/Publishing%20video%20and%20IMU%20data%20with%20roslibjs}
 */
class IMUPublisher extends IntervalPublisher {
  /**
     * Creates a new sensor publisher that publishes to the provided topic.
     * @param {Topic} topic a Topic from RosLibJS
     */
  constructor(topic) {
    // Frequency 5 used by estimation, could be further researched in the future.
    super(topic, 5);
    this.topic = topic;

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

    // Enable callback for deviceOrientationEvent

    if ( /iPad|iPhone|iPod|Macintosh/.test(navigator.userAgent) && !this.requestPermission(DeviceOrientationEvent)) {
      throw new PermissionDeniedError('Permission to use Device Orientation denied');
    } else {
      window.addEventListener('deviceorientation', (event) => {
        this.onReadOrientation(event);
      });
    }
    if ( /iPad|iPhone|iPod|Macintosh/.test(navigator.userAgent) && !this.requestPermission(DeviceMotionEvent)) {
      throw new PermissionDeniedError('Permission to use Device Orientation denied');
    } else {
    // Enable callback for deviceMotionEvent
      if (window.DeviceMotionEvent) {
        window.addEventListener('devicemotion', (event) => {
          this.onReadMotion.bind(this)(event);
        });
      } else {
        window.alert('acceleration not supported!');
      }
    }
  }

  /**
   * Adds a button to the document to ask for permission to use IMU sensor on iOS.
   *
   * @param {Event} event to request permission from.
   * @return {Boolean} true if permission is granted, else false.
   */
  requestPermission(event) {
    event.requestPermission()
        .then((response) => {
          if (response == 'granted') {
            return true;
          }
        })
        .catch(console.error);
    return false;
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
    const eurlerpose = new THREE.Euler(betaRad, gammaRad, alphaRad);

    // Create Quaternion based on device orientation
    const q = new THREE.Quaternion();
    q.setFromEuler(eurlerpose);

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
    this.topic.publish(imuMessage);
  }
}

module.exports = IMUPublisher;
