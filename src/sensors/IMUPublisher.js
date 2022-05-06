// Assumptions:
// A non-set timer is no problem.
// A covariance matrix can be set to all zeroes.

// Dependencies
const Quaternion = require('quaternion');
const IntervalPublisher = require('./IntervalPublisher.js');

// Important documentation
// http://docs.ros.org/en/lunar/api/sensor_msgs/html/msg/Imu.html

// Great example used
// http://wiki.ros.org/roslibjs/Tutorials/Publishing%20video%20and%20IMU%20data%20with%20roslibjs

/**
 * Object that publishes IMU sensor data to the provided ROS topic.
 */
class IMUPublisher extends IntervalPublisher {
  /**
     * Creates a new sensor publisher that publishes to the provided topic.
     * @param {Topic} topic a Topic from RosLibJS
     */
  constructor(topic) {
    super(topic, 2);
    this.topic = topic;

    // First need to detect first device orientation.
    this.orientationReady = false;
    this.motionReady = false;

    // Default values
    // TODO: find way to disclose not used yet.
    this.valpha = 0;
    this.vbeta = 0;
    this.vgamma = 0;

    // Enable callback for deviceOrientationEvent
    window.addEventListener('deviceorientation', (event) => {
      this.onReadOrientation.bind(this)(event);
    });

    // Enable callback for deviceMotionEvent
    if (window.DeviceMotionEvent) {
      window.addEventListener('devicemotion', (event) => {
        this.onReadMotion.bind(this)(event);
      });
    } else {
      window.alert('acceleration not supported!');
      throw Error('Faulty! No Motion Event!');
    }
  }

  /**
     * Callback for reading orientation data.
     * @param {*} event object containing sensor data.
     */
  onReadOrientation(event) {
    this.alpha = event.alpha;
    this.beta = event.beta;
    this.gamma = event.gamma;
    this.orientationReady = true;
  }

  /**
     * Callback for reading motion data.
     * @param {*} event object containing sensor data.
     */
  onReadMotion(event) {
    const rotation = event.rotationRate;
    const acceleration = event.acceleration;

    // acceleration
    this.x = acceleration.x;
    this.y = acceleration.y;
    this.z = acceleration.z;

    // rotation
    this.valpha = rotation.alpha;
    this.vbeta = rotation.beta;
    this.vgamma = rotation.gamma;

    this.motionReady = true;
  }

  /**
     * Create snapshot creates snapshot of IMU data and publishes this as a
     * ROS message to this.
     * Resource used: http://wiki.ros.org/roslibjs/Tutorials/Publishing%20video%20and%20IMU%20data%20with%20roslibjs
     */
  createSnapshot() {
    if (!this.orientationReady || !this.motionReady) {
      console.log('Motion or orientation not yet detected!');
    }
    // Convert rotation into quaternion.
    const alphaRad = ((this.alpha + 360) / 360 * 2 * Math.PI) % (2 * Math.PI);
    const betaRad = ((this.beta + 360) / 360 * 2 * Math.PI) % (2 * Math.PI);
    const gammaRad = ((this.gamma + 360) / 360 * 2 * Math.PI) % (2 * Math.PI);
    const q = Quaternion.fromEuler(alphaRad, betaRad, gammaRad, 'ZXY');

    // Create imuMessage in ROS's IMU-message format.
    const imuMessage = new ROSLIB.Message(
        {
          header: {
          },
          orientation: {
            x: q.x,
            y: q.y,
            z: q.z,
            w: q.w,
          },
          orientation_covariance: [0, 0, 0, 0, 0, 0, 0, 0, 0],
          angular_velocity: {
            x: this.vbeta,
            y: this.vgamma,
            z: this.valpha,
          },
          angular_velocity_covariance: [0, 0, 0, 0, 0, 0, 0, 0, 0],
          linear_acceleration: {
            x: this.x,
            y: this.y,
            z: this.z,
          },
          linear_acceleration_covariance: [0, 0, 0, 0, 0, 0, 0, 0, 0],
        }
    );

    // Publish message on designated topic.
    this.topic.publish(imuMessage);
  }
}

module.exports = IMUPublisher;
