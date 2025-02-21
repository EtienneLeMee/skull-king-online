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
        let senderPlayer = players.find(p => p.ws === ws);
        if(senderPlayer){
            let room = rooms.find(r => r.id === senderPlayer.roomId);
            leaveRoom(senderPlayer);
            if(room){
                room.players.forEach(p => {
                    let sendData = JSON.stringify({event: "leaveRoom", data: {player: p, senderPlayer: senderPlayer, room: room}});
                    p.ws.send(sendData);
                });
            }
        }   
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

        //Join Room App
        } else if (event === "joinRoom") {
            let player = data.player;
            player.socketId = client;
            player.ws = ws;
            let room = rooms.find(r => r.id === player.roomId);
            room = joinRoom(player, room);
            //console.log(room)
            if(room){
                room.players.forEach(p => {
                    sendData = JSON.stringify({event: event, data: {player: p, room: room}});
                    p.ws.send(sendData);
                });
            } else {
                sendData = JSON.stringify({event: event, data: {player: player, room: room, error: "Le salon est plein."}});
                ws.send(sendData)
            }
            

        //Leave Room App
        } else if (event === "leaveRoom") {
            let senderPlayer = data.senderPlayer;
            let room = rooms.find(r => r.id === senderPlayer.roomId);
            room = leaveRoom(senderPlayer);
            room.players.forEach(p => {
                sendData = JSON.stringify({event: event, data: {player: p, senderPlayer: senderPlayer, room: room}});
                p.ws.send(sendData);
            });

        //Send Chat App
        } else if (event === "sendChat"){
            let senderPlayer = data.senderPlayer
            let room = rooms.find(r => r.id === senderPlayer.roomId);
            room.players.forEach(p => {
                sendData = JSON.stringify({event: event, data: {player: p, senderPlayer: senderPlayer, sendChat: data.sendChat}});
                p.ws.send(sendData);
            });
            console.log(`[SERVER] Event - sendChat - ${room.id} - ${data.sendChat}`);

        //Start Game App
        } else if (event === "startGame"){
            let player = data.player;
            let room = rooms.find(r => r.id === player.roomId);
            room = startGame(room);
            let roomCopy = JSON.parse(JSON.stringify(room));
            // Supprimer les decks des autres joueurs
            roomCopy.players.forEach(p => {
                delete p.deck;
            });
            room.players.forEach(p => {
                let playerCards = p.cards;
                console.log(playerCards)
                sendData = JSON.stringify({event: event, data: {player: p, room: roomCopy, cards: playerCards}});
                p.ws.send(sendData);
            });

            room.players.forEach(p => {
                delete p.deck;
            });

        //Start Game App
        } else if (event === "emitBet"){
            let senderPlayer = data.player;
            //senderPlayer.emitBet = true;
            let room = rooms.find(r => r.id === senderPlayer.roomId);
            room.players.find(p => p.socketId === senderPlayer.socketId).emitBet = true;
            room.players.forEach(p => {
                //console.log(`${p.username} ${p.emitBet}`)
                //if(p.socketId===senderPlayer.socketId){p.emitBet = true}else{p.emitBet = false}
                //console.log(`${p.username} ${p.emitBet}`)
                const sendData = JSON.stringify({ event: event, data: { player: p, senderPlayer: senderPlayer, room: room } });
                p.ws.send(sendData);
            });
            if (room.players.every(p => p.emitBet === true)) {
                //startPlayingHand(); 
            
                room.players.forEach(p => {
                    const sendData = JSON.stringify({ event: "startPlayingHand", data: { player: p, room: room, cards: p.deck } });
                    p.ws.send(sendData);
                });
            }
            
        }
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
    if(room.players.length <8 ){
        console.log(`[SERVER] Event - joinRoom - ${room.id} - ${player.username}`);
        room.players.push(player)
        player.roomId = room.id;
        players.push(player);
    } else {
        console.error(`[SERVER] Event - joinRoom - ${room.id} - ${player.username} - Partie complète`);
        room = null;
    }
    
    return room;
}

function leaveRoom(player) {
    let room = null;
    let playerToDeleteIndex = null;
    if(player){
        room = rooms.find(r => r.id === player.roomId);
        playerToDeleteIndex = room.players.findIndex(p => p.socketId == player.socketId);
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

function startGame(room) {
    console.log(`[SERVER] Event - startGame - ${room.id}`);
    room = initScore(room)
    room = startRound(room);
    return room;
}

function initScore(room){
    room.players.forEach(p => p.score = 0);
    room.round = 2;
    return room
}

function startRound(room){
    room.round += 1;
    console.log(`[SERVER] Game - Start Round - Room : ${room.round}`)
    if(room.round==10){
        //finishGame here
    } else {
        console.log(`[SERVER] Game - initAndShuffleDeck - Room : ${room.id}`)
        room.deck = initAndShuffleDeck()
        
        room = dealCards(room);
        //Distrib here

        //MakePrediction here with user action

        //

    }
    return room;
} 

function initAndShuffleDeck(){
    let deck = [];

    const suits = ["yellow", "red", "green", "black"];
    const heads = [{suit: "Skull King", value:100},{suit: "Pirate", value:100},{suit: "Pirate", value:100},{suit: "Pirate", value:100},{suit: "Pirate", value:100},{suit: "Pirate", value:100},{suit: "Sirène", value:100},{suit: "Sirène", value:100},{suit: "Drapeau blanc", value:0}];

    // Remplir le deck avec les cartes
    suits.forEach((suit) => {
        for(let i=1; i<=14;i++){
            let value = i
            if(suit==="black"){
                value += 20           
            }
            deck.push({suit: suit, value: i})
        }
    });

    heads.forEach(h => deck.push(h))

    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        let change = deck[i]
        deck[i] = deck[j]
        deck[j] = change
    }

    return deck
}

function dealCards(room){
    for(let i=0; i<room.round;i++){
        players.forEach(p=> {
            p.cards = []
            p.cards.push(room.deck[0]);
            room.deck.splice(0,1);
        });
    }
    room.players.forEach(p => p.cards.forEach(card => console.log(`[SERVER] - Deal Cards - ${p.username} - ${card.suit} : ${card.value}`)))
    return room;
}

function outputRooms() {
    console.log("Rooms");
    rooms.forEach(r => console.log(r))
}