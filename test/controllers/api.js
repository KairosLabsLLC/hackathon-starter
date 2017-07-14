const app = require('../../app.js');
const controller = require('../../controllers/api');
const http_mocks = require('node-mocks-http');
const expect = require('chai').expect;
const host = process.env.INGENICO_ENDPOINT_HOST;
const merchantID = process.env.INGENICO_MERCHANT_ID;

function buildResponse() {
  return http_mocks.createResponse({eventEmitter: require('events').EventEmitter})
}

describe('Ingenico API Controller Tests', function() {

  it('ingenico hosted checkout', function(done) {
    this.timeout(4000)
    const response = buildResponse()
    const request  = http_mocks.createRequest({
      method: 'POST',
      url: '/api/ingenico',
      body: { amount: '3500' }
    })

    response.on('end', function() {
      expect(response.statusCode).to.equal(302)
      expect(response.statusMessage).to.equal('OK')
      done()
    })

    controller.postIngenicoHostedCheckout(request, response)
  })

  it('ingenico-products', function(done) {
    this.timeout(4000)
    const response = buildResponse()
    const request  = http_mocks.createRequest({
      method: 'GET',
      url: '/api/ingenico-products?amount=10000',
      query: {
        amount: '100000'
      }
    })

    response.on('end', function() {
      const data = response._getData()
      expect(data).to.have.property('paymentProducts')
      expect(data.paymentProducts).to.be.an('array')
      done()
    })

    controller.getIngenicoPaymentProducts(request, response)
  })

  it('ingenico-products productId', function(done) {
    this.timeout(4000)
    const response = buildResponse()
    const request  = http_mocks.createRequest({
      method: 'GET',
      url: '/api/ingenico-products/1',
      params: {
        productId: 1
      },
      query: {
        amount: '100000'
      }
    })

    response.on('end', function() {
      const data = response._getData()
      expect(data).to.have.property('allowsRecurring')
      expect(data).to.have.property('allowsTokenization')
      expect(data).to.have.property('autoTokenized')
      expect(data).to.have.property('displayHints')
      done()
    })

    controller.getIngenicoPaymentProduct(request, response)
  })

  it('ingenico server payment', function(done) {
    this.timeout(4000)
    const response = buildResponse()
    const request  = http_mocks.createRequest({
      method: 'POST',
      url: '/api/ingenico-payment',
      body: { 
        amount: '2980',
        cvv: '123',
        cardholderName: 'Wile E. Coyote',
        cardNumber: '4567350000427977',
        expiryDate: '1220',
        currencyCode: 'EUR',
        locale: 'en_US',
        additionalInfo: 'b',
        countryCode: 'US',
        zip: '84536',
        city: 'Monument Valley',
        state: 'Utah',
        street: 'Dessertroad',
        houseNumber: '13'
      }
    })

    response.on('end', function() {
      expect(response.statusCode).to.equal(200);
      expect(response.statusMessage).to.equal('OK');

      const data = response._getData();

      expect(data).to.have.property('creationOutput')
      expect(data).to.have.property('payment')

      done()
    })

    controller.postIngenicoPayment(request, response)
  })

})
