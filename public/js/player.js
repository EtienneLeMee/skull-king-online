

/*class Player {
    constructor(name) {
      this.name = name; // Le nom du joueur
      this.cards = [];  // Les cartes du joueur
      this.score = 0;   // Le score du joueur, initialisé à 0
      this.currentBid = null; // L'enchère du joueur (nombre de plis qu'il pense réaliser)
      this.currentTrick = 0; // Le nombre de plis réalisés par le joueur dans le tour actuel
      this.isActive = true; // Statut actif ou inactif du joueur (par exemple, s'il est encore dans la partie)
    }
  
    // Méthode pour ajouter des cartes à la main du joueur
    receiveCards(cards) {
      this.cards = [...this.cards, ...cards];
    }
  
    // Méthode pour jouer une carte
    playCard(card) {
      const cardIndex = this.cards.findIndex(c => c === card);
      if (cardIndex !== -1) {
        // Retirer la carte jouée de la main du joueur
        const playedCard = this.cards.splice(cardIndex, 1)[0];
        console.log(`${this.name} has played the ${playedCard.toString()}`);
        return playedCard;
      }
      return null; // Si la carte n'est pas dans la main
    }
  
    // Méthode pour définir une enchère (nombre de plis que le joueur pense réaliser)
    placeBid(bid) {
      if (bid >= 0 && bid <= this.cards.length) {
        this.currentBid = bid;
        console.log(`${this.name} has placed a bid of ${bid} tricks.`);
      } else {
        console.log("Invalid bid.");
      }
    }
  
    // Méthode pour augmenter le score du joueur
    updateScore(points) {
      this.score += points;
      console.log(`${this.name}'s score is now ${this.score}`);
    }
  
    // Méthode pour activer ou désactiver un joueur (par exemple, s'il a quitté la partie)
    toggleActiveStatus() {
      this.isActive = !this.isActive;
    }
  
    // Affichage des cartes du joueur (utile pour débogage)
    showCards() {
      console.log(`${this.name}'s cards:`);
      this.cards.forEach(card => {
        console.log(card.toString());
      });
    }
  }
  
  module.exports = Player;
  */