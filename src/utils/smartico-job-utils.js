const axios = require('axios');
const crypto = require('crypto');
const dayjs = require('dayjs');
var utc = require('dayjs/plugin/utc');
const config = require('../config/config');
const { AppError } = require('../errors');

dayjs.extend(utc);
const BRANDS = ['kapitalrs', 'fortrade', 'gcmasia', 'undefined'];

const fetchUserAccounts = async (
	numberOfAccounts = config.accountsItemsLimit,
	lastModifiedDateInMinutes = config.lastModifiedDateInMinutes,
	pageNumber = 1
) => {
	console.info(`Fetching ${numberOfAccounts} user accounts`);

	const lastModifiedDate = dayjs().subtract(
		lastModifiedDateInMinutes,
		'minutes'
	);

	const encodedDate = encodeURIComponent(
		dayjs.utc(lastModifiedDate).format('YYYY-MM-DD HH:MM:ss')
	);

	const queryParams = `LastModified=${encodedDate}&Items=${
		numberOfAccounts
	}&Page=${pageNumber}`;

	const headers = { 'X-API-Key': `${config.accountsApiKey}` };

	try {
		const response = await axios.get(
			`${config.accountsApiUrl}?${queryParams}`,
			{ headers }
		);

		if (!response) {
			return [];
		}
		return response.data;
	} catch (error) {
		throw new AppError(
			`Error occurred while fetching accounts: \n${error.title}`,
			error.stack
		);
	}
};

const getBrandFromAccountDetails = (siteName, accountId) => {
	let brandName = 'UNDEFINED';

	if (!siteName) {
		console.error(`Could not find brand for account: ${accountId}`);
		return brandName;
	}

	try {
		siteName = siteName.split(/[ .]/g)[0].toLowerCase();

		if (BRANDS.includes(siteName)) {
			// Capitalize the first letter only if it's 'fortrade'
			brandName =
				siteName === 'fortrade'
					? siteName.charAt(0).toUpperCase() + siteName.slice(1)
					: siteName;
		}
	} catch (error) {
		console.error(`Unable to find brand name\n${error.message}`, error);
		throw new AppError(
			`Unable to find brand name from account details with ID: ${accountId}, siteName = ${siteName}`,
			error.stack
		);
	}

	return brandName;
};

const composeSmarticoPayload = (accountDetails, eventDate) => {
	const eid = crypto.randomUUID();
	const request = {
		eid,
		event_date: eventDate,
		ext_brand_id: getBrandFromAccountDetails(
			accountDetails?.siteName,
			accountDetails?.accountId
		),
		user_ext_id: accountDetails.accountId,
		event_type: 'update_profile',
		payload: {
			fn_periodic_market_commentary: accountDetails.PeriodicMarketCommentary,
			fn_analysis_preference: accountDetails.AnalysisPreference,
		},
	};

	return request;
};

module.exports = {
	fetchUserAccounts,
	getBrandFromAccountDetails,
	composeSmarticoPayload,
};
