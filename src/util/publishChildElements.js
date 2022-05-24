const ButtonPublisher = require('../sensors/ButtonPublisher');
const SliderPublisher = require('../sensors/SliderPublisher');
const TextPublisher = require('../sensors/TextPublisher');
// const ImageSubscriber = require('../actuators/ImageSubscriber');
const TextSubscriber = require('../actuators/TextSubscriber');

/**
 * 
 * @param {HTMLElement} element 
 * @param {ROSLIB.Ros} ros 
 * @param {Map} map 
 */
function tryPublishElement(element, ros, map) {
  const topicName = node.id;

  // do not publish elements without id
  if (topicName.length < 1) {
    return;
  }

  const topic = {
    topicName: topicName,
    ros: ros,
  };

  switch (node.constructor.name) {
    case 'HTMLButtonElement':
      map.set(topicName, new ButtonPublisher(element, topic));
      return;
    case 'HTMLInputElement':
      if (node.type === 'range') {
        map.set(topicName, new SliderPublisher(element, topic));
      } else if (node.type === 'text') {
        map.set(topicName, new TextPublisher(element, topic));
      }
      return;
    case 'HTMLCanvasElement':
      // map.set(topicName, new ImageSubscriber(element, topic));
      return;
    default:
      map.set(topicName, new TextSubscriber(element, topic));
  }
}

/**
 *
 * @param {HTMLElement} parentNode
 * @param {ROSLIB.Ros} ros
 * @param {Map} map
 * @return {Map} map where each publisher is stored under it's respective topic name
 */
function publishChildElements(parentNode, ros, map) {
  // create default map
  map = map || new Map();
  // if no parent node is specified, publish to entire document by default
  parentNode = parentNode || window.self;

  if (!(ros instanceof ROSLIB.Ros)) {
    throw new TypeError('ros argument must be of type ROSLIB.Ros');
  }

  if (!(parentNode instanceof HTMLElement)) {
    throw new TypeError('parentNode argument must be of type HTMLElement');
  }

  if (!(map instanceof Map)) {
    throw new TypeError('map argument must be of type Map');
  }

  if (parentNode.children === 0) {
    return;
  }

  // Depth-first search through all children for valid elements to publish
  for (let i = 0; i < parentNode.childElementCount; i++) {
    const childNode = parentNode.children[i];

    tryPublishElement(childNode, ros, map);
    publishChildElements(childNode, ros, map);
  }

  return map;
}

module.exports = publishChildElements;
