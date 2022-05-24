require('../../globalSetup');

const TextSubscriber = require('../../../src/actuators/TextSubscriber');
const ButtonPublisher = require('../../../src/sensors/ButtonPublisher');
const SliderPublisher = require('../../../src/sensors/SliderPublisher');
const TextPublisher = require('../../../src/sensors/TextPublisher');
// Module to test
const {tryPublishElement} = require('../../../src/util/documentUtils');

const {document} = global.window;

describe('documentUtils', function() {
  describe('#tryPublishElement(element, ros, map)', function() {
    it('should be able properly publish a HTMLButtonElement', function() {
      const button = document.createElement('button');
      const buttonId = 'buttonA';
      button.id = buttonId;

      const ros = new ROSLIB.Ros();
      const map = new Map();

      tryPublishElement(button, ros, map);

      assert(map.has(buttonId));
      const buttonPublisher = map.get(buttonId);
      assert(buttonPublisher instanceof ButtonPublisher);
      assert.equal(buttonPublisher.button, button);
      assert.equal(buttonPublisher.topic.name, buttonId);
    });
    it('should be able properly publish a slider', function() {
      const slider = document.createElement('input');
      const sliderId = 'sliderA';
      slider.id = sliderId;
      slider.type = 'range';

      const ros = new ROSLIB.Ros();
      const map = new Map();

      tryPublishElement(slider, ros, map);

      assert(map.has(sliderId));
      const sliderPublisher = map.get(sliderId);
      assert(sliderPublisher instanceof SliderPublisher);
      assert.equal(sliderPublisher.slider, slider);
      assert.equal(sliderPublisher.topic.name, sliderId);
    });
    it('should be able properly publish a text input', function() {
      const textInput = document.createElement('input');
      const textInputId = 'textInputA';
      textInput.id = textInputId;
      textInput.type = 'text';

      const ros = new ROSLIB.Ros();
      const map = new Map();

      tryPublishElement(textInput, ros, map);

      assert(map.has(textInputId));
      const textPublisher = map.get(textInputId);
      assert(textPublisher instanceof TextPublisher);
      assert.equal(textPublisher.inputElement, textInput);
      assert.equal(textPublisher.topic.name, textInputId);
    });
    it('should be able properly publish a text output', function() {
      const textOutput = document.createElement('p');
      const textOutputId = 'textInputA';
      textOutput.id = textOutputId;

      const ros = new ROSLIB.Ros();
      const map = new Map();

      tryPublishElement(textOutput, ros, map);

      assert(map.has(textOutputId));
      const textSubscriber = map.get(textOutputId);
      assert(textSubscriber instanceof TextSubscriber);
      assert.equal(textSubscriber.HTMLElement, textOutput);
      assert.equal(textSubscriber.topic.name, textOutputId);
    });
  });
});
