const Card = require('./card'); // Supposons également une classe Player pour gérer les joueurs

class Deck {
    constructor() {
        // La structure de base des cartes du jeu Skull King
        this.cards = [];

        // Définir les suites et les rangs des cartes
        const suits = ["yellow", "blue", "green", "red"];
        const ranks = [
            "Skull King",
            "Pirate",
            "Mermaid",
            "Jolly Roger",
            "Treasure",
            ...Array.from({ length: 15 }, (_, i) => i + 1), // Cartes numérotées 1 à 15
        ];

        // Remplir le deck avec les cartes
        suits.forEach((suit) => {
            ranks.forEach((rank, index) => {
                let value = 0;
                if (rank === "Skull King") value = 100;
                else if (rank === "Pirate") value = 25;
                else if (rank === "Mermaid") value = 20;
                else if (rank === "Jolly Roger") value = 15;
                else if (rank === "Treasure") value = 10;
                else if (typeof rank === "number") value = rank;

                this.cards.push(new Card(rank, suit, value));
            });
        });

        // Ajouter les cartes spéciales (en dehors des couleurs principales)
        this.cards.push(new Card("Skull King", "special", 100)); // carte Skull King spéciale
        this.cards.push(new Card("Jolly Roger", "special", 15)); // carte Jolly Roger spéciale
    }

    // Mélanger le deck
    shuffle() {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]]; // Échange les cartes
        }
    }

    // Distribuer les cartes à un joueur en fonction du nombre de cartes à distribuer
    deal(numberOfCards) {
        return this.cards.splice(0, numberOfCards); // Retourne les premières cartes et les supprime du deck
    }

    // Récupérer le nombre de cartes restantes dans le deck
    remainingCards() {
        return this.cards.length;
    }

    // Afficher le contenu du deck pour débogage
    printDeck() {
        this.cards.forEach((card) => {
            console.log(card.toString());
        });
    }

    // Méthode pour vérifier si une carte existe dans le deck
    hasCard(card) {
      return this.cards.some(deckCard => deckCard === card);
  }
}

module.exports = Deck;
