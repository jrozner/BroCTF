(function() {
  $(document).ready(function() {
    $('#loginButton').on('click', submitLogin);
  });
})();

function submitLogin(evt) {
  var username = $('#username').val();
  var password = $('#password').val();
  var token = $('#token').val();

  $.ajax({
    'url': 'login.php',
    'type': 'post',
    'data':'username='+username+'&password='+password+'&token='+token,
    'success': displayResponse,
    'error': displayError,
  });
}

function displayResponse(data, status, xhr) {
  if (typeof data.msg === undefined)
    return;

  $('#msg').text(data.msg);
}

function displayError(xhr, status, error) {
  if (typeof error.msg === undefined)
    return;

  var msg = JSON.parse(xhr.responseText).msg
  $('#msg').text(msg);
}
