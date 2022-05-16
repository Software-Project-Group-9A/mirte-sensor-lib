require('../../globalSetup.js');

// Module to test
const Subscriber = require('../../../src/actuators/Subscriber.js');

describe('Test Subscriber', function() {
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
        new Subscriber(undefined);
      }, expectInvalidTopic);
    });
    it('should reject any topic argument that is not a ROSLIB.Topic instance', function() {
      assert.throws(() => {
        new Subscriber('not a topic');
      }, expectInvalidTopic);
    });

    it('should accept a ROSLIB.Topic', function() {
      let subscriber;
      const topic = new ROSLIB.Topic();

      assert.doesNotThrow(
          () => {
            subscriber = new Subscriber(topic);
          },
          (error) => {
            return false;
          },
      );

      assert.equal(subscriber.topic, topic);
    });
  });

  describe('#start()', function() {
    /**
     * Helper functions for checking whether correct error is raised.
     * @param {Error} error The raised error.
     * @return {boolean} true if valid.
     */
    function expectAlreadyStarted(error) {
      assert(error.message === 'Subscriber already started');

      return true;
    }

    /**
     * Helper functions for checking whether correct error is raised.
     * @param {Error} error The raised error.
     * @return {boolean} true if valid.
     */
    function expectAlreadyStoped(error) {
      assert(error.message === 'Subscriber did not start yet');

      return true;
    }

    it('should start before stop', function() {
      const topic = new ROSLIB.Topic();
      const subscriber = new Subscriber(topic);

      assert.throws(() => {
        subscriber.stop();
      }, expectAlreadyStoped);
    });


    it('should start only one time', function() {
      const topic = new ROSLIB.Topic();
      const subscriber = new Subscriber(topic);
      subscriber.start();

      assert.throws(() => {
        subscriber.start();
      }, expectAlreadyStarted);
    });

    it('should stop only one time', function() {
      const topic = new ROSLIB.Topic();
      const subscriber = new Subscriber(topic);
      subscriber.start();
      subscriber.stop();
      assert.throws(() => {
        subscriber.stop();
      }, expectAlreadyStoped);
    });
  });
});
