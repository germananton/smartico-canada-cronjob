const { Prometheus } = require('@finonex/fino-providers');

const client = new Prometheus();
const labelNames = [];

const cronjobStartedCounter = new client.Counter({
	name: 'smartico_cronjob_started_total',
	help: 'smartico_cronjob started counter',
	labelNames,
});

const cronjobSuccessCounter = new client.Counter({
	name: 'smartico_cronjob_success_total',
	help: 'smartico_cronjob success counter',
	labelNames,
});

const cronjobFailedCounter = new client.Counter({
	name: 'smartico_cronjob_failed_total',
	help: 'smartico_cronjob failed counter',
	labelNames: [...labelNames, 'err_type'],
});

module.exports = {
	client,
	counters: {
		cronjobStartedCounter,
		cronjobSuccessCounter,
		cronjobFailedCounter,
	},
};
