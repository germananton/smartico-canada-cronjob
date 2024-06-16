const axios = require('axios');
const dayjs = require('dayjs');
const CronJob = require('./cronjob-class');
const smarticoJobUtils = require('../utils/smartico-job-utils');
const prometheus = require('../utils/prometheus');
const config = require('../config/config');

class SmarticoDataSending extends CronJob {
	constructor() {
		super('smartico_canada_sending_job', { prometheus });
	}

	async _run() {
		const lastModifiedDate = dayjs().subtract(1, 'day');

		// fetch user accounts from smartico's API
		const userAccounts = smarticoJobUtils.fetchUserAccounts();

		// send payloads to smartico

		// update prometheus counters
	}

	async onCompletion(errType) {
		await super.onCompletion(errType);
	}
}

module.exports = SmarticoDataSending;
