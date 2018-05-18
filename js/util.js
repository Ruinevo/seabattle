'use strict';
// данный модуль с утилитными функциями 

window.util = (() => {



  // отрисовка экрана
  const renderScreen = (view) => {
    const app = document.querySelector(`.app`);
    app.innerHTML = ``;
    app.appendChild(view);
  };

  // получаем случайный элемент из массива
  const getRandomFromArray = (possibleValues) => {
    const randomIndex = Math.floor(Math.random() * possibleValues.length);
    return possibleValues[randomIndex];
  };

  // получаем случайный элемент из диапазона
  const getRandomFromRange = (min, max) => {
    return (Math.floor(Math.random() * (max - min + 1)) + min);
  }

  // Разбивает массив на подмассивы
  const splitArrayIntoParts = (array, size) => {
    const trueArray = Array.from(array);
    let result = [];
    for (let i = 0; i < Math.ceil(trueArray.length / size); i++) {
      result.push(trueArray.slice((i * size), (i * size) + size));
    }
    return result;
  }

  // функция возвращает массив ячеек с координатами, совпадающими с координатами палуб корабля
  const connectCellAndDeck = (ship, cells) => {
    const result = [];
    ship.forEach((elem) => {
      const element = Array.from(cells).find(cell => cell.dataset.x === String(elem.x) && cell.dataset.y === String(elem.y));
      result.push(element);
    });
    return result;
  };



  /* функция берет 1 ячейку с ее координатами и помечает все неотмеченные ячейки воокруг нее, как занятые
    ничего умнее не придумал, в дальнейшем планирую использовать ее для создания подобия ИИ у компа.
    чтобы он обстреливал воокрег подбитых палуб */
    
  const markNearestCells = (field, cell) => {

    const mark = (current) => {
      if (current.x <= 10 && current.y <= 10 && current.x > 0 && current.y > 0) {
        const cells = field.querySelectorAll('.cell');
        const element = Array.from(cells).find(cell => cell.dataset.x === String(current.x) && cell.dataset.y === String(current.y));
        !element.dataset.busy ? element.dataset.busy = true: false;
      }
    }


    const current = {};
    const x = Number(cell.dataset.x);
    const y = Number(cell.dataset.y);

    current.x = x;
    current.y = y + 1;
    mark(current);


    current.x = x;
    current.y = y - 1;
    mark(current);



    current.x = x - 1;
    current.y = y;
    mark(current);


    current.x = x + 1;
    current.y = y;
    mark(current);


    current.x = x - 1;
    current.y = y + 1;
    mark(current);



    current.x = x - 1;
    current.y = y - 1;
    mark(current);



    current.x = x + 1;
    current.y = y - 1;
    mark(current);



    current.x = x + 1;
    current.y = y + 1;
    mark(current);

  }


  return {
    renderScreen,
    getRandomFromArray,
    getRandomFromRange,
    splitArrayIntoParts,
    connectCellAndDeck,
    markNearestCells
  }

})();


