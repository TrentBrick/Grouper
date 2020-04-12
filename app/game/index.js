import KeyListener from "./helpers/keylistener.js";
import Socket from "./helpers/sockets.js";
import { Rocket } from "./models/rocket.js";
import { lerp } from "./helpers/math.js";
//import * as PIXI from 'pixi.js';
//import TextInput from "pixi-textinput-v5";
//import 'pixi-text-input' as TextInput
//import {TextInput} from 'pixi-text-input';
//const TextInput = require('pixi-text-input')
//import {TextInput} from './helpers/PIXITextInp.js';
const socket = new Socket();
const app = new PIXI.Application(800, 600, { backgroundColor: 0x1099bb });
const Listener = new KeyListener();
let packetsArray = [];

let rocketStats = null;
let obj_width, obj_height;
let collision_ids = []

function createPlayer(playerdata) {
  const res = new Rocket(playerdata);
  const rocket = res[0]
  const message = res[1]
  obj_height = res[2]
  obj_width = res[3]
  app.stage.addChild(rocket);
  app.stage.addChild(message);
  app.stage.addChild(rocket.user_name);
  app.stage.addChild(rocket.share_link);
}

//interpolates tehe movements of all the other players. 
function interPolate() {
  // why do we want if this is less than 5? 
  if (packetsArray.length < 5) return;
  const past = 140,
    now = Date.now(),
    renderTime = now - past;

  const t1 = packetsArray[1].timestamp,
    t2 = packetsArray[0].timestamp;

  if (renderTime <= t2 && renderTime >= t1) {
    // total time from t1 to t2
    const total = t2 - t1,
      // how far between t1 and t2 this entity is as of 'renderTime'
      portion = renderTime - t1,
      // fractional distance between t1 and t2
      ratio = portion / total;

    const t1Players = packetsArray[0].data,
      t2Players = packetsArray[1].data;
    t1Players.forEach(player => {
      const t2Player = t2Players.filter(item => player.id === item.id)[0];
      if (!t2Player) return;

      const interpX = lerp(t2Player.x, player.x, ratio);
      const interpY = lerp(t2Player.y, player.y, ratio);
      const cords = { x: interpX, y: interpY };
      if (rocketStats.id !== player.id) {
        editPlayerPosition(player, cords);
      }
    });
    // removing all of the older packages
    // else array will grow infinitely 
    //console.log('the packets array', packetsArray, packetsArray.length);
    packetsArray.splice(2); 
  }
}

function editPlayerPosition(player, cords) {
  const playerSprite = getCurrentPlayerSprite(player.id);
  if (!playerSprite) {
    // generates a new sprite at the position of each player at each time point. 
    // faster than having to send the image file? 
    // ultimately I will need to send the image file though. 
    createPlayer(player);
    const newPlayerSprite = getCurrentPlayerSprite(player.id);
    newPlayerSprite.x = cords.x;
    newPlayerSprite.y = cords.y;
  } else {
    playerSprite.x = cords.x;
    playerSprite.y = cords.y;
  }
}

function getCurrentPlayerSprite(id) {
  return app.stage.children.filter(children => children.id === id)[0];
}

function sendData() {
  const currentPlayerStats = getCurrentPlayerSprite(rocketStats.id);
  currentPlayerStats.x = rocketStats.x;
  currentPlayerStats.y = rocketStats.y;
  socket.send({
    type: "input",
    data: rocketStats
  });
}

function setPlayerName() {

  //loop through all players. 
  const all_players = packetsArray[0].data
  //console.log('all players', all_players)
  for (let i = 0; i < all_players.length; i++) {
    const player = all_players[i]

    //console.log('current player', player)

    if (player.id === rocketStats.id) {
      const full_player = getCurrentPlayerSprite(player.id);
      full_player.user_name.text = rocketStats.user_name;
      //console.log('full current player', player.x, player.y, full_player.user_name.text);
      full_player.user_name.position.set(player.x, player.y+30);

      // remove the share link if no collisions: 
      if (collision_ids.length == 0) {
        rocketStats.share_link = 'None'
      }

    }
    else {
      let full_player = getCurrentPlayerSprite(player.id);

      console.log('not current player', player.share_link, full_player)

      if (!full_player) { //need to create a new character locally!!
        //console.log('making a new player here!! Did not exist before. ')
        // generates a new sprite at the position of each player at each time point. 
        // faster than having to send the image file? 
        // ultimately I will need to send the image file though. 
        createPlayer(player);
        full_player = getCurrentPlayerSprite(player.id);
      }

      //updating the player user name and its location. 
      full_player.user_name.text = player.user_name;
      full_player.user_name.position.set(player.x, player.y+30);

      // setting the share link!!
      if (player.share_link != "None" && collision_ids.includes(player.id)) {
        //console.log('trying to set the share link!!', player.share_link, full_player)
        full_player.share_link.text = "Click to join! \n " + player.share_link;
        full_player.share_link.position.set(player.x, player.y+50);
        full_player.share_link.visible = true;
        }

      else {
          console.log('share link should be removed', player.share_link, full_player.share_link.text , collision_ids)
          player.share_link = "None"
          full_player.share_link.text = "None";
          full_player.share_link.visible = false;
      }

    }
  }
}

