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
const ws = new WebSocket.Server({ port: 9898 });

const sqlite3 = require('sqlite3').verbose();

var db = new sqlite3.Database('./db/data.db');
db.serialize(function() {  //Puts the execution mode into serialized. This means that at most one statement object can execute a query at a time. Other statements wait in a queue until the previous statements are executed.
  db.run('CREATE TABLE players(id INTEGER PRIMARY KEY, nickname text NOT NULL);',function(err){
    if(err){
      return console.log(err.message)
    }
    console.log('Table created')
    })
 
    db.close()

});

ws.on('connection', function connection(wsConnection) {
  wsConnection.on('message', function incoming(message) {
    console.log(`server received: ${message}`);
    wsConnection.send('Hi this is WebSocket server!');
  });
  wsConnection.on('data', function incoming(data) {
    console.log(`JVEUX METTRE CA DANS LA BDD: ${data}`);
  });
  wsConnection.on('close', function(event) {
    console.log('Client has disconnected.');
  });
  //wsConnection.send('got your message!');
  console.log("Nombre de client(s) connecté(s) : " + ws.clients.size);
});

