const request = require('supertest');
const app = require('../app.js');
const expect = require('chai').expect;

describe('GET /api/ingenico', () => {
  it('should return 200 OK', function(done) {
    this.timeout(4000);

    request(app)
      .get('/api/ingenico')
      .expect(200, done);
  });
});

describe('POST /api/ingenico', () => {
  it('should return 302 OK', function(done) {
    this.timeout(4000);
    const agent = request.agent(app)

    agent
      .get('/api/ingenico')
      .end((err,res) => {
        const textMatch = res.text.match(/csrf-token\"\s+content\=\"[^\"]*\"/g);
        const tokenString = textMatch[0].match(/"(\d|\w|\/|\+|\=)+\"/g)[0]
        const token = tokenString.substring(1, tokenString.length -1)

        agent
          .post('/api/ingenico')
          .send({
            _csrf: token,
            amount: '3500'
          })
          .expect(302, done);

      })
  });
});

describe('GET /api/ingenico-products', () => {
  it('should return 200 OK', function(done) {
    this.timeout(4000);

    request(app)
      .get('/api/ingenico-products?amount=100000')
      .expect(200)
      .end((err,res) => {
        const json = res.body
        expect(json.body).to.have.property('paymentProducts')
        expect(json.body.paymentProducts).to.be.an('array')
        done()
      })
  });
});

describe('GET /api/ingenico-products/:productId', () => {
  it('should return 200 OK', function(done) {
    this.timeout(4000);

    request(app)
      .get('/api/ingenico-products/1?amount=100000')
      .expect(200)
      .end((err,res) => {
        const json = res.body

        expect(json.body).to.have.property('allowsRecurring')
        expect(json.body).to.have.property('allowsTokenization')
        expect(json.body).to.have.property('autoTokenized')
        expect(json.body).to.have.property('displayHints')
        done()
      })
  });
});

describe('POST /api/ingenico-payment', () => {
  it('should return 302 OK', function(done) {
    this.timeout(4000);
    const agent = request.agent(app)

    agent
      .get('/api/ingenico')
      .end((err,res) => {
        const textMatch = res.text.match(/csrf-token\"\s+content\=\"[^\"]*\"/g);
        const tokenString = textMatch[0].match(/"(\d|\w|\/|\+|\=)+\"/g)[0]
        const token = tokenString.substring(1, tokenString.length -1)

        agent
          .post('/api/ingenico-payment')
          .send({
            _csrf: token,
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
          })
          .expect(200)
          .end((err,res) => {
            const json = res.body

            expect(json.body).to.have.property('creationOutput')
            expect(json.body).to.have.property('payment')
            expect(json.body.payment.status).to.equal('PENDING_APPROVAL')
            done()
          })

      })
  });
});
