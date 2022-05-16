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
   * Creates a new sensor publisher that publishes the angle
   * between the device and the provided Coordinates to the provided topic.
   * Will point to the North Pole (latitude 90, longitude 0) if not coordinates are specified.
   * @param {Topic} topic a Topic from RosLibJS
   * @param {Number} latitude float that gives the latitude of point where to aim for
   * @param {Number} longitude float that gives the longitude of point where to aim for
   */
  constructor(topic, latitude = 90, longitude = 0) {
    super(topic);

    if (!((typeof latitude === 'number') && (typeof longitude === 'number'))) {
      throw new TypeError('Coordinates were not of type Number');
    }

    this.topic = topic;

    // Sets, fields for compass
    this.compass = 0;
    this.lat = latitude;
    this.lng = longitude;

    // First need to detect first device orientation.
    this.orientationReady = false;
    this.gpsReady = false;

    // Prevents double message publishing
    this.oldCompass = null;

    // No support for IOS yet
    window.addEventListener('deviceorientation', (event) => {
      this.onReadOrientation(event);
    }, true);
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
    if (latitude === this.lat && longitude === this.lng) {
      return 0;
    }
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
    let degree = Math.round(psi);
    degree = degree + 180;
    if (degree === 360) {
      degree = 0;
    }
    return degree;
  }

  /**
   * Gets the location and puts in variables
   *
   * Then calculates the deeree and makes sure
   * it is between 0 and 360
   * @param {Geolocation} position
   */
  locationHandler(position) {
    const {latitude, longitude} = position.coords;
    this.compass = this.calcDegreeToPoint(latitude, longitude);

    this.gpsReady = true;
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
   * difference between current rotation and aiming for
   * @return {Number} difference
   */
  accountForRotation() {
    let diff = this.compass - this.alpha;
    if (diff < 0) {
      diff = 360 + diff;
    }
    return diff;
  }

  /**
   * Puts the declination
   * in a ROS message and publishes it
   */
  createSnapshot() {
    window.navigator.geolocation.getCurrentPosition(this.locationHandler);
    if (!(this.orientationReady && this.gpsReady)) {
      throw Error('Orientation is not read yet!');
    }

    this.compass = this.accountForRotation();

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
