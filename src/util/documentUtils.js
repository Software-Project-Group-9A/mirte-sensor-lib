/**
 * Publish the given HTMLElement, if possible.
 *
 * @param {HTMLElement} node
 * @param {ROSLIB.Ros} ros
 * @param {Object} dictionary
 */
function tryPublishNode(node, ros, dictionary) {
  if (!(node instanceof window.HTMLElement)) {
    throw new TypeError('node must be of type HTMLElement');
  }

  if (!(ros instanceof ROSLIB.Ros)) {
    throw new TypeError('ros must be of type ROSLIB.Ros');
  }
  // TODO: verify duplicates
  // TODO: invalid id verification

  const id = node.id;

  const topicOptions = {
    topicName: id,
    ros: ros,
  };

  switch (node) {
    case node instanceof window.HTMLButtonElement:
      dictionary[id] = new ROSLIB.ButtonPublisher(node, new ROSLIB.Topic(topicOptions));
      break;
    default:
      console.log('no');
  }
}


// TODO: do we want some sort of publisher collection to returns results with?
// should this also handle subscribers? How to signal this in the id?
/**
 *
 * @param {ROSLIB.Ros} ros
 * @param {HTMLElement} parentNode
 * @return {Object} dictionary of all created publishers.
 */
function publishAllChildren(ros, parentNode, dictionary) {
  dictionary = dictionary || {};

  // if no parent node is specified, publish to entire document by default
  parentNode = parentnode || window.self;

  if (!(ros instanceof ROSLIB.Ros)) {
    throw Error('ros argument must be valid ROSLIB.Ros instance');
  }

  if (!(parentNode instanceof window.HTMLElement)) {
    throw new TypeError('parentNode argument must be HTMLElement');
  }

  // try to publish every child element of the parent
  const numChildren = parentNode.children.length;
  for (let i = 0; i < numChildren; i++) {
    const childNode = parentNode.children[i];
    tryPublishNode(childNode, ros, dictionary);
  }

  return dictionary;
}

module.exports = {
  publishAllChildren: publishAllChildren,
  tryPublishNode: tryPublishNode,
};
