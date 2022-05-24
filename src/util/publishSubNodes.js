/**
 *
 * @param {HTMLElement} element
 */
function tryPublishElement(element, ros, map) {
  const topicName = node.id;

  // do not publish elements without id
  if (topicName.length < 1) {
    return;
  }

  if (map.has(topicName)) {
    throw error('');
  }

  switch (node) {
    case node instanceof window.HTMLButtonElement:
      break;
    default:
      console.log('no');
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
