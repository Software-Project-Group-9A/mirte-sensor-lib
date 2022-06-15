/**
 *
 * @param {HTMLElement} element
 * @param {HTMLElement} parent
 * @param {number} x
 * @param {number} y
 * @param {string} name
 */
function positionElement(element, parent, x, y, name) {
  // create div to hold element
  const div = window.document.createElement('div');
  const style = div.style;
  style.setProperty('position', 'absolute');
  style.setProperty('left', x + '%');
  style.setProperty('top', y + '%');

  // insert label and element into div
  const label = window.document.createElement('label');
  label.innerHTML = name;

  const br = window.document.createElement('br');

  div.appendChild(label);
  div.appendChild(br);
  div.appendChild(element);

  parent.appendChild(div);
}

module.exports = {
  positionElement: positionElement,
};
