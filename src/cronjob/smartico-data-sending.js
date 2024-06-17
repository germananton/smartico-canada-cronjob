const axios = require('axios');
const CronJob = require('./cronjob-class');
const smarticoJobUtils = require('../utils/smartico-job-utils');
const config = require('../config/config');

class SmarticoDataSending extends CronJob {
	constructor() {
		super('smartico_canada_sending_job');
	}

	async _run() {
		// fetch user accounts from the last 2 hours
		let userAccounts = await smarticoJobUtils.fetchUserAccounts();

		// Build payload to send to Smartico
		if (!userAccounts.length) return;
		let payloads = [];

		try {
			payloads = userAccounts.map((accountDetails) => {
				return smarticoJobUtils.composeSmarticoPayload(accountDetails);
			});

			console.debug(`Generated payloads for Smartico`);
		} catch (error) {
			// TODO: handle errors
			console.error(error.message);
		}

		// Send payload to Smartico
		try {
			const headers = {
				Authorization: config.smarticoApiKey,
				ContentType: 'application/json',
			};

			for (let index = 0; index < payloads.length; index++) {
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

					return;
				}

				console.info(response.data);
			}
		} catch (error) {
			// TODO: handle errors
			console.error(error.message);
		}
	}

	async onCompletion(errType) {
		await super.onCompletion(errType);
	}
}

module.exports = SmarticoDataSending;
