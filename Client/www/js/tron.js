const canvas = document.getElementById('tron');
const context = canvas.getContext('2d');
const unit = 10;

class Player {
  constructor(x, y, color) {
    this.color = color || '#fff';
    this.dead = false;
    this.direction = '';
    this.key = '';
    this.x = x;
    this.y = y;
    this.startX = x;
    this.startY = y;
    this.constructor.counter = (this.constructor.counter || 0) + 1;
    this._id = this.constructor.counter;

    Player.allInstances.push(this); //array containing players
  };
};

function setKey(key, player, up, right, down, left) {
  switch (key) {
    case up:
      if (player.direction !== 'DOWN') {
        player.key = 'UP';
      }
      break;
    case right:
      if (player.direction !== 'LEFT') {
        player.key = 'RIGHT';
      }
      break;
    case down:
      if (player.direction !== 'UP') {
        player.key = 'DOWN';
      }
      break;
    case left:
      if (player.direction !== 'RIGHT') {
        player.key = 'LEFT';
      }
      break;
    default:
      break;
  };
};

// assign player keys
function handleKeyPress(event) {
  let key = event.keyCode;
  if (key === 37 || key === 38 || key === 39 || key === 40) {
    event.preventDefault();//stop from scrolling with arrow keys
  };
  setKey(key, p1, 38, 39, 40, 37); // arrow keys
  //setKey(key, p2, 87, 68, 83, 65); // WASD
};

//find playable cells
function getPlayableCells(canvas, unit) {
  let playableCells = new Set();
  for (let i = 0; i < canvas.width / unit; i++) {
    for (let j = 0; j < canvas.height / unit; j++) {
      playableCells.add(`${i * unit}x${j * unit}y`);
    };
  };
  return playableCells;
};

//draw les lignes chelou pas ouf a enlever ou changer
function drawBackground() {

/*  for (let i = 0; i <= canvas.width / unit + 2; i += 2) {
    for (let j = 0; j <= canvas.height / unit + 2; j += 2) {
      context.strokeRect(0, 0, unit * i, unit * j);
    };
  };*/

//  context.lineWidth = 2;
//  for (let i = 1; i <= canvas.width / unit; i += 2) {
//    for (let j = 1; j <= canvas.height / unit; j += 2) {
//      context.strokeRect(0, 0, unit * i, unit * j);
//    };
//  };
//  context.lineWidth = 1;
    for (var x = 0.5; x < canvas.width; x += unit) {
      context.moveTo(x, 0);
      context.lineTo(x, canvas.height);
    }

    for (var y = 0.5; y < canvas.height; y += unit) {
      context.moveTo(0, y);
      context.lineTo(canvas.width, y);
    }
    context.strokeStyle = 'rgba(128,128,128,0.4)';
    context.stroke();
};

//place les joueurs sur la grille
function drawStartingPositions(players) {
  players.forEach(p => {
    context.fillStyle = p.color;
    context.fillRect(p.x, p.y, unit, unit);
    context.strokeStyle = 'black';
    context.strokeRect(p.x, p.y, unit, unit);
  });
};

//array containing players
Player.allInstances = [];

//create player
let p1 = new Player(unit * 6, unit * 6, '#75A4FF');
//let p2 = new Player(unit * 18, unit * 18, '#FF5050');

//add event listener to any key down
document.addEventListener('keydown', handleKeyPress);

let playableCells = getPlayableCells(canvas, unit);

drawBackground();

drawStartingPositions(Player.allInstances);




//game logic
let outcome, winnerColor, playerCount = Player.allInstances.length;
function draw() {
  if (Player.allInstances.filter(p => !p.key).length === 0) { //condition pour commencer le jeu
  // in-game logic...

    if (playerCount === 0) {
      const alivePlayers = Player.allInstances.filter(p => p.dead === false);
      outcome = `Player ${alivePlayers[0]._id} wins!`;
    } else if (playerCount === 0) {
      outcome = 'Draw!';
    }
    if (outcome) {
      console.log(outcome);
      clearInterval(game); //kill the loop
    }

    Player.allInstances.forEach(p => {//pour chaque joueur A CHANGER
      if (p.key) {
        p.direction = p.key;
        context.fillStyle = p.color;
        context.fillRect(p.x, p.y, unit, unit);
        context.strokeStyle = 'black';
        context.strokeRect(p.x, p.y, unit, unit);
        if (!playableCells.has(`${p.x}x${p.y}y`) && p.dead === false) {
          p.dead = true;
          p.direction = '';
          playerCount -= 1;
        }
        playableCells.delete(`${p.x}x${p.y}y`);
        if (!p.dead) {
          if (p.direction == "LEFT") p.x -= unit;
          if (p.direction == "UP") p.y -= unit;
          if (p.direction == "RIGHT") p.x += unit;
          if (p.direction == "DOWN") p.y += unit;
        };
      };
    });



  };
};
const game = setInterval(draw, 100);

