const { classNameToSnakeUpperCase } = require('../utils/utils');

class AppError extends Error {
	constructor(message, isOperational = true, stack = '') {
		super(message);
		this.isOperational = isOperational;
		this.type = classNameToSnakeUpperCase(new.target?.name) || 'APP_ERROR';
		if (stack) {
			this.stack = stack;
		} else {
			Error.captureStackTrace(this, this.constructor);
		}
	}
}

module.exports = AppError;
