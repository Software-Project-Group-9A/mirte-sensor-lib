const assert = require('assert');

// Sinon library for mocking
// Allows for fake timers, which might be useful in future testing
const sinon = require('sinon');

// JSDOM for simulating browser environment
const {JSDOM} = require('jsdom');
const {window} = new JSDOM(``, {});

// Module to test
const GPSDeclinationPublisher =
    require('../../../src/sensors/GPSDeclinationPublisher.js');

// define JSDOM window in global scope
global.window = global.window || window;

require('../../globalSetup.js');

describe('Test GPSDeclinationPublisher', function() {
  describe('#constructor(topic, latitude, longitude)', function() {
    /**
     * helper functions for checking whether correct error is raised
     * @param {*} error
     * @return {bool}
     */
    function expectInvalidData(error) {
      assert(error instanceof TypeError);
      assert.equal(error.message,
          'Coördinates were not of type Number');
      return true;
    }

    it('should reject an undefined latitude', function() {
      assert.throws(
          () => {
            new GPSDeclinationPublisher(new ROSLIB.Topic(), undefined, 1);
          },
          expectInvalidData,
      );
    });
    it('should reject an undefined longitude', function() {
      assert.throws(
          () => {
            new GPSDeclinationPublisher(new ROSLIB.Topic(), 1, undefined);
          },
          expectInvalidData,
      );
    });

    it('should accept a well defined coördinates', function() {
      assert.doesNotThrow(
          () => {
            new GPSDeclinationPublisher(new ROSLIB.Topic(), 1, 1);
          },
          (error) => {
            return false;
          },
      );
    });
  });

  describe('#calcDegreeToPoint(latitude, longitude)', function() {
    it('should calculate the degree between point and current location',
        function() {
          const topic = sinon.spy(new ROSLIB.Topic());
          const publisher = sinon.spy(new GPSDeclinationPublisher(topic, 1, 1));

          publisher.start();

          assert.equal(publisher.calcDegreeToPoint(1, 1), 0);
        });
  });

  describe('#locationHandler(position)', function() {
    it('should handle the location',
        function() {
          const topic = sinon.spy(new ROSLIB.Topic());
          const publisher = sinon.spy(new GPSDeclinationPublisher(topic, 1, 1));

          publisher.start();

          global.position = {
            'coords': {
              'latitude': 52.008254,
              'longitude': 4.370750,
            },
          };
          publisher.locationHandler(position);

          assert.equal(publisher.calcDegreeToPoint.callCount, 1);
        });
  });

  describe('#createSnapshot()', function() {
    it('should create snapshot', function() {
      const topic = sinon.spy(new ROSLIB.Topic());
      const publisher = sinon.spy(new GPSDeclinationPublisher(topic, 1, 1));

      global.geoPos = {
        'coords': {
          'latitude': -10,
          'longitude': 1,
        },
      };

      const mockGeolocation = {
        getCurrentPosition: function() {
          publisher.locationHandler(geoPos);
        },
      };

      global.window.navigator.geolocation = mockGeolocation;

      publisher.createSnapshot();

      assert.equal(publisher.calcDegreeToPoint.callCount, 1);
      assert.equal(publisher.locationHandler.callCount, 1);
      assert.equal(publisher.createSnapshot.callCount, 1);

      const expectedMessage = new ROSLIB.Message({data: 0});
      assert.equal(topic.publish.callCount, 1);
      assert.deepEqual(topic.publish.getCall(0).args[0], expectedMessage);
    });
    it('should not create double snapshot', function() {
      const topic = sinon.spy(new ROSLIB.Topic());
      const publisher = sinon.spy(new GPSDeclinationPublisher(topic, 1, 1));

      global.geoPos = {
        'coords': {
          'latitude': -10,
          'longitude': 1,
        },
      };

      const mockGeolocation = {
        getCurrentPosition: function() {
          publisher.locationHandler(geoPos);
        },
      };

      global.window.navigator.geolocation = mockGeolocation;

      publisher.createSnapshot();
      publisher.createSnapshot();

      assert.equal(publisher.calcDegreeToPoint.callCount, 2);
      assert.equal(publisher.locationHandler.callCount, 2);
      assert.equal(publisher.createSnapshot.callCount, 2);

      const expectedMessage = new ROSLIB.Message({data: 0});
      assert.equal(topic.publish.callCount, 1);
      assert.deepEqual(topic.publish.getCall(0).args[0], expectedMessage);
    });
  });
});
