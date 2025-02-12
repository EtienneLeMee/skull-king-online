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
        /*for (const room in rooms) {
            if (rooms[room][uuid]) {
                delete rooms[room][uuid]; // Supprime l'utilisateur de la room
                console.log(`Client ${uuid} removed from room ${room}`);

                // Supprime la room si elle devient vide
                if (Object.keys(rooms[room]).length === 0) {
                    delete rooms[room];
                    console.log(`Room ${room} deleted (empty)`);
                }
                break; // Sort de la boucle dès qu'on a trouvé la room de l'utilisateur
            }
        }*/
    });

    //ws.send("something first")

    ws.on("message", (messageData) => {
        var sendData = null;
        const parsedData = JSON.parse(messageData);
        const {event, data} = parsedData;
        console.log("[SERVER] Message - Data received : %s %s", event, data);

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


            if (!player.roomId){
                room = createRoom(player);
                console.log(`[SERVER] Event - createRoom - ${room.id} - ${player.username}`)
            }

        } else if (event === "sendChat"){
            let senderPlayer = data.senderPlayer
            let room = rooms.find(r => r.id === senderPlayer.roomId);
            console.log(senderPlayer)
            room.players.forEach(p => {
                sendData = JSON.stringify({event: event, data: {player: p, senderPlayer: senderPlayer, sendChat: data.sendChat}});
                p.ws.send(sendData);
            });
            console.log(`[SERVER] Event - sendChat - ${room.id} - ${data.sendChat}`);
            //ws.send(sendData); 

        } else if (meta === "leave") {
            if (Object.keys(rooms[room]).length === 1) {
                delete rooms[room]; // ...delete the room when leaving

            } else {
                delete rooms[room][uuid]; // ...delete the person id who's leaving
            }
        } else if (meta === "chat") {
            if (rooms[room]) {
                console.log(`Broadcasting message in room ${room}: ${message}`);
                // On envoie le message à tous les membres de la room
                Object.values(rooms[room]).forEach((client) => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(
                            JSON.stringify({ message, room, sender: uuid })
                        );
                    }
                });
            }
        }
    });

    //ws.send("something");
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

function roomId() {
    return Math.random().toString(36).substring(2,9);
}