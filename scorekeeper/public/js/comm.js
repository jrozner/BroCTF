document.querySelector('#login_button').addEventListener('click', login);

var socket = io.connect('127.0.0.1:8080');

socket.on('ready', displayLogin);
socket.on('logged_in', completeLogin);
socket.on('scoreboard', drawScoreBoard);
socket.on('challenges', populateChallenges);
socket.on('msg', displayMsg);
socket.on('error', displayError);
socket.on('update_score', updateScore);

function login() {
  var username = document.querySelector('#username').value;
  var password = document.querySelector('#password').value;

  socket.emit('login', {'username': username, 'password': password});
}

function completeLogin() {
  socket.emit('send_scoreboard');
  socket.emit('send_challenges');

  var username = document.querySelector('#username').value;
  document.querySelector('#username').value = '';
  document.querySelector('#password').value = '';

  var classes = document.querySelector('#login').getAttribute('class');
  document.querySelector('#login').setAttribute('class', classes+' hidden');

  var classes = document.querySelector('#container').getAttribute('class');
  console.log(classes);
  document.querySelector('#container').setAttribute('class', classes.replace(/hidden\s*/, ''));
}
