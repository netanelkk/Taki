var colors = ["yellow", "blue", "red", "green"];
var types = ["1", "3", "4", "5", "6", "7", "8", "9", "changesDirection", "2plush", "stop", "taki"];
var Cashier, TableDeck, player1_cards, player2_cards, turn;
const COMPUTER_DELAY = 1500;

// shuffles array
function shuffle(array) {
    let currentIndex = array.length, randomIndex;
    while (currentIndex != 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }
    return array;
}

// card object, contains type and color
function Card(type, color) {
    this.color = color;
    this.type = type;
    // check if given object has the same color
    // color change will have always "color" value inside this.color, and the chosen color will be in changeColorValue
    this.isEqualColor = function (color2) {
        if (this.changeColorValue == null) {
            return (color == color2);
        }
        return (this.changeColorValue == color2);
    }
    // check if given object has the same type
    this.isEqualType = function (type2) {
        return (type == type2);
    }
    this.cardID = this.type + '_' + this.color;
    this.image = function () {
        return 'images/' + this.cardID + '.jpg';
    }

    // attribute for color changer card. will contain the chosen color
    this.changeColorValue = null;
}

// deck object
function Deck() {
    this.cards = [];
    // creates deck from color and type array, without color changers
    this.createDeck = function () {
        for (c in colors) {
            for (t in types) {
                this.cards.push(new Card(types[t], colors[c]));
            }
        }
    }
    this.Shuffle = function () {
        this.cards = shuffle(this.cards);
    }
    this.addCard = function (card) {
        this.cards.push(card);
    }
    // removes card from array, checking by color and type method from card object
    this.removeCard = function (card) {
        var index = -1;
        for (i = 0; i < this.cards.length; i++) {
            if (this.cards[i].isEqualColor(card.color) && this.cards[i].isEqualType(card.type)) {
                index = i;
            }
        }
        this.cards.splice(index, 1);
    }

    // returns the last item in array
    this.lastCard = function () {
        return this.cards[this.cards.length - 1];
    }
}

// object that contains player's deck and his id in the game (1 or 2)
function playerCards(deck, id) {
    this.deck = deck;
    this.id = id;
    this.checkID = function (id2) {
        return (this.id == id2);
    }
}


// object that helps indexing deck of cards
// for example: if taki card exists, it will get the index value in deck
// if not, it will be null
function countDeck() {
    this.taki = null;
    this.stop = null;
    this.changesDirection = null;
    this.twoplush = null;
    this.color = null;
    this.type = null;
    this.colorChanger = null;

    this.init = function(deck) {
        var currentTableCard = TableDeck.lastCard();
        for (var i = 0; i < deck.cards.length; i++) {
            let computerCard = deck.cards[i];
            if (checkCardLegal(currentTableCard, computerCard)) {
                if (computerCard.type == "taki" || computerCard.type == "stop" || computerCard.type == "changesDirection") {
                    this[computerCard.type] = i;
                } else if (computerCard.type == "2plush") {
                    this.twoplush = i;
                } else if (computerCard.color == currentTableCard.color) {
                    this.color = i;
                } else if (computerCard.isEqualType("color")) { // means the card is color changer
                    this.colorChanger = i;
                } else { // match between 2 cards is not a color and no special card, so it has to be by type
                    this.type = i;
                }
            }
        }
    }

}

// moves given number of cards from one deck to another
// if cardByColor is not null, it will check that the cards has the same color
function moveCards(fromDeck, toDeck, numOfCards, cardByColor) {
    var tempDeck = new Deck();
    for (var i = 0; i < numOfCards; i++) {
        if (cardByColor != null) {
            if (fromDeck.cards[i].isEqualColor(cardByColor.color)) {
                tempDeck.addCard(fromDeck.cards[i]);
            }
        } else {
            tempDeck.addCard(fromDeck.cards[i]);
        }
    }

    for (var i = 0; i < tempDeck.cards.length; i++) {
        tempDeck.cards[i].changeColorValue = null; // reset color changer chosen color
        toDeck.addCard(tempDeck.cards[i]);
        fromDeck.removeCard(tempDeck.cards[i]);
    }
}

// moves cards from cashier to given deck
// if cashier is empty, it will move cards from table deck
function moveCardsFromCashier(toDeck, numOfCards) {
    if (Cashier.cards.length <= 0) {
        if (TableDeck.cards.length - numOfCards <= 0) {
            alert("No more cards left to pick"); // cashier is empty, and table deck is empty
            return;
        }
        moveCards(TableDeck, Cashier, TableDeck.cards.length - 1, null);
        Cashier.Shuffle();
    }

    moveCards(Cashier, toDeck, numOfCards, null);
}

