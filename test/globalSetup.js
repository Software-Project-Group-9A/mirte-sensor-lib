/**
 * global setup for all tests.
 * Should be included in every test file.
 */

// assert library
global.assert = global.assert || require('assert');
// sinon
global.sinon = global.sinon || require('sinon');
// JSDOM for simulating browser environment
if (!global.window) {
  const {JSDOM} = require('jsdom');
  const {window} = new JSDOM(``, {});

  global.window = window;
}


// define JSDOM window in global scope
global.window = global.window || window;

// define dummy ROSLIB in global scope
global.ROSLIB = {
  Topic: function(options) {
    // provide empty object if no options given
    options = options || {};

    this.name = options.name;
    this.ros = options.ros;
    this.messageType = options.messageType;

    this.publish = function(msg) {};
    this.subscribe = function(callback) {};
    this.unsubscribe = function(callback) {};
  },
  Message: function(msg) {
    Object.assign(this, msg);
  },
};

before(function() {
  global.clock = sinon.useFakeTimers();
});

afterEach(function() {
  global.clock.reset();
});

after(function() {
  global.clock.uninstall();
});
