/**
 * Positions an element within its parent.
 * This position is relative to the width and height of the parent element.
 * @param {HTMLElement} element element to position inside parent.
 * @param {HTMLElement} parent parent to place element in.
 * @param {number} x distance from right side of parent, as a percentage of its total width
 * @param {number} y distance from top side of parent, as a percentage of its total height
 */
function positionElement(element, parent, x, y) {
  // set position
  const style = element.style;
  style.setProperty('position', 'absolute');
  style.setProperty('left', x + '%');
  style.setProperty('top', y + '%');

  // add to parent
  parent.appendChild(element);
}

module.exports = {
  positionElement: positionElement,
};
