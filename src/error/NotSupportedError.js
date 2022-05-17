/**
 * Error thrown by the library to indicate some requested feature is not
 * supported by the current browser.
 */
class NotSupportedError extends Error {
  /**
   * Create a new NotSupportedError.
   * @param {string} message error message indicating what went wrong.
   */
  constructor(message) {
    super(message);

    this.name = 'NotSupportedError';
  }
}

module.exports = NotSupportedError;
