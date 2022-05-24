require('../../globalSetup');

const TextSubscriber = require('../../../src/actuators/TextSubscriber');
const ButtonPublisher = require('../../../src/sensors/ButtonPublisher');
const SliderPublisher = require('../../../src/sensors/SliderPublisher');
const TextPublisher = require('../../../src/sensors/TextPublisher');
// Module to test
const {tryPublishElement, publishChildElements} = require('../../../src/util/documentUtils');

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
    it('should ignore elements without an id', function() {
      const textOutput = document.createElement('p');
      const ros = new ROSLIB.Ros();
      const map = new Map();

      tryPublishElement(textOutput, ros, map);

      assert.equal(map.size, 0);
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
      assert(publisherMap.has(buttonAId));
      assert(publisherMap.has(buttonBId));
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
      childDiv.appendChild(buttonB);
      const parentDiv = document.createElement('div');
      parentDiv.appendChild(childDiv);

      const ros = new ROSLIB.Ros();

      const publisherMap = publishChildElements(parentDiv, ros);

      assert.equal(publisherMap.size, 2);
      assert(publisherMap.has(buttonAId));
      assert(publisherMap.has(buttonBId));
    });
  });
});
