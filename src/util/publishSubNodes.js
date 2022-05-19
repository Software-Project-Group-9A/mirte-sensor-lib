

function tryPublishNode(node) {
    switch(node) {
        case node instanceof window.HTMLButtonElement:
            console.log('yo');
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
}