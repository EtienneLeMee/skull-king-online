import { WebSocketServer } from "ws";
import { createServer } from 'http';
import { v4 as uuidv4 } from "uuid";
import { randomUUID } from "crypto";

const port = 8080
const server = createServer();
const wss = new WebSocketServer({ port: port });

const rooms = [];
const players = [];

wss.on("connection", function connection(ws) {
    let client = randomUUID();
    console.log(`[SERVER] Connection - Client has connected with the id : ${client} !`);

    ws.on("error", console.error);

    ws.on("close", () => {
        console.log("[SERVER] Close - Client has disconnected!");
        let player = players.find(p => p.ws === ws);
        leaveRoom(player)
    });

    ws.on("message", (messageData) => {

        var sendData = null;
        const parsedData = JSON.parse(messageData);
        const {event, data} = parsedData;
        console.log("[SERVER] Message - Data received : %s %s", event, data);

        //Create Room App
        if (event === "createRoom") {
            let player = data.player;
            player.socketId = client;
            player.ws = ws;

            let room = createRoom(player);
            console.log(`[SERVER] Event - createRoom - ${room.id} - ${player.username}`)
            sendData = JSON.stringify({event: event, data: {player: player, room: room}})
            ws.send(sendData);  
        } else if (event === "joinRoom") {
            let player = data.player;
            player.socketId = client;
            player.ws = ws;

            let room = rooms.find(r => r.id === player.roomId);
            room = joinRoom(player, room);
            console.log(`[SERVER] Event - joinRoom - ${room.id} - ${player.username}`);
            //sendData = JSON.stringify({event: event, data: {player: player}});
            //ws.send(sendData);

            room.players.forEach(p => {
                sendData = JSON.stringify({event: event, data: {player: p, room: room}});
                p.ws.send(sendData);
            });

        //Leave Room App
        } else if (event === "leaveRoom") {
            let senderPlayer = data.senderPlayer;
            let room = rooms.find(r => r.id === senderPlayer.roomId);
            room = leaveRoom(senderPlayer);
            room.players.forEach(p => {
                sendData = JSON.stringify({event: event, data: {player: p, senderPlayer: senderPlayer, room: room}});
                p.ws.send(sendData);
            });

        } else if (event === "sendChat"){
            let senderPlayer = data.senderPlayer
            let room = rooms.find(r => r.id === senderPlayer.roomId);
            room.players.forEach(p => {
                sendData = JSON.stringify({event: event, data: {player: p, senderPlayer: senderPlayer, sendChat: data.sendChat}});
                p.ws.send(sendData);
            });
            console.log(`[SERVER] Event - sendChat - ${room.id} - ${data.sendChat}`);

        }
        outputRooms();
    });

});

function createRoom(player) {
    const room = { id: roomId(), players: []};

    player.roomId = room.id;
    room.players.push(player);
    rooms.push(room);
    players.push(player);

    return room;
}

function joinRoom(player, room) {
    //TODO vérifier si la room n'est pas complète (8 joueurs)

    room.players.push(player)
    player.roomId = room.id;
    players.push(player);

    return room;
}

function leaveRoom(player) {
    let room = null;
    let playerToDeleteIndex = null;
    if(player){
        console.log(`player: ${player.username} - ${player.socketId}`)
        room = rooms.find(r => r.id === player.roomId);
        playerToDeleteIndex = room.players.findIndex(p => p.socketId == player.socketId);
        console.log(`playerToDelete: ${room.players[playerToDeleteIndex].username} - ${player.socketId}`)
        room.players.splice(playerToDeleteIndex, 1);
        playerToDeleteIndex = players.findIndex(p => p.socketId == player.socketId);
        players.splice(playerToDeleteIndex, 1); 

        //Si la room est vide
        if(room.players.length==0){
            deleteRoom(room)
        } else {
            if(player.host){
                room.players[0].host = true;
            }
        }
    }

    return room;
}

function deleteRoom(room){
    console.log(`[SERVER] Event - deleteRoom - ${room.id}`)
    rooms.pop(room);
}

function roomId() {
    return Math.random().toString(36).substring(2,9);
}

function outputRooms() {
    console.log("Rooms");
    rooms.forEach(r => console.log(r))
}