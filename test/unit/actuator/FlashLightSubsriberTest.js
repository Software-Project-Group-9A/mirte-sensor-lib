require('../../globalSetup.js');

// Module to test
const FlashLightSubsriber = require('../../../src/actuators/FlashLightSubsriber.js');

const {document} = global.window;

describe('Test FlashLightSubsriber', function() {
  describe('#constructor(topic)', function() {
    it('should accept a ROSLIB.Topic', function() {
      assert.doesNotThrow(
          () => {
            subscriber = new FlashLightSubsriber(new ROSLIB.Topic());
          },
          (error) => {
            return false;
          }
      );
    });

    it('should throw an error if browser does not support', function() {

    });

    it('should throw an error if there is no camera', function() {

    });
  });
});
