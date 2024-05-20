class Hole {
    constructor(left, top, fishCount) {
        this.left = left;
        this.top = top;
        this.fishCount = fishCount;
    }

    checkCollision(index, floatX, floatY) {
        const hole = document.getElementById("hole " + index);
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
        document.getElementById('game-wrapper').removeEventListener('mousedown', throwAnimation);
        document.getElementById('game-wrapper').removeEventListener('mousedown', startProgress);
        document.getElementById('game-wrapper').removeEventListener('mousedown', baitdecriment);
        document.getElementById('game-wrapper').removeEventListener('mouseup', resetProgress);
        const hole = document.getElementById("hole " + index);
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
const obj = document.getElementById('player');
const land = document.getElementById('land');
let score = document.getElementById('score-count');
let bait = document.getElementById('bait-count');
let scoreValue = parseInt(score.innerText);
let baitValue = parseInt(bait.innerText);
let _top = window.innerHeight - land.clientHeight / 2;
let left = land.clientWidth / 2 - 50;
let currSpriteIndex = 0;
let holesAmount = 2;
let progress = 0;
let intervalSprite;
let intervalThrow;
let leftPercent;

const holes = [];
let sprite = [];

/* EventListeners */
document.getElementById('game-wrapper').addEventListener('mouseup', () => {
    clearInterval(intervalSprite);
    currSpriteIndex = 0;
    changeSprite(currSpriteIndex, sprite);
});

document.getElementById('reload-button').addEventListener('click', () => {
    // Скинути всі необхідні змінні та стани
    resetGameState();
});

document.getElementById('game-wrapper').addEventListener('mousedown', throwAnimation);
document.getElementById('game-wrapper').addEventListener('mousedown', startProgress);
document.getElementById('game-wrapper').addEventListener('mousedown', baitdecriment);
window.document.addEventListener('keydown', keydownHandler);
document.getElementById('game-wrapper').addEventListener('mouseup', resetProgress);
window.addEventListener('resize', adaptPosition);

/* Ajax */
await HttpClient.getJson("database/player.json").then((response) => {
    for (let i in response)
        sprite[i] = response[i].img;
    changeSprite(currSpriteIndex, sprite);
});

/* Function calls */
loadRecords();
updatePosition();
holegeneration();
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
    float.style.top = "";
    loadRecords();
    clearInterval(intervalSprite);
    clearInterval(intervalThrow);

    holes.length = 0;
    sprite.length = 0;
    currSpriteIndex = 0;
    progress = 0;

    await HttpClient.getJson("database/player.json").then((response) => {
        for (let i in response)
            sprite[i] = response[i].img;
        changeSprite(currSpriteIndex, sprite);
    });

    _top = window.innerHeight - land.clientHeight / 2;
    left = land.clientWidth / 2 - 50;
    updatePosition();
    holegeneration();

    document.getElementById('game-wrapper').addEventListener('mousedown', throwAnimation);
    document.getElementById('game-wrapper').addEventListener('mousedown', startProgress);
    document.getElementById('game-wrapper').addEventListener('mousedown', baitdecriment);
    window.document.addEventListener('keydown', keydownHandler);
    document.getElementById('game-wrapper').addEventListener('mouseup', resetProgress);
    window.addEventListener('resize', adaptPosition);
}

function updatePosition() {
    obj.style.left = `${left}px`;
    obj.style.top = `${_top}px`;
    adaptPosition();
}

function adaptPosition() {
    if (obj.style.left.includes('px'))
        leftPercent = (left / window.innerWidth) * 100;
    obj.style.left = `${leftPercent}%`;
}

function throwAnimation(event) {
    if (event.button === 0)
        intervalSprite = setInterval(() => {
            changeSprite(currSpriteIndex, sprite);
        }, 300);
}

function keydownHandler(event) {
    if (obj.style.left.includes('%'))
        left = window.innerWidth * (parseFloat(obj.style.left) / 100);
    const step = 10;
    switch (event.key) {
        case 'ArrowLeft':
            left -= step;
            break;
        case 'ArrowRight':
            left += step;
            break;
    }
    _top = Math.max(window.innerHeight - land.clientHeight + obj.clientWidth / 2, Math.min(_top, window.innerHeight - obj.clientHeight / 2));
    left = Math.max(obj.clientWidth / 2, Math.min(left, land.clientWidth - obj.clientWidth / 2));
    updatePosition();
}

function changeSprite(SpriteIndex, sprite) {
    if (currSpriteIndex === sprite.length) {
        clearInterval(intervalSprite);
        return;
    }
    obj.style.backgroundImage = `url(${sprite[SpriteIndex]})`;
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

    const recordsObj = JSON.parse(recordsString) || [];
    const existedObj = recordsObj.findIndex((el) => el.name == name);

    if (existedObj != -1 && score > recordsObj[existedObj].score) {
        recordsObj[existedObj].score = score;
        localStorage.setItem('records', JSON.stringify(recordsObj));
        return;
    }

    recordsObj.push({ name, score });
    localStorage.setItem('records', JSON.stringify(recordsObj));
}

function loadRecords() {
    const recordsString = localStorage.getItem('records');
    const recordsObj = JSON.parse(recordsString) || [];

    for (let item of recordsObj) {
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
    if (event.button === 0) {
        showThrowScale();
    } else if (event.button === 1) {
        window.document.addEventListener('keydown', keydownHandler);
        float.style.top = "";
    }
}

function resetProgress(event) {
    if (event.button === 0) {
        hideThrowScale();
    }
}

function throwFloat(progress) {
    float.style.top = `${-((window.innerHeight - land.clientHeight / 2) - (recordTable.clientHeight + obj.clientHeight)) * progress / 100}px`;
    window.document.removeEventListener('keydown', keydownHandler);

    // Get the absolute position of the float
    const floatRect = float.getBoundingClientRect();
    const floatX = floatRect.left + (float.clientWidth / 2);
    const floatY = floatRect.top + (float.clientHeight / 2);

    // Check collision with holes
    checkHoleCollision(floatX, floatY);

    isFishing = true;
}

// Generate holes
function holegeneration() {
    const lake = document.getElementById('lake');
    lake.innerHTML = '';
    for (let i = 0; i < holesAmount; i++) {
        const left = Math.random() * 80;
        const _top = Math.random() * ((window.innerHeight - (land.clientHeight + 500)) / window.innerHeight * 100) + 29;
        const fishCount = Math.floor(Math.random() * 3) + 2; // Random fish count between 1 to 10
        const hole = new Hole(left, _top, fishCount);
        holes.push(hole);

        const lakearea = window.document.createElement('div');
        lakearea.className = 'hole';
        lakearea.id = 'hole ' + i;
        lakearea.style.left = `${left}%`;
        lakearea.style.top = `${_top}%`;
        lake.appendChild(lakearea);
    }
    return holes;
}

// Check collision and start fishing
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

// Function to move the fish towards the float
function moveFishTowardsFloat(hole, float) {
    const fish = window.document.createElement('div');
    fish.className = 'fish';
    hole.appendChild(fish);
    const duration = 50;

    setTimeout(() => {
        const holeRect = hole.getBoundingClientRect();
        const objRect = obj.getBoundingClientRect();

        const holeCenterX = holeRect.left + (holeRect.width / 2);
        const holeCenterY = holeRect.top + (holeRect.height / 2);

        const objCenterX = objRect.left + (objRect.width / 2);
        const objCenterY = objRect.top + (objRect.height / 2);

        const deltaX = objCenterX - holeCenterX;
        const deltaY = objCenterY - holeCenterY;

        fish.style.left = `${fish.offsetLeft}px`;
        fish.style.top = `${fish._offsetTop}px`;

        const steps = 100;

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
                fish.remove(); // Remove the fish when it reaches the float
            }
        }
    }, duration);
}

