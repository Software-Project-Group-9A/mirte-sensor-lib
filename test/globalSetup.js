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

// define dummy ROSLIB in global scope, if not already defined
global.ROSLIB = global.ROSLIB || {
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
  Ros: function() {},
  Message: function(msg) {
    Object.assign(this, msg);
  },
  Ros: function() {},
};

before(function() {
  // before each test file, create a new fake timer
  global.clock = sinon.useFakeTimers();
});

afterEach(function() {
  // after each test, reset the clock and remove all attached callbacks
  global.clock.reset();
});

after(function() {
  // after all tests, uninstall the fake clock
  global.clock.uninstall();
});
