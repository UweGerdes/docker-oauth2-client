/**
 * scripts for boilerplate
 */

'use strict';

let handler = {};

/**
 * open url from selection
 */
handler['data-open-url'] = {
  elements: document.querySelectorAll('[data-open-url]'),
  event: 'click',
  func: function (event) {
    const element = event.target;
    document.location.href = element.getAttribute('data-open-url');
  }
};

/**
 * attach event to elements
 *
 * @param {DOMelement} element - to attach event
 * @param {string} event - type
 * @param {function} handler - event handler
 */
function attachEventHandler(element, event, handler) {
  if (element.attachEvent) {
    element.attachEvent('on' + event, handler);
  } else if (element.addEventListener) {
    element.addEventListener(event, handler, false);
  } else {
    element.addEventListener(event, handler, false);
  }
}

/**
 * attach event handlers
 */
Object.values(handler).forEach((handler) => {
  handler.elements.forEach((element) => {
    attachEventHandler(element, handler.event, handler.func);
  });
});
