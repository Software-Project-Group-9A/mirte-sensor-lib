require('../../globalSetup.js');

// Module to test
const AmbientLightPublisher =
    require('../../../src/sensors/AmbientLightPublisher.js');

// Helper functions
/**
 * creates spy sensor.
 * @return {AmbientLightSensor} ambient light sensor.
 */
function spyOnLightSensor() {
  global.window.AmbientLightSensor = true;
  const mockSensor = {};
  mockSensor.addEventListener = sinon.spy();
  mockSensor.removeEventListener = sinon.spy();
  mockSensor.start = sinon.spy();
  mockSensor.stop = sinon.spy();
  return mockSensor;
}

// Test
describe('Test AmbientLightPublisher', function() {
  // Test constructor
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
  // Test start function
  describe('#start()', function() {
    it('should start with an event listener', function() {
      // Arrange
      const ros = new ROSLIB.Ros();
      const publisher = new AmbientLightPublisher(ros, 'topic');
      publisher.sensor = spyOnLightSensor();

      // Act
      publisher.start();

      // Assert
      assert(publisher.sensor.addEventListener.calledWith('reading'));
      assert(publisher.sensor.start.called);
    });
  });
  // Test stop function
  describe('#stop()', function() {
    it('should stop and remove event listener', function() {
      // Arrange
      const ros = new ROSLIB.Ros();
      const publisher = new AmbientLightPublisher(ros, 'topic');
      publisher.sensor = spyOnLightSensor();

      // Act
      publisher.start();
      publisher.stop();

      // Assert
      assert(publisher.sensor.removeEventListener.calledWith('reading'));
      assert(publisher.sensor.stop.called);
    });
  });

  // Test snapshot functionality
  describe('#createSnapshot()', function() {
    it('shoud capture the ambient light', function() {
      // Arrange
      const ros = new ROSLIB.Ros();
      const publisher = new AmbientLightPublisher(ros, 'topic');
      publisher.sensor = spyOnLightSensor();
      publisher.light = 10;
      publisher.topic.publish = sinon.spy();

      // Act
      publisher.createSnapshot();

      // Arrange
      const sentMsg = publisher.topic.publish.args[0][0];
      assert.equal(sentMsg.data, 10);
    });
  });
});
