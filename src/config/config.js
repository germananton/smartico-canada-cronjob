const dotenv = require('dotenv');
const Joi = require('joi');
const path = require('path');

dotenv.config({ path: path.join(process.cwd(), '.env'), override: true });

const envVarsSchema = Joi.object()
	.keys({
		NODE_ENV: Joi.string()
			.valid('development', 'staging', 'production')
			.required()
			.description('This environment is stating the running mode.'),
		SMARTICO_API_KEY: Joi.string().required(),
		SMARTICO_ACCOUNTS_URL: Joi.string().required(),
		SMARTICO_ACCOUNTS_API_KEY: Joi.string().required(),
		SMARTICO_ACCOUNTS_ITEMS_LIMIT: Joi.number().default(100),
		SMARTICO_ACCOUNTS_LAST_MODIFIED_IN_MINUTES: Joi.number()
			.default(120)
			.required(),
		GET_BRAND_NAME_URL: Joi.string(),
	})
	.unknown();

const { value: envVars, error } = envVarsSchema
	.prefs({ errors: { label: 'key' } })
	.validate(process.env);

if (error) {
	throw new Error(`Config validation error: ${error.message}`);
}

module.exports = {
	env: envVars.NODE_ENV,
	cronjob: {
		smarticoApiKey: envVars.SMARTICO_API_KEY,
		smarticoApiUrl: envVars.SMARTICO_ACCOUNTS_URL,
		smarticoApiKey: envVars.SMARTICO_ACCOUNTS_API_KEY,
		smarticoItemsLimit: envVars.SMARTICO_ACCOUNTS_ITEMS_LIMIT,
		lastModifiedDateInMinutes:
			envVars.SMARTICO_ACCOUNTS_LAST_MODIFIED_IN_MINUTES,
	},
};
