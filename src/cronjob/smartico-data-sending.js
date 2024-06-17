const axios = require('axios');
const CronJob = require('./cronjob-class');
const smarticoJobUtils = require('../utils/smartico-job-utils');
const config = require('../config/config');
const {
	AppError,
	BadRequestError,
	ForbiddenError,
	UnauthorizedError,
	ServerError,
} = require('../errors');

class SmarticoDataSending extends CronJob {
	constructor() {
		super('smartico_canada_sending_job');
	}

	async _run() {
		// fetch user accounts from the last x hours
		const userAccounts = await smarticoJobUtils.fetchUserAccounts();

		// Build payload to send to Smartico
		if (!userAccounts.length) return;
		let payloads = [];

		try {
			payloads = userAccounts.map((accountDetails) => {
				return smarticoJobUtils.composeSmarticoPayload(accountDetails);
			});

			console.debug(`Generated ${payloads.length} payloads for Smartico`);
		} catch (error) {
			throw new AppError(error.message, true, error.stack);
		}

		// Send payload to Smartico
		try {
			const headers = {
				Authorization: config.smarticoApiKey,
				ContentType: 'application/json',
			};

			for (let index = 0; index < payloads.length; index++) {
				// eslint-disable-next-line no-await-in-loop
				const response = await axios.post(
					config.smarticoApiUrl,
					payloads[index],
					{
						headers,
					}
				);

				if (response.data.errMsg) {
					console.error(
						`Failed to send request to Smartico. \nerror code:${response.data.errCode}, message: ${response.data.errMsg}`
					);

					continue;
				}

				console.debug(response.data);
			}
		} catch (error) {
			console.error(error.message);

			const status = error.response.status;
			const errorMsg = Object.values(
				error.response?.data?.failed_events
			)[0].toString();

			if (status === 400) {
				throw new BadRequestError(
					`Request to Smartico with BAD_REQUEST - ${errorMsg || 'UNKNOWN ERROR'}`,
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
					`Request to Smartico failed with internal server error: ${errorMsg || 'UNKNOWN ERROR'}`,
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

	async onCompletion(errType) {
		await super.onCompletion(errType);
	}
}

module.exports = SmarticoDataSending;
