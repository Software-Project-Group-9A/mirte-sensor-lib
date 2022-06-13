require('../../globalSetup');

const TextSubscriber = require('../../../src/actuators/TextSubscriber');
const ImageSubscriber = require('../../../src/actuators/ImageSubscriber');
const ButtonPublisher = require('../../../src/sensors/ButtonPublisher');
const SliderPublisher = require('../../../src/sensors/SliderPublisher');
const TextPublisher = require('../../../src/sensors/TextPublisher');
// Module to test
const {tryPublishElement, publishChildElements} = require('../../../src/util/documentUtils');
const CheckboxPublisher = require('../../../src/sensors/CheckboxPublisher');

const {document} = global.window;

describe('documentUtils', function() {
  describe('#tryPublishElement(element, ros, map)', function() {
    it('should be able to properly publish a HTMLButtonElement', function() {
      const button = document.createElement('button');
      const buttonId = 'buttonA';
      button.id = buttonId;

      const ros = new ROSLIB.Ros();
      const map = new Map();

      tryPublishElement(button, ros, map);

      const topicName = 'mirte/phone_button/' + buttonId;
      assert(map.has(topicName));
      const buttonPublisher = map.get(topicName);
      assert(buttonPublisher instanceof ButtonPublisher);
      assert.equal(buttonPublisher.button, button);
      assert.equal(buttonPublisher.topic.name, topicName);
    });
    it('should be able to properly publish a checkbox', function() {
      const checkbox = document.createElement('INPUT');
      checkbox.setAttribute('type', 'checkbox');
      const checkboxId = 'checkboxA';
      checkbox.id = checkboxId;

      const ros = new ROSLIB.Ros();
      const map = new Map();

      tryPublishElement(checkbox, ros, map);

      const topicName = 'mirte/phone_checkbox/' + checkboxId;
      assert(map.has(topicName));
      const checkboxPublisher = map.get(topicName);
      assert(checkboxPublisher instanceof CheckboxPublisher);
      assert.equal(checkboxPublisher.checkbox, checkbox);
      assert.equal(checkboxPublisher.topic.name, topicName);
    });
    it('should be able to properly publish a slider', function() {
      const slider = document.createElement('input');
      const sliderId = 'sliderA';
      slider.id = sliderId;
      slider.type = 'range';

      const ros = new ROSLIB.Ros();
      const map = new Map();

      tryPublishElement(slider, ros, map);

      const topicName = 'mirte/phone_slider/' + sliderId;
      assert(map.has(topicName));
      const sliderPublisher = map.get(topicName);
      assert(sliderPublisher instanceof SliderPublisher);
      assert.equal(sliderPublisher.slider, slider);
      assert.equal(sliderPublisher.topic.name, topicName);
    });
    it('should be able to properly publish a text input', function() {
      const textInput = document.createElement('input');
      const textInputId = 'textInputA';
      textInput.id = textInputId;
      textInput.type = 'text';

      const ros = new ROSLIB.Ros();
      const map = new Map();

      tryPublishElement(textInput, ros, map);

      const topicName = 'mirte/phone_text_input/' + textInputId;
      assert(map.has(topicName));
      const textPublisher = map.get(topicName);
      assert(textPublisher instanceof TextPublisher);
      assert.equal(textPublisher.inputElement, textInput);
      assert.equal(textPublisher.topic.name, topicName);
    });
    it('should be able to properly publish a text output', function() {
      const textOutput = document.createElement('p');
      const textOutputId = 'textInputA';
      textOutput.id = textOutputId;

      const ros = new ROSLIB.Ros();
      const map = new Map();

      tryPublishElement(textOutput, ros, map);

      const topicName = 'mirte/phone_text_output/' + textOutputId;
      assert(map.has(topicName));
      const textSubscriber = map.get(topicName);
      assert(textSubscriber instanceof TextSubscriber);
      assert.equal(textSubscriber.HTMLElement, textOutput);
      assert.equal(textSubscriber.topic.name, topicName);
    });
    it('should be able to properly publish a canvas for image publishing', function() {
      const imageOutput = document.createElement('canvas');
      const imageOutputId = 'imageA';
      imageOutput.id = imageOutputId;

      const ros = new ROSLIB.Ros();
      const map = new Map();

      tryPublishElement(imageOutput, ros, map);

      const topicName = 'mirte/phone_image_output/' + imageOutputId;
      assert(map.has(topicName));
      const imageSubscriber = map.get(topicName);
      assert(imageSubscriber instanceof ImageSubscriber);
      assert.equal(imageSubscriber.canvas, imageOutput);
      assert.equal(imageSubscriber.topic.name, topicName);
    });
    it('should ignore elements without an id', function() {
      const textOutput = document.createElement('p');
      const ros = new ROSLIB.Ros();
      const map = new Map();

      tryPublishElement(textOutput, ros, map);

      assert.equal(map.size, 0);
    });
    it('should throw an error for non-HTMLElement element argument', function() {
      const element = 'canvas';
      const ros = new ROSLIB.Ros();
      const map = new Map();

      assert.throws(
          () => tryPublishElement(element, ros, map),
          TypeError
      );
    });
  });
  describe('#publishChildElements(parentElement, ros, map)', function() {
    it('should reject a non-HTMLElement parentElement argument', function() {
      const ros = new ROSLIB.Ros();

      assert.throws(
          () => publishChildElements('string', ros),
          TypeError
      );
    });
    it('should reject a non-ROSLIB.Ros ros argument', function() {
      const div = document.createElement('div');

      assert.throws(
          () => publishChildElements(div, 'ros'),
          TypeError
      );
    });
    it('should reject a non-Map map argument', function() {
      const div = document.createElement('div');
      const ros = new ROSLIB.Ros();

      assert.throws(
          () => publishChildElements(div, ros, 'map'),
          TypeError
      );
    });
    it('should return an empty map if parentElement has no children', function() {
      const div = document.createElement('div');
      const ros = new ROSLIB.Ros();

      const publisherMap = publishChildElements(div, ros);

      assert.equal(publisherMap.size, 0);
    });
    it('should return an non-empty map if parentElement has publishable children', function() {
      const buttonA = document.createElement('button');
      const buttonAId = 'buttonA';
      buttonA.id = buttonAId;

      const buttonB = document.createElement('button');
      const buttonBId = 'buttonB';
      buttonB.id = buttonBId;

      const div = document.createElement('div');
      div.appendChild(buttonA);
      div.appendChild(buttonB);

      const ros = new ROSLIB.Ros();

      const publisherMap = publishChildElements(div, ros);

      assert.equal(publisherMap.size, 2);
      assert(publisherMap.has('mirte/phone_button/' + buttonAId));
      assert(publisherMap.has('mirte/phone_button/' + buttonBId));
    });
    it('should recursively publish children\'s children', function() {
      const buttonA = document.createElement('button');
      const buttonAId = 'buttonA';
      buttonA.id = buttonAId;

      const buttonB = document.createElement('button');
      const buttonBId = 'buttonB';
      buttonB.id = buttonBId;

      const childDiv = document.createElement('div');
      childDiv.appendChild(buttonA);
      const parentDiv = document.createElement('div');
      parentDiv.appendChild(childDiv);
      parentDiv.appendChild(buttonB);

      const ros = new ROSLIB.Ros();

      const publisherMap = publishChildElements(parentDiv, ros);

      assert.equal(publisherMap.size, 2);
      assert(publisherMap.has('mirte/phone_button/' + buttonAId));
      assert(publisherMap.has('mirte/phone_button/' + buttonBId));
    });
  });
});
