class Hole {
    constructor(left, top, fishCount) {
        this.left = left;
        this.top = top;
        this.fishCount = fishCount;
    }

    checkCollision(index, floatX, floatY) {
        const hole = document.getElementById('hole ' + index);
        const holeRect = hole.getBoundingClientRect();
        const holeLeft = holeRect.left;
        const holeRight = holeRect.right;
        const _holeTop = holeRect.top;
        const holeBottom = holeRect.bottom;

        if (floatX >= holeLeft && floatX <= holeRight && floatY >= _holeTop && floatY <= holeBottom) {
            return true; // Collision detected
        }
        return false; // No collision
    }

    isInHole(index) {
        removeControl();
        const hole = document.getElementById('hole ' + index);
        if (this.fishCount != 0)
            startFishing(this, hole);
    }
}

const progressBar = document.getElementById('progress-gradient-wrapper');
const endGameContainer = document.getElementById('endGameBackground');
const recordTable = document.getElementById('record-table');
const throwScale = document.getElementById('throw-scale');
const addName = document.getElementById('submit-score');
const float = document.getElementById('float');
const player = document.getElementById('player');
const land = document.getElementById('land');
let score = document.getElementById('score-count');
let bait = document.getElementById('bait-count');
let scoreValue = parseInt(score.innerText);
let baitValue = parseInt(bait.innerText);
let backroundHeight = document.getElementById('backround').clientHeight;
let backroundWidth = document.getElementById('backround').clientWidth;
let _top = backroundHeight - land.clientHeight / 2;
let left = backroundWidth / 2 - land.clientHeight / 2;
let currSpriteIndex = 0;
let holdDelay = 200;
let holesAmount = 3;
let progress = 0;
let intervalSprite;
let intervalThrow;
let leftPercent;
let _topPercent;
let holdTimeout;


const holes = [];
let sprite = [];

/* EventListeners */
document.getElementById('game-wrapper').addEventListener('mouseup', () => {
    clearInterval(intervalSprite);
    currSpriteIndex = 0;
    changeSprite(currSpriteIndex, sprite);
});

document.getElementById('reload-button').addEventListener('click', () => {
    resetGameState();
});

addName.addEventListener('click', function () {
    const playerName = document.getElementById('player-name').value;
    if (playerName) {
        saveRecords(playerName, scoreValue);

        const endGameContainer = document.getElementById('endGameBackground');
        endGameContainer.style.display = 'none';
    } else {
        alert('Будь ласка, введіть ваше ім\'я');
    }
    resetGameState();
});

window.addEventListener('resize', adaptPosition);

/* Ajax */
await HttpClient.getJson('database/player.json').then((response) => {
    for (let i in response)
        sprite[i] = response[i].img;
    changeSprite(currSpriteIndex, sprite);
});

/* Function calls */
addControl();
loadRecords();
holegeneration();
updatePosition();
adaptPosition();

/* Functions */
async function resetGameState() {
    scoreValue = 0;
    baitValue = 10;
    score.innerHTML = scoreValue;
    bait.innerHTML = baitValue;

    document.getElementById('lake').innerHTML = '';
    document.getElementById('record-container').innerHTML = '';
    document.getElementById('game').style.display = 'none';
    endGameContainer.style.display = 'none';
    float.style.opacity = 0;
    float.style.top = '';
    loadRecords();
    clearInterval(intervalSprite);
    clearInterval(intervalThrow);

    holes.length = 0;
    sprite.length = 0;
    currSpriteIndex = 0;
    progress = 0;

    await HttpClient.getJson('database/player.json').then((response) => {
        for (let i in response)
            sprite[i] = response[i].img;
        changeSprite(currSpriteIndex, sprite);
    });

    _top = backroundHeight - land.clientHeight / 2;
    left = land.clientWidth / 2 - 50;
    updatePosition();
    holegeneration();
    addControl();
    window.addEventListener('resize', adaptPosition);
}

