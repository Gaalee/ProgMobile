// Node.js WebSocket server script
// const http = require('http');
// const WebSocketServer = require('websocket').server;
// const server = http.createServer();
// server.listen(9898);
// const wsServer = new WebSocketServer({
//     httpServer: server
// });
// wsServer.on('request', function(request) {
//     const connection = request.accept(null, request.origin);
//     connection.on('message', function(message) {
//       console.log('Received Message:', message.utf8Data);
//       connection.sendUTF('Hi this is WebSocket server!');
//     });
//     connection.on('close', function(reasonCode, description) {
//         console.log('Client has disconnected.');
//     });
// });

// commented le temps de test le module ws un peu


const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 9898 });

var Database = require('better-sqlite3');
var db = new Database('./database/data.db');
const createTable = 'CREATE TABLE IF NOT EXISTS players(id INTEGER PRIMARY KEY, nickname text NOT NULL, highest_score int NULL);';
var waiting_list = {event: "waiting_list", players : []};

try {
  db.exec(createTable);
  console.log('La base de donnée est prête.')
} catch (err) {
  console.error(err)
}

function find_player(arr, name){
  for(var i=0; i<arr.length; i++){
    if(arr[i].name === name){
      return true;
    }
  }
  return false;
}

wss.getUniqueID = function () {
  function s4() {
      return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  }
  return s4() + s4() + '-' + s4();
};

wss.on('connection', function connection(ws) {
  ws.send(JSON.stringify(waiting_list));//update client from the waiting list on connexion

  ws.on('message', function incoming(data) {
    console.log(`server received: ${data}`);
    var parse_data = JSON.parse(data);

    switch (parse_data.event) {
      case 'user_connected':
        console.log('user is connected');
        break;
      case 'bdd_check_player': //il faudrait verifier la validiter du json pour voir si l'utilisateur a bien envoyer un string
      var prep = db.prepare('SELECT * FROM players WHERE nickname=?'); //ckeck if player exist
      var player = prep.get(parse_data.name);
      if(player === undefined){
        console.log("le pseudo utilisé n'a pas été trouvé donc il va être ajouté à la base de donnée.")
        var prep = db.prepare("INSERT INTO players (nickname, highest_score) VALUES(?, ?)");
        try {
          prep.run(parse_data.name, 0)
          console.log("l'utilisateur à été enregistré.")
          parse_data.highest_score = 0;
        } catch (err) {
          console.error(err)
        }
      }else{
        console.log(player.nickname + " a un score max de :" + player.highest_score)
        parse_data.highest_score = player.highest_score;
      }


      if(find_player(waiting_list.players,parse_data.name) == false){
        ws.name = parse_data.name;//store websocket username used
        ws.send(JSON.stringify({event: "user_is_identified", name : ws.name}));//send back client name and store it
        ws.send(JSON.stringify(parse_data));//send back player to client

        waiting_list.players.push({name: parse_data.name, highest_score: parse_data.highest_score})
        wss.clients.forEach(function each(client) {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(waiting_list));
          }
        });
      }else{
        ws.send(JSON.stringify({event: "error", message : "Un joueur en attente a déjà choisi ce pseudo."}));
      }

        break;
        case 'ask_start_game':
          var starting_player = [];
          waiting_list.players = waiting_list.players.filter(player => {
            if(player.name !== parse_data.name) return player;
            starting_player.push(player);
          });
          for(var i=1; i<parse_data.nbplayer; i++){
            starting_player.push(waiting_list.players.shift());
          }
          console.log(starting_player)
          //parse_data.name;
          //parse_data.nbplayer;
          console.log(waiting_list);
          wss.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify(waiting_list));
            }
          });
          wss.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN && find_player(starting_player,client.name) == true) {
              client.send(JSON.stringify({event: "start_game", players: starting_player}));
            }
          });
        break;
        case 'player_turn':
          console.log(parse_data.player);
          console.log(parse_data.players);
          //parse_data.players.map(obj => parse_data.player.find(o => o.name === obj.name) || obj);
          //console.log(parse_data.players);
          wss.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN && find_player(parse_data.players,client.name) == true) {
              client.send(JSON.stringify({event: "update_player", player: parse_data.player, players: parse_data.players}));
            }
          });
        break;
        case 'check_dead':
          console.log(parse_data.player_alive);
          console.log(parse_data.players);
          //if tout est bon alors on renvoi la fin de game au client
          wss.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN && find_player(parse_data.players,client.name) == true) {
              client.send(JSON.stringify({event: "end_game", status: 1, player_alive: parse_data.player_alive, players: parse_data.players}));
            }
          });
          break;
    }
  });

  ws.on('close', function(event) {
    console.log(ws.name + ' has disconnected.');
    if(ws.name != undefined){
      waiting_list.players = waiting_list.players.filter(player => player.name !== ws.name);
    }
    wss.clients.forEach(function each(client) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(waiting_list));
      }
    });
  });

  console.log("Nombre de client(s) connecté(s) : " + wss.clients.size);
});

