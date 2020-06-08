// const canvas = document.querySelector('#canvas');
//
// const ctx = canvas.getContext('2d');
//
// let width, height;
//
// const calcSize = () => {
//     width = canvas.width | 0;
//     height = canvas.height | 0;
//
//     canvas.width = width;
//     canvas.height = height;
// };
//
// canvas.onresize = calcSize;
// calcSize();

const createEmptyMatrix = (width, height, emptyValue = {}) =>
    new Array(height).fill(0).map(() => new Array(width).fill(0).map(() =>{
        if (typeof emptyValue === 'object') {
            if (Array.isArray(emptyValue)) return [...emptyValue];
            else if (emptyValue === null) return emptyValue;
            return Object.assign({}, emptyValue);
        }

        return emptyValue;
    }));

const random = (min, max) => Math.floor(Math.random() * (max - min) + min);

const forEachMatrix = (mx, cb) => mx.forEach((row, y) => row.forEach((cell, x) => cb(cell, [x, y], row, mx)));

function createGame(selector) {
    const game = document.querySelector(selector);
    if (!game)
        throw new Error(`Element with selector ${selector} doesn't exist`);

    const clear = () => [...game.children].forEach(child => child.remove());

    function newGame() {
        const nav = document.createElement('div');
        nav.classList.add('nav');

        const matrix = createEmptyMatrix(24, 1, { checked: false, ref: null, value: null });

        let gameEnded = false;

        let tableInitialized = false;
        function drawTable() {
            const table = document.createElement('table');
            for (const row of matrix) {
                const tr = document.createElement('tr');

                for (const cell of row) {
                    const td = cell.ref || document.createElement('td');
                    cell.ref = td;

                    td.onclick = function () {
                        if (gameEnded) return;

                        const checked = !cell.checked;
                        cell.checked = checked;

                        if (checked)
                            td.classList.add('checked');
                        else
                            td.classList.remove('checked');
                    }

                    if (typeof cell.value === 'number') {
                        td.innerText = String(cell.value);

                        const condition = cell.checked
                            ? cell.odd
                            : cell.even;

                        td.classList.add(condition ? 'correct' : 'incorrect');
                        cell.correct = condition;
                    }

                    if (!tableInitialized)
                        tr.appendChild(td);
                }

                if (!tableInitialized)
                    table.appendChild(tr);
            }

            if (!tableInitialized)
                game.appendChild(table);

            tableInitialized = true;
        }

        function drawScore() {
            const scoreDiv = document.createElement('div');
            scoreDiv.classList.add('score');

            let score = 0;
            forEachMatrix(matrix, cell => cell.correct ? score++ : score--);

            scoreDiv.innerText = `Счёт: ${score}`;

            if (score > 0)
                scoreDiv.classList.add('positive');
            else if (score < 0)
                scoreDiv.classList.add('negative');

            nav.appendChild(scoreDiv);
        }

        function drawReloadButton() {
            const button = document.createElement('div');
            button.classList.add('reload');
            button.onclick = function () {
                clear();
                newGame();
            }

            nav.appendChild(button);
        }

        let buttonClicked = false;
        function drawButton() {
            const button = document.createElement('div');
            button.classList.add('button');
            button.innerText = 'Проверить';

            button.onclick = function () {
                gameEnded = true;

                if (buttonClicked) return;
                buttonClicked = true;

                forEachMatrix(matrix, cell => {
                    cell.value = random(1, 24);
                    cell.odd = cell.value % 2 === 0;
                    cell.even = !cell.odd;
                });

                drawTable();
                drawReloadButton();
                drawScore();

                button.remove();
            }

            nav.appendChild(button);
        }

        drawTable();

        game.appendChild(nav);
        drawButton();
    }

    clear();
    newGame();
}

createGame('.game');