function endGame() {
    endGameContainer.style.display = 'flex';
    document.getElementById('game-wrapper').removeEventListener('mousedown', throwAnimation);
    document.getElementById('game-wrapper').removeEventListener('mousedown', startProgress);
    document.getElementById('game-wrapper').removeEventListener('mousedown', baitdecriment);
    document.getElementById('game-wrapper').removeEventListener('mouseup', resetProgress);
    //hideThrowScale();
    float.style.top = '';

    addName.addEventListener('click', function () {
        const playerName = document.getElementById('player-name').value;
        if (playerName) {
            saveRecords(playerName, scoreValue); // Поправлено тут

            // Закриття екрану після додавання рекорду
            const endGameContainer = document.getElementById('endGameBackground');
            endGameContainer.style.display = 'none';
        } else {
            alert('Будь ласка, введіть ваше ім\'я');
        }
        resetGameState();
    });
}

function startFishing(fishAmount, hole) {
    const game = document.getElementById('game');
    game.style.display = 'flex';
    isFishing = true;

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
                this.progress = 75;
            }

            reset() {
                this.progress = 75;
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
        document.addEventListener('keydown', indicatorActive);
        document.getElementById('game-wrapper').addEventListener('keyup', indicatorInactive);

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
            document.getElementById('game-wrapper').addEventListener('mousedown', throwAnimation);
            document.getElementById('game-wrapper').addEventListener('mousedown', startProgress);
            document.getElementById('game-wrapper').addEventListener('mousedown', baitdecriment);
            window.document.addEventListener('keydown', keydownHandler);
            document.getElementById('game-wrapper').addEventListener('mouseup', resetProgress);
            game.style.display = 'none';
            float.style.top = "";

            if (isWinning) {
                scoreValue += 10;
                score.innerHTML = scoreValue;
                fishAmount.fishCount--;
                moveFishTowardsFloat(hole, float);
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

    // -------
    // Seaweed
    // -------

    (function (isFishing) {
        let seaweed = [];
        const canvas = document.querySelector('[data-element="seaweed"]');
        canvas.width = canvas.clientWidth * 2;
        canvas.height = canvas.clientHeight * 2;
        const context = canvas.getContext('2d');

        function animationLoop() {
            if (!isFishing) return;

            clearCanvas();
            seaweed.forEach(seaweed => seaweed.draw());

            requestAnimationFrame(animationLoop);
        }

        function clearCanvas() {
            context.clearRect(0, 0, canvas.width, canvas.height);
        }

        class Seaweed {
            constructor(segments, spread, xoff) {
                this.segments = segments;
                this.segmentSpread = spread;
                this.x = 0;
                this.xoff = xoff;
                this.y = 0;
                this.radius = 1;
                this.sin = Math.random() * 10;
            }

            draw() {
                context.beginPath();
                context.strokeStyle = "#143e5a";
                context.fillStyle = "#143e5a";
                context.lineWidth = 2;
                for (let i = this.segments; i >= 0; i--) {
                    if (i === this.segments) {
                        context.moveTo(
                            Math.sin(this.sin + i) * i / 2.5 + this.xoff,
                            canvas.height + (-i * this.segmentSpread),
                        );
                    } else {
                        context.lineTo(
                            Math.sin(this.sin + i) * i / 2.5 + this.xoff,
                            canvas.height + (-i * this.segmentSpread),
                        );
                    }
                }
                context.stroke();

                this.sin += 0.05;
            }
        }

        seaweed.push(new Seaweed(6, 8, 25));
        seaweed.push(new Seaweed(8, 10, 35));
        seaweed.push(new Seaweed(4, 8, 45));

        animationLoop()
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