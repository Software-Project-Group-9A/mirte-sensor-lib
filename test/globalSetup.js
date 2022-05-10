/* JSDOM for simulating browser environment
const {JSDOM} = require('jsdom');
const {window} = new JSDOM(``, {});

// define JSDOM window in global scope, if not already defined
global.window = window;
global.document = global.window || window;

*/
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
    this.msg = msg;
  },
};
