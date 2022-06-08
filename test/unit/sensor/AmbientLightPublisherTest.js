require('../../globalSetup.js');

// Module to test
const AmbientLightPublisher =
    require('../../../src/sensors/AmbientLightPublisher.js');

describe('Test AmbientLightPublisher', function() {
  describe('#constructor(topic)', function() {
    it('should fail when there is no API support', function() {
      global.window.AmbientLightSensor = false;
      AmbientLightSensor = sinon.stub();
      assert.throws(() => new AmbientLightPublisher(new ROSLIB.Ros(), 'topic'));
    });
    it('should accept a ROSLIB.Topic', function() {
      global.window.AmbientLightSensor = true;
      AmbientLightSensor = sinon.stub();
      assert.doesNotThrow(
          () => {
            new AmbientLightPublisher(new ROSLIB.Ros(), 'topic');
          }
      );
    });
  });
});
