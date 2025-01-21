const rows = 26;
const cols = 16;
const gridContainer = document.getElementById('grid');
let ballPosition = { row: 0, col: 0 };
let holePosition = { row: 25, col: 15 };

function createGrid() {
    gridContainer.innerHTML = ''; // Clear existing grid
    for (let i = 0; i < rows; i++) {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'row';
        for (let j = 0; j < cols; j++) {
            const dotDiv = document.createElement('div');
            dotDiv.className = 'dotgrid';
            dotDiv.dataset.row = i;
            dotDiv.dataset.col = j;
            rowDiv.appendChild(dotDiv);
        }
        gridContainer.appendChild(rowDiv);
    }
}

function placeBall() {
    const ball = document.createElement('div');
    ball.className = 'ball';
    const initialDot = document.querySelector(`.dotgrid[data-row="${ballPosition.row}"][data-col="${ballPosition.col}"]`);
    initialDot.appendChild(ball);
}

function placeHole() {
    const hole = document.createElement('div');
    hole.className = 'hole';
    const holeDot = document.querySelector(`.dotgrid[data-row="${holePosition.row}"][data-col="${holePosition.col}"]`);
    holeDot.appendChild(hole);
}

function moveBall(steps) {
    const currentDot = document.querySelector(`.dotgrid[data-row="${ballPosition.row}"][data-col="${ballPosition.col}"] .ball`);
    if (currentDot) {
        currentDot.remove();
    }

    // Example movement logic: move right by steps
    ballPosition.col = (ballPosition.col + steps) % cols;

    placeBall();
}

function rollDice() {
    const dice = document.getElementById('dice');
    const result = Math.floor(Math.random() * 6) + 1;
    dice.dataset.side = result;
    dice.classList.toggle('reRoll');
    document.getElementById('diceResult').textContent = `You rolled a ${result}`;
    moveBall(result);
}

function startGame() {
    ballPosition = { row: 0, col: 0 };
    holePosition = { row: 25, col: 15 };
    
    placeBall();
    placeHole();
}

document.addEventListener('DOMContentLoaded', (event) => {
    // Load dice.html content into the controls container
    fetch('dice.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('controls').innerHTML += data; // Append dice content instead of replacing
            document.getElementById('playGame').addEventListener('click', startGame); // Ensure event listener is added after loading dice.html
        });
});
createGrid();