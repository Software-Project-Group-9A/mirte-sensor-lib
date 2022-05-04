// Assumptions:
// A non-set timer is no problem.
// A covariance matrix can be set to all zeroes.

// Dependencies
// const Quaternion = require('quaternion');
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
    super(topic, 4);
    this.topic = topic;

    // First need to detect first device orientation.
    this.orientationReady = false;
    this.motionReady = false;

    // Enable callback for deviceOrientationEvent
    window.addEventListener('deviceorientation', (event) => {
      this.onReadOrientation(event).bind(this);
    });
    console.log(window.DeviceMotionEvent);
    // Enable callback for deviceMotionEvent
    if (window.DeviceMotionEvent) {
      window.addEventListener('devicemotion', (event) => {
        this.onReadMotion(event).bind(this);
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
    self.alpha = event.alpha;
    self.beta = event.beta;
    self.gamma = event.gamma;
    self.orientationReady = true;
  }

  /**
     * Callback for reading motion data.
     * @param {*} event object containing sensor data.
     */
  onReadMotion(event) {
    const rotation = event.rotationRate;
    const acceleration = event.acceleration;

    // acceleration
    self.x = acceleration.x;
    self.y = acceleration.y;
    self.z = acceleration.z;

    // rotation
    self.valpha = rotation.alpha;
    self.vbeta = rotation.beta;
    self.vgamma = rotation.gamma;

    self.motionReady = true;
  }

  /**
     * Create snapshot creates snapshot of IMU data and publishes this as a
     * ROS message to this.
     * Resource used: http://wiki.ros.org/roslibjs/Tutorials/Publishing%20video%20and%20IMU%20data%20with%20roslibjs
     */
  createSnapshot() {
    if (!this.orientationReady || !this.motionReady) {
      throw Error('snapShot was too early!');
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
            frame_id: 'imu_client',
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
        },
    );

    // Publish message on designated topic.
    console.log(imuMessage);
    // this.topic.publish(imuMessage);
  }
}

module.exports = IMUPublisher;
