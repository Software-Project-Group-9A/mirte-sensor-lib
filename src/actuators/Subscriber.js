/**
 * Template for object that subscribes to a provided ROS topic.
 */
class Subscriber {
  /**
   * Creates a new subscriber that subscribes to the provided topic.
   * @param {Topic} topic a Topic from RosLibJS
   * @throws TypeError if topic argument is not of type ROSLIB.Topic
   */
  constructor(topic) {
    if (!(topic instanceof ROSLIB.Topic)) {
      throw new TypeError('topic argument was not of type ROSLIB.Topic');
    }

    /**
     * topic to which to publish button data
     */
    this.topic = topic;

    /**
     * start/stop status of subscriber
     */
    this.started = false;
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
    this.topic.subscribe(this.onMessage.bind(this));
    this.started = true;
  }

  /**
   * Stops the subscriber.
   */
  stop() {
    if (!this.started) {
      throw new Error('Subscriber did not start yet');
    }
    this.topic.unsubscribe(this.onMessage.bind(this));
    this.started = false;
  }
}

module.exports = Subscriber;
