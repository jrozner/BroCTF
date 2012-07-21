document.querySelector('#login_button').addEventListener('click', login);
document.querySelector('#pwn').addEventListener('click', submitFlag);

var socket = io.connect('127.0.0.1:8080');

socket.on('ready', displayLogin);
socket.on('logged_in', completeLogin);
socket.on('scoreboard', drawScoreboard);
socket.on('challenges', populateChallenges);
socket.on('score', updateScore);
socket.on('flag_accepted', flagAccepted);
socket.on('invalid_flag', invalidFlag);
socket.on('update_scoreboard', updateScoreboard);
//socket.on('msg', displayMsg);
//socket.on('error', displayError);

function login() {
  var username = document.querySelector('#username').value;
  var password = document.querySelector('#password').value;

  socket.emit('login', {'username': username, 'password': password});
}

function displayLogin() {
  var loginObj = document.querySelector('#login');
  var classes = loginObj.getAttribute('class');
  loginObj.setAttribute('class', classes.replace(/hidden\s*/, ''));
}

function completeLogin(data) {
  socket.emit('send_scoreboard');
  socket.emit('send_challenges');

  var usernameObj = document.querySelector('#username');
  var usename = usernameObj.value;
  var passwordObj = document.querySelector('#password');
  var teamObj = document.querySelector('#team');
  var scoreObj = document.querySelector('#score');
  var loginObj = document.querySelector('#login');
  var containerObj = document.querySelector('#container');

  usernameObj.value = '';
  passwordObj.value = '';

  teamObj.innerText = 'Team: '+data.username;
  scoreObj.innerText = 'Score: '+data.score;
  scoreObj.setAttribute('data-user-id', data.userId);

  var classes = loginObj.getAttribute('class');
  loginObj.setAttribute('class', classes+' hidden');

  var classes = containerObj.getAttribute('class');
  containerObj.setAttribute('class', classes.replace(/hidden\s*/, ''));
}

function drawScoreboard(data) {
  var scoreboard = document.querySelector('#scoreboard');

  for (var i = 0; i < data.length; i++) {
    var li = document.createElement('li');
    li.innerText = data[i].username+': '+data[i].score;
    li.setAttribute('data-user-id', data[i].id);
    scoreboard.appendChild(li);
  }
}

function populateChallenges(data) {
  var pyramid = document.querySelector('#pyramid')
  for (var i = 0; i < 5; i++) {
    for (var j = 0; j < (i + 1); j++) {
      var div = document.createElement('div');
      div.setAttribute('id', i + j);
      div.setAttribute('class', 'building_block');
      div.innerText = ((rows - i) * 100);
      pyramid.appendChild(div);
    }

    var div = document.createElement('div');
    pyramid.appendChild(div);
  }
}

function submitFlag() {
  var flagObj = document.querySelector('#flag');

  socket.emit('submit_flag', {'challengeId': flagObj.getAttribute('data-challenge-id'), 'flag': flagObj.value});
  flagObj.value = '';
}

function flagAccepted() {
}

function invalidFlag() {
  alert('Invalid flag.');
}

function updateScore(data) {
  if ((data.score === undefined) || (data.score === null))
    return;

  var scoreObj = document.querySelector('#score');
  var uid = parseInt(scoreObj.getAttribute('data-user-id'));

  if (uid === data.userId)
    scoreObj.innerText = 'Score: '+data.score;
}

function updateScoreboard(data) {
}
