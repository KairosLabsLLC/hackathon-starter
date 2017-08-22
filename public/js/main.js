$(document).ready(function() {


  $('#ingenico-products').on('submit', function(event){
    event.preventDefault();
    event.stopPropagation();
    var codeResponse = $('#ingenico-products-response')

    $.ajax({
      url: '/api/ingenico-products?amount=10000&countryCode=US&locale=en_US&currencyCode=USD',
      method: 'GET',
      success: function(data){
        codeResponse.empty()
        codeResponse.append('<pre>'+ JSON.stringify(data, undefined, 2) +'</pre>')
      },
      error: function(err){
        console.warn(err)
      }
    })
  })

  $('#ingenico-specific-product').on('submit', function(event){
    event.preventDefault();
    event.stopPropagation();
    var codeResponse = $('#ingenico-product-response')

    $.ajax({
      url: '/api/ingenico-products/1?amount=10000&countryCode=US&locale=en_US&currencyCode=USD',
      method: 'GET',
      success: function(data){
        codeResponse.empty()
        codeResponse.append('<pre>'+ JSON.stringify(data, undefined, 2) +'</pre>')
      },
      error: function(err){
        console.warn(err)
      }
    })
  })

  $('#ingenico-payment').on('submit', function(event){
    event.preventDefault();
    event.stopPropagation();
    var codeResponse = $('#ingenico-payment-response')

    $.ajax({
      url: '/api/ingenico-payment',
      method: 'POST',
      data: $('#ingenico-payment').serialize(),
      success: function(data){
        codeResponse.empty()
        codeResponse.append('<pre>'+ JSON.stringify(data, undefined, 2) +'</pre>')
      },
      error: function(err){
        console.warn(err)
      }
    })

  })

  $('#ingenico-session').on('submit', function(event){
    event.preventDefault();
    event.stopPropagation();
    var codeResponse = $('#ingenico-session-response')

    $.ajax({
      url: '/api/ingenico-session',
      method: 'POST',
      data: $('#ingenico-session').serialize(),
      success: function(data){
        codeResponse.empty()
        codeResponse.append('<pre>'+ JSON.stringify(data, undefined, 2) +'</pre>')
      },
      error: function(err){
        console.warn(err)
      }
    })

  })

  $('#ingenico-crypto').on('submit', function(event){
    event.preventDefault();
    event.stopPropagation();
    var domainname = "sandbox"



    $.ajax({
      url: '/api/ingenico-session',
      method: 'POST',
      data: $('#ingenico-session').serialize(),
      success: function(data){
        data.body.environment = 'SANDBOX'
        var session = new connectsdk.Session(data.body)
        var paymentDetails = {
          countryCode: "US",
          locale: "en_US",
          currency: "USD",
          isRecurring: false,
          totalAmount: 10000,
          amount: 10000
        };
        var cardDetails = {
          cardNumber: '4567350000427977',
          expiryDate: '12/21',
          cvv: '123'
        }
        createPaymentHash(session, cardDetails, paymentDetails, sendEncryptedPayment)

        console.log(session)
        console.log(data.body)
        // createPayload(session, '4567350000427977', paymentDetails)

        // var clientSessionId = data.body.clientSessionId;
        // var customerId = data.body.customerId;

        // session.getPublicKey().then(function (publicKey) {
        //   console.log(publicKey);
        // }, function (error) {
        //   console.warn(error);
        // });
        // session.getBasicPaymentItems(paymentDetails, true).then(function (basicPaymentItems) {
        //   console.log(basicPaymentItems.json);
        // }, function(err) {
        //   // The promise failed, inform the user what happened.
        //   console.warn(err)
        // });

        // var url = "https://api-sandbox.globalcollect.com/client/v1/" + customerId + "/crypto/publickey";
        // $.ajax({
        //   url: url,
        //   type: "GET",
        //   dataType: "json",
        //   headers: {Authorization: "GCS v1Client:" + clientSessionId},
        //   success: function(json){
        //     codeResponse.empty()
        //     codeResponse.append('<pre>'+ JSON.stringify(json, undefined, 2) +'</pre>')
        //   },
        //   error: function(err){
        //     console.warn(err)
        //   }
        // });

        // payload = {bin: "456735"} 
        // var url = "https://api-sandbox.globalcollect.com/client/v1/" + customerId + "/services/getIINdetails";
        // $.ajax({
        //   url: url,
        //   type: "POST",
        //   dataType: "json",
        //   contentType: "application/json",
        //   data: JSON.stringify(payload),
        //   headers: {Authorization: "GCS v1Client:" + clientSessionId}
        // }).done(function(json) {
        //   // success!
        //   console.log(json);
        // }).fail(function(jqXHR, textStatus, errorThrown) {
        //   // the request failed
        //   console.log(jqXHR, textStatus, errorThrown);
        // });

      },
      error: function(err){
        console.warn(err)
      }
    })

  })

});