// create HTML elements of the cards
function displayCards(deck, elementID, ishidden) {
    document.getElementById(elementID).innerHTML = "";
    for (var i = 0; i < deck.cards.length; i++) {
        var cardimg = '<img src="' + deck.cards[i].image() + '" class="card" onclick="cardclicked(`' + deck.cards[i].cardID + '`,`' + elementID + '`)">';
        if (ishidden)
            cardimg = '<img src="images/card_back.png" class="card_back">';

        document.getElementById(elementID).innerHTML += cardimg;
    }
}

// refreshes all the relevant html in the page
function refreshDOM() {
    displayCards(player1_cards.deck, "player1", false);
    displayCards(player2_cards.deck, "player2", true);
    if (turn == 1) {
        document.getElementById("currentplayer").innerText = "תורך";
    } else {
        document.getElementById("currentplayer").innerText = "תור המחשב";
    }


    document.getElementById("Deck").innerHTML = "<img src='images/cashier.png' onclick='takecard()' id='cashier'> ";
    document.getElementById("Deck").innerHTML += '<img src="' + TableDeck.lastCard().image() + '" class="card">';
}

// changes turn from 1 to 2, and opposite
function changeturn() {
    if (turn == 1) {
        turn = 2;
        setTimeout(computerPlaceCard, COMPUTER_DELAY);
    } else
        turn = 1;
}

function start() {
    Cashier = new Deck();
    player1_cards = new playerCards(new Deck(), 1); // new player deck, with unique id
    player2_cards = new playerCards(new Deck(), 2);
    TableDeck = new Deck();
    turn = 1;


    if (localStorage["Cashier"] != undefined && localStorage["player1_cards"] != undefined &&
        localStorage["player2_cards"] != undefined && localStorage["TableDeck"] != undefined &&
        localStorage["turn"] != undefined) { // check if localstorage have date

        jsonInitDeck(Cashier, JSON.parse(localStorage.getItem("Cashier")).cards);

        jsonInitDeck(player1_cards.deck, JSON.parse(localStorage.getItem("player1_cards")).deck.cards);
        player1_cards.id = JSON.parse(localStorage.getItem("player1_cards")).id;

        jsonInitDeck(player2_cards.deck, JSON.parse(localStorage.getItem("player2_cards")).deck.cards);
        player2_cards.id = JSON.parse(localStorage.getItem("player2_cards")).id;

        jsonInitDeck(TableDeck, JSON.parse(localStorage.getItem("TableDeck")).cards);

        turn = parseInt(localStorage.getItem("turn"));
        if (turn == 2) {
            setTimeout(computerPlaceCard, COMPUTER_DELAY);
        }

    } else {
        Cashier.createDeck();

        Cashier.addCard(new Card("color", "changer")); // adding color changer cards to cashier
        Cashier.addCard(new Card("color", "changer"));

        Cashier.Shuffle();

        moveCardsFromCashier(player1_cards.deck, 8);
        moveCardsFromCashier(player2_cards.deck, 8);

        do {
            moveCardsFromCashier(TableDeck, 1);
        } while (TableDeck.lastCard().isEqualType("color")); // choose card from cashier, but not color changer as first card
    }

    refreshDOM();
}


// save data to localstorage
function saveGame() {
    localStorage.setItem("Cashier", JSON.stringify(Cashier));
    localStorage.setItem("player1_cards", JSON.stringify(player1_cards));
    localStorage.setItem("player2_cards", JSON.stringify(player2_cards));
    localStorage.setItem("TableDeck", JSON.stringify(TableDeck));
    localStorage.setItem("turn", turn);
}

// function to add cards to deck by json object of cards
function jsonInitDeck(deck,cards) {
    for (var i = 0; i < cards.length; i++) {
        let cardtemp = new Card(cards[i].type, cards[i].color);
        cardtemp.changeColorValue = cards[i].changeColorValue;
        deck.addCard(cardtemp);
    }
}

function checkCardLegal(tableCard, playerCard) {
    if (playerCard.isEqualType("color")) // means the card is color changer
        return true;
    if (tableCard.isEqualColor(playerCard.color))
        return true;
    if (tableCard.isEqualType(playerCard.type))
        return true;
    return false;
}

// pick color for color changer card
function pickColorChanger(card) {
    let newcolor;
    if (getCurrentPlayer().id == 1) {
        do {
            newcolor = prompt("Enter new color: (red, green, yellow, blue)", "");
            if (!(newcolor === null)) newcolor = newcolor.toLowerCase();
        } while ((newcolor != "red" && newcolor != "green" && newcolor != "yellow" && newcolor != "blue") || newcolor === null);
    } else {
        newcolor = mostCommonColor(player2_cards.deck);
        alert("Opponent chose: " + newcolor);
    }

    card.changeColorValue = newcolor;
}

