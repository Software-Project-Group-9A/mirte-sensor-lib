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
      assert(error.message === 'topicName argument was not of type String');

      return true;
    }

    /**
     * Helper functions for checking whether correct error is raised for
     * an invalid ros instance.
     * @param {Error} error The raised error.
     * @return {boolean} true if valid.
     */
    function expectInvalidRos(error) {
      assert(error instanceof TypeError);
      assert(error.message === 'ros argument was not of type ROSLIB.Ros');

      return true;
    }

    /* tests for topic verification */
    it('should reject an undefined ros', function() {
      assert.throws(() => {
        new Subscriber(undefined, 'topic');
      }, expectInvalidRos);
    });
    it('should reject an undefined topic', function() {
      assert.throws(() => {
        new Subscriber(new ROSLIB.Ros(), undefined);
      }, expectInvalidTopic);
    });
    it('should reject any topic argument that is not a ROSLIB.Topic instance', function() {
      assert.throws(() => {
        new Subscriber('not a ros instance', 'topic');
      }, expectInvalidRos);
    });
    it('should reject any topic argument that is not a ROSLIB.Topic instance', function() {
      assert.throws(() => {
        new Subscriber(new ROSLIB.Ros(), 1);
      }, expectInvalidTopic);
    });

    it('should accept a topic name string argument and ros instance', function() {
      let subscriber;
      const topic = 'topic';
      const ros = new ROSLIB.Ros();

      assert.doesNotThrow(
          () => {
            subscriber = new Subscriber(ros, 'topic');
          },
          (error) => {
            return false;
          }
      );

      assert.equal(subscriber.ros, ros);
      assert.equal(subscriber.topic.name, topic);
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
      const ros = new ROSLIB.Ros();
      const subscriber = new Subscriber(ros, 'topic');

      assert.throws(() => {
        subscriber.stop();
      }, expectAlreadyStoped);
    });


    it('should start only one time', function() {
      const ros = new ROSLIB.Ros();
      const subscriber = new Subscriber(ros, 'topic');
      subscriber.start();

      assert.throws(() => {
        subscriber.start();
      }, expectAlreadyStarted);
    });

    it('should stop only one time', function() {
      const ros = new ROSLIB.Ros();
      const subscriber = new Subscriber(ros, 'topic');

      subscriber.start();
      subscriber.stop();
      assert.throws(() => {
        subscriber.stop();
      }, expectAlreadyStoped);
    });
  });
});
