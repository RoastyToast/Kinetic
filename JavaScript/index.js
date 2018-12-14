var lightboxOpen = false;

$(function() {
  $(".article-comment-text-overflow").on('click', function(e) {
    if ($(this).prev().height() <= 100) {
      $(this).prev().css('max-height', $(this).prev()[0].scrollHeight);
      $(this).text("Read Less");
    } else {
      $(this).prev().css('max-height', '100px');
      $(this).text("Read More");
    }
  });

  if ($("#index").length > 0) {
    $("#btn-join-forge").hide();
    $("#btn-join-download").show();
  }

  $("a[href^='#']").on('click', function(e) {
    e.preventDefault();
    var hash = this.hash;
    var top = 0;
    if (hash != "") {
      top = $(hash).offset().top;
    }
    $('html, body').animate({
      scrollTop: top
    }, 300, function() {
      window.location.hash = hash;
    });
  });

  /*$("#index-text-container").click(function(e) {
      var hash;

      if ($("#index-btn").length > 0) {
          hash = $("#index-btn").attr("href");
      } else if ($("#btn-download").length > 0) {
          hash = $("#btn-download").attr("href");
      }

      if (hash == undefined) {
          e.preventDefault();
          return;
      } else if (hash.charAt(0) == "#") {
          $('html, body').animate({scrollTop: $(hash).offset().top});
      } else {
          window.location = hash;
      }

      $(hash).find(".first-focus").focus();
  });*/

  $(".open-lightbox").on('click', function(e) {
    openLightbox($(this).data("id"));
  });

  $(".close-lightbox, #lightbox-area").on('click', function(e) {
    closeLightbox();
  });

  $(".silhouette").on('click', function(e) {
    $(this).addClass("active");
  });

  $("#btn-purchase").on('click', function(e) {
    if (document.getElementById("popup-panel-side-alt") != null) {
      $("#popup-panel-side").hide();
      $("#popup-panel-side-alt").show();
    }
  });

  /*$("#index-text-container").hover(function () {
      $("#index-btn").addClass("hovered");
      $("#index-image").addClass("hovered");
  }, function () {
      $("#index-btn").removeClass("hovered");
      $("#index-image").removeClass("hovered");
  });*/

  $(".silhouette").on('click', function(e) {
    $(".silhouette").removeClass("silhouette-large").addClass("silhouette-small");
    $(this).addClass("silhouette-large");

    $("#faction-prompt").hide();

    $(".faction-text").fadeOut("fast");
    $(this).find(".faction-text").delay(500).fadeIn();
  });

  checkCommentOverflow();

  if (("#comment-char-count").length == 0) {
    updateCommentCharacterCount();
  }

  $("#inputComment").bind('input propertychange', function() {
    updateCommentCharacterCount();
  });

  $("#lightbox-change-icon li").on('click', function(e) {
    $(this).parent().find(".active").removeClass("active");
    $(this).addClass("active");
  });

  updateRegionCarouselText();
  updateLocationCarouselText();
  $('#carouselLocations.carousel').on('slid.bs.carousel', function() {
    updateRegionCarouselText();
  });
  $('#carouselFeatured.carousel').on('slid.bs.carousel', function() {
    updateLocationCarouselText();
  });

  window.mvxLogin = function(email, password, success, error) {
    var passwordSha512 = sha512(password);

    $.ajax({
      url: SITE_BASE_URL + '/login',
      type: 'GET',
      data: {
        'email': email,
        'passwordHash': passwordSha512
      },
      success: success,
      error: error
    });

    return true;
  };

  $('#login-form').submit(function(e) {
    e.preventDefault();
    let emailFeedback = $('.email-feedback');
    emailFeedback.css('display', 'none');

    let emailElem = $('#inputEmailSignIn');
    let passwordElem = $('#inputPasswordSignIn');

    emailElem.removeClass('is-invalid');
    passwordElem.removeClass('is-invalid');

    let email = emailElem.val();
    let password = passwordElem.val();

    if (email == null || email.length === 0) {
      emailElem.addClass('is-invalid');
      return;
    } else if (password == null || password.length === 0) {
      passwordElem.addClass('is-invalid');
      return;
    }

    let loginButton = $('#login-button');
    loginButton.css('pointer-events', 'none');
    let originalLoginText = loginButton.text();
    loginButton.text(loginButton.attr('alt-text'));

    function onSuccess() {
      var params = {};
      location.search.substr(1).split("&").forEach(function(item) {
        params[item.split("=")[0]] = item.split("=")[1]
      });
      if ("login" in params) {
        window.location.href = "https://ayphix.com/forums/index.php?/login";
      } else {
        location.reload();
      }
    };

    mvxLogin(email, password, onSuccess, () => {
      emailElem.addClass('is-invalid');
      emailFeedback.css('display', '');
      emailFeedback.text('Invalid email or password.');
      loginButton.css('pointer-events', '');
      loginButton.text(originalLoginText);
    });
  });

  window.mvxRegister = function(userName, email, password, success, error) {
    let passwordSha512 = sha512(password);

    if (success == null) {
      success = function() {
        location.href = "/?newRegistration";
      };
    }

    $.ajax({
      url: SITE_BASE_URL + '/register',
      type: 'POST',
      data: {
        'userName': userName,
        'email': email,
        'passwordHash': passwordSha512,
        'rd': '' // TODO: recaptcha
      },
      success: success,
      statusCode: {
        406: function() {
          $('#invalid-email').css('display', '');
          $('#register-email').addClass('is-invalid');
          $('#inputEmail').addClass('is-invalid');
        },
        409: function() {
          $('#invalid-email').css('display', '');
          $('#register-email').addClass('is-invalid');
          $('.email-address-taken').css('display', '');
          $('#inputEmail').addClass('is-invalid');
        }
      },
      error: error
    });

    return true;
  };

  window.mvxSubmitForgotPassword = function(email, successHandler, errorHandler) {
    if (errorHandler == null) {
      errorHandler = function() {}
    }
    // forgot-password-submit
    $.ajax({
      url: SITE_BASE_URL + '/account/action',
      data: {
        'a': 'lostpass',
        'email': email
      },
      type: 'POST',
      success: successHandler,
      error: errorHandler
    });
  };

  window.mvxSubmitForgotPasswordComplete = function(memberId, validatingId, password, successHandler, errorHandler) {
    if (errorHandler == null) {
      errorHandler = function() {}
    }
    password = sha512(password);
    // forgot-password-submit
    $.ajax({
      url: SITE_BASE_URL + '/account/action',
      data: {
        'a': 'lostpasscomplete',
        'memberId': memberId,
        'vid': validatingId,
        'ph': password
      },
      type: 'POST',
      success: successHandler,
      error: errorHandler
    });
  };

  $('#forgot-password-submit').click(function(e) {
    e.preventDefault();
    let emailElem = $('#inputEmailForgotPassword');
    let originalText = $(this).html();
    let email = emailElem.val();
    if (emailElem.hasClass('is-invalid')) {
      emailElem.removeClass('is-invalid');
    }
    $(this).css('pointer-events', 'none');
    $(this).html($(this).attr('alt-text'));
    mvxSubmitForgotPassword(email, () => {
      $('#forgot-password-success').css('display', '');
      $(this).css('display', 'none');
    }, () => {
      $(this).css('pointer-events', '');
      $(this).html(originalText);
      emailElem.focus();
      emailElem.addClass('is-invalid');
    });
  });

  window.mvxChangePassword = function(oldPassword, newPassword, successHandler, errorHandler) {
    if (errorHandler == null) {
      errorHandler = function() {}
    }
    oldPassword = sha512(oldPassword);
    newPassword = sha512(newPassword);
    $.ajax({
      url: SITE_BASE_URL + '/account/action?a=changepass&oldPassword=' + oldPassword + '&newPassword=' + newPassword,
      contentType: "text/plain",
      type: 'POST',
      success: successHandler,
      error: errorHandler
    });
  };

  window.mvxSubmitChangeEmail = function(password, email, successHandler, errorHandler) {
    if (errorHandler == null) {
      errorHandler = function() {}
    }
    $.ajax({
      url: SITE_BASE_URL + '/account/action',
      data: {
        'a': 'changeemail',
        'email': email,
        'password': password
      },
      type: 'POST',
      success: successHandler,
      error: errorHandler
    });
  };

  window.mvxUpdateIcon = function(iconId, successHandler, errorHandler) {
    if (errorHandler == null) {
      errorHandler = function() {}
    }
    $.ajax({
      url: SITE_BASE_URL + '/account/action?a=setIcon&id=' + iconId,
      contentType: "text/plain",
      type: 'POST',
      success: successHandler,
      error: errorHandler
    });
  };

  $('#save-icon').click(function(e) {
    e.preventDefault();
    for (let idx = 0; idx <= 6; idx++) {
      if ($('#selected-icon-' + idx).hasClass('active')) {
        window.mvxUpdateIcon(idx, function() {
          closeLightbox();
          let imgElem = $('#selected-icon-' + idx + ' > img');
          $('#profile-image').attr('src', imgElem.attr('src'));
          $('#account-icon > img').attr('src', imgElem.attr('src'));
        });
        break;
      }
    }
  });

  $('#personalAge').keypress(function(e) {
    var a = [];
    var k = e.which;

    for (i = 48; i < 58; i++)
      a.push(i);

    if (!(a.indexOf(k) >= 0))
      e.preventDefault();
  });

  // $('#invite-form').submit(function(e) {
  //     openLightbox('#lightbox-invite-save');
  //     e.preventDefault();
  // });
  if ($('#q3yes').is(':checked')) {
    showMoreQuestions(true);
  }

  $('#founder-register-form').submit(function(e) {
    e.preventDefault();
    let iacceptElem = $('#founder-iaccept');
    let displayNameElem = $('#founder-register-username');
    let emailElem = $('#founder-register-email');
    let passwordElem = $('#founder-register-password');
    let passwordConfirmElem = $('#founder-register-password-confirm');

    let displayName = displayNameElem.val();
    let email = emailElem.val();
    let password = passwordElem.val();
    let passwordConfirm = passwordConfirmElem.val();

    let fail = false;
    if (!iacceptElem.is(':checked')) {
      fail = true;
      iacceptElem.addClass('is-invalid');
    }
    if (displayName == null || displayName.length < 3 || displayName.length > 16) {
      fail = true;
      displayNameElem.addClass('is-invalid');
    }
    if (email == null || email.length <= 5) {
      emailElem.addClass('is-invalid');
      fail = true;
    }
    if (password == null || password.length < 3 || password !== passwordConfirm) {
      passwordElem.addClass('is-invalid');
      passwordConfirmElem.addClass('is-invalid');
      fail = true;
    }
    if (fail) {
      return;
    }
    let registerButton = $('#register-account');
    registerButton.css('pointer-events', 'none');
    let originalRegisterText = registerButton.text();
    registerButton.text(registerButton.attr('alt-text'));

    mvxRegister(displayName, email, password, null, () => {
      registerButton.css('pointer-events', '');
      registerButton.text(originalRegisterText);
    });
  });

  $('#register-form').submit(function(e) {
    e.preventDefault();
    let iacceptElem = $('#iaccept');
    let displayNameElem = $('#register-username');
    let emailElem = $('#register-email');
    let passwordElem = $('#register-password');
    let passwordConfirmElem = $('#register-password-confirm');

    let displayName = displayNameElem.val();
    let email = emailElem.val();
    let password = passwordElem.val();
    let passwordConfirm = passwordConfirmElem.val();

    let fail = false;
    if (!iacceptElem.is(':checked')) {
      fail = true;
      iacceptElem.addClass('is-invalid');
    }
    if (displayName == null || displayName.length < 3 || displayName.length > 16) {
      fail = true;
      displayNameElem.addClass('is-invalid');
    }
    if (email == null || email.length <= 5) {
      emailElem.addClass('is-invalid');
      fail = true;
    }
    if (password == null || password.length < 3 || password !== passwordConfirm) {
      passwordElem.addClass('is-invalid');
      passwordConfirmElem.addClass('is-invalid');
      fail = true;
    }
    if (fail) {
      return;
    }
    let registerButton = $('#create-account-button');
    registerButton.css('pointer-events', 'none');
    let originalRegisterText = registerButton.text();
    registerButton.text(registerButton.attr('alt-text'));

    mvxRegister(displayName, email, password, null, () => {
      registerButton.css('pointer-events', '');
      registerButton.text(originalRegisterText);
    });
  });

  $('#register-form-inline').submit(function(e) {
    e.preventDefault();
    let iacceptElem = $('#inputAccept');
    let displayNameElem = $('#inputUsername');
    let emailElem = $('#inputEmail');
    let passwordElem = $('#inputPassword');
    let passwordConfirmElem = $('#inputConfirmPassword');

    let displayName = displayNameElem.val();
    let email = emailElem.val();
    let password = passwordElem.val();
    let passwordConfirm = passwordConfirmElem.val();

    let fail = false;
    if (!iacceptElem.is(':checked')) {
      fail = true;
      iacceptElem.addClass('is-invalid');
    }
    if (displayName == null || displayName.length < 3 || displayName.length > 16) {
      fail = true;
      displayNameElem.addClass('is-invalid');
    }
    if (email == null || email.length <= 5) {
      emailElem.addClass('is-invalid');
      fail = true;
    }
    if (password == null || password.length < 3 || password !== passwordConfirm) {
      passwordElem.addClass('is-invalid');
      passwordConfirmElem.addClass('is-invalid');
      fail = true;
    }
    if (fail) {
      return;
    }
    let registerButton = $('#create-account-button-inline');
    registerButton.css('pointer-events', 'none');
    let originalRegisterText = registerButton.text();
    registerButton.text(registerButton.attr('alt-text'));

    mvxRegister(displayName, email, password, null, () => {
      registerButton.css('pointer-events', '');
      registerButton.text(originalRegisterText);
    });
  });

  $('#change-password').click(function(e) {
    e.preventDefault();
    openLightbox('#lightbox-change-password');
  });

  $('#change-password-form').submit(function(e) {
    e.preventDefault();
    var oldPassword = $('#inputCurrentPasswordChangePassword').val();
    var password = $('#inputNewPasswordChangePassword').val();
    var passwordConfirm = $('#inputConfirmNewPasswordChangePassword').val();

    if (password.length < 3) {
      $('#inputNewPasswordChangePassword').addClass('is-invalid');
      $('#inputConfirmNewPasswordChangePassword').addClass('is-invalid');
      // alert("Password too short");
      return;
    } else if (password !== passwordConfirm) {
      $('#inputNewPasswordChangePassword').addClass('is-invalid');
      $('#inputConfirmNewPasswordChangePassword').addClass('is-invalid');
      // alert("Password doesn't match");
      return;
    }

    // TODO: another parameter can be passed for fail
    window.mvxChangePassword(oldPassword, password, passwordConfirm, function() {
      // TODO:
      closeLightbox();
    }, function() {
      $('#inputCurrentPasswordChangePassword').addClass('is-invalid');
    });
  });

  $('#change-email-form').submit(function(e) {
    e.preventDefault();
    var password = sha512($('#inputEmailChangePassword').val());
    var email = $('#inputEmailChangeEmail').val();
    var emailConfirm = $('#inputConfirmEmailChangeEmail').val();

    if (email !== emailConfirm) {
      $('#inputEmailChangeEmail').addClass('is-invalid');
      $('#inputConfirmEmailChangeEmail').addClass('is-invalid');
      return;
    }

    window.mvxSubmitChangeEmail(password, email, function() {
      $('#email-change-success').css('display', '');
    }, function() {
      $('#inputEmailChangePassword').addClass('is-invalid'); // TODO: ?
      // TODO: ????
    });
  });

  window.mvxComment = function(text, success) {
    if (window.articleId == null) {
      // TODO: alert?
      throw "Invalid article";
    }

    let articleId = window.articleId;
    let parentCommentId = window.parentCommentId;
    var url = SITE_BASE_URL + '/article/comment?articleId=' + articleId;
    if (parentCommentId != null) {
      url += "&parentCommentId=" + parentCommentId;
    }
    $.ajax({
      url: url,
      contentType: "text/plain",
      type: 'POST',
      data: text,
      success: success,
      error: function(data) {
        // validation("Invalid username and/or password.");
      }
    });
  };

  window.mvxVoteComment = function(commentId, up, successHandler, errorHandler) {
    var url = SITE_BASE_URL + '/article/comment?a=vote&commentId=' + commentId + '&up=' + (up ? "true" : "false");
    $.ajax({
      url: url,
      contentType: "text/plain",
      type: 'POST',
      success: successHandler,
      error: errorHandler
    });
  };

  window.mvxDeleteComment = function(commentId, successHandler) {
    $.ajax({
      url: SITE_BASE_URL + '/article/comment?a=delete&commentId=' + commentId,
      contentType: "text/plain",
      type: 'POST',
      success: successHandler,
      error: function() {}
    });
  };

  // lightbox events
  $('#comment-form').submit(function(e) {
    e.preventDefault();
    let text = $('#inputComment').val();
    mvxComment(text, () => location.reload());
  });

  $('#comment-delete-confirm').click(function(e) {
    console.log("Deleting " + window.selectedCommentId);
    e.preventDefault();
    window.mvxDeleteComment(window.selectedCommentId, function() {
      $('#article-comment-' + window.selectedCommentId).css('display', 'none');
      closeLightbox();
    });
  });
  // ~lightbox events

  var params = {};
  location.search.substr(1).split("&").forEach(function(item) {
    params[item.split("=")[0]] = item.split("=")[1]
  });
  if ("login" in params) {
    openLightbox('#lightbox-sign-in');
  }

  window.mvxRegisterCommentEvents = function() {
    if (!window.loggedIn) {
      return;
    }

    $('.article-comment-delete').each(function() {
      if (parseInt($(this).attr('memberid')) === window.memberId) {
        $(this).css('display', '');
      }
    });

    $('.article-comment-delete').click(function(e) {
      e.preventDefault();
      let commentId = $(this).attr('commentid');
      if (commentId == null) {
        throw "Invalid comment";
      }

      // use a global var to avoid any accidents
      window.selectedCommentId = commentId;
      openLightbox('#lightbox-delete-comment');
    });

    // TODO: cooldown on votes
    $('.article-comment-vote-up').click(function(e) {
      if ($(this).hasClass('active')) {
        e.preventDefault();
        return;
      }
      let commentId = $(this).attr('commentid');
      let votesElement = $('#article-comment-vote-amount-' + commentId);
      let previousVoteElement = $('#article-comment-vote-down-' + commentId);
      // preemptively set the vote count
      if (previousVoteElement.hasClass('active')) {
        previousVoteElement.removeClass('active');
        votesElement.text(parseInt(votesElement.text()) + 2);
      } else {
        votesElement.text(parseInt(votesElement.text()) + 1);
      }
      $('#article-comment-vote-up-' + commentId).addClass('active');
      // TODO: error handler
      window.mvxVoteComment(commentId, true, (data) => {
        // correct the vote count
        votesElement.text(data);
      });
    });

    $('.article-comment-vote-down').click(function(e) {
      if ($(this).hasClass('active')) {
        e.preventDefault();
        return;
      }
      let commentId = $(this).attr('commentid');
      let votesElement = $('#article-comment-vote-amount-' + commentId);
      let previousVoteElement = $('#article-comment-vote-up-' + commentId);
      // preemptively set the vote count
      if (previousVoteElement.hasClass('active')) {
        previousVoteElement.removeClass('active');
        votesElement.text(parseInt(votesElement.text()) - 2);
      } else {
        votesElement.text(parseInt(votesElement.text()) - 1);
      }
      $('#article-comment-vote-down-' + commentId).addClass('active');
      // TODO: error handler
      window.mvxVoteComment(commentId, false, (data) => {
        // correct the vote count
        votesElement.text(data);
      });
    });

    $(".open-reply-lightbox").on('click', function(e) {
      e.preventDefault();
      let parentCommentId = $(this).data('commentid');
      if (parentCommentId === undefined) {
        parentCommentId = null;
        $('.reply-to-name').css('display', 'none');
        $('.reply-to-comment').css('display', 'none');
      } else {
        $('.reply-to-name').css('display', '');
        $('.reply-to-name').text("Reply to: " + $("#article-comment-name-" + parentCommentId).text());
        $('.reply-to-comment').css('display', '');
        $('.reply-to-comment').text($("#article-comment-text-" + parentCommentId).text());
      }
      window.parentCommentId = parentCommentId;
      openLightbox($(this).data("id"));
      $('#inputComment').focus();
    });
  };

  window.mvxLoadComments = function() {
    let articleId = window.articleId;
    if (articleId == null) {
      throw "Invalid article";
    }
    $.ajax({
      url: SITE_BASE_URL + "/article/comments",
      data: {
        'articleId': articleId
      },
      type: 'GET',
      success: function(data) {
        $('#comments-content').html(data);
        // this must be executed after setting the html
        window.mvxRegisterCommentEvents();

      },
      error: function(e) {
        console.log(e);
      }
    });
  };

  var params = {};
  location.search.substr(1).split("&").forEach(function(item) {
    params[item.split("=")[0]] = item.split("=")[1]
  });
  if ("discordoauth" in params) {
    openLightbox('#lightbox-discord-oauth');
    $('#discord-role-button').parent().remove();
  }

  window.mvxRegisterCommentEvents();
});

