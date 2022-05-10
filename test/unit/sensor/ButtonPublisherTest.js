const assert = require('assert');
// Sinon library for mocking
const sinon = require('sinon');

// JSDOM for simulating browser environment
const {JSDOM} = require('jsdom');
const {window} = new JSDOM(``, {});

// Module to test
const ButtonPublisher = require('../../../src/sensors/ButtonPublisher.js');

// define JSDOM window in global scope, if not already defined
global.window = global.window || window;
const {document} = global.window;

require('../../globalSetup.js');

describe('Test ButtonPublisher', function() {
  describe('#constructor(topic, button)', function() {
    /**
     * Helper functions for checking whether correct error is raised for
     * invalid topics.
     * @param {Error} error The raised error.
     * @return {boolean} true if valid.
     */
    function expectInvalidButton(error) {
      assert(error instanceof TypeError);
      assert(
          error.message === 'button argument was not of type HTMLButtonElement',
      );

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

    /* test for button verification */
    it('should reject an undefined button', function() {
      assert.throws(() => {
        new ButtonPublisher(new ROSLIB.Topic(), undefined);
      }, expectInvalidButton);
    });
    it('should reject any button argument that is not an HTML Button', function() {
      assert.throws(() => {
        new ButtonPublisher(new ROSLIB.Topic(), 'not a button');
      }, expectInvalidButton);
    });

    /* tests for topic verification */
    /* functionality should probably be moved into superclass SensorPublisher */
    it('should reject an undefined topic', function() {
      assert.throws(() => {
        new ButtonPublisher(undefined, document.createElement('button'));
      }, expectInvalidTopic);
    });
    it('should reject any topic argument that is not a ROSLIB.Topic instance', function() {
      assert.throws(() => {
        new ButtonPublisher('not a topic', document.createElement('button'));
      }, expectInvalidTopic);
    });

    it('should accept a ROSLIB.Topic and an HTML Button as arguments', function() {
      let publisher;
      const button = document.createElement('button');

      assert.doesNotThrow(
          () => {
            publisher = new ButtonPublisher(new ROSLIB.Topic(), button);
          },
          (error) => {
            return false;
          },
      );

      assert.equal(publisher.button, button);
    });
  });

  describe('#start()', function() {
    it('should subscribe onMouseUp and onMouseDown callbacks to correct events', function() {
      const button = sinon.spy(document.createElement('button'));
      const topic = new ROSLIB.Topic();
      const publisher = new ButtonPublisher(topic, button);

      publisher.start();

      assert.equal(button.addEventListener.callCount, 2);
      assert(
          button.addEventListener.calledWith('mouseup', publisher.onMouseUp),
      );
      assert(
          button.addEventListener.calledWith('mousedown', publisher.onMouseDown),
      );
    });
    it('should result in onMouseDown being called at mousedown event 1', function() {
      const button = document.createElement('button');
      const topic = new ROSLIB.Topic();
      const publisher = sinon.spy(new ButtonPublisher(topic, button));

      publisher.start();

      button.dispatchEvent(new window.Event('mousedown'));

      assert.equal(publisher.onMouseDown.callCount, 1);
    });
    it('should result in onMouseDown being called at mousedown event 2', function() {
      const button = document.createElement('button');
      const topic = new ROSLIB.Topic();
      const publisher = sinon.spy(new ButtonPublisher(topic, button));

      publisher.start();
      button.dispatchEvent(new window.Event('mouseup'));

      assert.equal(publisher.onMouseUp.callCount, 1);
    });
  });

  describe('#onMouseUp()', function() {
    it('should publish a sts_msgs/Bool message to topic upon callback', function() {
      const button = document.createElement('button');
      const topic = sinon.spy(new ROSLIB.Topic());
      const publisher = sinon.spy(new ButtonPublisher(topic, button));

      publisher.start();
      button.dispatchEvent(new window.Event('mouseup'));

      const expectedMessage = new ROSLIB.Message({data: false});
      assert.equal(publisher.onMouseUp.callCount, 1);
      assert.equal(topic.publish.callCount, 1);
      assert.deepEqual(topic.publish.getCall(0).args[0], expectedMessage);
    });
  });

  describe('#onMouseDown()', function() {
    it('should publish a sts_msgs/Bool message to topic upon callback', function() {
      const button = document.createElement('button');
      const topic = sinon.spy(new ROSLIB.Topic());
      const publisher = sinon.spy(new ButtonPublisher(topic, button));

      publisher.start();
      button.dispatchEvent(new window.Event('mousedown'));

      const expectedMessage = new ROSLIB.Message({data: true});
      assert.equal(publisher.onMouseDown.callCount, 1);
      assert.equal(topic.publish.callCount, 1);
      assert.deepEqual(topic.publish.getCall(0).args[0], expectedMessage);
    });
  });

  describe('#stop()', function() {
    it('should unsubscribe onMouseUp and onMouseDown callbacks', function() {
      const button = sinon.spy(document.createElement('button'));
      const topic = new ROSLIB.Topic();
      const publisher = new ButtonPublisher(topic, button);

      publisher.start();
      publisher.stop();

      assert.equal(button.removeEventListener.callCount, 2);
      assert(
          button.removeEventListener.calledWith(
              'mousedown',
              publisher.onMouseDown,
          ),
      );
      assert(
          button.removeEventListener.calledWith('mouseup', publisher.onMouseUp),
      );
    });
    it('should prevent onMouseDown from being called at mousedown event', function() {
      const button = document.createElement('button');
      const topic = new ROSLIB.Topic();
      const publisher = sinon.spy(new ButtonPublisher(topic, button));

      publisher.start();
      publisher.stop();
      button.dispatchEvent(new window.Event('mousedown'));

      assert.equal(publisher.onMouseDown.callCount, 0);
    });
    it('should prevent onMouseUp from being called at mouseup event', function() {
      const button = document.createElement('button');
      const topic = new ROSLIB.Topic();
      const publisher = sinon.spy(new ButtonPublisher(topic, button));

      publisher.start();
      publisher.stop();
      button.dispatchEvent(new window.Event('mouseup'));

      assert.equal(publisher.onMouseUp.callCount, 0);
    });
  });
});