// reciving deck and return the most common color in deck
function mostCommonColor(deck) {
    let colorCount = { "red": 0, "green": 0, "yellow": 0, "blue": 0 };
    let color, max = 0;
    let maxcolor = "red"; // default color, in case computer have color changer as last card

    for (var i = 0; i < deck.cards.length; i++) {
        if (!deck.cards[i].isEqualType("color")) { // if card is not color changer
            color = deck.cards[i].color;
            colorCount[color]++;
            if (colorCount[color] > max) {
                max = colorCount[color];
                maxcolor = deck.cards[i].color;
            }
        }
    }

    return maxcolor;
}

// receiving deck and color name, and counting how many times this color is in cards deck
function countCardsWithColor(deck, color) {
    let count = 0;
    for (var i = 0; i < deck.cards.length; i++) {
        if (deck.cards[i].isEqualColor(color)) {
            count++;
        }
    }
    return count;
}

function cardclicked(value, player) {
    if (player.includes(turn)) { // checking if it's his turn
        var currentPlayer = getCurrentPlayer();
        card = new Card(value.split("_")[0], value.split("_")[1]);

        if (checkCardLegal(TableDeck.lastCard(), card)) {
            TableDeck.addCard(card);
            currentPlayer.deck.removeCard(card);

            if (card.isEqualType("color") && card.isEqualColor("changer"))  // check if the card is color changer
                pickColorChanger(card);

            if (!card.isEqualType("stop") && !card.isEqualType("changesDirection")) // if not stop/change direction, move the turn to next player
                changeturn();
            else if (turn == 2) { // if computer placed "stop" or "changesDirection", it will have another turn
                setTimeout(computerPlaceCard, COMPUTER_DELAY);
            }

            if (card.isEqualType("2plush")) // check if the card is 2+
                moveCardsFromCashier(getSecondPlayer().deck, 2);

            if (card.isEqualType("taki")) // check if the card is taki 
                moveCards(currentPlayer.deck, TableDeck, currentPlayer.deck.cards.length, card); // moves all cards with the same color to table deck

            refreshDOM();
            saveGame();

            if (currentPlayer.deck.cards.length == 0) { // check if player have no cards left
                let message;
                if (currentPlayer.id == 1) {
                    message = "כל הכבוד, ניצחת!";
                } else {
                    message = "הפסדת, לא נורא";
                }
                localStorage.clear(); // cleaning all saved game data
                setTimeout(function () {
                    alert(message + "\n לחץ אישור למשחק חוזר.");
                    start();
                }, 1000);
            }

        } else {
            takecard(); // if the card is not legal, the player will pick up card
        }

    }

}


// selecting the best card to place, and calling it by cardclicked function
// if the computer doesn't have suitable card, it will take card from cashier
function computerPlaceCard() {
    countdeck = new countDeck();
    countdeck.init(player2_cards.deck);

    let cardid, deckcards = player2_cards.deck.cards; // cardid - the id ("type_color") of the card

    if (countdeck.taki != null && countCardsWithColor(player2_cards.deck, deckcards[countdeck.taki].color) >= 2) { // counting cards with the same color as taki card chosen
        cardid = deckcards[countdeck.taki].cardID;
    } else if (countdeck.stop != null) {
        cardid = deckcards[countdeck.stop].cardID;
    } else if (countdeck.changesDirection != null) {
        cardid = deckcards[countdeck.changesDirection].cardID;
    } else if (countdeck.twoplush != null) {
        cardid = deckcards[countdeck.twoplush].cardID;
    } else if (countdeck.color != null) {
        cardid = deckcards[countdeck.color].cardID;
    } else if (countdeck.type != null) {
        cardid = deckcards[countdeck.type].cardID;
    } else if (countdeck.colorChanger != null) {
        cardid = deckcards[countdeck.colorChanger].cardID;
    } else {
        takecard();
        return;
    }

    cardclicked(cardid, "player2");
}

function takecard() {
    moveCardsFromCashier(getCurrentPlayer().deck, 1);
    changeturn();
    saveGame();
    refreshDOM();
}

function getCurrentPlayer() {
    var currentPlayer = player2_cards;
    if (player1_cards.checkID(turn)) {
        currentPlayer = player1_cards;
    }
    return currentPlayer;
}

function getSecondPlayer() {
    var secondPlayer = player1_cards;
    if (!player1_cards.checkID(turn)) {
        secondPlayer = player2_cards;
    }
    return secondPlayer;
}


