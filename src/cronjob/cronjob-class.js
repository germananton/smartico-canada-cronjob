const { AppError } = require('../errors');

class CronJob {
	constructor(jobName, { prometheus = undefined } = {}) {
		this.jobName = jobName;
		this.prometheus = prometheus;
	}

	async run(params) {
		let errType = '';

		try {
			logger.info(`Cronjob ${this.jobName} started`);
			this.prometheus?.counters.cronjobStartedCounter.inc(
				this.prometheusLabels
			);

			await this._run(params);
			logger.info(`Cronjob ${this.jobName} completed successfully`);
		} catch (err) {
			logger.error(
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
		logger.error(
			`Completion workflow started for cronjob ${this.jobName} after ${errType ? `error type: ${errType}` : 'successful run !'}`
		);

		if (errType) {
			this.prometheus?.counters.cronjobFailedCounter.inc({
				...this.prometheusLabels,
				err_type: errType,
			});
		} else {
			this.prometheus?.counters.cronjobSuccessCounter.inc(
				this.prometheusLabels
			);
		}

		await this.prometheus?.client?.pushToPushGateway(this.jobName);

		logger.info(`Completion workflow completed for cronjob ${this.jobName}`);
	}

	async shutdown(errType) {
		logger.info('CronJob shutdown requested');
		await this.onCompletion(errType);
		logger.info('CronJob shutdown completed');
	}
}

module.exports = CronJob;
