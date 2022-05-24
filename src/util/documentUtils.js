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
  const topicName = element.id;

  // do not publish elements without id
  if (topicName.length < 1) {
    return;
  }

  const topic = new ROSLIB.Topic({
    name: topicName,
    ros: ros,
  });

  switch (element.constructor.name) {
    case 'HTMLButtonElement':
      map.set(topicName, new ButtonPublisher(topic, element));
      return;
    case 'HTMLInputElement':
      if (element.type === 'range') {
        map.set(topicName, new SliderPublisher(topic, element));
      } else if (element.type === 'text') {
        map.set(topicName, new TextPublisher(topic, element));
      }
      return;
    case 'HTMLCanvasElement':
      // map.set(topicName, new ImageSubscriber(topic, element));
      return;
    default:
      map.set(topicName, new TextSubscriber(topic, element));
  }
}

/**
 *
 * @param {HTMLElement} parentElement
 * @param {ROSLIB.Ros} ros
 * @param {Map} map
 * @return {Map} map where each publisher is stored under it's respective topic name
 */
function publishChildElements(parentElement, ros, map) {
  // create default map
  map = map || new Map();
  // if no parent node is specified, publish to entire document by default
  parentElement = parentElement || window.self;

  if (!(ros instanceof ROSLIB.Ros)) {
    throw new TypeError('ros argument must be of type ROSLIB.Ros');
  }

  if (!(parentElement instanceof window.HTMLElement)) {
    throw new TypeError('parentElement argument must be of type HTMLElement');
  }

  if (!(map instanceof Map)) {
    throw new TypeError('map argument must be of type Map');
  }

  if (parentElement.children === 0) {
    return map;
  }

  // Depth-first search through all children for valid elements to publish
  for (let i = 0; i < parentElement.childElementCount; i++) {
    const childNode = parentElement.children[i];

    tryPublishElement(childNode, ros, map);
    publishChildElements(childNode, ros, map);
  }

  return map;
}

module.exports = {
  publishChildElements: publishChildElements,
  tryPublishElement: tryPublishElement,
};
