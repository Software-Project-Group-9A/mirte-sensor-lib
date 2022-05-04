/*
 Used sources:
    https://dev.to/orkhanjafarovr/real-compass-on-mobile-browsers-with-javascript-3emi
    https://answers.ros.org/question/65971/how-can-i-publish-an-integer-and-string-int16-string-using-roslibjs/
*/

// Dependencies
const IntervalPublisher = require('./IntervalPublisher.js');


let compass;
let pointDegree;

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

    const self = this;
    this.topic = topic;

    // First need to detect first device orientation.
    this.orientationReady = false;
    this.motionReady = false;

    // No support for IOS yet
    window.addEventListener('deviceorientation', (event) => {
      this.onReadOrientation(self, event);
    });
  }

  /**
   * Callback for when error occurs while reading sensor data.
   * @param {*} event containing error info.
   */
  onError(event) {
    console.log('Error: ' + event);
    throw Error('ERROR!');
  }

  /**
   * Callback for angle calculation
   * @param {*} latitude from coordinates of Geolocation
   * @param {*} longitude from coordinates of Geolocation
   * @return {Int} angle between current position and the North
   */
  calcDegreeToPoint(latitude, longitude) {
    // Qibla geolocation
    const point = {
      lat: 21.422487,
      lng: 39.826206,
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
    pointDegree = this.calcDegreeToPoint(latitude, longitude);

    if (pointDegree < 0) {
      pointDegree = pointDegree + 360;
    }
  }

  /**
     * Callback for reading orientation data.
     * @param {MagneticDeclinationPublisher} self
     * context of object that called callback.
     *
     * @param {*} event object containing sensor data.
     */
  onReadOrientation(self, event) {
    self.alpha = event.alpha;
    self.beta = event.beta;
    self.gamma = event.gamma;
    self.orientationReady = true;

    window.navigator.geolocation.getCurrentPosition(this.locationHandler);
  }

  /**
   * Puts the magnetic declination
   * in a ROS message and publishes it
   */
  createSnapshot() {
    console.log('**SNAP**');
    compass = Math.abs(this.alpha - 360);

    const magneticDecilinationMessage = new ROSLIB.Message({
      data: compass,
    });

    console.log(magneticDecilinationMessage);
    this.topic.publish(magneticDecilinationMessage);
  }
}

module.exports = MagneticDeclinationPublisher;
