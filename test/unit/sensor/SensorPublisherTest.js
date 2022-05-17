require('../../globalSetup.js');

// Module to test
const SensorPublisher = require('../../../src/sensors/SensorPublisher.js');

describe('Test SensorPublisher', function() {
  describe('#constructor(topic)', function() {
    /**
     * Helper functions for checking whether correct error is raised for
     * invalid topics.
     * @param {Error} error The raised error.
     * @return {boolean} true if valid.
     */
    function expectInvalidTopic(error) {
      assert(error instanceof TypeError);
      assert(error.message === 'topic argument was not of type ROSLIB.Topic');

      return true;
    }

    /* tests for topic verification */
    it('should reject an undefined topic', function() {
      assert.throws(() => {
        new SensorPublisher(undefined);
      }, expectInvalidTopic);
    });
    it('should reject any topic argument that is not a ROSLIB.Topic instance', function() {
      assert.throws(() => {
        new SensorPublisher('not a topic');
      }, expectInvalidTopic);
    });

    it('should accept a ROSLIB.Topic', function() {
      let publisher;
      const topic = new ROSLIB.Topic();

      assert.doesNotThrow(
          () => {
            publisher = new SensorPublisher(topic);
          },
          (error) => {
            return false;
          }
      );

      assert.equal(publisher.topic, topic);
    });
  });

  describe('#start()', function() {
    /**
     * Helper functions for checking whether correct error is raised.
     * @param {Error} error The raised error.
     * @return {boolean} true if valid.
     */
    function expectAlreadyStarted(error) {
      assert(error.message === 'Publisher already started');

      return true;
    }

    /**
     * Helper functions for checking whether correct error is raised.
     * @param {Error} error The raised error.
     * @return {boolean} true if valid.
     */
    function expectAlreadyStoped(error) {
      assert(error.message === 'Publisher did not start yet');

      return true;
    }

    it('should start before stop', function() {
      const topic = new ROSLIB.Topic();
      publisher = new SensorPublisher(topic);

      assert.throws(() => {
        publisher.stop();
      }, expectAlreadyStoped);
    });


    it('should start only one time', function() {
      const topic = new ROSLIB.Topic();
      publisher = new SensorPublisher(topic);
      publisher.start();

      assert.throws(() => {
        publisher.start();
      }, expectAlreadyStarted);
    });

    it('should stop only one time', function() {
      const topic = new ROSLIB.Topic();
      publisher = new SensorPublisher(topic);
      publisher.start();
      publisher.stop();
      assert.throws(() => {
        publisher.stop();
      }, expectAlreadyStoped);
    });
  });
});
