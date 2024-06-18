const axios = require('axios');
const config = require('../config/config');
const {
	AppError,
	BadRequestError,
	ForbiddenError,
	UnauthorizedError,
	ServerError,
} = require('../errors');

class Smartico {
	async sendUpdateProfileEvent(eventPayload) {
		try {
			const response = await axios.post(config.smarticoApiUrl, eventPayload, {
				headers: {
					ContentType: 'application/json',
					Authorization: config.smarticoApiKey,
				},
			});

			if (response.data && response.data.errMsg) {
				const { errCode, errMsg } = response.data;

				console.error(
					`Failed to send request to Smartico. \nerror code:${errCode}, message: ${errMsg}`
				);

				return;
			}

			return response.data;
		} catch (error) {
			console.error(`Error thrown while sending a request to Smartico`);

			const status = error.response.status;
			let errorMsg;

			if (error.response.data.failed_events) {
				errorMsg = Object.values(
					error?.response?.data?.failed_events
				)[0].toString();
			}

			if (status === 400) {
				throw new BadRequestError(
					`Request to Smartico failed with BAD_REQUEST error ${errorMsg || 'UNKNOWN ERROR'}`,
					error.stack
				);
			}

			if (status === 401) {
				throw new UnauthorizedError(
					`Unauthorized request sent to Smartico`,
					error.stack
				);
			}

			if (status === 403) {
				throw new ForbiddenError(
					`Forbidden request sent to Smartico`,
					error.stack
				);
			}

			if (status >= 500 && status <= 599) {
				throw new ServerError(
					`Request to Smartico failed with internal server error ${errorMsg || 'UNKNOWN ERROR'}`,
					error.stack
				);
			}

			throw new AppError(
				`Smartico error code: ${status} error: ${errorMsg || 'UNKNOWN ERROR'}`,
				true,
				error.stack
			);
		}
	}
}

module.exports = Smartico;
