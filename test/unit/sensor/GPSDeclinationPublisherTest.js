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

global.window.navigator.geolocation = true;

require('../../globalSetup.js');

describe('Test GPSDeclinationPublisher', function() {
  describe('#constructor(topic, latitude, longitude)', function() {
    /**
     * Helper functions for checking whether correct error is raised for
     * invalid topics.
     * @param {Error} error The raised error.
     * @return {boolean} true if valid.
     */
    function expectOutOfRange(error) {
      assert(error.message === 'Range of given coordinates is invalid');

      return true;
    }
    it('should accept an undefined latitude', function() {
      assert.doesNotThrow(
          () => {
            new GPSDeclinationPublisher(new ROSLIB.Topic(), undefined, 1);
          },
          (error) => {
            return false;
          }
      );
    });
    it('should accept an undefined longitude', function() {
      assert.doesNotThrow(
          () => {
            new GPSDeclinationPublisher(new ROSLIB.Topic(), 1, undefined);
          },
          (error) => {
            return false;
          }
      );
    });

    it('should not accept an out of range latitude', function() {
      assert.throws(() => {
        new GPSDeclinationPublisher(new ROSLIB.Topic(), -100, 1);
      }, expectOutOfRange);
    });
    it('should not accept an out of range undefined longitude', function() {
      assert.throws(() => {
        new GPSDeclinationPublisher(new ROSLIB.Topic(), 1, 200);
      }, expectOutOfRange);
    });

    it('should accept a well defined coördinates', function() {
      assert.doesNotThrow(
          () => {
            new GPSDeclinationPublisher(new ROSLIB.Topic(), 1, 1);
          },
          (error) => {
            return false;
          }
      );
    });
  });

  describe('#calcDegreeToPoint(latitude, longitude)', function() {
    it('should calculate the degree between point and current location',
        function() {
          const topic = sinon.spy(new ROSLIB.Topic());
          const publisher = sinon.spy(new GPSDeclinationPublisher(topic, 1, 1));

          assert.equal(publisher.calcDegreeToPoint(1, 1), 0);
        });
  });

  describe('#locationHandler(position)', function() {
    it('should handle the location',
        function() {
          const topic = sinon.spy(new ROSLIB.Topic());
          const publisher = sinon.spy(new GPSDeclinationPublisher(topic, 1, 1));

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

      global.eventParam = {
        'alpha': 0,
        'beta': 1,
        'gamma': 1,
      };

      const mockGeolocation = {
        getCurrentPosition: function() {
          publisher.locationHandler(geoPos);
        },
      };

      global.window.navigator.geolocation = mockGeolocation;

      publisher.locationHandler(geoPos);
      publisher.onReadOrientation(eventParam);
      publisher.createSnapshot();

      assert.equal(publisher.calcDegreeToPoint.callCount, 1);
      assert.equal(publisher.locationHandler.callCount, 1);
      assert.equal(publisher.createSnapshot.callCount, 1);

      const expectedMessage = new ROSLIB.Message({data: 180});
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

      global.eventParam = {
        'alpha': 0,
        'beta': 1,
        'gamma': 1,
      };

      const mockGeolocation = {
        getCurrentPosition: function() {
          publisher.locationHandler(geoPos);
        },
      };

      global.window.navigator.geolocation = mockGeolocation;

      publisher.locationHandler(geoPos);
      publisher.onReadOrientation(eventParam);
      publisher.createSnapshot();
      publisher.createSnapshot();

      assert.equal(publisher.calcDegreeToPoint.callCount, 1);
      assert.equal(publisher.locationHandler.callCount, 1);
      assert.equal(publisher.createSnapshot.callCount, 2);

      const expectedMessage = new ROSLIB.Message({data: 180});
      assert.equal(topic.publish.callCount, 1);
      assert.deepEqual(topic.publish.getCall(0).args[0], expectedMessage);
    });
  });


  describe('#accountForRotation()', function() {
    it('Difference is 0 when same orientation', function() {
      const topic = sinon.spy(new ROSLIB.Topic());
      const publisher = sinon.spy(new GPSDeclinationPublisher(topic, 1, 1));

      publisher.alpha = 0;
      publisher.compass = 0;

      assert.equal(publisher.accountForRotation(), 0);

      publisher.alpha = 100;
      publisher.compass = 100;

      assert.equal(publisher.accountForRotation(), 0);

      publisher.alpha = 200;
      publisher.compass = 200;

      assert.equal(publisher.accountForRotation(), 0);
    });

    it('Small difference', function() {
      const topic = sinon.spy(new ROSLIB.Topic());
      const publisher = sinon.spy(new GPSDeclinationPublisher(topic, 1, 1));

      publisher.alpha = 359;
      publisher.compass = 0;

      assert.equal(publisher.accountForRotation(), 1);

      publisher.alpha = 99;
      publisher.compass = 100;

      assert.equal(publisher.accountForRotation(), 1);

      publisher.alpha = 279;
      publisher.compass = 280;

      assert.equal(publisher.accountForRotation(), 1);
    });

    it('180 difference', function() {
      const topic = sinon.spy(new ROSLIB.Topic());
      const publisher = sinon.spy(new GPSDeclinationPublisher(topic, 1, 1));

      publisher.alpha = 280;
      publisher.compass = 100;

      assert.equal(publisher.accountForRotation(), 180);

      publisher.alpha = 100;
      publisher.compass = 280;

      assert.equal(publisher.accountForRotation(), 180);
    });

    it('big difference', function() {
      const topic = sinon.spy(new ROSLIB.Topic());
      const publisher = sinon.spy(new GPSDeclinationPublisher(topic, 1, 1));

      publisher.alpha = 5;
      publisher.compass = 355;

      assert.equal(publisher.accountForRotation(), 350);

      publisher.alpha = 100;
      publisher.compass = 90;

      assert.equal(publisher.accountForRotation(), 350);

      publisher.alpha = 280;
      publisher.compass = 270;

      assert.equal(publisher.accountForRotation(), 350);
    });
  });
});