function updatePosition() {
    player.style.left = `${left}px`;
    player.style.top = `${_top}px`;
    adaptPosition();
}

function adaptPosition() {
    //document.getElementById('wrapper').style.height = window.innerWidth * 16 / 9;
    backroundWidth = document.getElementById('backround').clientWidth;
    if (player.style.left.includes('px'))
        leftPercent = (left / backroundWidth) * 100;
    player.style.left = `${leftPercent}%`;

    if (player.style.top.includes('px'))
        _topPercent = (_top / backroundHeight) * 100;
    player.style.top = `${_topPercent}%`;
}

function throwAnimation(event) {
    if (event.button === 0)
        intervalSprite = setInterval(() => {
            changeSprite(currSpriteIndex, sprite);
        }, 300);
}

function keydownHandler(event) {
    if (player.style.left.includes('%'))
        left = backroundWidth * (parseFloat(player.style.left) / 100);
    if (player.style.top.includes('%'))
        _top = backroundHeight * (parseFloat(player.style.top) / 100);
    const step = 10;
    switch (event.key) {
        case 'ArrowLeft':
            left -= step;
            break;
        case 'ArrowRight':
            left += step;
            break;
    }
    _top = Math.max(backroundHeight - land.clientHeight + player.clientWidth / 2, Math.min(_top, window.innerHeight - player.clientHeight / 2));
    left = Math.max(player.clientWidth / 2, Math.min(left, land.clientWidth - player.clientWidth / 2));
    updatePosition();
}

function changeSprite(SpriteIndex, sprite) {
    if (currSpriteIndex === sprite.length) {
        clearInterval(intervalSprite);
        return;
    }
    player.style.backgroundImage = `url(${sprite[SpriteIndex]})`;
    currSpriteIndex++;
}

function baitdecriment(event) {
    if (event.button === 0)
        baitValue--;
    if (baitValue >= 0)
        bait.innerHTML = baitValue;
}

function updateRecordsDisplay(recordName, recordScore) {
    const recordContainer = document.getElementById('record-container');
    const recordElement = window.document.createElement('div');

    recordElement.className = 'record';
    recordElement.textContent = `${recordName}: ${recordScore} очок`;
    recordContainer.appendChild(recordElement);
}

function saveRecords(name, score) {
    const recordsString = localStorage.getItem('records');

    const recordsPlayer = JSON.parse(recordsString) || [];
    const existedPlayer = recordsPlayer.findIndex((el) => el.name == name);

    if (existedPlayer != -1 && score > recordsPlayer[existedPlayer].score) {
        recordsPlayer[existedPlayer].score = score;
        localStorage.setItem('records', JSON.stringify(recordsPlayer));
        return;
    }

    recordsPlayer.push({ name, score });
    localStorage.setItem('records', JSON.stringify(recordsPlayer));
}

function loadRecords() {
    const recordsString = localStorage.getItem('records');
    const recordsPlayer = JSON.parse(recordsString) || [];
    recordsPlayer.sort((a, b) => b.score - a.score);

    for (let item of recordsPlayer) {
        updateRecordsDisplay(item.name, item.score);
    }
}

function showThrowScale() {
    throwScale.style.display = 'block';
    progressBar.style.height = '0%';
    intervalThrow = setInterval(updateProgress, 30);
    progress = 0;
}

function hideThrowScale() {
    throwScale.style.display = 'none';
    progressBar.style.height = '0%';
    clearInterval(intervalThrow);
    throwFloat(progress);
    progress = 0;
}

function updateProgress() {
    if (progress < 100) {
        progress++;
        progressBar.style.height = `${progress}%`;
    } else {
        hideThrowScale();
    }
}

function startProgress(event) {
    if (event.button === 0 && (float.style.top == '' || float.style.top == '0px'))
        showThrowScale();
}

function resetProgress(event) {
    if (event.button === 0) {
        hideThrowScale();
    }
}

