require('../../globalSetup');

// module under test
const {tryPublishNode} = require('../../../src/util/documentUtils');
const document = window.document;

const ros = new ROSLIB.Ros();

describe('documentUtils', function() {
  describe('tryPublishNode', function() {
    it('should not accept non-HTMLElements', function() {
      assert.throws(
          () => tryPublishNode(undefined, ros, {}),
          TypeError
      );
    });
    it('should not accept an invalid ros instance', function() {
      const button = document.createElement('button');

      assert.throws(
          () => tryPublishNode(button, undefined, {}),
          TypeError
      );
    });
  });
});
