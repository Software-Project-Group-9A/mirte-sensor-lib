require('../../globalSetup.js');

// Module to test
const ButtonPublisher = require('../../../src/sensors/ButtonPublisher.js');

const {document} = global.window;

describe('Test ButtonPublisher', function() {
  describe('#constructor(ros, topicName, button)', function() {
    /**
     * Helper functions for checking whether correct error is raised for
     * invalid topics.
     * @param {Error} error The raised error.
     * @return {boolean} true if valid.
     */
    function expectInvalidButton(error) {
      assert(error instanceof TypeError);
      assert(
          error.message === 'button argument was not of type HTMLButtonElement'
      );

      return true;
    }

    /* test for button verification */
    it('should reject an undefined button', function() {
      assert.throws(() => {
        new ButtonPublisher(new ROSLIB.Ros(), 'topic', undefined);
      }, expectInvalidButton);
    });
    it('should reject any button argument that is not an HTML Button', function() {
      assert.throws(() => {
        new ButtonPublisher(new ROSLIB.Ros(), 'topic', 'not a button');
      }, expectInvalidButton);
    });

    it('should accept a ROSLIB.Topic and an HTML Button as arguments', function() {
      let publisher;
      const button = document.createElement('button');

      assert.doesNotThrow(
          () => {
            publisher = new ButtonPublisher(new ROSLIB.Ros(), 'topic', button);
          },
          (error) => {
            return false;
          }
      );

      assert.equal(publisher.button, button);
    });
  });

  describe('#start()', function() {
    it('should subscribe onMouseUp and onMouseDown callbacks to correct events', function() {
      const button = sinon.spy(document.createElement('button'));
      const ros = new ROSLIB.Ros();
      const publisher = new ButtonPublisher(ros, 'topic', button);

      publisher.start();

      assert.equal(button.addEventListener.callCount, 6);
      assert(
          button.addEventListener.calledWith('mouseup', publisher.onMouseUp)
      );
      assert(
          button.addEventListener.calledWith('mousedown', publisher.onMouseDown)
      );
      assert(
          button.addEventListener.calledWith('touchstart', publisher.onMouseDown)
      );
      assert(
          button.addEventListener.calledWith('mouseleave', publisher.onMouseUp)
      );
      assert(
          button.addEventListener.calledWith('touchend', publisher.onMouseUp)
      );
      assert(
          button.addEventListener.calledWith('touchcancel', publisher.onMouseUp)
      );
    });
    it('should result in onMouseDown being called at mousedown', function() {
      const button = document.createElement('button');
      const ros = new ROSLIB.Ros();
      const publisher = sinon.spy(new ButtonPublisher(ros, 'topic', button));

      publisher.start();

      button.dispatchEvent(new window.Event('mousedown'));

      assert.equal(publisher.onMouseDown.callCount, 1);
    });
    it('should result in onMouseDown being called at touchstart', function() {
      const button = document.createElement('button');
      const publisher = sinon.spy(new ButtonPublisher(new ROSLIB.Ros(), 'topic', button));

      publisher.start();

      button.dispatchEvent(new window.Event('touchstart'));

      assert.equal(publisher.onMouseDown.callCount, 1);
    });
    it('should result in onMouseUp being called at mouseup', function() {
      const button = document.createElement('button');
      const ros = new ROSLIB.Ros();
      const publisher = sinon.spy(new ButtonPublisher(ros, 'topic', button));

      publisher.start();
      button.dispatchEvent(new window.Event('mouseup'));

      assert.equal(publisher.onMouseUp.callCount, 1);
    });
    it('should result in onMouseUp being called at mouseleave', function() {
      const button = document.createElement('button');
      const ros = new ROSLIB.Ros();
      const publisher = sinon.spy(new ButtonPublisher(ros, 'topic', button));

      publisher.start();
      button.dispatchEvent(new window.Event('mouseleave'));

      assert.equal(publisher.onMouseUp.callCount, 1);
    });
    it('should result in onMouseUp being called at touchend', function() {
      const button = document.createElement('button');
      const ros = new ROSLIB.Ros();
      const publisher = sinon.spy(new ButtonPublisher(ros, 'topic', button));

      publisher.start();
      button.dispatchEvent(new window.Event('touchend'));

      assert.equal(publisher.onMouseUp.callCount, 1);
    });
    it('should result in onMouseUp being called at mousedown event 4', function() {
      const button = document.createElement('button');
      const ros = new ROSLIB.Ros();
      const publisher = sinon.spy(new ButtonPublisher(ros, 'topic', button));

      publisher.start();
      button.dispatchEvent(new window.Event('touchcancel'));

      assert.equal(publisher.onMouseUp.callCount, 1);
    });
  });

  describe('#onMouseUp()', function() {
    it('should publish a sts_msgs/Bool message to topic upon callback', function() {
      const button = document.createElement('button');
      const ros = new ROSLIB.Ros();
      const publisher = sinon.spy(new ButtonPublisher(ros, 'topic', button));
      const topic = sinon.spy(publisher.topic);

      publisher.start();
      button.dispatchEvent(new window.Event('mouseup'));

      assert.equal(topic.publish.callCount, 0);

      // First mousedown should be called before mouseup can be called
      button.dispatchEvent(new window.Event('mousedown'));
      button.dispatchEvent(new window.Event('mouseup'));

      const expectedMessage = new ROSLIB.Message({data: false});
      assert.equal(publisher.onMouseUp.callCount, 2);
      assert.equal(topic.publish.callCount, 2);
      assert.deepEqual(topic.publish.getCall(1).args[0], expectedMessage);
    });
  });

  describe('#onMouseDown()', function() {
    it('should publish a sts_msgs/Bool message to topic upon callback', function() {
      const button = document.createElement('button');
      const ros = new ROSLIB.Ros();
      const publisher = sinon.spy(new ButtonPublisher(ros, 'topic', button));
      const topic = sinon.spy(publisher.topic);

      publisher.start();
      button.dispatchEvent(new window.Event('mousedown'));

      const expectedMessage = new ROSLIB.Message({data: true});
      assert.equal(publisher.onMouseDown.callCount, 1);
      assert.equal(topic.publish.callCount, 1);
      assert.deepEqual(topic.publish.getCall(0).args[0], expectedMessage);
    });
    it('should publish only once upon double callback', function() {
      const button = document.createElement('button');
      const publisher = sinon.spy(new ButtonPublisher(new ROSLIB.Ros(), 'topic', button));
      const topic = sinon.spy(publisher.topic);

      publisher.start();
      button.dispatchEvent(new window.Event('mousedown'));
      button.dispatchEvent(new window.Event('mousedown'));

      const expectedMessage = new ROSLIB.Message({data: true});
      assert.equal(publisher.onMouseDown.callCount, 2);
      assert.equal(topic.publish.callCount, 1);
      assert.deepEqual(topic.publish.getCall(0).args[0], expectedMessage);
    });
  });

  describe('#stop()', function() {
    it('should unsubscribe onMouseUp and onMouseDown callbacks', function() {
      const button = sinon.spy(document.createElement('button'));
      const ros = new ROSLIB.Ros();
      const publisher = new ButtonPublisher(ros, 'topic', button);

      publisher.start();
      publisher.stop();

      assert.equal(button.removeEventListener.callCount, 6);
      assert(
          button.removeEventListener.calledWith('mousedown', publisher.onMouseDown)
      );
      assert(
          button.removeEventListener.calledWith('touchstart', publisher.onMouseDown)
      );
      assert(
          button.removeEventListener.calledWith('mouseup', publisher.onMouseUp)
      );
      assert(
          button.removeEventListener.calledWith('touchend', publisher.onMouseUp)
      );
      assert(
          button.removeEventListener.calledWith('mouseleave', publisher.onMouseUp)
      );
      assert(
          button.removeEventListener.calledWith('touchcancel', publisher.onMouseUp)
      );
    });
    it('should prevent onMouseDown from being called at mousedown event', function() {
      const button = document.createElement('button');
      const ros = new ROSLIB.Ros();
      const publisher = sinon.spy(new ButtonPublisher(ros, 'topic', button));

      publisher.start();
      publisher.stop();
      button.dispatchEvent(new window.Event('mousedown'));

      assert.equal(publisher.onMouseDown.callCount, 0);
    });
    it('should prevent onMouseUp from being called at mouseup event', function() {
      const button = document.createElement('button');
      const ros = new ROSLIB.Ros();
      const publisher = sinon.spy(new ButtonPublisher(ros, 'topic', button));

      publisher.start();
      publisher.stop();
      button.dispatchEvent(new window.Event('mouseup'));

      assert.equal(publisher.onMouseUp.callCount, 0);
    });
  });
});
