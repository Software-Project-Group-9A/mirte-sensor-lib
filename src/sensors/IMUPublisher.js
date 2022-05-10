// Assumptions:
// A non-set timer is no problem.
// A covariance matrix can be set to all zeroes.

// Dependencies
const THREE = require('three');
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

    // Flags used to detect whether callbacks
    // have been invoked.
    this.orientationReady = false;
    this.motionReady = false;

    // Default values
    this.alpha = 0;
    this.beta = 0;
    this.gamma = 0;

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
     * Resource used: http://wiki.ros.org/roslibjs/Tutorials/Publishing%20video%20and%20IMU%20data%20with%20roslibjs
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
