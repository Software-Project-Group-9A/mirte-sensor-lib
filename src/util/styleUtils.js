/**
 *
 * @param {HTMLElement} element
 * @param {HTMLElement} parent
 * @param {number} x
 * @param {number} y
 */
function positionElement(element, parent, x, y) {
  const style = element.style;
  style.setProperty('position', 'absolute');
  style.setProperty('left', x + '%');
  style.setProperty('top', y + '%');
  parent.appendChild(element);
}

module.exports = {
  positionElement: positionElement,
};
