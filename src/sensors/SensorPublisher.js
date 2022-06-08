/**
 * Template for object that publishes sensor data to the provided ROS topic.
 */
class SensorPublisher {
  /**
   * Creates a new sensor publisher that publishes to the provided topic.
   * @param {ROSLIB.Ros} ros a ROS instance to publish to
   * @param {ROSLIB.Topic} topicName a Topic from RosLibJS
   * @throws TypeError if topic argument is not of type ROSLIB.Topic
   */
  constructor(ros, topicName) {
    if (!(ros instanceof ROSLIB.Ros)) {
      throw new TypeError('ros argument was not of type ROSLIB.Ros');
    }
    if (typeof(topicName) !== 'string') {
      throw new TypeError('topicName argument was not of type String');
    }

    /**
     * ros instance to publish data to
     */
    this.ros = ros;

    /**
     * Topicname of the topic to publish to.
     */
    this.topicName = topicName;

    /**
     * topic to publish to. The message type of the topic has to be set within every publisher
     */
    this.topic = new ROSLIB.Topic({
      ros: this.ros,
      name: this.topicName,
    });

    /**
     * start/stop status of sensor
     */
    this.started = false;
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
}

module.exports = SensorPublisher;
