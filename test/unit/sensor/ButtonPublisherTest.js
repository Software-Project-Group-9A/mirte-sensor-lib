var assert = require('assert');
var ButtonPublisher = require('../../../src/sensors/ButtonPublisher.js');

global.window = {
    HTMLButtonElement: function() {}
}

describe("Test ButtonPublisher", function() {
    describe("#constructor(topic, button)", function() {
        it('should reject an undefined button', function() {
            assert.throws(
                () => {
                    var sensorInstance = new ButtonPublisher();
                },
                (error) => {
                    assert.equal(error, 'error');

                    return true;
                }
            );
        });
        it('should reject any button argument that is not an HTML Button', function() {
            assert.throws(
                () => {
                    var sensorInstance = new ButtonPublisher("topic", "not a button");
                },
                (error) => {
                    assert.equal(error, 'error');

                    return true;
                }
            );
        });
        it('should accept an HTML Button for the button argument', function() {
            assert.doesNotThrow(
                () => {
                    var sensorInstance = new ButtonPublisher("topic", new window.HTMLButtonElement());
                },
                (error) => {
                    return false;
                }
            );
        });
    });
});