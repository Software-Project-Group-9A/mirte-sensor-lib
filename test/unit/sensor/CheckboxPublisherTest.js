require('../../globalSetup.js');

// Module to test
const CheckboxPublisher = require('../../../src/sensors/CheckboxPublisher.js');

const {document} = global.window;

describe('Test CheckboxPublisher', function() {
  describe('#constructor(topic, topicName, checkbox)', function() {
    /**
     * Helper functions for checking whether correct error is raised for
     * invalid topics.
     * @param {Error} error The raised error.
     * @return {boolean} true if valid.
     */
    function expectInvalidCheckbox(error) {
      assert(error instanceof TypeError);
      assert(
          error.message === 'checkbox argument was not a HTML checkbox'
      );

      return true;
    }

    it('should reject an undefined checkbox', function() {
      assert.throws(() => {
        new CheckboxPublisher(new ROSLIB.Ros(), 'topic', undefined);
      }, expectInvalidCheckbox);
    });
    it('should reject any checkbox argument that is not an HTML checkbox', function() {
      assert.throws(() => {
        new CheckboxPublisher(new ROSLIB.Ros(), 'topic', 'not a checkbox');
      }, expectInvalidCheckbox);
    });

    it('should accept a ROSLIB.Topic and an HTML checkbox as arguments', function() {
      let publisher;
      const checkbox = document.createElement('INPUT');
      checkbox.setAttribute('type', 'checkbox');

      assert.doesNotThrow(
          () => {
            publisher = new CheckboxPublisher(new ROSLIB.Ros(), 'topic', checkbox);
          },
          (error) => {
            return false;
          }
      );

      assert.equal(publisher.checkbox, checkbox);
    });
  });

  describe('#start()', function() {
    it('should subscribe to change callback', function() {
      const checkbox = sinon.spy(document.createElement('INPUT'));
      checkbox.setAttribute('type', 'checkbox');
      const publisher = new CheckboxPublisher(new ROSLIB.Ros(), 'topic', checkbox);

      publisher.start();

      assert.equal(checkbox.addEventListener.callCount, 1);
      assert(
          checkbox.addEventListener.calledWith('change', publisher.change)
      );
    });
    it('should result in change being called at check', function() {
      const checkbox = document.createElement('INPUT');
      checkbox.setAttribute('type', 'checkbox');
      const publisher = sinon.spy(new CheckboxPublisher(new ROSLIB.Ros(), 'topic', checkbox));

      publisher.start();

      checkbox.dispatchEvent(new window.Event('change'));

      assert.equal(publisher.change.callCount, 1);
    });
    it('should result in change being called multiple times at multiple check', function() {
      const checkbox = document.createElement('INPUT');
      checkbox.setAttribute('type', 'checkbox');
      const publisher = sinon.spy(new CheckboxPublisher(new ROSLIB.Ros(), 'topic', checkbox));

      publisher.start();

      checkbox.dispatchEvent(new window.Event('change'));
      checkbox.dispatchEvent(new window.Event('change'));
      checkbox.dispatchEvent(new window.Event('change'));

      assert.equal(publisher.change.callCount, 3);
    });
  });

  describe('#publishBoolMsg(bool)', function() {
    it('should publish true message to topic upon checked call', function() {
      const checkbox = document.createElement('INPUT');
      checkbox.setAttribute('type', 'checkbox');

      const publisher = sinon.spy(new CheckboxPublisher(new ROSLIB.Ros(), 'topic', checkbox));
      const topic = sinon.spy(publisher.topic);

      publisher.start();

      checkbox.checked = true;
      checkbox.dispatchEvent(new window.Event('change'));

      const expectedMessage = new ROSLIB.Message({data: true});
      assert.equal(publisher.change.callCount, 1);
      assert.equal(topic.publish.callCount, 1);
      assert.deepEqual(topic.publish.getCall(0).args[0], expectedMessage);
    });
    it('should publish false message to topic upon unchecked call', function() {
      const checkbox = document.createElement('INPUT');
      checkbox.setAttribute('type', 'checkbox');

      const publisher = sinon.spy(new CheckboxPublisher(new ROSLIB.Ros(), 'topic', checkbox));
      const topic = sinon.spy(publisher.topic);

      publisher.start();

      checkbox.checked = false;
      checkbox.dispatchEvent(new window.Event('change'));

      const expectedMessage = new ROSLIB.Message({data: false});
      assert.equal(publisher.change.callCount, 1);
      assert.equal(topic.publish.callCount, 1);
      assert.deepEqual(topic.publish.getCall(0).args[0], expectedMessage);
    });
  });

  describe('#stop()', function() {
    it('should unsubscribe to change callback', function() {
      const checkbox = sinon.spy(document.createElement('INPUT'));
      checkbox.setAttribute('type', 'checkbox');
      const publisher = new CheckboxPublisher(new ROSLIB.Ros(), 'topic', checkbox);

      publisher.start();
      publisher.stop();

      assert.equal(checkbox.removeEventListener.callCount, 1);
      assert(
          checkbox.removeEventListener.calledWith('change', publisher.change)
      );
      it('should result in change not being called at check', function() {
        const checkbox = document.createElement('INPUT');
        checkbox.setAttribute('type', 'checkbox');
        const publisher = sinon.spy(new CheckboxPublisher(new ROSLIB.Ros(), 'topic', checkbox));

        publisher.start();
        publisher.stop();

        checkbox.dispatchEvent(new window.Event('change'));

        assert.equal(publisher.change.callCount, 0);
      });
    });
  });
  describe('#readFromConfig(ros, config, targetElement)', function() {
    it('should append a checkbox to the target element', function() {
      const ros = new ROSLIB.Ros();
      const targetDiv = document.createElement('div');
      const config = {
        name: 'checkbox',
        x: 30,
        y: 20,
      };

      CheckboxPublisher.readFromConfig(ros, config, targetDiv);

      assert.equal(targetDiv.childElementCount, 1);
      const child = targetDiv.childNodes.item(0);
      assert(child instanceof window.HTMLInputElement);
    });
    it('should return the correct publisher', function() {
      const ros = new ROSLIB.Ros();
      const targetDiv = document.createElement('div');
      const config = {
        name: 'checkbox',
        x: 30,
        y: 20,
      };

      const publisher = CheckboxPublisher.readFromConfig(ros, config, targetDiv);

      assert(publisher instanceof CheckboxPublisher);
      assert(publisher.started);
      assert.equal(publisher.topic.name, '/mirte/phone_checkbox/checkbox');
    });
  });
});
