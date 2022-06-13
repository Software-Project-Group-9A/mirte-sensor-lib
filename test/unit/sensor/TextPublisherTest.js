require('../../globalSetup.js');

// Module to test
const TextPublisher = require('../../../src/sensors/TextPublisher.js');

const {document} = global.window;

describe('Test TextPublisher', function() {
  describe('#constructor(ros, topicName, inputElement, options)', function() {
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

    /* test for input element verification */
    it('should reject an undefined input element', function() {
      assert.throws(
          () => {
            new TextPublisher(new ROSLIB.Ros(), 'topic', undefined);
          },
          expectInvalidInputElement
      );
    });
    it('should reject any input argument that is not an HTMLInputElement', function() {
      assert.throws(
          () => {
            new TextPublisher(new ROSLIB.Ros(), 'topic', 'not an input element');
          },
          expectInvalidInputElement
      );
    });

    it('should accept a ROSLIB.Topic and an HTML Input element as arguments',
        function() {
          let publisher;
          const inputElement = document.createElement('input');

          assert.doesNotThrow(
              () => {
                publisher = new TextPublisher(new ROSLIB.Ros(), 'topic', inputElement);
              },
              (error) => {
                return false;
              }
          );

          assert.equal(publisher.inputElement, inputElement);
        });
  });

  describe('#start()', function() {
    it('should subscribe onKeyUp callback to correct events',
        function() {
          const inputElement = sinon.spy(document.createElement('input'));
          const publisher = new TextPublisher(new ROSLIB.Ros(), 'topic', inputElement);

          publisher.start();

          assert.equal(inputElement.addEventListener.callCount, 1);
          assert(inputElement.addEventListener.calledWith('keyup',
              publisher.onKeyUp));
        });
  });

  describe('#start()', function() {
    it('should subscribe onInput callback to correct events',
        function() {
          const inputElement = sinon.spy(document.createElement('input'));
          const publisher = new TextPublisher(new ROSLIB.Ros(), 'topic', inputElement, {onEnter: false});

          publisher.start();

          assert.equal(inputElement.addEventListener.callCount, 1);
          assert(inputElement.addEventListener.calledWith('input',
              publisher.onInput));
        });
  });

  describe('#onKeyUp()', function() {
    it('should publish a sts_msgs/String message to topic upon callback' +
        'with onEnter=false',
    function() {
      const inputElement = document.createElement('input');
      const publisher = sinon.spy(new TextPublisher(new ROSLIB.Ros(), 'topic', inputElement,
          {onEnter: false}));
      const topic = sinon.spy(publisher.topic);

      inputElement.value = 'test text';

      publisher.start();
      inputElement.dispatchEvent(new window.Event('keyup'));
      inputElement.dispatchEvent(new window.Event('input'));

      const expectedMessage = new ROSLIB.Message({data: 'test text'});
      assert.equal(publisher.onInput.callCount, 1);
      assert.equal(topic.publish.callCount, 1);
      assert.deepEqual(topic.publish.getCall(0).args[0], expectedMessage);
    });
  });

  describe('#onKeyUp()', function() {
    it('should not publish a sts_msgs/String message to topic upon callback' +
        'with onEnter=true and no enter',
    function() {
      const inputElement = document.createElement('input');
      const publisher = sinon.spy(new TextPublisher(new ROSLIB.Ros(), 'topic', inputElement));
      const topic = sinon.spy(publisher.topic);

      inputElement.value = 'test text';

      publisher.start();
      inputElement.dispatchEvent(new window.Event('keyup'));
      inputElement.dispatchEvent(new window.Event('input'));

      assert.equal(publisher.onKeyUp.callCount, 1);
      assert.equal(topic.publish.callCount, 0);
    });
  });

  describe('#onKeyUp()', function() {
    it('should publish a sts_msgs/String message to topic upon callback' +
        'with onEnter=true and enter',
    function() {
      const inputElement = document.createElement('input');
      const publisher = sinon.spy(new TextPublisher(new ROSLIB.Ros(), 'topic', inputElement));
      const topic = sinon.spy(publisher.topic);

      inputElement.value = 'test text';

      publisher.start();
      const keyUpEvent = new window.Event('keyup');
      inputElement.dispatchEvent(new window.Event('input'));
      keyUpEvent.key = 'Enter';
      inputElement.dispatchEvent(keyUpEvent);

      const expectedMessage = new ROSLIB.Message({data: 'test text'});
      assert.equal(publisher.onKeyUp.callCount, 1);
      assert.equal(topic.publish.callCount, 1);
      assert.deepEqual(topic.publish.getCall(0).args[0], expectedMessage);
    });
  });

  describe('#onKeyUp()', function() {
    it('should not clear text when clearOnPublish=false',
        function() {
          const inputElement = document.createElement('input');
          const publisher = sinon.spy(new TextPublisher(new ROSLIB.Ros(), 'topic', inputElement,
              {clearOnPublish: false}));

          inputElement.value = 'test text';

          publisher.start();
          const keyUpEvent = new window.Event('keyup');
          inputElement.dispatchEvent(new window.Event('input'));
          keyUpEvent.key = 'Enter';
          inputElement.dispatchEvent(keyUpEvent);

          assert.equal(inputElement.value, 'test text');
        });
  });

  describe('#onKeyUp()', function() {
    it('should clear text when clearOnPublish=true',
        function() {
          const inputElement = document.createElement('input');
          const publisher = sinon.spy(new TextPublisher(new ROSLIB.Ros(), 'topic', inputElement));

          inputElement.value = 'test text';

          publisher.start();
          const keyUpEvent = new window.Event('keyup');
          inputElement.dispatchEvent(new window.Event('input'));
          keyUpEvent.key = 'Enter';
          inputElement.dispatchEvent(keyUpEvent);

          assert.equal(inputElement.value, '');
        });
  });

  describe('#stop()', function() {
    it('should unsubscribe onKeyUp callback', function() {
      const inputElement = sinon.spy(document.createElement('input'));
      const publisher = new TextPublisher(new ROSLIB.Ros(), 'topic', inputElement);
      const topic = sinon.spy(publisher.topic);

      publisher.start();
      publisher.stop();
      inputElement.dispatchEvent(new window.Event('keyup'));
      inputElement.dispatchEvent(new window.Event('input'));

      assert.equal(topic.publish.callCount, 0);
    });
  });
});
