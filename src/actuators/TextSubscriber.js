const {positionElement} = require('../util/styleUtils.js');
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
   * @param {ROSLIB.Topic} topicName name for the topic to subscribe to
   * @param {HTMLElement} HTMLElement HTML element in which the messages will be displayed.
   */
  constructor(ros, topicName, HTMLElement) {
    super(ros, topicName);

    if (!(HTMLElement instanceof window.HTMLElement)) {
      throw new TypeError('HTMLElement argument was not of type HTMLElement');
    }

    this.topic.messageType = 'std_msgs/String';

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

  /**
   * Deserializes a TextSubscriber stored in a config object, and returns the resulting publisher instance.
   * The returned instance is already started.
   * @param {ROSLIB.Ros} ros ros instance to which subscriber will subscribe
   * @param {Object} config object with the following keys:
   * @param {string} config.name - name of the subscriber to create
   * @param {string} config.topicPath - path to location of topic of subscriber.
   *  subscriber will subscribe to the topic topicPath/name
   * @param {number} config.x distance from right side of container
   * @param {number} config.y distance from top side of container
   * @param {HTMLElement} targetElement HTML element in which to generate necessary UI elements
   * @return {TextSubscriber} TextSubscriber described in the provided properties parameter
   */
  static readFromConfig(ros, config, targetElement) {
    const div = window.document.createElement('div');
    div.width = '20%';

    positionElement(div, targetElement, config.x, config.y);

    const topicName = config.topicPath + '/' + config.name;
    const subscriber = new TextSubscriber(ros, topicName, div);

    return subscriber;
  }
}

module.exports = TextSubscriber;
