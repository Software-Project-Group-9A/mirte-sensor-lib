const assert = require('assert');

// Sinon library for mocking
// Allows for fake timers, which might be useful in future testing
const sinon = require('sinon');

// JSDOM for simulating browser environment
const {JSDOM} = require('jsdom');
const {window} = new JSDOM(``, {});
// const {document} = window;

// Module to test
const MagneticDeclinationPublisher =
    require('../../../src/sensors/MagneticDeclinationPublisher.js');

// define JSDOM window in global scope
global.window = global.window || window;

// create spy for Topic
global.ROSLIB = {
  Topic: function() {
    this.publish = function(msg) {};
  },
  Message: function(msg) {
    this.msg = msg;
  },
};

describe('Test MagneticDeclinationPublisher', function() {
  describe('#constructor(topic)', function() {
    /**
     * helper functions for checking whether correct error is raised
     * @param {*} error
     * @return {bool}
     */
    function expectInvalidTopic(error) {
      assert(error instanceof TypeError);
      assert.equal(error.message,
          'topic argument was not of type ROSLIB.Topic');
      return true;
    }

    it('should reject an undefined topic', function() {
      assert.throws(
          () => {
            new MagneticDeclinationPublisher(undefined);
          },
          expectInvalidTopic,
      );
    });
    it('should reject any topic argument ' +
        'that is not a ROSLIB.Topic instance', function() {
      assert.throws(
          () => {
            new MagneticDeclinationPublisher('not a topic');
          },
          expectInvalidTopic,
      );
    });

    it('should accept a ROSLIB.Topic', function() {
      assert.doesNotThrow(
          () => {
            new MagneticDeclinationPublisher(new ROSLIB.Topic());
          },
          (error) => {
            return false;
          },
      );
    });
  });

  describe('#calcDegreeToPoint()', function() {
    it('should calculate the degree between point and current location',
        function() {
          const topic = sinon.spy(new ROSLIB.Topic());
          const publisher = sinon.spy(new MagneticDeclinationPublisher(topic));

          publisher.start();

          assert.equal(publisher.calcDegreeToPoint(86.5, 164.04), 0);
        });
  });


  describe('#locationHandler()', function() {
    it('should handle the location',
        function() {
          const topic = sinon.spy(new ROSLIB.Topic());
          const publisher = sinon.spy(new MagneticDeclinationPublisher(topic));

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

  describe('#onReadOrientation()', function() {
    it('should find the current location',
        function() {
          const topic = sinon.spy(new ROSLIB.Topic());
          const publisher = sinon.spy(new MagneticDeclinationPublisher(topic));

          publisher.start();

          global.eventParam = {
            'alpha': 1,
            'beta': 1,
            'gamma': 1,
          };

          const mockGeolocation = {
            getCurrentPosition: function() {
              position = {
                'coords': {
                  'latitude': 52.008254,
                  'longitude': 4.370750,
                },
              };
              return position;
            },
          };

          global.window.navigator.geolocation = mockGeolocation;

          publisher.onReadOrientation(eventParam);

          assert.equal(publisher.alpha, 1);
          assert.equal(publisher.beta, 1);
          assert.equal(publisher.gamma, 1);
          assert(publisher.onReadOrientation);
        });
  });


  describe('#createSnapshot()', function() {
    const topic = sinon.spy(new ROSLIB.Topic());
    const publisher = sinon.spy(new MagneticDeclinationPublisher(topic));

    global.eventParam = {
      'alpha': 0,
      'beta': 1,
      'gamma': 1,
    };

    const mockGeolocation = {
      getCurrentPosition: function() {
        position = {
          'coords': {
            'latitude': 52.008254,
            'longitude': 4.370750,
          },
        };
        return position;
      },
    };

    global.window.navigator.geolocation = mockGeolocation;

    publisher.start();
    publisher.onReadOrientation(eventParam);
    publisher.createSnapshot();

    const expectedMessage = new ROSLIB.Message({data: 360});
    assert.equal(topic.publish.callCount, 1);
    assert.deepEqual(topic.publish.getCall(0).args[0], expectedMessage);
  });
});
