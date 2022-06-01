require('../../globalSetup.js');

// Module to test
const AmbientLightPublisher =
    require('../../../src/sensors/AmbientLightPublisher.js');

describe('Test AmbientLightPublisher', function() {
  describe('#constructor(topic)', function() {
    it('should fail when there is no API support', function() {

    });
    it('should accept a ROSLIB.Topic', function() {
      assert.doesNotThrow(
          () => {
            new AmbientLightPublisher(new ROSLIB.Topic());
          },
          (error) => {
            return false;
          }
      );
    });
    it('should set values correct', function() {

    });
  });


  describe('#start()', function() {
    it('should attach a callback', function() {

    });
  });

  describe('#stop()', function() {
    it('should dettach a callback', function() {

    });
  });

  describe('#createSnapshot()', function() {
    it('should create snapshot', function() {

    });
  });
});
