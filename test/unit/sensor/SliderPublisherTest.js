const assert = require("assert");

// Sinon library for mocking
// Allows for fake timers, which might be useful in future testing
const sinon = require("sinon");

// JSDOM for simulating browser environment
const { JSDOM } = require("jsdom");
const { window } = new JSDOM(``, {});

// Module to test
var SliderPublisher = require("../../../src/sensors/SliderPublisher.js");

// define JSDOM window in global scope, if not already defined
global.window = global.window || window;
let { document } = global.window;

// define dummy ROSLIB in global scope
global.ROSLIB = global.ROSLIB || {
	Topic: function () {
		this.publish = function (msg) {};
	},
	Message: function (msg) {
		this.msg = msg;
	},
};

describe("SliderPublisher", function () {
	/* helper function for slider creation*/
	function createSlider(min = 0, max = 100, value = 50) {
		const slider = document.createElement("INPUT");
		slider.setAttribute("type", "range");
		slider.setAttribute("min", min);
		slider.setAttribute("max", max);
		slider.setAttribute("value", value);
		return slider;
	}

	describe("#constructor(topic slider)", function () {
		/* helper function for checking whether correct error is raised */
		function expectInvalidSlider(error) {
			assert(error instanceof TypeError);
			assert(
				error.message === "slider argument was not of type HTMLInputElement" ||
					error.message === "slider argument does not have type range"
			);

			return true;
		}
		function expectInvalidTopic(error) {
			assert(error instanceof TypeError);
			assert(error.message === "topic argument was not of type ROSLIB.Topic");

			return true;
		}

		/* test for slider verification */
		it("should reject an undefined slider", function () {
			assert.throws(() => {
				new SliderPublisher(new ROSLIB.Topic(), undefined);
			}, expectInvalidSlider);
		});
		it("should reject any slider argument that is not an HTML Input Element", function () {
			assert.throws(() => {
				new SliderPublisher(new ROSLIB.Topic(), "not a button");
			}, expectInvalidSlider);
		});
		it("should reject any slider argument that does not have field type set to slider", function () {
			assert.throws(() => {
				new SliderPublisher(new ROSLIB.Topic(), "not a button");
			}, expectInvalidSlider);
		});

		/* tests for topic verification */
		it("should reject an undefined topic", function () {
			assert.throws(() => {
				new SliderPublisher(undefined, createSlider());
			}, expectInvalidTopic);
		});
		it("should reject any topic argument that is not a ROSLIB.Topic instance", function () {
			assert.throws(() => {
				new SliderPublisher("not a topic", createSlider());
			}, expectInvalidTopic);
		});

		it("should accept a ROSLIB.Topic and an slider as arguments", function () {
			const slider = createSlider();

			var publisher = new SliderPublisher(new ROSLIB.Topic(), slider);

			assert.equal(publisher.slider, slider);
		});
	});

	describe("#start()", function () {
		it("should subscribe the onInput callback to the correct event", function () {
			const slider = sinon.spy(createSlider());
			var publisher = new SliderPublisher(new ROSLIB.Topic(), slider);

			publisher.start();

			assert.equal(slider.addEventListener.callCount, 1);
			assert(slider.addEventListener.calledWith("input", publisher.onInput));
		});
		it("should result in onInput being called at input event", function () {
			const slider = createSlider();
			var publisher = sinon.spy(
				new SliderPublisher(new ROSLIB.Topic(), slider)
			);

			publisher.start();
			slider.dispatchEvent(new window.Event("input"));

			assert.equal(publisher.onInput.callCount, 1);
		});
	});

	describe("#stop()", function () {
		it("should remove the onInput callback from the correct event", function () {
			const slider = sinon.spy(createSlider());
			var publisher = new SliderPublisher(new ROSLIB.Topic(), slider);

			publisher.start();
			publisher.stop();

			assert.equal(slider.removeEventListener.callCount, 1);
			assert(slider.removeEventListener.calledWith("input", publisher.onInput));
		});
		it("should prevent onInput from being called at input event", function () {
			const slider = createSlider();
			var publisher = sinon.spy(
				new SliderPublisher(new ROSLIB.Topic(), slider)
			);

			publisher.start();
			publisher.stop();
			slider.dispatchEvent(new window.Event("input"));

			assert.equal(publisher.onInput.callCount, 0);
		});
	});

	describe("#onInput()", function () {
		it("should publish a sts_msgs/Int32 message with the slider value to topic upon callback", function () {
			const slider = createSlider();
			const topic = sinon.spy(new ROSLIB.Topic(0, 100, 50));
			var publisher = sinon.spy(new SliderPublisher(topic, slider));

			publisher.start();
			slider.dispatchEvent(new window.Event("input"));

			const expectedMessage = new ROSLIB.Message({ data: 50 });
			assert.equal(topic.publish.callCount, 1);
			assert.deepEqual(topic.publish.getCall(0).args[0], expectedMessage);
		});
		it("should publish a the slider as a number", function () {
			const slider = createSlider();
			const topic = sinon.spy(new ROSLIB.Topic(0, 100, 50));
			var publisher = sinon.spy(new SliderPublisher(topic, slider));

			publisher.start();
			slider.dispatchEvent(new window.Event("input"));
			const publishedMessage = topic.publish.getCall(0).args[0];

			assert.equal(typeof publishedMessage.msg.data, "number");
		});
		it("should publish a message with the updated slider value when the slider changes", function () {
			const slider = createSlider();
			const topic = sinon.spy(new ROSLIB.Topic(0, 100, 50));
			var publisher = sinon.spy(new SliderPublisher(topic, slider));

			publisher.start();
			slider.dispatchEvent(new window.Event("input"));
			slider.value = 75;
			slider.dispatchEvent(new window.Event("input"));

			const expectedFirstMessage = new ROSLIB.Message({ data: 50 });
			const expectedSecondMessage = new ROSLIB.Message({ data: 75 });
			assert.equal(topic.publish.callCount, 2);
			assert.deepEqual(topic.publish.getCall(0).args[0], expectedFirstMessage);
			assert.deepEqual(topic.publish.getCall(1).args[0], expectedSecondMessage);
		});
	});
});
