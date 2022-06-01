require('../../globalSetup.js');

// Module to test
const SliderPublisher = require('../../../src/sensors/SliderPublisher.js');

const {document} = global.window;

describe('SliderPublisher', function() {
  /**
   * Helper function for slider creation
   * @param {number} min minimum value of slider, default 0
   * @param {number} max maximum value of slider, default 100
   * @param {number} value initial value of slider, default 50
   * @return {HTMLInputElement} input element of type range with supplied attributes
   */
  function createSlider(min = 0, max = 100, value = 50) {
    const slider = document.createElement('input');
    slider.setAttribute('type', 'range');
    slider.setAttribute('min', min);
    slider.setAttribute('max', max);
    slider.setAttribute('value', value);
    return slider;
  }

  describe('#constructor(topic slider)', function() {
    /**
     * Helper functions for checking whether correct error is raised for
     * invalid topics.
     * @param {Error} error The raised error.
     * @return {boolean} true if valid.
     */
    function expectInvalidSlider(error) {
      assert(error instanceof TypeError);
      assert(
          error.message === 'slider argument was not of type HTMLInputElement' ||
          error.message === 'slider argument does not have type range'
      );

      return true;
    }

    /* test for slider verification */
    it('should reject an undefined slider', function() {
      assert.throws(() => {
        new SliderPublisher(new ROSLIB.Ros(), 'topic', undefined);
      }, expectInvalidSlider);
    });
    it('should reject any slider argument that is not an HTML Input Element', function() {
      assert.throws(() => {
        new SliderPublisher(new ROSLIB.Ros(), 'topic', 'not a button');
      }, expectInvalidSlider);
    });
    it('should reject any slider argument that does not have field type set to range', function() {
      assert.throws(() => {
        new SliderPublisher(new ROSLIB.Ros(), 'topic', document.createElement('input'));
      }, expectInvalidSlider);
    });

    it('should accept a ROSLIB.Topic and an slider as arguments', function() {
      const slider = createSlider();

      const publisher = new SliderPublisher(new ROSLIB.Ros(), 'topic', slider);

      assert.equal(publisher.slider, slider);
    });
  });

  describe('#createSnapshot()', function() {
    it('should publish an std_msgs/Int32 message with the slider value to topic', function() {
      const slider = createSlider();
      const publisher = sinon.spy(new SliderPublisher(new ROSLIB.Ros(), 'topic', slider));
      const topic = sinon.spy(publisher.topic);

      publisher.createSnapshot();

      const expectedMessage = new ROSLIB.Message({data: 50});
      assert.equal(topic.publish.callCount, 1);
      assert.deepEqual(topic.publish.getCall(0).args[0], expectedMessage);
    });
    it('should publish the slider as a number', function() {
      const slider = createSlider();
      const publisher = sinon.spy(new SliderPublisher(new ROSLIB.Ros(), 'topic', slider));
      const topic = sinon.spy(publisher.topic);

      publisher.createSnapshot();

      const publishedMessage = topic.publish.getCall(0).args[0];

      assert.equal(typeof publishedMessage.data, 'number');
    });
    it('should publish a message with the updated slider value when the slider changes', function() {
      const slider = createSlider();
      const publisher = sinon.spy(new SliderPublisher(new ROSLIB.Ros(), 'topic', slider));
      const topic = sinon.spy(publisher.topic);

      publisher.createSnapshot();

      slider.value = 75;

      publisher.createSnapshot();

      const expectedFirstMessage = new ROSLIB.Message({data: 50});
      const expectedSecondMessage = new ROSLIB.Message({data: 75});
      assert.equal(topic.publish.callCount, 2);
      assert.deepEqual(topic.publish.getCall(0).args[0], expectedFirstMessage);
      assert.deepEqual(topic.publish.getCall(1).args[0], expectedSecondMessage);
    });
    it('should not publish double messages', function() {
      const slider = createSlider();
      const publisher = sinon.spy(new SliderPublisher(new ROSLIB.Ros(), 'topic', slider));
      const topic = sinon.spy(publisher.topic);

      publisher.createSnapshot();
      publisher.createSnapshot();

      const expectedFirstMessage = new ROSLIB.Message({data: 50});
      assert.equal(topic.publish.callCount, 1);
      assert.deepEqual(topic.publish.getCall(0).args[0], expectedFirstMessage);
    });
  });
});
