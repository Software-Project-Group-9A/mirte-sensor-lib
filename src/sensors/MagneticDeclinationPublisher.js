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
    this.motionReady = false;

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
   * Callback for angle calculation
   * @param {Number} latitude from coordinates of Geolocation
   * @param {Number} longitude from coordinates of Geolocation
   * @return {Number} angle between current position and the North
   */
  calcDegreeToPoint(latitude, longitude) {
    // North pole
    const point = {
      lat: 86.5,
      lng: 164.04,
    };

    const phiK = (point.lat * Math.PI) / 180.0;
    const lambdaK = (point.lng * Math.PI) / 180.0;
    const phi = (latitude * Math.PI) / 180.0;
    const lambda = (longitude * Math.PI) / 180.0;
    const psi =
      (180.0 / Math.PI) *
      Math.atan2(
          Math.sin(lambdaK - lambda),
          Math.cos(phi) * Math.tan(phiK) -
          Math.sin(phi) * Math.cos(lambdaK - lambda));
    return Math.round(psi);
  }

  /**
   * Gets the location and puts in variables
   *
   * Then calculates the degeree and makes sure
   * it is between 0 and 360
   * @param {Geolocation} position
   */
  locationHandler(position) {
    const {latitude, longitude} = position.coords;
    let pointDegree = this.calcDegreeToPoint(latitude, longitude);

    if (pointDegree < 0) {
      pointDegree = pointDegree + 360;
    }
  }

  /**
     * Callback for reading orientation data.
     * context of object that called callback.
     *
     * @param {DeviceOrientationEvent} event object containing sensor data.
     */
  onReadOrientation(event) {
    this.alpha = event.alpha;
    this.beta = event.beta;
    this.gamma = event.gamma;
    this.orientationReady = true;

    window.navigator.geolocation.getCurrentPosition(this.locationHandler);
  }

  /**
   * Puts the magnetic declination
   * in a ROS message and publishes it
   */
  createSnapshot() {
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
