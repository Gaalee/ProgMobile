const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 9898 });

var Database = require('better-sqlite3'); //sqlite bdd
var db = new Database('./database/data.db'); //path to bdd
const createTable = 'CREATE TABLE IF NOT EXISTS players(id INTEGER PRIMARY KEY, nickname text NOT NULL, highest_score int NULL);';//bdd creation
var waiting_list = {event: "waiting_list", players : []}; //waiting list array

try {//exec table creation
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

wss.on('connection', function connection(ws) { //on client connexion
  ws.send(JSON.stringify(waiting_list));//update client from the waiting list on connexion

  ws.on('message', function incoming(data) {//on client received msg
    console.log(`server received: ${data}`);//debugg console.log
    var parse_data = JSON.parse(data);//parse data to check event and data

    switch (parse_data.event) {
      case 'user_connected':
        console.log('user is connected');
        break;
      case 'bdd_check_player': //check if player exist, if not create it
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

        waiting_list.players.push({name: parse_data.name, highest_score: parse_data.highest_score})//update wating_list
        wss.clients.forEach(function each(client) {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(waiting_list)); //send back waiting_list
          }
        });
      }else{
        ws.send(JSON.stringify({event: "error", message : "Un joueur en attente a déjà choisi ce pseudo."}));//check if name is available
      }
        break;
        case 'ask_start_game'://if a client try to start a game then
          var starting_player = [];
          waiting_list.players = waiting_list.players.filter(player => {//take in waiting list player to sart the game
            if(player.name !== parse_data.name) return player;
            starting_player.push(player);
          });
          for(var i=1; i<parse_data.nbplayer; i++){
            starting_player.push(waiting_list.players.shift());
          }
  
          wss.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify(waiting_list));//update waiting list
            }
          });
          wss.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN && find_player(starting_player,client.name) == true) {
              client.send(JSON.stringify({event: "start_game", players: starting_player})); //send to clients selected to start the game an event "start_game"
            }
          });
        break;
        case 'player_turn': //check if a player want to turn
          wss.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN && find_player(parse_data.players,client.name) == true) {
              client.send(JSON.stringify({event: "update_player", player: parse_data.player, players: parse_data.players})); //send back to client in this game that the player x is turning
            }
          });
        break;
        case 'check_dead': //check if client send dead event
            if (find_player(parse_data.players,ws.name) == true) {
              ws.send(JSON.stringify({event: "end_game", status: parse_data.status, player_alive: parse_data.player_alive, players: parse_data.players}));//if player is in game return dead (CAN ADD A LOT MORE SECURITY HERE)
            }
          break;
        case 'game_result'://add score to bdd (score = nbwin)
          if(parse_data.status == 1){
            var prep = db.prepare('UPDATE players SET highest_score= highest_score + 1 WHERE nickname = ?');
            try {
              prep.run(parse_data.name)
              console.log("le nouveau score de " + parse_data.name + " à bien été enregistré.");
            } catch (err) {
              console.error(err)
            }     
          }else if(parse_data.status == 0){
            console.log("La partie est un draw");
          }else{
            //problem in game
          }
     
          break;
    }
  });

  ws.on('close', function(event) {//if client connexion close 
    console.log(ws.name + ' has disconnected.');
    if(ws.name != undefined){
      waiting_list.players = waiting_list.players.filter(player => player.name !== ws.name);//if client was in waiting list remove him
    }
    wss.clients.forEach(function each(client) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(waiting_list)); //update waiting list
      }
    });
  });

  console.log("Nombre de client(s) connecté(s) : " + wss.clients.size); //count clients connected to server
});

