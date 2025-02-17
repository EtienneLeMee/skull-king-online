import { WebSocketServer } from "ws";
import { createServer } from 'http';
import { v4 as uuidv4 } from "uuid";
import { randomUUID } from "crypto";

const port = 8080
const server = createServer();
const wss = new WebSocketServer({ port: port });

const rooms = [];

wss.on("connection", function connection(ws) {
    let client = randomUUID();
    console.log(`[SERVER] Connection - Client has connected with the id : ${client} !`);

    ws.on("error", console.error);

    ws.on("close", () => {
        console.log("[SERVER] Close - Client has disconnected!");
        leaveRoom()
    });

    ws.on("message", (messageData) => {
        var sendData = null;
        const parsedData = JSON.parse(messageData);
        const {event, data} = parsedData;
        console.log("[SERVER] Message - Data received : %s %s", event, data);

        //Create Room App
        if (event === "createRoom") {
            let player = data.player;
            player.ws = ws;

            let room = createRoom(player);
            console.log(`[SERVER] Event - createRoom - ${room.id} - ${player.username}`)
            sendData = JSON.stringify({event: event, data: {player: player}})
            ws.send(sendData);  
        } else if (event === "joinRoom") {
            let player = data.player;
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

        } else if (event === "leaveRoom") {
            let player = data.player;
            let room = rooms.find(r => r.id === player.roomId);


        } else if (event === "sendChat"){
            let senderPlayer = data.senderPlayer
            let room = rooms.find(r => r.id === senderPlayer.roomId);
            console.log(senderPlayer)
            room.players.forEach(p => {
                sendData = JSON.stringify({event: event, data: {player: p, senderPlayer: senderPlayer, sendChat: data.sendChat}});
                p.ws.send(sendData);
            });
            console.log(`[SERVER] Event - sendChat - ${room.id} - ${data.sendChat}`);

        }
    });

});

function createRoom(player) {
    const room = { id: roomId(), players: []};

    player.roomId = room.id;
    room.players.push(player);
    rooms.push(room);

    return room;
}

function joinRoom(player, room) {
    //TODO vérifier si la room n'est pas complète (8 joueurs)

    room.players.push(player)
    player.roomId = room.id;

    return room;
}

function leaveRoom(player, room) {
    //TODO vérifier si la room n'est pas vide

    room.players.pop(player)

    return room;
}

function roomId() {
    return Math.random().toString(36).substring(2,9);
}