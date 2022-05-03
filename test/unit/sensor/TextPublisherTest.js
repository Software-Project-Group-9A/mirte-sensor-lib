const assert = require('assert');

// Sinon library for mocking
// Allows for fake timers, which might be useful in future testing
const sinon = require('sinon');

// JSDOM for simulating browser environment
const {JSDOM} = require('jsdom');
const {window} = new JSDOM(``, {});
const {document} = window;

// Module to test
const TextPublisher = require('../../../src/sensors/TextPublisher.js');

// define JSDOM window in global scope
global.window = window;
// create spy for Topic
global.ROSLIB = {
  Topic: function() {
    this.publish = function(msg) {};
  },
  Message: function(msg) {
    this.msg = msg;
  },
};

describe('Test TextPublisher', function() {
  describe('#constructor(topic, inputElement)', function() {
    /**
     * Helper functions for checking whether correct error is raised for
     * invalid input element.
     * @param {Error} error The raised error.
     * @return {boolean} true if valid.
     */
    function expectInvalidInputElement(error) {
      assert(error instanceof TypeError);
      assert(error.message === 'input element was not of type ' +
                               'HTMLInputElement');

      return true;
    }

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

    /* test for input element verification */
    it('should reject an undefined input element', function() {
      assert.throws(
          () => {
            new TextPublisher(new ROSLIB.Topic(), undefined);
          },
          expectInvalidInputElement,
      );
    });
    it('should reject any input argument that is not an HTMLInputElement',
        function() {
          assert.throws(
              () => {
                new TextPublisher(new ROSLIB.Topic(), 'not an input element');
              },
              expectInvalidInputElement,
          );
        });

    /* tests for topic verification */
    /* functionality should probably be moved into superclass SensorPublisher */
    it('should reject an undefined topic', function() {
      assert.throws(
          () => {
            new TextPublisher(undefined, document.createElement('input'));
          },
          expectInvalidTopic,
      );
    });
    it('should reject any topic argument that is not a ROSLIB.Topic instance',
        function() {
          assert.throws(
              () => {
                new TextPublisher('not a topic',
                    document.createElement('input'));
              },
              expectInvalidTopic,
          );
        });

    it('should accept a ROSLIB.Topic and an HTML Input element as arguments',
        function() {
          let publisher;
          const inputElement = document.createElement('input');

          assert.doesNotThrow(
              () => {
                publisher = new TextPublisher(new ROSLIB.Topic(),
                    inputElement);
              },
              (error) => {
                return false;
              },
          );

          assert.equal(publisher.inputElement, inputElement);
        });
  });

  describe('#start()', function() {
    it('should subscribe onKeyPress callback to correct events',
        function() {
          const inputElement = sinon.spy(document.createElement('input'));
          const topic = new ROSLIB.Topic();
          const publisher = new TextPublisher(topic, inputElement);

          publisher.start();

          assert.equal(inputElement.addEventListener.callCount, 1);
          assert(inputElement.addEventListener.calledWith('onkeydown',
              publisher.onKeyDown));
        });
  });

  describe('#onKeyDown()', function() {
    it('should publish a sts_msgs/String message to topic upon callback' +
        'with onEnter=true',
    function() {
      const inputElement = document.createElement('input');
      const topic = sinon.spy(new ROSLIB.Topic());
      const publisher = sinon.spy(new TextPublisher(topic, inputElement));

      inputElement.value = 'test text';

      publisher.start();
      inputElement.dispatchEvent(new window.Event('onkeydown'));

      const expectedMessage = new ROSLIB.Message({data: 'test text'});
      assert.equal(publisher.onKeyDown.callCount, 1);
      assert.equal(topic.publish.callCount, 1);
      assert.deepEqual(topic.publish.getCall(0).args[0], expectedMessage);
    });
  });

  describe('#stop()', function() {
    it('should unsubscribe onKeyDown callback', function() {
      const inputElement = sinon.spy(document.createElement('input'));
      const topic = sinon.spy(new ROSLIB.Topic());
      const publisher = new TextPublisher(topic, inputElement);

      publisher.start();
      publisher.stop();
      inputElement.dispatchEvent(new window.Event('onkeydown'));

      assert.equal(topic.publish.callCount, 0);
    });
  });
});
