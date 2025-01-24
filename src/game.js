const rows = 26;
const cols = 16;
const gridContainer = document.getElementById('grid');
const canvas = document.getElementById('linesCanvas');
const ctx = canvas.getContext('2d');
let ballPosition = { row: 0, col: 0 };
let holePosition = { row: 25, col: 15 };
let score = 0;
let gameOver = false;
let scoreHistory = [];
let diceRolled = false;

function createGrid() {
    gridContainer.innerHTML = ''; // Clear existing grid
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
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
    const ballCell = document.querySelector(`.dotgrid[data-row="${ballPosition.row}"][data-col="${ballPosition.col}"]`);
    if (ballCell) {
        const ballDiv = document.createElement('div');
        ballDiv.className = 'ball';
        ballCell.appendChild(ballDiv);
    }
}

function placeHole() {
    const hole = document.createElement('div');
    hole.className = 'hole';
    const holeDot = document.querySelector(`.dotgrid[data-row="${holePosition.row}"][data-col="${holePosition.col}"]`);
    holeDot.appendChild(hole);
}

function rollDice() {
    if (gameOver || diceRolled) return; // Prevent rolling the dice if the game is over or if the dice has already been rolled

    const dice = document.getElementById('dice');
    let result = Math.floor(Math.random() * 6) + 1;

    // Adjust the roll based on the current surface
    const ballCell = document.querySelector(`.dotgrid[data-row="${ballPosition.row}"][data-col="${ballPosition.col}"]`).parentElement;
    if (ballCell.classList.contains('fairway')) {
        result += 1;
    } else if (ballCell.classList.contains('bunker')) {
        result -= 1;
    }

    // Ensure the result is within the valid range
    result = Math.max(1, Math.min(result, 6));

    dice.dataset.side = result;
    dice.classList.toggle('reRoll');
    
    highlightGridPositions(result);
    diceRolled = true; // Set the flag to indicate that the dice has been rolled
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
        { row: -steps, col: 0 }, // Up
        { row: -steps, col: steps },  // Top Right
        { row: -steps, col: -steps }, // Top Left
        { row: steps, col: -steps },  // Bottom Left
        { row: steps, col: steps }  // Bottom Right
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
            highlightDiv.addEventListener('click', () => moveBallToPosition(newRow, newCol));
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
            highlightDiv.addEventListener('click', () => moveBallToPosition(adjRow, adjCol));
            adjDotDiv.parentElement.insertBefore(highlightDiv, adjDotDiv);

            console.log(`Highlighting ${adjRow}, ${adjCol}`);
        }
    });
}

function moveBallToPosition(row, col) {
    // Draw a line from the old position to the new position
    const oldBallCell = document.querySelector(`.dotgrid[data-row="${ballPosition.row}"][data-col="${ballPosition.col}"]`);
    const newBallCell = document.querySelector(`.dotgrid[data-row="${row}"][data-col="${col}"]`);
    const oldRect = oldBallCell.getBoundingClientRect();
    const newRect = newBallCell.getBoundingClientRect();
    const canvasRect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(oldRect.left + oldRect.width / 2 - canvasRect.left, oldRect.top + oldRect.height / 2 - canvasRect.top);
    ctx.lineTo(newRect.left + newRect.width / 2 - canvasRect.left, newRect.top + newRect.height / 2 - canvasRect.top);
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Remove the ball from the current position
    const currentBall = document.querySelector(`.dotgrid[data-row="${ballPosition.row}"][data-col="${ballPosition.col}"] .ball`);
    if (currentBall) {
        currentBall.remove();
    }

    // Update the ball position
    ballPosition = { row, col };

    // Place the ball at the new position
    placeBall();

    // Increment the score
    score++;
    document.getElementById('score').textContent = `Score: ${score}`;

    // Check if the ball is in the hole
    if (ballPosition.row === holePosition.row && ballPosition.col === holePosition.col) {
        gameOver = true;
        
        updateScorecard(score);
    }

    // Clear the highlights
    document.querySelectorAll('.highlight').forEach(cell => cell.remove());

    // Reset the dice rolled flag
    diceRolled = false;
}

function updateScorecard(score) {
    // Add the current score to the score history
    scoreHistory.push(score);

    // Keep only the last 9 scores
    if (scoreHistory.length > 9) {
        scoreHistory.shift();
    }

    // Update the scorecard display
    const scoreList = document.getElementById('score-list');
    scoreList.innerHTML = '';
    scoreHistory.forEach((score, index) => {
        const listItem = document.createElement('li');
        listItem.textContent = `Hole ${index + 1}: ${score}`;
        scoreList.appendChild(listItem);
    });
}

function startGame() {
    const grid = createGrid(); // Reset the grid

    // Reset the score
    score = 0;
    document.getElementById('score').textContent = `Score: ${score}`;

    // Reset game over flag
    gameOver = false;

    // Reset dice rolled flag
    diceRolled = false;

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

function rulesButton() {
    modal.style.display = "block";
}

// Modal functionality
document.addEventListener('DOMContentLoaded', (event) => {
    // Load dice.html content into the controls container
    fetch('dice.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('controls').innerHTML += data; // Append dice content instead of replacing
            document.getElementById('playGame').addEventListener('click', startGame); // Ensure event listener is added after loading dice.html
            document.getElementById('dice').addEventListener('click', rollDice); 
            document.getElementById('rulesButton').addEventListener('click', rulesButton); 

        });

    // Get the modal
    const modal = document.getElementById("rulesModal");

    // Get the button that opens the modal
    const btn = document.getElementById("rulesButton");

    // Get the <span> element that closes the modal
    const span = document.getElementsByClassName("close")[0];


    // When the user clicks on <span> (x), close the modal
    span.onclick = function() {
        modal.style.display = "none";
    }

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }
});