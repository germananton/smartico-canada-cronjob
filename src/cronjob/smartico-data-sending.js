const dayjs = require('dayjs');
const CronJob = require('./cronjob-class');
const smarticoJobUtils = require('../utils/smartico-job-utils');
const Smartico = require('../providers/smartico');

const smartico = new Smartico();
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

		payloads = userAccounts.map((accountDetails) => {
			return smarticoJobUtils.composeSmarticoPayload(
				accountDetails,
				dayjs(dayjs()).valueOf()
			);
		});

		console.debug(`Generated ${payloads.length} payloads for Smartico`);

		// Send payload to Smartico
		for (let index = 0; index < payloads.length; index++) {
			// eslint-disable-next-line no-await-in-loop
			await smartico.sendUpdateProfileEvent(payloads[index]);
		}
	}

	async onCompletion(errType) {
		await super.onCompletion(errType);
	}
}

module.exports = SmarticoDataSending;
