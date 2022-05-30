/**
 * Template for object that publishes sensor data to the provided ROS topic.
 */
class SensorPublisher {
  /**
   * Creates a new sensor publisher that publishes to the provided topic.
   * @param {ROSLIB.Ros} ros a ROS instance to publish to
   * @param {ROSLIB.Topic} topicname a Topic from RosLibJS
   * @throws TypeError if topic argument is not of type ROSLIB.Topic
   */
  constructor(ros, topicname) {
    if (!(ros instanceof ROSLIB.Ros)) {
      throw new TypeError('ros argument was not of type ROSLIB.Ros');
    }
    if (typeof(topicname) !== 'string') {
      throw new TypeError('topicname argument was not of type String');
    }

    /**
     * ros instance to publish data to
     */
    this.ros = ros;

    /**
     * topic to which to publish data
     */
    this.topicname = topicname;

    /**
     * start/stop status of sensor
     */
    this.started = false;
  }

  /**
   * Callback for when error occurs while reading sensor data.
   * @param {*} event containing error info.
   */
  onError(event) {
    throw Error('onError method not defined!');
  }

  /**
   * Callback for reading sensor data.
   * Should publish data to ROS topic.
   * @param {*} event object containing sensor data.
   */
  onReadData(event) {
    throw Error('onReadData method not defined!');
  }

  /**
   * Start the publishing of data to ROS.
   */
  start() {
    if (this.started) {
      throw new Error('Publisher already started');
    }
    this.started = true;
  }

  /**
   * Stops the publishing of data to ROS.
   */
  stop() {
    if (!this.started) {
      throw new Error('Publisher did not start yet');
    }
    this.started = false;
  }

  /**
   * Sets the maximum frequency at which new data can be published.
   */
  setPublishFrequency() {
    throw Error('setPublishFrequency method not defined!');
  }
}

module.exports = SensorPublisher;
