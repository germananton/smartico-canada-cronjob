const { AppError } = require('../errors');

class CronJob {
	constructor(jobName) {
		this.jobName = jobName;
	}

	async run(params) {
		let errType = '';

		try {
			console.info(`Cronjob ${this.jobName} started`);

			await this._run(params);
			console.info(`Cronjob ${this.jobName} completed successfully`);
		} catch (err) {
			console.error(
				`Unexpected error occurred during cronjob ${this.jobName}: ${err}`
			);
			errType = err.type || 'UNKNOWN';
		} finally {
			this.onCompletion(errType);
		}
	}

	// eslint-disable-next-line no-unused-vars
	async _run(params) {
		throw new AppError(
			'_run method is not implemented by parent class - make sure to implement it in subclasses'
		);
	}

	async onCompletion(errType = undefined) {
		console.error(
			`Completion workflow started for cronjob ${this.jobName} after ${errType ? `error type: ${errType}` : 'successful run !'}`
		);

		if (errType) {
			console.error(errType);
		}

		console.info(`Completion workflow completed for cronjob ${this.jobName}`);
	}

	async shutdown(errType) {
		console.info('CronJob shutdown requested');
		await this.onCompletion(errType);
		console.info('CronJob shutdown completed');
	}
}

module.exports = CronJob;
