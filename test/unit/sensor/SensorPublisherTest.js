require('../../globalSetup.js');

// Module to test
const SensorPublisher = require('../../../src/sensors/SensorPublisher.js');

describe('Test SensorPublisher', function() {
  describe('#constructor(ros, topicName)', function() {
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
     * invalid topics.
     * @param {Error} error The raised error.
     * @return {boolean} true if valid.
     */
    function expectInvalidTopic2(error) {
      assert(error.message === 'topicName argument has space');

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
        new SensorPublisher(undefined, 'topic');
      }, expectInvalidRos);
    });
    it('should reject an undefined topicName', function() {
      assert.throws(() => {
        new SensorPublisher(new ROSLIB.Ros(), undefined);
      }, expectInvalidTopic);
    });
    it('should reject any topicName argument that is not a string', function() {
      assert.throws(() => {
        new SensorPublisher('not a ros instance', 'topic');
      }, expectInvalidRos);
    });
    it('should reject any topicName argument that is not a string', function() {
      assert.throws(() => {
        new SensorPublisher(new ROSLIB.Ros(), 1);
      }, expectInvalidTopic);
    });

    it('should reject any topicName argument that has a space', function() {
      assert.throws(() => {
        new SensorPublisher(new ROSLIB.Ros(), 'Anish Gijs Mike Pieter Tijs');
      }, expectInvalidTopic2);
    });

    it('should accept a ROSLIB.Topic', function() {
      let publisher;
      const ros = new ROSLIB.Ros();

      assert.doesNotThrow(
          () => {
            publisher = new SensorPublisher(ros, 'topic&topic');
          },
          (error) => {
            return false;
          }
      );

      assert.equal(publisher.ros, ros);
      assert.equal(publisher.topic.name, 'topic&topic');
    });
  });

  describe('#start() & stop()', function() {
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
      const ros = new ROSLIB.Ros();
      publisher = new SensorPublisher(ros, 'topic');

      assert.throws(() => {
        publisher.stop();
      }, expectAlreadyStoped);
    });


    it('should start only one time', function() {
      const ros = new ROSLIB.Ros();
      publisher = new SensorPublisher(ros, 'topic');

      publisher.start();

      assert.throws(() => {
        publisher.start();
      }, expectAlreadyStarted);
    });

    it('should stop only one time', function() {
      const ros = new ROSLIB.Ros();
      publisher = new SensorPublisher(ros, 'topic');

      publisher.start();
      publisher.stop();
      assert.throws(() => {
        publisher.stop();
      }, expectAlreadyStoped);
    });
  });
});
