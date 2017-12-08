(function() {

  "use strict";
  Trillo.Login = function(viewSpec) {
    $.ajaxSetup({
      cache : false,
      beforeSend : function(xhr) {
        Trillo.setCSRFCookieHeader(xhr, true);
        if (Trillo.orgName) {
          xhr.setRequestHeader('x-org-name', Trillo.orgName);
        }
        if (Trillo.appName) {
          xhr.setRequestHeader('x-app-name', Trillo.appName);
        }
      }
    });
    var appContext = Trillo.appContext || {};
    Trillo.appName = appContext.appName;
    Trillo.orgName = appContext.orgName;
    // if the following line is commented then the login will follow
    // form submission and the server will handle is properly (except one caveat
    // that the server will not
    // honor the "hash" part of url (it really does not know about it).
    if ($("form").validate) {
      this.validator = $("form").validate({
        errorClass : "trillo-field-error"
      });
    }
    $("form").on("submit", $.proxy(this.doLogin, this));
    $('[name="j_username"').focus();
  };

  var Login = Trillo.Login.prototype;

  /*
   * This method is used for ajax based login. Note we ignore url define as the
   * action attribute of the form. Instead use '/ajaxLogin' URL. Ajax based
   * login is essential for single page UI page redirection and not creating
   * history for the url where the server will normally redirect the page in
   * case of form submission (remember that url-hash is actively used to decide
   * the landing page).
   */
  Login.doLogin = function(ev) {
    ev.stopPropagation();
    ev.preventDefault();
    if (this.validator) {
      this.validator.form();
      if (!this.validator.valid()) {
        return;
      }
    }
    var $e = $("form");
    var data = $e.serializeArray();
    $.ajax('/ajaxLogin', {
      'method' : 'post',
      'data' : data
    }).done(function(result) {
      $('body').removeClass('login-failed');
      var url = Trillo.appContext ? Trillo.appContext.redirectPath : null;
      if (!url) {
        url = result.redirectPath || "/";
      }
      window.location.replace(url);
    }).fail(function() {
      $('body').addClass('login-failed');
    });
  };

  $(document).ready(function() {
    Trillo.sessionStorage.clear();
    new Trillo.Login();
  });
})();
