const axios = require('axios');
const crypto = require('crypto');
const dayjs = require('dayjs');
var utc = require('dayjs/plugin/utc');
const config = require('../config/config');

dayjs.extend(utc);
const BRANDS = ['kapitalrs', 'fortrade', 'gcmasia', 'undefined'];

const fetchUserAccounts = async (
	numberOfAccounts = config.accountsItemsLimit,
	lastModifiedDateInMinutes = config.lastModifiedDateInMinutes,
	pageNumber = 1
) => {
	console.info(`Fetching ${numberOfAccounts} user accounts`);

	// const lastModifiedDate = dayjs().subtract(
	// 	lastModifiedDateInMinutes,
	// 	'minutes'
	// );
	const lastModifiedDate = dayjs().subtract(1, 'day');

	const encodedDate = encodeURIComponent(
		dayjs.utc(lastModifiedDate).format('YYYY-MM-DD HH:MM:ss')
	);

	const queryParams = `LastModified=${encodedDate}&Items=${
		numberOfAccounts
	}&Page=${pageNumber}`;

	const headers = { 'X-API-Key': `${config.accountsApiKey}` };

	try {
		// TODO: uncomment
		// const response = await axios.get(
		// 	`${config.accountsApiUrl}?${queryParams}`,
		// 	{ headers }
		// );
		// return response.data;
	} catch (error) {
		console.error(
			`Error occurred while fetching accounts: \n${error.message}`,
			error
		);
		return [];
	}
};

const getBrandFromAccountDetails = (siteName, accountId) => {
	if (!siteName) {
		console.error(`Could not find brand for account: ${accountId}`);

		return;
	}

	let brandName;

	try {
		siteName = siteName.split(/[ .]/g)[0].toLowerCase();

		if (BRANDS.includes(siteName)) {
			brandName =
				siteName === 'gcmasia'
					? 'gcmasia'
					: siteName.charAt(0).toUpperCase() + siteName.slice(1);
		}
	} catch (error) {
		logger.error(
			`Unable to find the brand name from account details with ID: ${accountId}, siteName = ${siteName}`
		);
	}

	return brandName;
};

const composeSmarticoPayload = (fields) => {
	const eid = crypto.randomUUID();
	const request = {
		eid,
		event_date: dayjs(dayjs()).valueOf(),
		ext_brand_id: getBrandFromAccountDetails(
			fields?.siteName,
			fields?.accountId
		),
		user_ext_id: fields.accountId,
		event_type: 'update_profile',
		payload: {
			fn_periodic_market_commentary: fields.PeriodicMarketCommentary ?? false,
			fn_analysis_preference: fields.AnalysisPreference,
		},
	};

	return request;
};

module.exports = {
	fetchUserAccounts,
	getBrandFromAccountDetails,
	composeSmarticoPayload,
};
