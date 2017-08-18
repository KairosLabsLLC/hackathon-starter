const connectSdk = require('connect-sdk-nodejs');

connectSdk.init({
  host: process.env.INGENICO_ENDPOINT_HOST,
  scheme: "https",
  port: 443,
  apiKeyId: process.env.INGENICO_KEY_ID,
  secretApiKey: process.env.INGENICO_SECRET
});

const ingenicoMerchantID = process.env.INGENICO_MERCHANT_ID;

/**
 * GET /api
 * List of API examples.
 */
exports.getApi = (req, res) => {
  res.render('api/index', {
    title: 'API Examples'
  });
};


/**
 * GET /api/ingenico
 * Ingenico API example.
 */
exports.getIngenico = (req, res) => {
  res.render('api/ingenico', {
    title: 'ingenico API'
  });
};
