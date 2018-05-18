/* 

Так как желательно было выполнить задание без сборщика модулей, gulp и Rollup я не ставил.
Игра открывается запуском файла index.html. К сожалению, поддержку IE8+ обеспечить не удалось, так как 
babel ставить было некуда =)

Писал код на ES2015 (ES6) 


*/


'use strict';

window.main = ((util) => {

  const SIDE_LENGTH = 10; // длина стороны поля
  const COUNT_OF_PLAYER = 2; // количество игроков

  const SHIPS = { // стартовые данные с количеством кораблей
    1: 4,
    2: 3,
    3: 2,
    4: 1
  };

  let name;
  let arrayWithShips = []; // 

  // функция отрисовывает экран игры

  const renderGameScreen = () => {
    const gameTemplate = document.querySelector('#game__template').content;
    const gameTemplateCopy = gameTemplate.cloneNode(true);
    util.renderScreen(gameTemplateCopy);
    initGame();
  }

  const startGame = () => {
    name = document.querySelector('.name_wrapper input').value;
    renderGameScreen();
  }


  const setupGame = () => {
    const playButton = document.querySelector('.main-play');
    const nameInput = document.querySelector('.name_wrapper input');

    playButton.disabled = true;
    playButton.addEventListener(`click`, startGame);

    // блокируем возможность начать игру без введенного имени игрока

    nameInput.addEventListener('input', (evt) => {
      evt.target.value.length >= 2 ? playButton.disabled = false : playButton.disabled = true;
    });
  }

  setupGame();


  // функция отрисовывает экран с результатами

  const showResult = (text) => {
    const resultTemplate = document.querySelector('#result__template').content;
    const resultTemplateCopy = resultTemplate.cloneNode(true);
    resultTemplateCopy.querySelector('.title').textContent = text;
    const playButton = resultTemplateCopy.querySelector('.main-play');
    playButton.addEventListener('click', renderGameScreen);
    util.renderScreen(resultTemplateCopy);
  }



  // класс для создания игрового поля

  class Field {
    constructor(length) {
      this.length = length;
      this.countOfCells = this.length * this.length;
    }

    createField() {
      const field = document.createElement('div');
      field.classList.add('field');
      this.field = field;
    }

    // бежим по полю и заполняем его ячейками
    createCells () {
      for (let i = 0; i < this.countOfCells; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        this.field.appendChild(cell);
      }
    }

    /* устанавливаем координаты для каждой ячейки. для удобства 
    нумерования разбил массив из 100 элементов на 10 массивов по 10 элементов, в итоге получаем стандартные 
    числовые координаты для каждой ячейки */
    setCoordinatesForCell() {
      const cells = this.field.querySelectorAll('.cell');
      const subArrays = util.splitArrayIntoParts(cells, 10);
      let y = 1;
      subArrays.forEach((it) => {
        Array.from(it).forEach((cell, idx) => {
          cell.dataset.x = idx + 1;
          cell.dataset.y = y;
        });
        y++;
      });
    }

    // создаем поле, заполняем ячейками, устанавливаем координаты
    installField() {
      this.createField();
      this.createCells();
      this.setCoordinatesForCell();
    }
  }


  // класс для создания корабля

  class Ship {
    constructor(size, route) {
      this.size = size;
      this.route = route; // направление корабля, горизонталь или вертикаль
    }

    // установка случайных координат для первой палубы корабля
    setCoordaintesForFirstDeck() {
      this.ship = [];
      const firstDeck = {};
      firstDeck.x = util.getRandomFromRange(1, SIDE_LENGTH);
      firstDeck.y = util.getRandomFromRange(1, SIDE_LENGTH);
      this.firstDeck = firstDeck;
      this.ship.push(firstDeck);
    }

    // если направление горизонтальное, устанавливаем координаты для оставшихся палуб
    setCoordinatesToX() {
      const deck = {};
      const x = this.firstDeck.x++;
      deck.x = x;
      deck.y = this.firstDeck.y;
      return deck;
    }

    // если направление вертикальное, устанавливаем координаты для оставшихся палуб
    setCoordinatesToY() {
      const deck = {};
      const y = this.firstDeck.y++;
      deck.x = this.firstDeck.x;
      deck.y = y;
      return deck;
    }

    // координаты должны быть уникальные, для каждого корабля
    setCoordinatesForDecks(route) {
      let isCoordinatesActual = false;
      while (!isCoordinatesActual) {
        this.ship = [];
        this.setCoordaintesForFirstDeck();
        for (let i = 1; i < this.size; i++) {
          let deck = {};
          route > 0.5 ? deck = this.setCoordinatesToX() : deck = this.setCoordinatesToY();
          if (deck.x < SIDE_LENGTH && deck.y < SIDE_LENGTH) {
            this.ship.push(deck);
            isCoordinatesActual = true;
          } else {
            isCoordinatesActual = false;
          }
        }
      }
    }

    setCoordinatesForShip() {
      this.size >= 2 ? this.setCoordinatesForDecks(this.route) : this.setCoordaintesForFirstDeck();
    }
  }



  // функция бежит по ближайшим ячейкам и помечает их как занятые, чтобы корабли при установке не располагались рядом
  const markBusy = (field, cell) => {
    cell.dataset.busy = true;
    util.markNearestCells(field, cell);
  }

  // если ячейки не заняты, устанаваливаем корабль туда
  const locationShips = (ship, field) => {
    ship.setCoordinatesForShip();
    const cells = field.querySelectorAll('.cell');
    const filteredCells = util.connectCellAndDeck(ship.ship, cells);
    const unSuccessPlace = filteredCells.some(it => it.dataset.busy);
    if (!unSuccessPlace) {
      arrayWithShips.push(filteredCells); // дуюлируем сюда координаты каждого корабля, чтобы в дальнейшем определять, что корабль уничтожен полностью
      filteredCells.forEach((it) => {
        it.classList.add('deck');
      });
      filteredCells.forEach((it) => markBusy(field, it));
    } else {
      return locationShips(ship, field);
    }
  }

  // для каждого игрока создаем поле, заполняем кораблями
  const initGame = () => {
    for (let i = 1; i <=  COUNT_OF_PLAYER; i ++) {
      const gameWrapper = document.querySelector('.game-wrapper');
      const fieldArea = new Field(SIDE_LENGTH);
      fieldArea.installField();
      gameWrapper.appendChild(fieldArea.field);

      for (const shipType of Object.entries(SHIPS)) {
        for(let i = 1; i <= shipType[0]; i++) {
          const ship = new Ship(shipType[1], Math.random());
          locationShips(ship, fieldArea.field);
        }
      }
    }
    const game = new Game(name);
    game.startPlaying();
  }


  // для удобства, создал класс, полностью отвечающий за логику игры
  class Game {
    constructor(name) {
      this.playerField = document.querySelector('.field:first-of-type');
      this.compField = document.querySelector('.field:last-of-type');
      this.bgc = '#3a78a1';
      this.compName = 'Компьютер';
      this.currentPlayer = document.querySelector('.main--title span');
      this.playerName = name;
      this.comment = document.querySelector('.comment p');
    }

    setPlayerName() {
      this.currentPlayer.textContent = this.playerName;
    }

    // скрываем корабли противника
    hideCompDecks() {
      const compDecks = this.compField.querySelectorAll('.deck');
      compDecks.forEach(it => it.classList.add('hidden'));
    }

    // смена имени при смене хода
    changeName() {
      let currentPlayer = document.querySelector('.main--title span');
      currentPlayer.textContent === this.playerName ? currentPlayer.textContent = this.compName : currentPlayer.textContent = this.playerName;
    }

    // навешиваем обработчики
    bind() {
      this.shoot = this.playerShoot.bind(this);
      this.compField.addEventListener('click', this.shoot);
    }

    // убираем обработчики в целях оптимизации
    unbind() {
      this.compField.removeEventListener('click', this.shoot);
    }

    // проверка на попадание
    checkForHitting(target) {
      if (target.classList.contains('deck')) {
        target.classList.add('wound');
        this.comment.textContent = 'Попадание!';
        return true;
      } else {
        target.classList.add('miss');
        this.comment.textContent = 'Промах!';
        return false;
      }
    }

    // проверка на наличие живых кораблей
    checkOnLive(field) {
      const decks = field.querySelectorAll('.deck');
      const AllShipsDestroyed =  Array.from(decks).every(it => it.classList.contains('wound'));
      if (AllShipsDestroyed) {
        field === this.compField ? showResult('Ура! Вы победили!') : showResult('Очень жаль! Вы проиграли!');
      }
    }

    // стреляет игрок
    playerShoot(evt) {
      evt.preventDefault();
      const target = evt.target;
      if (!target.classList.contains('miss') && target.classList.contains('cell')) {
        const hit = this.checkForHitting(target);
        if (!hit) {
          this.unbind();
          this.changeName();
          this.compShoot();
        } else {
          this.deleteShip(target);
          this.checkOnLive(this.compField);
        }
      }

    }

    // через 1,5 с стреляет комп
    compShoot() {
      const shoot = () => {
        const cells = this.playerField.querySelectorAll('.cell');
        const target = util.getRandomFromArray(cells);
        if (!target.classList.contains('miss') && !target.classList.contains('wound')) {
          const hit = this.checkForHitting(target);
          if (!hit) {
            this.bind();
            this.changeName();
          } else {
            this.checkOnLive(this.playerField);
            this.deleteShip(target);
            this.compShoot();
          }
        } else {
          shoot();
        }
      };
      setTimeout(shoot, 1500);

    }

    // эта функция удаляет подбитую палубу из массива с кораблями, для определения, что корабль уничтожен полностью
    deleteShip(target) {
      arrayWithShips.forEach((ship) => {
        ship.forEach((deck) => {
          if (target === deck) {
            const index = ship.indexOf(deck);
            ship.splice(index, 1);
            !ship.length ? this.isShipDestroyed(ship) : false;
          }
        })
      })
    }


    isShipDestroyed(ship) {
      this.comment.textContent = 'Корабль убит!';
    }


    // устанаваливаем имя игрока, прячем корабли компа и навешиваем обработчики
    startPlaying() {
      this.setPlayerName();
      this.hideCompDecks();
      this.bind();
    }



  }





})(window.util);


