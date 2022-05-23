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
   * @param {ROSLIB.Topic} topic topic to which to subscribe to
   * @param {HTMLElement} HTMLElement HTML element in which the messages will be displayed.
   */
  constructor(topic, HTMLElement) {
    super(topic);

    if (!(HTMLElement instanceof window.HTMLElement)) {
      throw new TypeError('HTMLElement argument was not of type HTMLElement');
    }

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