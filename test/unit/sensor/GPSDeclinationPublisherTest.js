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

  /** TODO 
  describe('#calcDegreeToPoint(latitude, longitude)', function() {
    it('...',
        function() {
          
        });
  });

  describe('#locationHandler(position)', function() {
    it('...',
        function() {
          
        });
  });

  describe('#createSnapshot()', function() {
    it('should create snapshot', function() {
      
    });
    it('should not create double snapshot', function() {
      
    });
    it('should not create snapshot when orientation is not read yet', function() {
      
    });
  });
  */
});
