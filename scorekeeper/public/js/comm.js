document.querySelector('#login_button').addEventListener('click', login);
document.querySelector('#pwn').addEventListener('click', submitFlag);

var hints = {};
var socket = io.connect('127.0.0.1:8080');

socket.on('ready', displayLogin);
socket.on('logged_in', completeLogin);
socket.on('scoreboard', drawScoreboard);
socket.on('challenges', populateChallenges);
socket.on('score', setScore);
socket.on('flag_accepted', flagAccepted);
socket.on('update_score', updateScore);
socket.on('msg', displayMsg);
socket.on('error', displayError);
socket.on('play_sound', playSound);
socket.on('add_user', addUser);
socket.on('remove_user', removeUser);

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

  teamObj.textContent = 'Team: '+data.username;
  scoreObj.textContent = 'Score: '+data.score;
  scoreObj.setAttribute('data-user-id', data.userId);

  var classes = loginObj.getAttribute('class');
  loginObj.setAttribute('class', classes+' hidden');

  var classes = containerObj.getAttribute('class');
  containerObj.setAttribute('class', classes.replace(/hidden\s*/, ''));

  playSound({'name': 'prepare'});
}

function drawScoreboard(data) {
  var scoreboard = document.querySelector('#scoreboard');

  for (var i = 0; i < data.length; i++) {
    var li = document.createElement('li');
    li.textContent = data[i].username+': '+data[i].score;
    li.setAttribute('data-user-id', data[i].id);
    li.setAttribute('data-score', data[i].score);
    scoreboard.appendChild(li);
  }
}

function swapChallenge(id) {
  var hintObj = document.querySelector('#hint');
  var flagObj = document.querySelector('#flag');

  hintObj.innerHTML = hints[id];
  flagObj.setAttribute('data-challenge-id', 15 - id);
}

function populateChallenges(data) {
  var challenges = document.querySelectorAll('.building_block');
  var pyramid = document.querySelector('#pyramid');

  for (var i = 0; i < challenges.length; i++)
    pyramid.removeChild(challenges[i]);

  var rows = data.length;

  var k = 0;
  for (var i = 0; i < 5; i++) {
    for (var j = 0; j < (i + 1); j++, k++) {
      var classes = 'building_block';
      var div = document.createElement('div');

      if (k + rows >= 15) {
        var challenge = data[k-(15-rows)];
        hints[k] = challenge.description;
        if (challenge.solved === true)
          classes += ' solved';

        div.addEventListener('click', function(evt) {
          swapChallenge(evt.target.getAttribute('data-challenge-id'));
        });
      } else {
        classes += ' unopened';
      }

      div.setAttribute('data-challenge-id', k);
      div.setAttribute('class', classes);
      div.textContent = (5 - i) * 100;
      pyramid.appendChild(div);
    }

    var spacer = document.createElement('div');
    pyramid.appendChild(spacer);
  }
}

function submitFlag() {
  var flagObj = document.querySelector('#flag');

  socket.emit('submit_flag', {'challengeId': flagObj.getAttribute('data-challenge-id'), 'flag': flagObj.value});
  flagObj.value = '';
}

function flagAccepted(data) {
  var challengeObj = document.querySelector('.building_block[data-challenge-id="'+(15-parseInt(data.challengeId))+'"]');
  var classes = challengeObj.getAttribute('class');
  challengeObj.setAttribute('class', classes+' solved');
}

function displayMsg(data) {
  var msgboxObj = document.querySelector('#msgbox');

  var msgObj = document.createElement('p');
  msgObj.textContent = data.msg;
  msgboxObj.appendChild(msgObj);

  msgboxObj.removeAttrbute('class');
  setTimeout(function() {
    msgboxObj.setAttribute('class', 'hidden');
    msgboxObj.removeChild(msgObj);
  }, 1200);
}

function displayError(data) {
  var msgboxObj = document.querySelector('#msgbox');

  var msgObj = document.createElement('p');
  msgObj.textContent = data.msg;
  msgboxObj.appendChild(msgObj);

  msgboxObj.setAttribute('class', 'error');
  setTimeout(function() {
    msgboxObj.setAttribute('class', 'hidden');
    msgboxObj.removeChild(msgObj);
  }, 1200);
}

function setScore(data) {
  if ((data.score === undefined) || (data.score === null))
    return;

  var scoreObj = document.querySelector('#score');
  scoreObj.textContent = 'Score: '+data.score;
}

function updateScore(data) {
  var scoreboardObj = document.querySelector('ol#scoreboard');
  var userObj = document.querySelector('li[data-user-id="'+data.userId+'"]');
  var users = document.querySelectorAll('#scoreboard *');

  userObj.textContent = data.username+': '+data.score;
  userObj.setAttribute('data-score', data.score);

  var position = 1;
  for (var i = 0; i < users.length; i++, position++) {
    var score = parseInt(users[i].getAttribute('data-score'));
    if (data.score > score)
      break;
  }

  if (users[position] == userObj)
    return;

  var below = document.querySelectorAll('#scoreboard :nth-child('+position+'), #scoreboard :nth-child('+position+')~li');
  var old = document.querySelector('#scoreboard :nth-child('+position+')');
  var y = userObj.offsetTop - old.offsetTop;
  var style = '-webkit-transition: All 1.5s ease-in-out; -moz-transition: All 1.5s ease-in-out; -webkit-transform: translate(0, '+y * -1+'px); -moz-transform: translate(0, '+y * -1+'px)';
  var restStyle = '-webkit-transition: All 1.2s ease-in-out; -moz-transition: All 1.2s ease-in-out; -webkit-transform: translate(0, 20px); -moz-transform: translate(0, 20px);';

  userObj.setAttribute('style', style);

  setTimeout(function() {
    if (position === users.length)
      scoreboardObj.appendChild(old);
    else
      scoreboardObj.insertBefore(userObj, old);

    userObj.setAttribute('style', '');
    for (var i = 0; i < below.length; i++) {
      below[i].setAttribute('style', '');
    }
  }, 1500);

  setTimeout(function() {
    for (var i = 0; i < below.length; i++) {
      if (below[i] === userObj)
        continue;

      below[i].setAttribute('style', restStyle);
    }
  }, 300);
}

function playSound(data) {
  if ((data.name === undefined) || (data.name === ''))
    return;

  var audio = document.querySelector('#sound_'+data.name);

  if (audio === null)
    return;

  audio.play();
}

function addUser(data) {
  var users = document.querySelectorAll('#scoreboard *');

  var position = 1;
  for (var i = 0; i < users.length; i++, position++) {
    var score = parseInt(users[i].getAttribute('data-score'));
    if (score > data.score)
      break;
  }

  var adjacentUser = document.querySelector('ol#scoreboard :nth-child('+position+')');
  var newUser = document.createElement('li');
  newUser.textContent = data.username;
  newUser.setAttribute('data-score', data[position].score);
  newUser.setAttribute('data-user-id', data[position].userId);

    if (position === users.length)
      scoreboardObj.appendChild(newUser);
    else
      scoreboardObj.insertBefore(newUser, adjacentUser);
}

function removeUser(data) {
  var scoreboardObj = document.querySelector('ol#scoreboard');
  var userObj = document.querySelector('li[data-user-id="'+data.userId+'"]');

  scoreboard.removeChild(userObj);
}