function proximityCollision() {
  // need to handle 2 way and multiway interactions differently. 
  // all get the link but then needs to disappear for everyone else. 

  //Define the variables we'll need to calculate
  let hit, combinedHalfWidths, combinedHalfHeights, vx, vy;
  //hit will determine whether there's a collision
  hit = false;
  const aura=15;

  // get current player. 
  const r1 = getCurrentPlayerSprite(rocketStats.id);

  // getting the position of the current player. 
  r1.centerX = r1.x + r1.width / 2;
  r1.centerY = r1.y + r1.height / 2;
  r1.halfWidth = (r1.width / 2) +aura;
  r1.halfHeight = (r1.height / 2)+aura;

  //console.log(r1);

  //loop through all other players. 
  const all_players = packetsArray[0].data
  

  for (let i = 0; i < all_players.length; i++) {
    const r2 = all_players[i]
    if (r2.id === rocketStats.id) 
      continue;

    //Find the center points of each sprite
    r2.centerX = r2.x + obj_width / 2;
    r2.centerY = r2.y + obj_height / 2;

    //Find the half-widths and half-heights of each sprite
    r2.halfWidth = (obj_width / 2)+aura;
    r2.halfHeight = (obj_height / 2)+aura;

    //Calculate the distance vector between the sprites
    vx = r1.centerX - r2.centerX;
    vy = r1.centerY - r2.centerY;

    //Figure out the combined half-widths and half-heights
    combinedHalfWidths = r1.halfWidth + r2.halfWidth;
    combinedHalfHeights = r1.halfHeight + r2.halfHeight;

    //Check for a collision on either axis
    if ((Math.abs(vx) < combinedHalfWidths) && (Math.abs(vy) < combinedHalfHeights)) {
      if (!collision_ids.includes(r2.id) ) {
      collision_ids.push(r2.id)
      }
    }
    else { //remove it
      if (collision_ids.includes(r2.id) ) {
        const ind = collision_ids.indexOf(r2.id);
        collision_ids.splice(ind)
      }

    }

  //console.log('collision idslist', collision_ids);

  if (collision_ids.length > 0) {
    // display message above the current rocket. 
    r1.message.position.set(r1.x-10, r1.y-20);
    r1.message.visible = true
  }
  else {
    r1.message.visible = false
  }

  }
  // need to display hit here. all the other ones can run locally too.
  // generates link
  // needs to keep this open until user sends it OR they move away. 

  //return collision_ids
}

/*function removeShareLinks() {
  // every 10 seconds drop all currently shared links. 
  let t1 = packetsArray[0].timestamp;
  //convert to seconds
  t1 = Math.round(t1/1000)
  console.log('times are: ', t1, last_share_time)
  console.log('collision ids', collision_ids)
  if (last_share_time+share_interval < t1 ){

    const all_players = packetsArray[0].data
    //console.log('all players', all_players)
  for (let i = 0; i < all_players.length; i++) {
    const full_player = getCurrentPlayerSprite(all_players[i].id);
    full_player.share_link.text = ""
    full_player.share_link.visible = false;

    //drop the links. 
    last_share_time = t1
  }
}
}*/



document.getElementById("input_link_button").addEventListener("click", function(){
  
  var text_link_input = document.getElementById("share_link_input").value;
  console.log('got the text input!!', text_link_input)
  var popup = document.getElementById("input_link");
  //console.log('got the document!!!', popup)
  popup.style.zIndex = -1;
  rocketStats.share_link = text_link_input;

  //reset the share link text

  sendData();
});

document.getElementById("input_name_button").addEventListener("click", function(){
  
  var text_user_input = document.getElementById("input_name_box").value;
  console.log('got the text input!!', text_user_input)
  var popup = document.getElementById("input_name");
  //console.log('got the document!!!', popup)
  popup.style.zIndex = -1;
  rocketStats.user_name = text_user_input;
  sendData();
});

// This is what is run upon recieving a message. 
socket.connection.onmessage = signal => {
  const payload = JSON.parse(signal.data);
  switch (payload.type) {
    case "init":
      rocketStats = payload.data;
      createPlayer(payload.data);
      break;
    case "update":
      packetsArray.unshift(payload);
      break;
  }
};

app.ticker.add(delta => {
  
  if (rocketStats) {
    interPolate();
    setPlayerName();
    //removeShareLinks();
    proximityCollision();
    
  }

  /*if (proximityCollision()) {

    //if there's a collision, change the message text
    //and tint the box red
    message.text = "hit!";
    box.tint = 0xff3300;
  } 
  else {

    //if there's no collision, reset the message
    //text and the box's color
    message.text = "No collision...";
    box.tint = 0xccff99;
  }
*/
  Listener.on("W", () => {
    rocketStats.y -= 4;
    sendData();
  });

  Listener.on("S", () => {
    rocketStats.y += 4;
    sendData();
  });

  Listener.on("A", () => {
    rocketStats.x -= 4;
    sendData();
  });

  Listener.on("D", () => {
    rocketStats.x += 4;
    sendData();
  });

});

document.getElementById("game").appendChild(app.view);