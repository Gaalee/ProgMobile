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
    document.getElementById('WebSocketStatus').innerText = "Try to connect using WebSocket";

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
      console.log('WebSocket Client Connected');
      socket.send('Hi this is web client.');
    });

    socket.addEventListener('message', function (event) {
      //console.log('Message from server ', event.data);
      console.log("Received: '" + event.data + "'");
      document.getElementById('WebSocketStatus').innerText = "Received from server :" + event.data;
    });

    socket.addEventListener('close', function (event) {
      console.log('The connection has been closed');
    });

    $('#register_player').submit(function(){
        socket.send($('#pseudo').val());
        //socket.emit('message', "Input");
        //$('#Input').val('');
        return false;
      });
}
