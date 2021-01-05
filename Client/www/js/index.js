/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

// Wait for the deviceready event before using any of Cordova's device APIs.
// See https://cordova.apache.org/docs/en/latest/cordova/events/events.html#deviceready
document.addEventListener('deviceready', onDeviceReady, false);
const socket = new WebSocket('ws://localhost:9898');
function onDeviceReady() {
    document.getElementById('deviceready').classList.add('ready');


    var client_name = "";
    var waiting_list = [];

    $("#start_at_2").click(function(){
        socket.send(JSON.stringify({event: "ask_start_game", name : client_name, nbplayer: 2}));
    });
    $("#start_at_4").click(function(){
        socket.send(JSON.stringify({event: "ask_start_game", name : client_name, nbplayer: 4}));
    });

    $("#left").click(function(){
        let p = Player.allInstances.filter(player => {
        return player.name === client_name
        });
      if (p[0].direction !== 'RIGHT') {
        console.log(p[0].name + " veut aller a gauche")
        p[0].key = 'LEFT';
        socket.send(JSON.stringify({event: "player_turn", player: p, players: Player.allInstances}))
      }
    });
    $("#right").click(function(){
        let p = Player.allInstances.filter(player => {
        return player.name === client_name
        });
      if (p[0].direction !== 'LEFT') {
        console.log(p[0].name + " veut aller a droite")
        p[0].key = 'RIGHT';
        socket.send(JSON.stringify({event: "player_turn", player: p, players: Player.allInstances}))
      }
      console.log(p[0]);
    });
    $("#up").click(function(){
        let p = Player.allInstances.filter(player => {
        return player.name === client_name
        });
      if (p[0].direction !== 'DOWN') {
        console.log(p[0].name + " veut aller en bas")
        p[0].key = 'UP';
        socket.send(JSON.stringify({event: "player_turn", player: p, players: Player.allInstances}))
      }
      console.log(p[0]);
    });
    $("#down").click(function(){
        let p = Player.allInstances.filter(player => {
        return player.name === client_name
        });
      if (p[0].direction !== 'UP') {
        console.log(p[0].name + "  veut aller en haut")
        p[0].key = 'DOWN';
        socket.send(JSON.stringify({event: "player_turn", player: p, players: Player.allInstances}))
      }
      console.log(p[0]);
    });

    socket.addEventListener('open', function (event) {
      console.log('Client Linked');
      $( "#alert" ).remove();
              $('body').prepend('<div id="alert"> was saved</div>');
              $('#alert').fadeOut(5000);
    });

    socket.addEventListener('close', function (event) {
      console.log('The connection has been closed');
    });

    //On player input, check database to create or find the player
    $('#register_player').submit(function(){
        var obj = {
            event: "bdd_check_player",
            name: $("#pseudo").val()
        }
        socket.send(JSON.stringify(obj));
        return false;
      });

    socket.addEventListener('message', function (event) {
    var parse_data = JSON.parse(event.data);
    switch (parse_data.event) {
      case 'user_is_identified':
        client_name = parse_data.name;
        break;
      case 'bdd_check_player':
        console.log(parse_data);

        //alert box status
        $( "#alert" ).remove();
        $('body').prepend('<div id="alert">' + parse_data.name + ' was saved</div>');
        $('#alert').fadeOut(5000);
        $("#pseudo").value = '';
        $("#register_player").hide();
        break;
      case 'waiting_list':
      if(parse_data.players.length != 0){
        if(parse_data.players.length >= 2){
            $('#start_at_2').prop('disabled', false);
        }else{
            $('#start_at_2').prop('disabled', true);
        }
        if(parse_data.players.length >= 4){
            $('#start_at_4').prop('disabled', false);
        }else{
            $('#start_at_4').prop('disabled', true);
        }
        if(client_name != ""){
            $("#waiting_block").show();
        }
        //afficher la liste d'attente
        $("#player_waiting").empty()
        parse_data.players.forEach(player => {
        console.log(player)
        $('#player_waiting').append('<li>' + player.name + ' (highest score : ' + player.highest_score +') is waiting ...</div>');
        });
      }else{
        $('#start_at_2').prop('disabled', true);
        $('#start_at_4').prop('disabled', true);
        $("#waiting_block").hide();
      }
        break;
      case 'start_game':
        start_game(client_name,parse_data.players);
      break;
      case 'update_player':
        console.log(Player.allInstances);
        console.log(parse_data.players);
        Player.allInstances = parse_data.players;
      break;
      case 'end_game':
        if(parse_data.status == 1){
          console.log(parse_data.player_alive);
          console.log(parse_data.players);
          context.fillStyle = parse_data.player_alive[0].color;
          context.fillText(parse_data.player_alive[0].name + " won !" , 200, 200);
          clearInterval(game); //kill the loop
        }else{
            console.log("error")
        }
      case 'error':
         $( "#alert" ).remove();
         $('body').prepend('<div id="alert">' + parse_data.message + '</div>');
         $('#alert').fadeOut(5000);
        break;
    }
    });

}

const canvas = document.getElementById('tron');
const context = canvas.getContext('2d');
context.textAlign = 'center';
context.font = "30px Segoe UI";
const unit = 10;

class Player {
  constructor(x, y, color, name, score) {
    this.name = name
    this.score = score
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
  };
};

function updatePlayer(players){
    Player.allInstances = [];
    players.forEach(player => {
        let p = new Player(start_pos[i].x, start_pos[i].y, colour[i], player.name, player.highest_score);
        Player.allInstances.push(p);
        i++;
    });
}


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

 //draw grid
function drawBackground() {
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


function draw() {
  if (Player.allInstances.filter(p => !p.key).length === 0) { //condition pour commencer le jeu
  // in-game logic...

    console.log(playerCount);
    if (playerCount === 1) {
      const alivePlayers = Player.allInstances.filter(p => p.dead === false);
      //outcome = `${alivePlayers[0].name} wins!`;
      socket.send(JSON.stringify({event:"check_dead", player_alive: alivePlayers, players: Player.allInstances}));
    } else if (playerCount === 0) {
      outcome = 'Draw!';
      socket.send(JSON.stringify({event:"check_dead", player_alive: alivePlayers, players: Player.allInstances}));
    }

    Player.allInstances.forEach(p => {//pour chaque joueur A CHANGER
      if (p.key) {
        p.direction = p.key;
        context.fillStyle = p.color;
        context.fillRect(p.x, p.y, unit, unit);
        context.strokeStyle = 'black';
        context.strokeRect(p.x, p.y, unit, unit);
        if (!playableCells.has(`${p.x}x${p.y}y`) && p.dead === false) {
          //socket.send(JSON.stringify({event:"check_dead", player: p, playable:playableCells}));
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
    let outcome, playerCount,playableCells, game;
function start_game(client,players){
    var i = 0;
    var colour = ["#2378f7", "#bf2424", "#24bf62", "#d4d424"];
    var start_pos = [{x: 60, y: 60},{x: 340, y: 330}, {x: 60, y: 330},{x: 330, y: 60}]
    Player.allInstances = [];

    $("#game").show();

    players.forEach(player => {
        let p = new Player(start_pos[i].x, start_pos[i].y, colour[i], player.name, player.highest_score);
        if(player.name == client){
            $("#player_color").html("<font color='"+colour[i]+"'><b>" + client + "</b></font>");
        }
        Player.allInstances.push(p);
        i++;
    });
    playerCount = Player.allInstances.length;
    playableCells = getPlayableCells(canvas, unit);

    drawBackground();

    drawStartingPositions(Player.allInstances);


    //game logic

    game = setInterval(draw, 100);
}
