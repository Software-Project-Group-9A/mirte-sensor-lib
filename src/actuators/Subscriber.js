/**
 * Template for object that subscribes to a provided ROS topic.
 */
class Subscriber {
  /**
   * Creates a new subscriber that subscribes to the provided topic.
   * @param {ROSLIB.Ros} ros a ROS instance to publish to
   * @param {ROSLIB.Topic} topicName name for the topic from roslibjs to subscribe to
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
     * ros instance to publish to
     */
    this.ros = ros;

    /**
     * topicName to which to name the topic
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
     * start/stop status of subscriber
     */
    this.started = false;

    this.onMessage = this.onMessage.bind(this);
  }

  /**
   * Callback that gets called when a message is received.
   * @param {ROSLIB.Message} msg the received message
   */
  onMessage(msg) {
    throw Error('onMessage method not defined!');
  }

  /**
   * Start by subscribing to ros topic.
   */
  start() {
    if (this.started) {
      throw new Error('Subscriber already started');
    }
    this.topic.subscribe(this.onMessage);
    this.started = true;
  }

  /**
   * Stops the subscriber.
   */
  stop() {
    if (!this.started) {
      throw new Error('Subscriber did not start yet');
    }
    this.topic.unsubscribe(this.onMessage);
    this.started = false;
  }
}

module.exports = Subscriber;