var createPaymentHash = function (session, cardDetails, paymentDetails, action) {
  session.getIinDetails(cardDetails.cardNumber.substring(0,6), paymentDetails).then(function (iinDetailsResponse) {

    session.getPaymentProduct(iinDetailsResponse.paymentProductId, paymentDetails).then(function (paymentProduct) {

      var paymentRequest = session.getPaymentRequest();
      paymentRequest.setPaymentProduct(paymentProduct);
      paymentRequest.setValue("cardNumber", cardDetails.cardNumber);
      paymentRequest.setValue("cvv", cardDetails.cvv);
      paymentRequest.setValue("expiryDate", cardDetails.expiryDate);

      session.getEncryptor().encrypt(paymentRequest).then(function (paymentHash) {
        action(paymentHash)
      }, function (errors) {
        console.error('Failed encrypting the payload: ', errors);
      });

    }, function (errors) {
      console.error('Failed getting payment product: ', errors);
    });

  }, function (errors) {
    console.error('Failed getting IinDetails: ', errors);
  });
}

var sendEncryptedPayment = function(hash){
  var codeResponse = $('#ingenico-crypto-response')

  $.ajax({
    url: '/api/ingenico-payment',
    method: 'POST',
    data: {encryptedCustomerInput: hash},
    success: function(data){
      codeResponse.empty()
      codeResponse.append('<pre>'+ JSON.stringify(data, undefined, 2) +'</pre>')
    },
    error: function(err){
      console.warn(err)
    }
  })

}

// var createPayload = function (session, cardNumber, paymentDetails) {
//     session.getIinDetails(cardNumber, paymentDetails).then(function (iinDetailsResponse) {
//         if (iinDetailsResponse.status !== "SUPPORTED") {
//             console.error("Card check error: " + iinDetailsResponse.status);
//             document.querySelector('.output').innerText = 'Something went wrong, check the console for more information.';
//             return;
//         }
//         session.getPaymentProduct(iinDetailsResponse.paymentProductId, paymentDetails).then(function (paymentProduct) {
//             var paymentRequest = session.getPaymentRequest();
//             paymentRequest.setPaymentProduct(paymentProduct);
//             paymentRequest.setValue("cardNumber", cardNumber);
//             paymentRequest.setValue("cvv", "123");
//             paymentRequest.setValue("expiryDate", "04/17");

//             if (!paymentRequest.isValid()) {
//                 for (var error in paymentRequest.getErrorMessageIds()) {
//                     console.error('error', error);
//                 }
//             }
//             session.getEncryptor().encrypt(paymentRequest).then(function (paymentHash) {
//                 document.querySelector('.output').innerText = 'Encrypted to: ' + paymentHash;
//             }, function (errors) {
//                 console.error('Failed encrypting the payload, check your credentials');
//                 document.querySelector('.output').innerText = 'Something went wrong, check the console for more information.';
//             });

//         }, function () {
//             console.error('Failed getting payment product, check your credentials');
//             document.querySelector('.output').innerText = 'Something went wrong, check the console for more information.';
//         });

//     }, function () {
//         console.error('Failed getting IinDetails, check your credentials');
//         document.querySelector('.output').innerText = 'Something went wrong, check the console for more information.';
//     });
// }