function throwFloat(progress) {
    float.style.top = `${-(backroundHeight - land.clientHeight / 2) * progress / 100}px`;
    if (progress > 0) {
        window.document.removeEventListener('keydown', keydownHandler);
        float.style.opacity = 1;
    }
    else {
        window.document.addEventListener('keydown', keydownHandler);
        float.style.opacity = 0;
    }

    const floatRect = float.getBoundingClientRect();
    const floatX = floatRect.left + (float.clientWidth / 2);
    const floatY = floatRect.top + (float.clientHeight / 2);
    checkHoleCollision(floatX, floatY);

    isFishing = true;
}

function holegeneration() {
    const lake = document.getElementById('lake');
    lake.innerHTML = '';

    for (let i = 0; i < holesAmount; i++) {
        let left = Math.random() * 80;
        let _top = Math.random() * 70;

        const fishCount = Math.floor(Math.random() * 3) + 2;
        const hole = new Hole(left, _top, fishCount);
        holes.push(hole);

        const lakearea = window.document.createElement('div');
        lakearea.className = 'hole';
        lakearea.id = 'hole ' + i;

        for (let j = 0; j < i; j++) {
            let holeSize = document.querySelector('.hole').clientWidth;
            let holeWidth = holeSize / backroundWidth * 100;
            let holeHeight = holeSize / backroundHeight * 100;

            while (
                Math.abs(parseFloat(document.getElementById(`hole ${j}`).style.left) - left) < holeWidth &&
                Math.abs(parseFloat(document.getElementById(`hole ${j}`).style.top) - _top) < holeHeight
            ) {
                left = Math.random() * 80;
                _top = Math.random() * 70;
            }
        }

        lakearea.style.left = `${left}%`;
        lakearea.style.top = `${_top}%`;

        const holeImage = window.document.createElement('img');
        holeImage.src = './img/gameSprites/hole.png';

        lakearea.appendChild(holeImage);
        lake.appendChild(lakearea);
    }
    return holes;
}

function checkHoleCollision(floatX, floatY) {
    for (let i = 0; i < holes.length; i++) {
        if (holes[i].checkCollision(i, floatX, floatY)) {
            holes[i].isInHole(i);
            break;
        }
        if (!holes[i].checkCollision(i, floatX, floatY) && baitValue === 0 && i === holes.length - 1)
            endGame();
    }
}

function moveFish(hole) {
    const fish = window.document.createElement('div');
    fish.className = 'fish';

    const fishImage = window.document.createElement('img');
    fishImage.src = './img/gameSprites/fish.png';

    fish.appendChild(fishImage);
    hole.appendChild(fish);

    const duration = 50;

    setTimeout(() => {
        const holeRect = hole.getBoundingClientRect();
        const playerRect = player.getBoundingClientRect();

        const holeCenterX = holeRect.left + (holeRect.width / 2);
        const holeCenterY = holeRect.top + (holeRect.height / 2);

        const deltaX = 0;
        const deltaY = -50;

        fish.style.left = `${fish.offsetLeft}px`;
        fish.style.top = `${fish.offsetTop}px`;
        const steps = 20;

        let step = 0;
        moveStep();

        function moveStep() {
            if (step < steps) {
                let newX = parseFloat(fish.style.left) + deltaX / steps;
                let newY = parseFloat(fish.style.top) + deltaY / steps;

                fish.style.left = `${newX}px`;
                fish.style.top = `${newY}px`;

                step++;
                requestAnimationFrame(moveStep);
            } else {
                fish.remove();
            }
        }
    }, duration);
}

function endGame() {
    endGameContainer.style.display = 'flex';
    removeControl();
    float.style.opacity = 0;
    float.style.top = '';
}

function handleMouseDown(event) {
    if (event.button !== 0 || !(float.style.top == '' || float.style.top == '0px')) return;

    holdTimeout = setTimeout(() => {
        throwAnimation(event);
        startProgress(event);
        baitdecriment(event);
    }, holdDelay);
}

function handleMouseUp(event) {
    if (event.button !== 0) return;

    clearTimeout(holdTimeout);
    resetProgress(event);
}

