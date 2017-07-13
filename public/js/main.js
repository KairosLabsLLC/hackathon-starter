$(document).ready(function() {


  $('#ingenico-products').on('click', function(event){
    event.preventDefault();
    event.stopPropagation();
    var codeResponse = $('#ingenico-products-response')

    $.ajax({
      url: '/api/ingenico-products?amount=10000',
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

  $('#ingenico-specific-product').on('click', function(event){
    event.preventDefault();
    event.stopPropagation();
    var codeResponse = $('#ingenico-product-response')

    $.ajax({
      url: '/api/ingenico-products/1',
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

});
