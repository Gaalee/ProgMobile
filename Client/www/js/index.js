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

function onDeviceReady() {
    // Cordova is now initialized. Have fun!

    document.getElementById('deviceready').classList.add('ready');

    // Say now we will try to connect using WebSocket
    //document.getElementById('WebSocketStatus').innerText = "Try to connect using WebSocket";

    // Create the Web socket !
//    const ws = new WebSocket('ws://localhost:9898/');
//    ws.onopen = function() {
//        console.log('WebSocket Client Connected');
//        ws.send('Hi this is web client.');
//    };
//    ws.onmessage = function(e) {
//        console.log("Received: '" + e.data + "'");
//        document.getElementById('WebSocketStatus').innerText = "Received from server :" + e.data;
//    };

    const socket = new WebSocket('ws://localhost:9898');

    socket.addEventListener('open', function (event) {
      console.log('Client Linked');
    });

    socket.addEventListener('close', function (event) {
      console.log('The connection has been closed');
    });

    $('#register_player').submit(function(){
        var obj = {
            event: "bdd_add",
            name: $("#pseudo").val()
        }
        socket.send(JSON.stringify(obj));
        //socket.emit('message', "Input");
        //$('#Input').val('');
        return false;
      });

    socket.addEventListener('message', function (event) {
    var json = JSON.parse(event.data);
    switch (json.event) {
      case 'user_connected':
        console.log(json.name + ' is connected');
        break;
      case 'bdd_add':
        console.log(json.name);
        $( "#alert" ).remove();
        $('body').append('<div id="alert">' + json.name + ' was saved</div>');
        $('#alert').fadeOut(5000);
        //afficher la liste d'attente
        $('#player_waiting').append('<li>' + json.name + ' (highest score : ' + json.highest_score +') is waiting ...</div>');
        break;
    }
    });

}
