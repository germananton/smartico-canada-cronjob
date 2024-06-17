/* eslint-disable global-require */
module.exports = {
	AppError: require('./app-error'),
	BadRequestError: require('./smartico-bad-request-error'),
	ForbiddenError: require('./smartico-forbidden-error'),
	ServerError: require('./smartico-server-error'),
	UnauthorizedError: require('./smartico-unauthorized-error'),
};