function addControl() {
    const gameWrapper = document.getElementById('game-wrapper');
    gameWrapper.addEventListener('mousedown', handleMouseDown);
    gameWrapper.addEventListener('mouseup', handleMouseUp);
    window.document.addEventListener('keydown', keydownHandler);
}

function removeControl() {
    const gameWrapper = document.getElementById('game-wrapper');
    gameWrapper.removeEventListener('mousedown', handleMouseDown);
    gameWrapper.removeEventListener('mouseup', handleMouseUp);
    window.document.removeEventListener('keydown', keydownHandler);
}

function startFishing(fishAmount, hole) {
    const game = document.getElementById('game');
    game.style.display = 'flex';
    isFishing = true;
    removeControl();

    (function (isFishing) {
        let gameOver = false;

        // --------------
        // Animation loop
        // --------------

        function animationLoop() {
            if (!gameOver && isFishing) {
                indicator.updateIndPosition();
                indicator.detectCollision();
                progressBar.updateUi();
                progressBar.detectGameEnd();
                fish.updateFishPosition();
                requestAnimationFrame(animationLoop);
            }
        }

        // ---------
        // Indicator
        // ---------

        class Indicator {
            constructor() {
                this.indicator = document.querySelector('.indicator');
                this.height = this.indicator.clientHeight;
                this.y = 0;
                this.velocity = 0;
                this.acceleration = 0;
                this.topBounds = (gameBody.clientHeight * -1) + 70;
                this.bottomBounds = 0;
            }

            applyForce(force) {
                this.acceleration += force;
            }

            updateIndPosition() {
                if (!isFishing) return;

                this.velocity += this.acceleration;
                this.y += this.velocity;

                //  Reset acceleration
                this.acceleration = 0;

                // Change direction when hitting the bottom + add friction
                if (this.y > this.bottomBounds) {
                    this.y = 0;
                    this.velocity = 0; // Вимкнено інерцію, встановлено швидкість на нуль
                }

                // Prevent from going beyond the _top
                // Don't apply button forces when beyond the _top
                if (this.y < this.topBounds) {
                    this.y = this.topBounds;
                    this.velocity = 0; // Вимкнено інерцію, встановлено швидкість на нуль
                } else {
                    if (keyPressed) {
                        this.applyForce(-0.2);
                    }
                }

                // Apply constant force
                this.applyForce(0.1);

                // Update object position
                this.indicator.style.transform = `translateY(${this.y}px)`;
            }

            detectCollision() {
                if (!isFishing) return;

                if (
                    fish.y < this.y && fish.y > this.y - this.height ||
                    fish.y - fish.height < this.y && fish.y - fish.height > this.y - this.height
                ) {
                    progressBar.fill();
                    window.document.body.classList.add('collision');
                } else {
                    progressBar.drain();
                    window.document.body.classList.remove('collision');
                }
            }
        }

        // ----
        // Fish
        // ----

        class Fish {
            constructor() {
                this.fish = document.querySelector('.fish');
                this.height = this.fish.clientHeight;
                this.y = 3;
                this.direction = null;
                this.randomPosition = null;
                this.randomCountdown = null;
                this.speed = 1;
            }

            resetPosition() {
                this.y = 5;
            }

            updateFishPosition() {
                if (!isFishing) return;

                if (!this.randomPosition || this.randomCountdown < 0) {
                    this.randomPosition = Math.ceil(Math.random() * (gameBody.clientHeight - this.height)) * -1;
                    this.randomCountdown = Math.abs(this.y - this.randomPosition);
                    this.speed = Math.abs(Math.random() * (2 - 1) + 1);
                };

                if (this.randomPosition < this.y) {
                    this.y -= this.speed;
                } else {
                    this.y += this.speed;
                }

                this.fish.style.transform = `translateY(${this.y}px)`;
                this.randomCountdown -= this.speed;
            }
        }

        // ------------
        // Progress bar
        // ------------

        class ProgressBar {
            constructor() {
                this.wrapper = document.querySelector('.progress-bar');
                this.progressBar = this.wrapper.querySelector('.progress-gradient-wrapper');
                this.progress = 50;
            }

            reset() {
                this.progress = 50;
            }

            drain() {
                if (!isFishing) return;
                if (this.progress > 0) this.progress -= 0.4;
                if (this.progress < 1) this.progress = 0;
            }

            fill() {
                if (!isFishing) return;
                if (this.progress < 100) this.progress += 0.3;
            }

            detectGameEnd() {
                if (!isFishing) return;
                if (!(this.progress < 100 && this.progress > 0)) {
                    gameOver = true;
                    let isWinning;
                    if (this.progress >= 100)
                        isWinning = true;
                    else
                        isWinning = false;
                    endFishing(isWinning);
                }
            }

            updateUi() {
                this.progressBar.style.height = `${this.progress}%`
            }
        }

        // -----------
        // Application
        // -----------

        const gameBody = document.querySelector('.game-body');
        let keyPressed = false;
        const indicator = new Indicator();
        const progressBar = new ProgressBar();
        const fish = new Fish();

        // ------------
        // Mouse events
        // ------------

        document.getElementById('game-wrapper').addEventListener('mousedown', indicatorActive);
        document.getElementById('game-wrapper').addEventListener('mouseup', indicatorInactive);
        document.getElementById('game-wrapper').addEventListener('keyup', indicatorInactive);
        document.addEventListener('keydown', indicatorActive);

        function indicatorActive() {
            if (!isFishing) return;
            if (!keyPressed) {
                keyPressed = true;
                window.document.body.classList.add('indicator-active');
            }
        }

        function indicatorInactive() {
            if (!isFishing) return;
            if (keyPressed) {
                keyPressed = false;
                window.document.body.classList.remove('indicator-active');
            }
        }

        // ----------
        // Reset game
        // ----------

        const game = document.getElementById('game');

        // ----------------
        // Success timeline
        // ----------------

        function endFishing(isWinning) {
            setTimeout(() => {
                addControl();
            }, 0);
            game.style.display = 'none';
            float.style.opacity = 0;
            float.style.top = '';

            if (isWinning) {
                scoreValue += 10;
                score.innerHTML = scoreValue;
                fishAmount.fishCount--;
                moveFish(hole, float);
            }

            if (fishAmount.fishCount === 0) {
                setTimeout(() => {
                    hole.style.display = 'none';
                }, 2000);
            }
            if (baitValue === 0)
                endGame();
        }

        // -------------
        // Initiate loop
        // -------------

        animationLoop();

    })(isFishing);
    
    // -----------------
    // Reel line tension
    // -----------------

    (function (isFishing) {
        let line = null;
        const canvas = document.querySelector('[data-element="reel-line-tension"]');
        canvas.width = canvas.clientWidth * 2;
        canvas.height = canvas.clientHeight * 2;
        const context = canvas.getContext('2d');

        function animationLoop() {
            if (!isFishing) return;

            clearCanvas();
            line.draw();
            line.animate();

            requestAnimationFrame(animationLoop);
        }

        function clearCanvas() {
            context.clearRect(0, 0, canvas.width, canvas.height);
        }

        class Line {
            constructor() {
                this.tension = 0;
                this.tensionDirection = 'right';
            }

            draw() {
                context.beginPath();
                context.strokeStyle = "#18343d";
                context.lineWidth = 1.3;
                context.moveTo(canvas.width, 0);
                context.bezierCurveTo(
                    canvas.width, canvas.height / 2 + this.tension,
                    canvas.width / 2, canvas.height + this.tension,
                    0, canvas.height
                );
                context.stroke();
            }

            animate() {
                if (window.document.body.classList.contains('collision')) {
                    if (this.tension > -30) this.tension -= 8;
                } else {
                    if (this.tension < 0) this.tension += 4;
                }
            }
        }

        line = new Line();
        animationLoop()
    })(isFishing);

}
