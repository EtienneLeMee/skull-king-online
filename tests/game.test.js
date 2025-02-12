const Game = require("../public/js/game"); // Assurez-vous d'importer la bonne classe

describe("Skull King Game Tests", () => {
    let game;

    beforeEach(() => {
        game = new Game(4); // Initialiser un jeu avec 4 joueurs
    });

    test("should initialize players and deck", () => {
        expect(game.players.length).toBe(4);
        expect(game.deck.cards.length).toBeGreaterThan(0); // Le deck doit avoir des cartes
    });

    test("should start a new round", () => {
        game.startRound();

        // Vérifier que le nombre de cartes distribuées est correct
        expect(game.players[0].cards.length).toBe(1); // Le nombre de cartes pour le premier tour est de 1
        expect(game.currentRound).toBe(2); // La manche suivante doit être la manche 2
        expect(game.phase).toBe("predictions"); // La phase doit être 'predictions' au début de chaque round
    });

    test("should allow players to make predictions", () => {
        game.makePrediction(1, 2); // Joueur 1 prédit 2 plis
        game.makePrediction(2, 1); // Joueur 2 prédit 1 pli
        game.makePrediction(3, 0); // Joueur 3 prédit 0 pli
        game.makePrediction(4, 3); // Joueur 4 prédit 3 plis

        expect(game.predictions[1]).toBe(2); // Vérifier la prédiction du joueur 1
        expect(game.predictions[2]).toBe(1); // Vérifier la prédiction du joueur 2
        expect(game.predictions[3]).toBe(0); // Vérifier la prédiction du joueur 3
        expect(game.predictions[4]).toBe(3); // Vérifier la prédiction du joueur 4

        // Phase devrait changer après que tous les joueurs aient fait leur prédiction
        expect(game.phase).toBe("playing");
    });

    test("should allow players to play cards", () => {
        game.startRound(); // Démarrer une nouvelle manche
        game.makePrediction(1, 2);
        game.makePrediction(2, 1);
        game.makePrediction(3, 0);
        game.makePrediction(4, 3);

        const player1 = game.players[0];
        const cardToPlay = player1.cards[0];

        game.playCard(1, cardToPlay); // Joueur 1 joue sa carte
        expect(game.currentTrick.length).toBe(1); // La carte du joueur 1 doit être dans le pli

        const player2 = game.players[1];
        game.playCard(2, player2.cards[0]); // Joueur 2 joue sa carte
        expect(game.currentTrick.length).toBe(2); // La carte du joueur 2 doit être dans le pli

        // Vérifier que l'indice du joueur suivant est correctement mis à jour
        expect(game.currentPlayerIndex).toBe(2);
    });

    test("should resolve a trick and determine the winner", () => {
        game.startRound();
        game.makePrediction(1, 2);
        game.makePrediction(2, 1);
        game.makePrediction(3, 0);
        game.makePrediction(4, 3);

        // Joueurs jouent leurs cartes
        game.playCard(1, game.players[0].cards[0]);
        game.playCard(2, game.players[1].cards[0]);
        game.playCard(3, game.players[2].cards[0]);
        game.playCard(4, game.players[3].cards[0]);

        game.resolveTrick(); // Résoudre le pli

        // Vérifier que le pli a été résolu et qu'il y a un gagnant
        expect(game.currentTrick.length).toBe(0); // Le pli doit être vide après sa résolution
        expect(
            game.rounds[game.currentRound - 1].results[0].winner
        ).toBeGreaterThan(0); // Il doit y avoir un gagnant
    });

    test("should end the round and update scores", () => {
        game.startRound();
        game.makePrediction(1, 2);
        game.makePrediction(2, 1);
        game.makePrediction(3, 0);
        game.makePrediction(4, 3);

        // Joueurs jouent leurs cartes
        game.playCard(1, game.players[0].cards[0]);
        game.playCard(2, game.players[1].cards[0]);
        game.playCard(3, game.players[2].cards[0]);
        game.playCard(4, game.players[3].cards[0]);

        game.resolveTrick(); // Résoudre le pli

        // Fin de la manche
        game.endRound();

        // Vérifier que les scores sont bien mis à jour
        expect(game.players[0].score).toBeGreaterThan(0); // Le joueur 1 devrait avoir un score mis à jour
        expect(game.players[1].score).toBeGreaterThan(0); // Le joueur 2 devrait avoir un score mis à jour
        expect(game.players[2].score).toBeGreaterThan(0); // Le joueur 3 devrait avoir un score mis à jour
        expect(game.players[3].score).toBeGreaterThan(0); // Le joueur 4 devrait avoir un score mis à jour
    });

    test("should calculate actual tricks won by a player", () => {
        game.startRound();
        game.makePrediction(1, 2);
        game.makePrediction(2, 1);
        game.makePrediction(3, 0);
        game.makePrediction(4, 3);

        // Joueurs jouent leurs cartes
        game.playCard(1, game.players[0].cards[0]);
        game.playCard(2, game.players[1].cards[0]);
        game.playCard(3, game.players[2].cards[0]);
        game.playCard(4, game.players[3].cards[0]);

        game.resolveTrick(); // Résoudre le pli

        // Calcul des vrais plis gagnés par le joueur 1
        const actualTricks = game.calculateActualTricks(1);
        expect(actualTricks).toBeGreaterThanOrEqual(0); // Le joueur 1 devrait avoir un nombre valide de plis gagnés
    });
});
