const dayjs = require('dayjs');
const config = require('../config/config');

const fetchUserAccounts = async (numberOfAccounts, pageNumber = 1) => {
	console.info(`Fetching ${numberOfAccounts} user accounts`);

	const lastModifiedDate = dayjs().subtract(
		config.cronjob.lastModifiedDateInMinutes,
		'minutes'
	);
	const encodedDate = encodeURIComponent(lastModifiedDate);
	const queryParams = `LastModified=${encodedDate}&Items=${
		config.cronjob.smarticoItemsLimit
	}&Page=${pageNumber}`;
	const headers = { 'X-API-Key': `${config.cronjob.smarticoApiKey}` };

	try {
		const response = await axios.get(
			`${config.cronjob.smarticoRestApiUrl}?${queryParams}`,
			{ headers }
		);

		return response;
	} catch (error) {
		console.error(
			`Error occurred while fetching accounts: \n${error.message}`,
			error
		);
		return [];
	}
};

module.exports = { fetchUserAccounts };
