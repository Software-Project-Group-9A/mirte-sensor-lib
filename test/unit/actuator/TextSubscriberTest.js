require('../../globalSetup.js');

// Module to test
const TextSubscriber = require('../../../src/actuators/TextSubscriber.js');

const {document} = global.window;

describe('Test TextSubscriber', function() {
  describe('#constructor(ros, topicName, HTMLElement)', function() {
    /**
     * Helper functions for checking whether correct error is raised for
     * invalid HTMLElements.
     * @param {Error} error The raised error.
     * @return {boolean} true if valid.
     */
    function expectInvalidHTMLElement(error) {
      assert(error instanceof TypeError);
      assert(
          error.message === 'HTMLElement argument was not of type HTMLElement'
      );

      return true;
    }

    /* test for HTML element verification */
    it('should reject an undefined element', function() {
      assert.throws(() => {
        new TextSubscriber(new ROSLIB.Ros(), 'topic', undefined);
      }, expectInvalidHTMLElement);
    });
    it('should reject any element argument that is not an HTMLElement', function() {
      assert.throws(() => {
        new TextSubscriber(new ROSLIB.Ros(), 'topic', 'not an HTML element');
      }, expectInvalidHTMLElement);
    });

    it('should accept a ROSLIB.Topic and an HTML Element as arguments', function() {
      let subscriber;
      const div = document.createElement('div');

      assert.doesNotThrow(
          () => {
            subscriber = new TextSubscriber(new ROSLIB.Ros(), 'topic', div);
          },
          (error) => {
            return false;
          }
      );

      assert.equal(subscriber.HTMLElement, div);
    });

    it('should set innerHTML when the the callback gets called', function() {
      const div = document.createElement('div');
      div.innerHTML = 'test';

      const subscriber = new TextSubscriber(new ROSLIB.Ros(), 'topic', div);

      subscriber.onMessage({data: 'test message'});

      assert.equal(div.innerHTML, 'test message');
    });
  });
  describe('#readFromConfig(ros, config, targetElement)', function() {
    it('should return the correct TextSubscriber instance', function() {
      const targetElement = document.createElement('div');

      const config = {
        'name': 'textA',
        'topicPath': '/mirte/phone_text_output',
        'x': 20,
        'y': 20,
      };

      const subscriber = TextSubscriber.readFromConfig(new ROSLIB.Ros, config, targetElement);

      assert.equal(subscriber.topic.name, '/mirte/phone_text_output/textA');
      assert.equal(targetElement.childElementCount, 1);
      const child = targetElement.firstChild;
      assert(child instanceof window.HTMLDivElement);
    });
  });
});
