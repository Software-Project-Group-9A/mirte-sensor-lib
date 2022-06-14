const IntervalPublisher = require('./IntervalPublisher');
const NotSupportedError = require('../error/NotSupportedError');

/**
 * GPSPublisher publishes the geolocation data of the
 * current device.
 *
 * The user must make sure to give permission for access
 * to their geolocation.
 */
class GPSPublisher extends IntervalPublisher {
  /**
   * Creates a new GPSPublisher, which will publish the longitude and latitude
   * of the current device in the form of a sensor_msgs/NavSatFix message.
   * @param {ROSLIB.Ros} ros a ROS instance to publish to
   * @param {ROSLIB.Topic} topicName name for the topic to publish data to
   * @param {number} hz frequency at which to publish GPS data, in Hertz.
   * If no frequency is specified, this will default to 1 Hz.
   * @throws {NotSupportedError} if the Geolocation API is not supported
   * by the current browser.
   */
  constructor(ros, topicName, hz = 1) {
    super(ros, topicName, hz);

    this.topic.messageType = GPSPublisher.messageType;

    /**
     * Id of geolocation watch callback
     */
    this.watchId = -1;

    /**
     * GeolocationPosition storing latest device position.
     * Is set to null when the latest position was already published.
     */
    this.position = undefined;

    // check support for API
    if (!window.navigator.geolocation) {
      throw new NotSupportedError('Unable to create GPSPublisher, ' +
        'Geolocation API not supported');
    }
  }

  /**
   * Returns the message type this publisher publishes its data.
   */
  static get messageType() {
    return 'sensor_msgs/NavSatFix';
  }

  /**
   * Start the publishing of data to ROS with frequency of <freq> Hz.
   */
  start() {
    super.start();

    // Callback for reading position data
    const successCallback = function(pos) {
      this.position = pos;
    }.bind(this);

    // Callback for handling errors. Will throw any error provided to it.
    const errorCallback = function(error) {
      throw error;
    };

    this.watchId = window.navigator.geolocation.watchPosition(
        successCallback,
        errorCallback);
  }

  /**
   * Stops the publishing of data to ROS.
   */
  stop() {
    super.stop();
    window.navigator.geolocation.clearWatch(this.watchId);
  }

  /**
   * Creates a new ROS.Message object, containing a
   * sensor_msgs/NavSatFix message.
   *
   * Only the longitude and latitude are contained in this
   * message.
   * @param {GeolocationCoordinates} coordinates coordinates to be
   * contained by the created message.
   * @return {ROSLIB.Message} sensor_msgs/NavSatFix message containing longitude
   * and latitude of supplied coordinates.
   */
  static createNavSatMessage(coordinates) {
    return new ROSLIB.Message({
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      position_covariance_type: 0,
    });
  }

  /**
   * Creates a snapshot of the current position of the device, and publishes
   * this data as a sensor_msgs/NavSatFix message.
   */
  createSnapshot() {
    // position has not yet been set, do not publish
    if (!this.position) {
      return;
    }

    // create and publish message
    const coordinates = this.position.coords;
    const message = GPSPublisher.createNavSatMessage(coordinates);

    this.msg = message;
    super.createSnapshot();
  }

  /**
   * Deserializes a GPSPublisher stored in a config object, and returns the resulting publisher instance.
   * The returned instance is already started.
   * @param {ROSLIB.Ros} ros ros instance to which to resulting publisher will publish
   * @param {Object} config object with the following keys:
   * @param {string} config.name - name of the publisher to create
   * @param {number} config.frequency - name of the publisher to create
   * @return {GPSPublisher} GPSPublisher described in the provided properties parameter
   */
  static readFromConfig(ros, config) {
    const topicName = 'mirte/phone_gps/' + config.name;
    const publisher = new GPSPublisher(ros, topicName);
    publisher.start();
    publisher.setPublishFrequency(config.frequency);

    return publisher;
  }
}

module.exports = GPSPublisher;
