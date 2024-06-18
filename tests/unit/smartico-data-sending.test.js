const axios = require('axios');
const crypto = require('crypto');
const Smartico = require('../../src/providers/smartico');
const { testError } = require('../utils/test-utils');
const {
	AppError,
	BadRequestError,
	ForbiddenError,
	UnauthorizedError,
	ServerError,
} = require('../../src/errors');
const { smarticoPayload } = require('../fixtures/smartico-payload.fixture');
const config = require('../../src/config/config');

jest.mock('axios');

const smartico = new Smartico();

describe('Test Smartico data sending', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		jest.restoreAllMocks();
	});

	it('should successfully send request to Smartico', async () => {
		const mockPayload = smarticoPayload();
		const mockResponse = {
			data: {
				req_id: 'b4be3f0f-3e0a-4092-8267-4ae358397541',
				pd: 26,
				err_code: 0,
			},
		};

		axios.post.mockResolvedValue(mockResponse);

		const response = await smartico.sendUpdateProfileEvent(mockPayload);

		await expect(response).toEqual(mockResponse.data);
		await expect(axios.post).toHaveBeenCalledWith(
			config.smarticoApiUrl,
			mockPayload,
			{
				headers: {
					ContentType: 'application/json',
					Authorization: config.smarticoApiKey,
				},
			}
		);
	});

	it('should throw a BadRequestError', async () => {
		const accountId = crypto.randomUUID();

		const errorResponse = {
			response: {
				status: 400,
				data: {
					req_id: crypto.randomUUID(),
					failed_events: {
						[accountId]: [
							'Property fn_periodic_market_commentary faled to parse value null, error: JSONObject["fn_periodic_market_commentary"] is not a Boolean.',
						],
					},
					pd: 4,
					err_code: 2,
				},
			},
		};

		axios.post.mockRejectedValue(errorResponse);

		const errorMsg = Object.values(
			errorResponse.response.data.failed_events
		)[0].toString();

		await expect(
			testError(
				async () => smartico.sendUpdateProfileEvent('test payload'),
				BadRequestError,
				`Request to Smartico failed with BAD_REQUEST error ${errorMsg}`
			)
		).resolves.toBe();
	});

	it('should throw a ServerError', async () => {
		const accountId = crypto.randomUUID();

		const errorResponse = {
			response: {
				status: 500,
				data: {
					req_id: crypto.randomUUID(),
					failed_events: {
						[accountId]: ['Internal Server Error (500)'],
					},
					pd: 4,
					err_code: 0,
				},
			},
		};

		axios.post.mockRejectedValue(errorResponse);

		const errorMsg = Object.values(
			errorResponse.response.data.failed_events
		)[0].toString();

		await expect(
			testError(
				async () => smartico.sendUpdateProfileEvent('this is a payload'),
				ServerError,
				`Request to Smartico failed with internal server error ${errorMsg}`
			)
		).resolves.toBe();
	});

	it('should throw a UnAuthorized error', async () => {
		const errorResponse = {
			response: {
				status: 401,
				data: {
					duration: 1,
					errCode: 4,
					errMsg: 'Access denied/Access denied',
					cid: 99999,
				},
			},
		};

		axios.post.mockRejectedValue(errorResponse);

		await expect(
			testError(
				async () => smartico.sendUpdateProfileEvent('mock payload'),
				UnauthorizedError,
				`Unauthorized request sent to Smartico`
			)
		).resolves.toBe();
	});

	it('should throw a Forbidden error', async () => {
		const errorResponse = {
			response: {
				status: 403,
				data: {
					duration: 1,
					errCode: 4,
					errMsg: 'forbidden',
					cid: 99999,
				},
			},
		};

		axios.post.mockRejectedValue(errorResponse);

		await expect(
			testError(
				async () => smartico.sendUpdateProfileEvent('this is a mock payload'),
				ForbiddenError,
				`Forbidden request sent to Smartico`
			)
		).resolves.toBe();
	});
});
