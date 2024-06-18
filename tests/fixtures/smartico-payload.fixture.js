const dayjs = require('dayjs');
const crypto = require('crypto');

const rndId = crypto.randomUUID();
const BRANDS = ['kapitalrs', 'fortrade', 'gcmasia', 'undefined'];
const rndBrand = BRANDS[Math.floor(Math.random() * BRANDS.length)];
const brandName =
	rndBrand === 'fortrade'
		? rndBrand.charAt(0).toUpperCase() + rndBrand.slice(1)
		: rndBrand;

const smarticoPayload = () => {
	return {
		eid: rndId,
		event_date: dayjs(dayjs()).valueOf(),
		ext_brand_id: brandName,
		user_ext_id: rndId,
		event_type: 'update_profile',
		payload: {
			fn_periodic_market_commentary: true,
			fn_analysis_preference: 'Equities,Commodities,Indices',
		},
	};
};

module.exports = { smarticoPayload };
