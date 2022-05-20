/**
 * 
 * @param {HTMLElement} node 
 */
function tryPublishNode(node, ros) {
    const id = node.id;

  switch (node) {
    case node instanceof window.HTMLButtonElement:
      break;
    default:
      console.log('no');
  }
}

/**
 *
 * @param {ROSLIB.Ros} ros
 * @param {HTMLElement} parentNode
 * @return {Object} dictionary of all created publishers.
 */
function publishAllChildren(ros, parentNode) {
    if (!(ros instanceof ROSLIB.Ros)) {
        throw Error('ros argument must be valid ROSLIB.Ros instance');
    }
    
  // if no parent node is specified, publish to entire document by default
  if (!parentNode) {
    parentNode = window.self;
  }

  if (parentNode.children === 0) {
    return;
  }

  for (const childNode in parentNode.childNodes) {
    tryPublishNode(childNode, ros, dictionary);
  }

  return dictionary;
}
