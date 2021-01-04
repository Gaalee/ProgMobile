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
    document.getElementById('deviceready').classList.add('ready');


    const socket = new WebSocket('ws://localhost:9898');

    socket.addEventListener('open', function (event) {
      console.log('Client Linked');
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
      case 'user_connected':
        console.log(parse_data.name + ' is connected');
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
        //afficher la liste d'attente
        $("#player_waiting").empty()
        parse_data.players.forEach(player => {
        console.log(player)
        $('#player_waiting').append('<li>' + player.name + ' (highest score : ' + player.highest_score +') is waiting ...</div>');
        });
        break;
      case 'error':
         $( "#alert" ).remove();
         $('body').prepend('<div id="alert">' + parse_data.message + '</div>');
         $('#alert').fadeOut(5000);
        break;
    }
    });

}
