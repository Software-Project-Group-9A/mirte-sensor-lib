/*
 Used sources:
    https://dev.to/orkhanjafarovr/real-compass-on-mobile-browsers-with-javascript-3emi
    https://answers.ros.org/question/65971/how-can-i-publish-an-integer-and-string-int16-string-using-roslibjs/
*/

// Dependencies
const IntervalPublisher = require('./IntervalPublisher.js');
const PermissionDeniedError = require('../error/PermissionDeniedError.js');
const NotSupportedError = require('../error/NotSupportedError');

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
   * @param {ROSLIB.Ros} ros a ROS instance to publish to
   * @param {String} topicName name for the topic to publish data to
   * @param {Number} latitude float that gives the latitude of point where to aim for
   * @param {Number} longitude float that gives the longitude of point where to aim for
   * @param {Number} hz a standard frequency for this type of object.
   */
  constructor(ros, topicName, latitude = 90, longitude = 0, hz = 10) {
    super(ros, topicName, hz);

    if (!((typeof latitude === 'number') && (typeof longitude === 'number'))) {
      throw new TypeError('Coordinates were not of type Number');
    }

    if (latitude > 90 || latitude < -90 || longitude > 180 || longitude < -180) {
      throw new Error('Range of given coordinates is invalid');
    }

    this.topic.messageType = 'std_msgs/Int32';

    // Sets, fields for compass
    this.compass = 0;
    this.lat = latitude;
    this.lng = longitude;

    // First need to detect first device orientation.
    this.orientationReady = false;
    this.gpsReady = false;

    // Id of geolocation watch callback
    this.watchId = -1;

    /*
    * Support for iOS
    * For DeviceOrientationEvent and DeviceMotionEvent to work on Safari on iOS 13 and up,
    * the user has to give permission through a user activation event.
    * Note: This will only work through either localhost or a secure connection (https).
    */
    if (!window.MSStream && /iPad|iPhone|iPod|Macintosh/.test(window.navigator.userAgent)) {
      this.requestPermission();
    }

    // check support for API
    if (!window.navigator.geolocation) {
      throw new NotSupportedError('Unable to create GPSPublisher, ' +
        'Geolocation API not supported');
    }
  }

  /**
   * Start the publishing of data to ROS with frequency of <freq> Hz.
   */
  start() {
    super.start();

    window.addEventListener('deviceorientationabsolute', (event) => {
      if (event.isTrusted) {
        this.onReadOrientation(event);
      }
    }, true);

    this.watchId = window.navigator.geolocation.watchPosition(
        this.locationHandler.bind(this),
        (error) => {
          throw Error('failed to watch position');
        });
  }

  /**
   * Stops the publishing of data to ROS.
   */
  stop() {
    super.stop();
    window.navigator.geolocation.clearWatch(this.watchId);
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
   * Helper method for angle calculation
   * @param {Number} latitude from coordinates of Geolocation
   * @param {Number} longitude from coordinates of Geolocation
   * @return {Number} angle between current position and the North
   */
  calcDegreeToPoint(latitude, longitude) {
    if (latitude === this.lat && longitude === this.lng) {
      return 0;
    }


    // Copied code to calculate the degree
    // But works in a weird way
    // North = 180, East = -90, South = 0, West = 90
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
    // Round to shift out small changes
    let degree = Math.round(psi);
    // By this it becomes
    // North = 360, East = 90, South = 180, West = 270
    degree = degree + 180;
    // Since we work in range [0, 359]
    if (degree === 360) {
      degree = 0;
    }

    return degree;
  }

  /**
   * Gets the location and puts in variables
   *
   * Then calculates the degree and makes sure
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
    this.alpha = Math.round(Math.abs(event.alpha - 360));
    this.orientationReady = true;
  }

  /**
   * difference between current rotation and aiming for
   * @return {Number} difference
   */
  accountForRotation() {
    // Does point to - current looking at
    let diff = this.compass - this.alpha;
    // If it is smaller then 0 it means alpha is bigger
    // We could turn left that amount of degrees but taking compass [0, 360[ we account for that
    // So ex. -10 (10 degrees left) becomes 350 (350 degrees right)
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
    if (!(this.orientationReady && this.gpsReady)) {
      throw Error('Orientation is not read yet!');
    }

    this.compass = this.accountForRotation();

    const GPSDeclinationMessage = new ROSLIB.Message({
      data: this.compass,
    });

    this.msg = GPSDeclinationMessage;
    super.createSnapshot();
  }

  /**
   * Deserializes a GPSDeclinationPublisher stored in a config object, and returns the resulting publisher instance.
   * The returned instance is already started.
   * @param {ROSLIB.Ros} ros ros instance to which to resulting publisher will publish
   * @param {Object} config object with the following keys:
   * @param {string} config.name - name of the publisher to create
   * @param {string} config.topicPath - path to location of topic of publisher.
   *  Publisher will publish to the topic topicPath/name
   * @param {number} config.frequency - name of the publisher to create
   * @return {GPSDeclinationPublisher} GPSDeclinationPublisher described in the provided config parameter
   */
  static readFromConfig(ros, config) {
    const topicName = config.topicPath + '/' + config.name;
    const publisher = new GPSDeclinationPublisher(ros, topicName);

    publisher.start();
    publisher.setPublishFrequency(config.frequency);

    return publisher;
  }
}

module.exports = GPSDeclinationPublisher;
