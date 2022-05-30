const Subscriber = require('./Subscriber.js');

/**
 * TextSubscriber subscribes to a ROS topic and displays the received messages
 * in an HTML element.
 *
 * The data should be from a topic with message type
 * ROS std_msgs/String message.
 */
class TextSubscriber extends Subscriber {
  /**
   * Creates a new TextSubscriber.
   * @param {ROSLIB.Ros} ros a ROS instance to publish to
   * @param {ROSLIB.Topic} topicname topic to which to subscribe to
   * @param {HTMLElement} HTMLElement HTML element in which the messages will be displayed.
   */
  constructor(ros, topicname, HTMLElement) {
    super(ros, topicname);

    if (!(HTMLElement instanceof window.HTMLElement)) {
      throw new TypeError('HTMLElement argument was not of type HTMLElement');
    }

    // Set the topic to publish to
    this.topic = new ROSLIB.Topic({
      ros: this.ros,
      name: this.topicname,
      messageType: 'sensor_msgs/CompressedImage',
    });

    this.HTMLElement = HTMLElement;
  }

  /**
   * Callback that gets called when a message is received.
   * Displays received message in HTML.
   * @param {ROSLIB.Message} msg the received message
   */
  onMessage(msg) {
    this.HTMLElement.innerHTML = msg.data;
  }
}

module.exports = TextSubscriber;
