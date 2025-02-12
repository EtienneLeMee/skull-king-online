const Deck = require('./deck');  // Supposons que vous ayez une classe Deck qui gère le paquet de cartes
const Player = require('./player'); // Supposons également une classe Player pour gérer les joueurs

class Game {
  constructor(numberOfPlayers) {
    // Initialisation des joueurs
    this.players = [];
    for (let i = 0; i < numberOfPlayers; i++) {
      this.players.push(new Player(i + 1)); // Chaque joueur a un ID unique
    }
    
    // Initialisation du deck
    this.deck = new Deck(); // La classe Deck va gérer la création et le mélange des cartes

    // Initialisation des autres propriétés
    this.currentRound = 1;
    this.rounds = []; // Tableau des résultats des manches
    this.scores = {}; // Scores des joueurs
    this.predictions = {}; // Prédictions des joueurs pour chaque manche
    this.currentTrick = []; // Liste des cartes jouées lors de chaque pli (trick)
    this.currentPlayerIndex = 0; // Pour savoir quel joueur doit jouer
    this.phase = 'predictions'; // Phase initiale pour les prédictions de plis
  }

  // Commence une nouvelle manche
  startRound() {
    // Réinitialisation de la partie pour une nouvelle manche
    this.currentTrick = [];
    this.rounds.push({ round: this.currentRound, results: [] });
    this.phase = 'predictions'; // Phase des prédictions
    this.players.forEach(player => player.resetForNextRound()); // Réinitialiser les données des joueurs

    // Distribuer les cartes
    this.deck.shuffle();
    this.players.forEach(player => {
      player.receiveCards(this.deck.deal(this.currentRound)); // Distribuer les cartes
    });

    this.currentRound++;
  }

  // Permet de faire une prédiction
  makePrediction(playerId, prediction) {
    if (this.phase === 'predictions') {
      this.predictions[playerId] = prediction; // Enregistrer la prédiction
      if (Object.keys(this.predictions).length === this.players.length) {
        this.phase = 'playing'; // Passer à la phase de jeu lorsque tous ont fait leur prédiction
      }
    }
  }

  // Jouer un tour
  playCard(playerId, card) {
    if (this.phase !== 'playing') return;

    const player = this.players.find(p => p.id === playerId);
    if (!player || !player.hasCard(card)) return; // Vérifier que le joueur a bien cette carte

    // Ajouter la carte jouée au pli
    this.currentTrick.push({ playerId, card });

    // Vérifier si tout le monde a joué une carte
    if (this.currentTrick.length === this.players.length) {
      this.resolveTrick(); // Résoudre le pli une fois que tous ont joué
    } else {
      this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
    }
  }

  // Résoudre un pli
  resolveTrick() {
    // Calculer qui a remporté le pli
    let winningPlayer = this.determineWinner();
    this.rounds[this.currentRound - 1].results.push({
      trick: this.currentTrick,
      winner: winningPlayer,
    });

    // Réinitialiser le pli
    this.currentTrick = [];

    // Passer à la prochaine phase
    if (this.rounds[this.currentRound - 1].results.length === this.players.length) {
      this.endRound();
    }
  }

  // Déterminer le gagnant du pli (par exemple en fonction de la valeur des cartes jouées)
  determineWinner() {
    let highestCard = null;
    let winningPlayer = null;

    this.currentTrick.forEach(({ playerId, card }) => {
      if (!highestCard || card.value > highestCard.value) {
        highestCard = card;
        winningPlayer = playerId;
      }
    });

    return winningPlayer;
  }

  // Fin de la manche
  endRound() {
    this.players.forEach(player => {
      const predicted = this.predictions[player.id];
      const actual = this.calculateActualTricks(player.id);
      player.updateScore(predicted, actual); // Mettre à jour le score
    });

    this.resetForNextRound();
  }

  // Calculer le nombre de plis réellement remportés par un joueur
  calculateActualTricks(playerId) {
    return this.rounds[this.currentRound - 1].results.filter(result => result.winner === playerId).length;
  }

  // Réinitialiser pour la prochaine manche
  resetForNextRound() {
    this.phase = 'predictions';
    this.predictions = {};
    this.currentRound++;
    this.currentPlayerIndex = 0;
  }
}

module.exports = Game;
