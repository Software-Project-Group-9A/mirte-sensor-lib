const ButtonPublisher = require('../sensors/ButtonPublisher');
const SliderPublisher = require('../sensors/SliderPublisher');
const TextPublisher = require('../sensors/TextPublisher');
const ImageSubscriber = require('../actuators/ImageSubscriber');
const TextSubscriber = require('../actuators/TextSubscriber');

/**
 * Takes an HTMLElement, and creates the an appropriate Publisher if possible.
 * The data of the HTMLElement is published to a topic with the same name as the element's id.
 * In order to be able to publish an element, the following must be true:
 *  - The element must have an id
 *  - The element must be an HTML element
 *  - The element must be one of the following types:
 *    > HTMLButtonElement (published as ButtonPublisher)
 *    > HTMLInputElement  (published as SliderPublisher if type is set to 'range',
 *      and as TextPublisher if type is set to 'text')
 *    > HTMLCanvasElement (subscribed as ImageSubscriber)
 *    > If none of the above are applicable, the element will be subscribed as a TextSubscriber
 * Any resulting publisher or subscriber will be placed in the provided map, with its id as its key
 * @param {HTMLElement} element HTMLElement to attempt to publish
 * @param {ROSLIB.Ros} ros ros instance to which to publish/subscribe resulting publishers and subscribers
 * @param {Map} map Map in which to place any created publisher or subscriber
 */
function tryPublishElement(element, ros, map) {
  const topicName = element.id;

  // do not publish elements without id
  if (topicName.length < 1) {
    return;
  }

  if (!(element instanceof window.HTMLElement)) {
    throw new TypeError('element was not instance of HTMLElement');
  }

  // choose how to publish or subscribe element
  let mapEntry;
  switch (element.constructor.name) {
    case 'HTMLButtonElement':
      mapEntry = new ButtonPublisher(ros, topicName, element);
      break;
    case 'HTMLInputElement':
      if (element.type === 'range') {
        mapEntry = new SliderPublisher(ros, topicName, element);
      } else if (element.type === 'text') {
        mapEntry = new TextPublisher(ros, topicName, element);
      }
      break;
    case 'HTMLCanvasElement':
      mapEntry = new ImageSubscriber(ros, topicName, element);
      break;
    default:
      mapEntry = new TextSubscriber(ros, topicName, element);
  }

  mapEntry.start();
  map.set(topicName, mapEntry);
}

/**
 * Recursively publishes all children of the provided parentElement.
 * In order to be publishable, a child element must have an id.
 * For more information on the publishing of these childnodes,
 * see the comments on the @function tryPublishElement function
 * @param {HTMLElement} parentElement element of which to publish child elements
 * @param {ROSLIB.Ros} ros ros instance to which to publish child elements
 * @param {Map} [map] map in which to place resulting publishers and subscribers.
 *  Will create an empty map if no map is given.
 * @return {Map} Map where each publisher is stored under it's respective topic name
 */
function publishChildElements(parentElement, ros, map) {
  // create default map
  map = map || new Map();

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
