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
  console.log(arr);
  console.log(name);
  for(var i=0; i<arr.players.length; i++){
    console.log(arr.players[i]);
    if(arr.players[i].name === name){
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


      if(find_player(waiting_list,parse_data.name) == false){
        ws.name = parse_data.name;//store websocket username used
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
        case 'state_of_the_game':
          //exemple pour broadcast to all client
          // wss.clients.forEach(function each(client) {
          //   if (client.readyState === WebSocket.OPEN) { //rajouter client !== ws si on veut ignorer le client qui envoi le msg
          //     client.send(message);
          //   }else{
          //     console.log("message n'a pas atteint le client");
          //   }
          // });
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

