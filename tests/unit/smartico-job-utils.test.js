const axios = require('axios');
const dayjs = require('dayjs');
var utc = require('dayjs/plugin/utc');
const crypto = require('crypto');

const smarticoJobUtils = require('../../src/utils/smartico-job-utils');
const accountsPayload = require('../fixtures/accounts-payload.fixture');
const config = require('../../src/config/config');
const { testError } = require('../utils/test-utils');
const { AppError } = require('../../src/errors');

dayjs.extend(utc);
jest.mock('axios');

describe('Test smartico job utils', () => {
	afterEach(() => {
		jest.clearAllMocks();
	});

	it('should properly fetch user accounts', async () => {
		const lastModifiedDate = dayjs().subtract(
			config.lastModifiedDateInMinutes,
			'minutes'
		);

		// mocks the Date object to always return the mockDate value when instantiated.
		//This ensures that the lastModifiedDate parameter is always predictable
		const mockDate = new Date(lastModifiedDate);
		global.Date = jest.fn(() => mockDate);

		const encodedDate = encodeURIComponent(
			dayjs.utc(lastModifiedDate).format('YYYY-MM-DD HH:MM:ss')
		);

		const queryParams = `LastModified=${encodedDate}&Items=${
			config.accountsItemsLimit
		}&Page=${1}`;

		const headers = { 'X-API-Key': `${config.accountsApiKey}` };

		const mockedResponse = { userAccounts: accountsPayload.userAccounts };
		axios.get.mockResolvedValue({ data: accountsPayload });

		const response = await smarticoJobUtils.fetchUserAccounts();

		await expect(axios.get).toHaveBeenCalledWith(
			`${config.accountsApiUrl}?${queryParams}`,
			{ headers }
		);

		await expect(response).toEqual(mockedResponse);
	});

	it('should throw AppError when an invalid fetchUserAccounts request is sent', async () => {
		const mockErrorResponse = {
			type: 'https://tools.ietf.org/html/rfc7231#section-6.5.1',
			title: 'One or more validation errors occurred.',
			status: 400,
			traceId: '00-a0f73791a3c2dbebed7b5d6fd2a6e047-e8ae103be591bc83-00',
			errors: {
				LastModified: [
					"The value '20220616 11:00:00' is not valid for LastModified.",
				],
			},
		};

		axios.get.mockRejectedValue(mockErrorResponse);

		await expect(
			testError(
				async () => smarticoJobUtils.fetchUserAccounts(),
				AppError,
				`Error occurred while fetching accounts: \n${mockErrorResponse.title}`,
				[(error) => expect(error.isOperational).toBe(true)]
			)
		).resolves.toBe();
	});

	it('should correctly get the brand name from account details', () => {
		const siteName = 'fortrade.au';
		const accountId = crypto.randomUUID();

		const brandName = smarticoJobUtils.getBrandFromAccountDetails(
			siteName,
			accountId
		);

		expect(brandName).toBe('Fortrade');
	});

	it('should return UNDEFINED when site name does not contain valid brand', () => {
		const siteName = 'fortrade-eu';
		const accountId = crypto.randomUUID();

		const brandName = smarticoJobUtils.getBrandFromAccountDetails(
			siteName,
			accountId
		);

		expect(brandName).toBe('UNDEFINED');
	});

	it('should return UNDEFINED when site name is empty', () => {
		const siteName = '';
		const accountId = crypto.randomUUID();

		const brandName = smarticoJobUtils.getBrandFromAccountDetails(
			siteName,
			accountId
		);

		expect(brandName).toBe('UNDEFINED');
	});

	it('should properly compose a valid Smartico payload', () => {
		const accountId = crypto.randomUUID();
		const eventDate = dayjs(dayjs()).valueOf();

		const mockData = {
			siteName: 'GCMAsia FSC',
			accountId,
			PeriodicMarketCommentary: true,
			AnalysisPreference: 'Commodities, Indices',
		};

		const mockPayload = {
			eid: '',
			event_date: eventDate,
			ext_brand_id: 'gcmasia',
			user_ext_id: accountId,
			event_type: 'update_profile',
			payload: {
				fn_periodic_market_commentary: true,
				fn_analysis_preference: 'Commodities, Indices',
			},
		};

		const result = smarticoJobUtils.composeSmarticoPayload(mockData, eventDate);

		mockPayload.eid = result.eid;
		expect(result).toEqual(mockPayload);
	});
});
