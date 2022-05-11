/*
 Used sources:
    https://dev.to/orkhanjafarovr/real-compass-on-mobile-browsers-with-javascript-3emi
    https://answers.ros.org/question/65971/how-can-i-publish-an-integer-and-string-int16-string-using-roslibjs/
*/

// Dependencies
const IntervalPublisher = require('./IntervalPublisher.js');

/**
 * GPSDeclinationPublisher publishes the rotation as a compass to
 * a certain point in the world.
 * By default it publishes data at the interval rate
 * from parrent class IntervalPublisher
 *
 * The data resulting from the interactions is published as a
 * ROS std_msgs/Int32 message.
 */
class GPSDeclinationPublisher extends IntervalPublisher {
  /**
   * Creates a new sensor publisher that publishes to the provided topic.
   * @param {Topic} topic a Topic from RosLibJS
   * @param {Number} latitude float that gives the latitude of point where to aim for
   * @param {Number} longitude float that gives the longitude of point where to aim for
   */
  constructor(topic, latitude, longitude) {
    super(topic);

    if (!((typeof latitude === 'number') && (typeof longitude === 'number'))) {
      throw new TypeError('Coördinates were not of type Number');
    }

    this.topic = topic;

    // Sets, fields for compass
    this.compass = 0;
    this.lat = latitude;
    this.lng = longitude;

    // First need to detect first device orientation.
    this.orientationReady = false;

    // Prevents double message publishing
    this.oldCompass = null;
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
   * Helper method for angle calculation
   * @param {Number} latitude from coordinates of Geolocation
   * @param {Number} longitude from coordinates of Geolocation
   * @return {Number} angle between current position and the North
   */
  calcDegreeToPoint(latitude, longitude) {
    const phiK = (this.lat * Math.PI) / 180.0;
    const lambdaK = (this.lng * Math.PI) / 180.0;
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
    this.compass = this.calcDegreeToPoint(latitude, longitude);

    if (this.compass < 0) {
      this.compass = this.compass + 360;
    }

    this.orientationReady = true;
  }

  /**
   * Puts the declination
   * in a ROS message and publishes it
   */
  createSnapshot() {
    window.navigator.geolocation.getCurrentPosition(this.locationHandler);
    if (!this.orientationReady) {
      throw Error('Orientation is not read yet!');
    }
    // Check if compass changed
    if (this.compass === this.oldCompass) {
      return;
    }

    this.oldCompass = this.compass;

    const GPSDeclinationMessage = new ROSLIB.Message({
      data: this.compass,
    });

    this.topic.publish(GPSDeclinationMessage);
  }
}

module.exports = GPSDeclinationPublisher;
