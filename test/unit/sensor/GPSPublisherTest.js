const assert = require('assert');
// Sinon library for mocking
const sinon = require('sinon');

// JSDOM for simulating browser environment
const {JSDOM} = require('jsdom');
const {window} = new JSDOM(``, {});

// Module to test
const GPSPublisher = require('../../../src/sensors/GPSPublisher.js');
const NotSupportedError = require('../../../src/error/NotSupportedError.js');
const { afterEach } = require('mocha');

// define JSDOM window in global scope, if not already defined
global.window = global.window || window;
const {document} = global.window;

require('../../globalSetup.js');

function createGeolocationMock() {
  return sinon.mock(
    {
      watchPosition: function(succes, error, options) {},
      clearWatch: function(watchId) {},
    }
  );
}

describe("GPSPublisher", function() {
  describe("#constructor", function() {
    it("should create a new instance if the geolocation API is supported", function() {
      // mock navigator instance
      global.window.navigator.geolocation = createGeolocationMock();
      const topic = new ROSLIB.Topic();
      const frequency = 10;

      const publisher = new GPSPublisher(topic, frequency);

      assert.equal(publisher.topic, topic);
      assert.equal(publisher.freq, frequency);
    });
    it("should set the correct message type for the topic", function() {
      // mock navigator instance
      global.window.navigator.geolocation = true;
      const topic = new ROSLIB.Topic();
      const frequency = 10;

      const publisher = new GPSPublisher(topic, frequency);

      assert.equal(publisher.topic.messageType, 'sensor_msgs/NavSatFix');
    });
    it("should throw an error if the geolocation API is not suppported", function() {
      const topic = new ROSLIB.Topic();
      const frequency = 10;

      assert.throws(() => new GPSPublisher(topic, frequency), NotSupportedError);
    });
  });
  describe("#start", function() {
    it("should add the correct callbacks to geolocation", function() {
      global.window.navigator.geolocation = createGeolocationMock();
      const topic = new ROSLIB.Topic();
      const frequency = 10;

      //assert.equal(global.window.navigator.geolocation, false);

      const publisher = new GPSPublisher(topic, frequency);
      publisher.start();
    });
  });

  afterEach(function() {
    // make sure geolocation is reset to undefined
    global.window.navigator.geolocation = undefined;
  })
});
