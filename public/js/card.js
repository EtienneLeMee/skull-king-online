class Card {
    constructor(rank, suit, value) {
        this.rank = rank; // La catégorie de la carte (par ex. "Pirate", "Skull King", etc.)
        this.suit = suit; // La couleur de la carte (par ex. "yellow", "blue", etc.)
        this.value = value; // La valeur numérique de la carte (utile pour le classement)
    }

    // Méthode pour obtenir une représentation lisible de la carte
    toString() {
        return `${this.rank} of ${this.suit} (value: ${this.value})`;
    }

    // Méthode pour afficher une carte dans un format plus adapté au jeu
    toDisplayString() {
        return `${this.rank} of ${this.suit}`;
    }

    // Comparer deux cartes sur la base de leur valeur pour le classement
    compareTo(otherCard) {
        if (this.value > otherCard.value) {
            return 1;
        } else if (this.value < otherCard.value) {
            return -1;
        } else {
            return 0;
        }
    }
}

module.exports = Card;
