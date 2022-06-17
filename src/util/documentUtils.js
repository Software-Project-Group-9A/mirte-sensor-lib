const ButtonPublisher = require('../sensors/ButtonPublisher');
const CheckboxPublisher = require('../sensors/CheckboxPublisher');
const ImageSubscriber = require('../actuators/ImageSubscriber');
const SliderPublisher = require('../sensors/SliderPublisher');
const TextPublisher = require('../sensors/TextPublisher');
const TextSubscriber = require('../actuators/TextSubscriber');

/**
 * Takes an HTML element, and creates the appropriate Publisher if possible.
 * The id of the element and type of element will determine the name of the topic.
 * In order to be able to publish an element, the following must be true:
 *  - The element must have an id
 *  - The element must be an HTML element
 *  - The element must be one of the following types:
 *    > HTMLButtonElement - published as ButtonPublisher, to topic mirte/phone_button/{id}
 *    > HTMLInputElement - published as SliderPublisher if type is set to 'range',
 *      and as TextPublisher if type is set to 'text', to topics mirte/phone_slider/{id}
 *      and mirte/phone_text_input/{id} respectively
 *    > HTMLCanvasElement - subscribed as ImageSubscriber, to topic mirte/phone_image_output/{id}
 *    > If none of the above are applicable, the element will be subscribed as a TextSubscriber
 *      to topic mirte/phone_text_output/{id}
 * Any resulting publisher or subscriber will be placed in the provided map, with its id as its key
 * @param {HTMLElement} element HTMLElement to attempt to publish
 * @param {ROSLIB.Ros} ros ros instance to which to publish/subscribe resulting publishers and subscribers
 * @param {Map} map Map in which to place any created publisher or subscriber
 */
function tryPublishElement(element, ros, map) {
  const instanceName = element.id;

  // do not publish elements without id
  if (instanceName.length < 1) {
    return;
  }

  if (!(element instanceof window.HTMLElement)) {
    throw new TypeError('element was not instance of HTMLElement');
  }

  // find appropriate action for element
  let mapEntry;
  switch (element.constructor.name) {
    case 'HTMLButtonElement':
      mapEntry = new ButtonPublisher(ros, 'mirte/phone_button/' + instanceName, element);
      break;
    case 'HTMLInputElement':
      if (element.type && element.type === 'range') {
        mapEntry = new SliderPublisher(ros, 'mirte/phone_slider/' + instanceName, element);
      } else if (element.type && element.type === 'text') {
        mapEntry = new TextPublisher(ros, 'mirte/phone_text_input/' + instanceName, element);
      } else if (element.type && element.type === 'checkbox') {
        mapEntry = new CheckboxPublisher(ros, 'mirte/phone_checkbox/' + instanceName, element);
      }
      break;
    case 'HTMLCanvasElement':
      mapEntry = new ImageSubscriber(ros, 'mirte/phone_image_output/' + instanceName, element);
      break;
    default:
      mapEntry = new TextSubscriber(ros, 'mirte/phone_text_output/' + instanceName, element);
  }

  // check for duplicate topic names
  const topicName = mapEntry.topic.name;
  if (map.has(topicName)) {
    throw new Error(`topic name ${topicName} already published`);
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

  // check recursive base case
  if (parentElement.children === 0) {
    return map;
  }

  // depth-first search through all children for valid elements to publish
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
