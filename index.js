require('dotenv').config();
const SmarticoDataSendingJob = require('./src/cronjob/smartico-data-sending');

const dataSendingJob = new SmarticoDataSendingJob();

async function gracefulShutdown(type) {
	console.info('cronjob is starting cleanup');

	try {
		await dataSendingJob.shutdown(type);
	} catch (error) {
		console.error(error);
	}
}

const errorTypes = ['unhandledRejection', 'uncaughtException'];
const signalTraps = ['SIGTERM', 'SIGINT', 'SIGHUP'];

errorTypes.forEach((type) => {
	process.on(type, async (error) => {
		console.info(`process.on ${type}`);
		console.error(error);
		await gracefulShutdown(type);
	});
});

signalTraps.forEach((type) => {
	process.once(type, async () => {
		console.info(`process.on ${type}`);
		await gracefulShutdown(type);
	});
});

(async () => {
	await dataSendingJob.run();
})();