function updateRegionCarouselText() {
  $("#region-info").fadeOut(function() {
    $('#region-name').html($('#carouselLocations.carousel .active > .carousel-caption h3').html());
    $('#region-description').html($('#carouselLocations.carousel .active > .carousel-caption p').html());
    $(this).fadeIn();
  });
}

function updateLocationCarouselText() {
  $("#location-info").fadeOut(function() {
    $('#location-name').html($('#carouselFeatured.carousel .active > .carousel-caption h3').html());
    $('#location-description').html($('#carouselFeatured.carousel .active > .carousel-caption p').html());
    $(this).fadeIn();
  });
}

function updateCommentCharacterCount() {
  $("#comment-char-count").text($("#inputComment").val().length + " / " + $("#inputComment").attr("maxLength"));
}

function showMoreQuestions(show) {
  if (show) {
    $("#moreQuestions").slideDown("slow");
  } else {
    $("#moreQuestions").slideUp("slow", function() {
      $("#moreQuestions textarea").val("");
      $("#moreQuestions :checkbox").prop('checked', false).parent().removeClass('active');
    });
  }
}

$(window).resize(function() {
  checkCommentOverflow();
});

function checkCommentOverflow() {
  $(".article-comment-text").each(function() {
    if (parseInt($(this).css("max-height")) >= $(this)[0].scrollHeight) {
      $(this).parent().find(".article-comment-text-overflow").hide();
    } else {
      $(this).parent().find(".article-comment-text-overflow").show();
    }
  });
}

function openLightbox(content) {
  if (lightboxOpen) {
    $("#lightbox-holder").contents().appendTo("#lightbox-screens");
  }

  $(content).appendTo("#lightbox-holder");
  $("#lightbox").fadeIn("fast");
  lightboxOpen = true;

  $(content).find(".first-focus").focus();
}

function closeLightbox() {
  if (!lightboxOpen) {
    return;
  }

  $.when($("#lightbox").fadeOut("fast")).done(function() {
    $("#lightbox-holder").contents().appendTo("#lightbox-screens");
    lightboxOpen = false;
  });
}
