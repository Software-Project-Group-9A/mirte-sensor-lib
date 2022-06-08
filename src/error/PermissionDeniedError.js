/**
 * Error thrown by the library to indicate some sensor is denied access
 * by the current browser.
 */
class PermissionDeniedError extends Error {
  /**
     * Create a new PermissionDeniedError.
     * @param {string} message error message indicating what went wrong.
     */
  constructor(message) {
    super(message);

    this.name = 'PermissionDeniedError';
  }
}

module.exports = PermissionDeniedError;

