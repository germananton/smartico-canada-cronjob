const AppError = require('./app-error');

class SmarticoBadRequestError extends AppError {
	/**
	 *
	 * @param {string} message
	 * @param {string} stack
	 */
	constructor(message, stack = '') {
		super(message, true, stack);
	}
}

module.exports = SmarticoBadRequestError;
