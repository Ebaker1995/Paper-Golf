const rows = 26;
const cols = 16;
const gridContainer = document.getElementById('grid');
let ballPosition = { row: 0, col: 0 };
let holePosition = { row: 25, col: 15 };

function createGrid() {
    gridContainer.innerHTML = ''; // Clear existing grid
    const surfaceTypes = ['fairway', 'bunker', 'rough'];
    const grid = Array.from({ length: rows }, () => Array(cols).fill(''));

    function placePatch(type, size) {
        let startRow, startCol, isValid;
        do {
            startRow = Math.floor(Math.random() * (rows - size));
            startCol = Math.floor(Math.random() * (cols - size));
            isValid = true;
            for (let i = startRow; i < startRow + size; i++) {
                for (let j = startCol; j < startCol + size; j++) {
                    if (type === 'green' && grid[i][j] === 'fairway') {
                        isValid = false;
                    }
                    if (type === 'fairway' && grid[i][j] === 'green') {
                        isValid = false;
                    }
                }
            }
        } while (!isValid);

        for (let i = startRow; i < startRow + size; i++) {
            for (let j = startCol; j < startCol + size; j++) {
                grid[i][j] = type;
            }
        }
    }

    // Place fairway patches
    placePatch('fairway', 2);
    placePatch('fairway', 3);
    placePatch('fairway', 5);
    placePatch('fairway', 3);
    placePatch('fairway', 8);

    // Place bunker patches
    placePatch('bunker', 3);

    // Place rough patches
    placePatch('rough', 4);
    placePatch('rough', 4);

    // Place green
    placePatch('green', 6);

    // Fill remaining cells with rough
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            if (!grid[i][j]) {
                grid[i][j] = 'rough';
            }
        }
    }

    // Create grid elements
    for (let i = 0; i < rows; i++) {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'row';
        for (let j = 0; j < cols; j++) {
            const cellDiv = document.createElement('div');
            cellDiv.className = 'cell';
            const surfaceDiv = document.createElement('div');
            surfaceDiv.className = grid[i][j];
            surfaceDiv.classList.add('surface');
            const dotDiv = document.createElement('div');
            dotDiv.className = 'dotgrid';
            dotDiv.dataset.row = i;
            dotDiv.dataset.col = j;
            cellDiv.appendChild(surfaceDiv);
            cellDiv.appendChild(dotDiv);
            rowDiv.appendChild(cellDiv);
        }
        gridContainer.appendChild(rowDiv);
    }
    console.log({grid});
    return grid;
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
//Not working properly
// function moveBall(steps) {
//     const currentDot = document.querySelector(`.dotgrid[data-row="${ballPosition.row}"][data-col="${ballPosition.col}"] .ball`);
//     if (currentDot) {
//         currentDot.remove();
//     }

//     // Example movement logic: move right by steps
//     ballPosition.col = (ballPosition.col + steps) % cols;

//     placeBall();
// }

function rollDice() {
    
    const dice = document.getElementById('dice');
    const result = Math.floor(Math.random() * 6) + 1;
    dice.dataset.side = result;
    dice.classList.toggle('reRoll');
    
    // moveBall(result);
    highlightGridPositions(result);
    console.log(result);
    
}
function highlightGridPositions(steps) {
    // Clear previous highlights
    document.querySelectorAll('.highlight').forEach(cell => cell.remove());

    // Check if the ball is in the fairway
    const ballCell = document.querySelector(`.dotgrid[data-row="${ballPosition.row}"][data-col="${ballPosition.col}"]`).parentElement;
    const isInFairway = ballCell.classList.contains('fairway');
    console.log(`Ball is in fairway: ${isInFairway}`);

    // Highlight new positions in a straight line
    const directions = [
        { row: 0, col: steps },  // Right
        { row: 0, col: -steps }, // Left
        { row: steps, col: 0 },  // Down
        { row: -steps, col: 0 }  // Up
    ];

    directions.forEach(direction => {
        let newRow = ballPosition.row + direction.row;
        let newCol = ballPosition.col + direction.col;

        if (isInFairway) {
            newRow += Math.sign(direction.row);
            newCol += Math.sign(direction.col);
        }

        if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols) {
            const dotDiv = document.querySelector(`.dotgrid[data-row="${newRow}"][data-col="${newCol}"]`);
            const highlightDiv = document.createElement('div');
            highlightDiv.className = 'highlight';
            dotDiv.parentElement.insertBefore(highlightDiv, dotDiv);
        }
    });

    // Highlight surrounding positions around the ball
    const surroundingDirections = [
        { row: 0, col: 1 },  // Right
        { row: 1, col: 1 },  // Top Right
        { row: -1, col: -1 }, // Bottom Left
        { row: 1, col: -1 }, // Bottom Right
        { row: 0, col: -1 }, // Left
        { row: -1, col: 1 }, // Top Left
        { row: 1, col: 0 },  // Down
        { row: -1, col: 0 }  // Up
    ];

    surroundingDirections.forEach(direction => {
        const adjRow = ballPosition.row + direction.row;
        const adjCol = ballPosition.col + direction.col;
        if (adjRow >= 0 && adjRow < rows && adjCol >= 0 && adjCol < cols) {
            const adjDotDiv = document.querySelector(`.dotgrid[data-row="${adjRow}"][data-col="${adjCol}"]`);
            const highlightDiv = document.createElement('div');
            highlightDiv.className = 'highlight';
            adjDotDiv.parentElement.insertBefore(highlightDiv, adjDotDiv);
        }
    });
}

function startGame() {
    const grid = createGrid(); // Reset the grid

    // Find a fairway position for the ball
    let ballRow, ballCol;
    do {
        ballRow = Math.floor(Math.random() * rows);
        ballCol = Math.floor(Math.random() * cols);
    } while (grid[ballRow][ballCol] !== 'fairway');

    // Find a green position for the hole that is at least 10 spaces away from the ball
    let holeRow, holeCol;
    do {
        holeRow = Math.floor(Math.random() * rows);
        holeCol = Math.floor(Math.random() * cols);
    } while (grid[holeRow][holeCol] !== 'green' || Math.abs(holeRow - ballRow) + Math.abs(holeCol - ballCol) < 10);

    ballPosition = { row: ballRow, col: ballCol };
    holePosition = { row: holeRow, col: holeCol };

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
            document.getElementById('dice').addEventListener('click', rollDice); // Add event listener for dice click
        });
});