const connectSdk = require('connect-sdk-nodejs');

connectSdk.init({
  host: process.env.INGENICO_ENDPOINT_HOST,
  scheme: 'https',
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

/**
 * GET /api/ingenico
 * Ingenico API example.
 */
exports.getIngenico = (req, res) => {
  const status = req.query.status;
  const hostedCheckoutId = req.query.hostedCheckoutId;
  const returnmac = req.query.RETURNMAC;

  if (status === 'SUCCESS'){
    // This is the point where the hostedCheckoutId and RETURNMAC could be used to save
    // the payment status in a database

    connectSdk.hostedcheckouts.get(ingenicoMerchantID, hostedCheckoutId, null, (error, sdkResponse) => {
      if (sdkResponse.body.errors)
        console.warn('Your query could not be processed')

      req.flash('success', { msg: 'Your hosted payment has been received with a status ' + sdkResponse.status});

    });

  }

  res.render('api/ingenico', {
    title: 'ingenico API'
  });

};

exports.postIngenicoHostedCheckout = (req, res) => {
  const amount = Number(req.body.amount);

  const data = {
    order: {
      amountOfMoney: {
        currencyCode: 'USD',
        amount
      },
      customer: {
        merchantCustomerId: '1234',
        billingAddress: {
          countryCode: 'US'
        }
      }
    },
    hostedCheckoutSpecificInput: {
      variant: 'testVariant',
      locale: 'en_GB'
    }
  };

  connectSdk.hostedcheckouts.create(ingenicoMerchantID, data, null, (error, sdkResponse) => {
    // In order to record the hosted checkout status, the sdkResponse body has a
    // hostedCheckoutId that could be saved to compare to a successful redirect back from
    // the payment page

    if (sdkResponse.body.errors) {
      req.flash('errors', { msg: 'There was a problem with the checkout and we can not redirect you at this time.' });
      return res.redirect('/api/ingenico');
    }

    req.flash('success', { msg: 'You will be redirected shortly to the payment page.' });
    res.redirect('https://payment.'+sdkResponse.body.partialRedirectUrl);
  });
};

exports.getIngenicoHostedCheckout = (req, res) => {
  const hostedCheckoutId = req.params.hostedCheckoutId

  connectSdk.hostedcheckouts.get(ingenicoMerchantID, hostedCheckoutId, null, (error, sdkResponse) => {
    if (sdkResponse.body.errors)
      console.warn('Your query could not be processed')

    res.setHeader('Content-Type', 'application/json');
    return res.send(sdkResponse);
  });
};

exports.getIngenicoPaymentProducts = (req, res) => {
  const countryCode = req.query.countryCode;
  const locale = req.query.locale;
  const currencyCode = req.query.currencyCode;
  const amount = Number(req.query.amount);

  const data = {
    hide: [
      'fields'
    ],
    isRecurring: true,
    countryCode,
    locale,
    currencyCode,
    amount
  };

  connectSdk.products.find(ingenicoMerchantID, data, (error, sdkResponse) => {
    if (sdkResponse.body.errors)
      console.warn('Your query could not be processed')

    res.setHeader('Content-Type', 'application/json');
    return res.send(sdkResponse);
  });
};

exports.getIngenicoPaymentProduct = (req, res) => {
  const countryCode = req.query.countryCode;
  const locale = req.query.locale;
  const currencyCode = req.query.currencyCode;
  const amount = Number(req.query.amount);
  const productId = Number(req.params.productId);

  const data = {
    isRecurring: true,
    countryCode,
    locale,
    currencyCode,
    amount
  };

  connectSdk.products.get(ingenicoMerchantID, productId, data, (error, sdkResponse) => {
    if (sdkResponse.body.errors)
      console.warn('Your query could not be processed')

    res.setHeader('Content-Type', 'application/json');
    return res.send(sdkResponse);
  });
};

exports.postIngenicoPayment = (req, res) => {
  const amount = Number(req.body.amount);
  const cvv = req.body.cvv;
  const cardholderName = req.body.cardholderName;
  const cardNumber = req.body.cardNumber;
  const expiryDate = req.body.expiryDate;
  const currencyCode = req.body.currencyCode;
  const locale = req.body.locale;
  const additionalInfo = req.body.additionalInfo;
  const countryCode = req.body.countryCode;
  const zip = req.body.zip;
  const city = req.body.city;
  const state = req.body.state;
  const street = req.body.street;
  const houseNumber = req.body.houseNumber;

  const data = {
    cardPaymentMethodSpecificInput: {
      paymentProductId: 1,
      skipAuthentication: false,
      card: {
        cvv,
        cardholderName,
        cardNumber,
        expiryDate,
      }
    },
    order: {
      amountOfMoney: {
        currencyCode,
        amount
      },
      customer: {
        locale,
        billingAddress: {
          additionalInfo,
          countryCode,
          zip,
          city,
          state,
          street,
          houseNumber
        },
      },
    }
  };

  connectSdk.payments.create(ingenicoMerchantID, data, null, (error, sdkResponse) => {
    if (sdkResponse.body.errors)
      console.warn('Your query could not be processed')

    res.setHeader('Content-Type', 'application/json');
    return res.send(sdkResponse);
  });
};

exports.createIngenicoSession = (req, res) => {

  const body = {
    tokens: [
    ]
  };
  connectSdk.sessions.create(ingenicoMerchantID, body, null, (error, sdkResponse) => {
    if (sdkResponse.body.errors)
      console.warn('Your query could not be processed')

    res.setHeader('Content-Type', 'application/json');
    return res.send(sdkResponse);
  });
};

exports.postEncryptedIngenicoPayment = (req, res) => {
  const data = req.body;

  connectSdk.payments.create(ingenicoMerchantID, data, null, (error, sdkResponse) => {
    if (sdkResponse.body.errors)
      console.warn('Your query could not be processed')

    res.setHeader('Content-Type', 'application/json');
    return res.send(sdkResponse);
  });
};
