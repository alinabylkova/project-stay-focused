(function() {
  $('input').on('change', function() {
    if ($(this).val().length > 0) {
      $(this).addClass('dirty');
    } else {
      $(this).removeClass('dirty');
    }
  });

  $('.show-signup-btn').on('click', function() {
    $('.signup-wrap').removeClass('hide');
    $('.login-wrap').addClass('hide');
  });

  $('.hide-signup-btn').on('click', function() {
    $('.signup-wrap')
      .removeClass('.hide-exit')
      .addClass('hide-enter');
    setTimeout(function() {
      $('.signup-wrap')
        .addClass('hide')
        .removeClass('hide-enter');
    }, 600);

    $('.login-wrap').removeClass('hide');
  });

  $('input.check-email').on('keyup', function() {
    if ($(this).hasClass('invalid')) {
      addValidation($(this), emailCheck);
    } else {
      $(this).on('change', function() {
        addValidation($(this), emailCheck);
      });
    }
  });

  function addValidation(input, inputCheck) {
    if (input.val().length > 0) {
      var validInput = inputCheck(input.val());
      console.log(validInput);
      if (validInput) {
        if (input.hasClass('invalid')) {
          input.removeClass('invalid');
        }
        input.addClass('valid');
      } else {
        if (input.hasClass('valid')) {
          input.removeClass('valid');
        }
        input.addClass('invalid');
      }
    } else {
      input.removeClass('invalid');
      input.removeClass('valid');
    }
  }

  function emailCheck(email) {
    var emailRegEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return emailRegEx.test(email);
  }
})();
