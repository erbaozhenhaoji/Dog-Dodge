// ============================================================
// 白色金毛狗躲避老太太 Web 小游戏 - Core Engine
// ============================================================

class SoundSystem {
    constructor() {
        this.enabled = true;
        this.ctx = null;
    }

    init() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) {
                this.ctx = new AudioCtx();
            }
        }
    }

    playBark() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(160, now + 0.15);

        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.15);
    }

    playCollect() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.16); // G5

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.28);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.28);
    }

    playCrash() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        
        // Low noise generator for bump/crash
        const bufferSize = this.ctx.sampleRate * 0.3;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, now);
        filter.frequency.exponentialRampToValueAtTime(50, now + 0.3);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        noise.start(now);
        noise.stop(now + 0.3);
    }
}

class Particle {
    constructor(x, y, color, speedX, speedY, size, life) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.speedX = speedX;
        this.speedY = speedY;
        this.size = size;
        this.maxLife = life;
        this.life = life;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.life--;
    }

    draw(ctx) {
        if (this.life <= 0) return;
        ctx.save();
        ctx.globalAlpha = this.life / this.maxLife;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

class GoldenDog {
    constructor(canvasWidth, canvasHeight) {
        this.width = 46;
        this.height = 56;
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.x = canvasWidth / 2 - this.width / 2;
        this.y = canvasHeight - this.height - 30;
        this.speed = 7;
        this.vx = 0;
        this.animFrame = 0;
    }

    reset() {
        this.x = this.canvasWidth / 2 - this.width / 2;
        this.y = this.canvasHeight - this.height - 30;
        this.vx = 0;
    }

    update(keys, touchDir) {
        this.vx = 0;

        if (keys['ArrowLeft'] || keys['KeyA'] || touchDir === 'left') {
            this.vx = -this.speed;
        } else if (keys['ArrowRight'] || keys['KeyD'] || touchDir === 'right') {
            this.vx = this.speed;
        }

        this.x += this.vx;

        // Boundaries check
        const roadLeftMargin = 55;
        const roadRightMargin = this.canvasWidth - 55 - this.width;

        if (this.x < roadLeftMargin) this.x = roadLeftMargin;
        if (this.x > roadRightMargin) this.x = roadRightMargin;

        this.animFrame += 0.2;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);

        // Tilt slightly when moving left/right
        const tilt = this.vx * 0.03;
        ctx.rotate(tilt);

        const w = this.width;
        const h = this.height;

        // Tail wagging
        const tailAngle = Math.sin(this.animFrame * 0.8) * 0.25;
        ctx.save();
        ctx.translate(0, h / 2 - 8);
        ctx.rotate(tailAngle);
        ctx.fillStyle = '#fcebe6';
        ctx.beginPath();
        ctx.ellipse(0, 12, 6, 14, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Main Dog Body (Fluffy Cream White Golden Retriever)
        ctx.fillStyle = '#FAF0E6'; // Cream white fur
        ctx.beginPath();
        ctx.roundRect(-w / 2, -h / 2 + 10, w, h - 14, 18);
        ctx.fill();

        // Golden soft shading highlights on back
        ctx.fillStyle = '#F4E1D2';
        ctx.beginPath();
        ctx.ellipse(0, 4, w / 2 - 5, h / 3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Paws (Running animation)
        const pawOffset = Math.sin(this.animFrame) * 4;
        ctx.fillStyle = '#FFFFFF';
        // Left paws
        ctx.beginPath();
        ctx.arc(-w / 2 + 8, h / 2 - 4 + pawOffset, 6, 0, Math.PI * 2);
        ctx.arc(-w / 2 + 8, -h / 2 + 18 - pawOffset, 5, 0, Math.PI * 2);
        ctx.fill();
        // Right paws
        ctx.beginPath();
        ctx.arc(w / 2 - 8, h / 2 - 4 - pawOffset, 6, 0, Math.PI * 2);
        ctx.arc(w / 2 - 8, -h / 2 + 18 + pawOffset, 5, 0, Math.PI * 2);
        ctx.fill();

        // Dog Head
        ctx.fillStyle = '#FAF0E6';
        ctx.beginPath();
        ctx.arc(0, -h / 2 + 12, 18, 0, Math.PI * 2);
        ctx.fill();

        // Golden Floppy Ears
        ctx.fillStyle = '#EAD5C3'; // Light golden tint for ears
        // Left Ear
        ctx.beginPath();
        ctx.ellipse(-16, -h / 2 + 14, 6, 12, Math.PI / 8, 0, Math.PI * 2);
        ctx.fill();
        // Right Ear
        ctx.beginPath();
        ctx.ellipse(16, -h / 2 + 14, 6, 12, -Math.PI / 8, 0, Math.PI * 2);
        ctx.fill();

        // Snout
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.ellipse(0, -h / 2 + 17, 9, 7, 0, 0, Math.PI * 2);
        ctx.fill();

        // Black Nose
        ctx.fillStyle = '#2C3E50';
        ctx.beginPath();
        ctx.ellipse(0, -h / 2 + 14, 4, 3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Pink Tongue
        ctx.fillStyle = '#FF7675';
        ctx.beginPath();
        ctx.ellipse(0, -h / 2 + 21, 3, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Cute Shiny Eyes
        ctx.fillStyle = '#2C3E50';
        ctx.beginPath();
        ctx.arc(-7, -h / 2 + 9, 3, 0, Math.PI * 2);
        ctx.arc(7, -h / 2 + 9, 3, 0, Math.PI * 2);
        ctx.fill();

        // Eye specular catchlight
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(-8, -h / 2 + 8, 1, 0, Math.PI * 2);
        ctx.arc(6, -h / 2 + 8, 1, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    getHitbox() {
        // Slightly padded hitbox for fair collisions
        const padding = 6;
        return {
            x: this.x + padding,
            y: this.y + padding,
            width: this.width - padding * 2,
            height: this.height - padding * 2
        };
    }
}

class OldLadyObstacle {
    constructor(x, y, speed) {
        this.x = x;
        this.y = y;
        this.width = 42;
        this.height = 52;
        this.speed = speed;
        this.animFrame = Math.random() * 10;
        
        // Randomize lady appearance
        const dressColors = ['#8E44AD', '#D35400', '#16A085', '#C0392B', '#27AE60'];
        this.dressColor = dressColors[Math.floor(Math.random() * dressColors.length)];
        this.caneSide = Math.random() > 0.5 ? 1 : -1;
    }

    update() {
        this.y += this.speed;
        this.animFrame += 0.1;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);

        const w = this.width;
        const h = this.height;
        const sway = Math.sin(this.animFrame * 0.6) * 2;

        // Walking Cane / Stick
        ctx.strokeStyle = '#6E2C00';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(this.caneSide * (w / 2 - 2), -5);
        ctx.lineTo(this.caneSide * (w / 2 + 4), h / 2 - 2);
        ctx.stroke();

        // Cane handle
        ctx.beginPath();
        ctx.arc(this.caneSide * (w / 2 - 2), -7, 3, 0, Math.PI);
        ctx.stroke();

        // Grandma Dress / Cardigan
        ctx.fillStyle = this.dressColor;
        ctx.beginPath();
        ctx.roundRect(-w / 2 + 4 + sway * 0.3, -h / 2 + 18, w - 8, h - 22, 10);
        ctx.fill();

        // Floral / Pattern dots on dress
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(-6 + sway * 0.3, 0, 2, 0, Math.PI * 2);
        ctx.arc(6 + sway * 0.3, 8, 2, 0, Math.PI * 2);
        ctx.arc(0, 14, 2, 0, Math.PI * 2);
        ctx.fill();

        // Head (Skin tone)
        ctx.fillStyle = '#F5CBA7';
        ctx.beginPath();
        ctx.arc(sway, -h / 2 + 14, 12, 0, Math.PI * 2);
        ctx.fill();

        // Silver / Gray Curly Hair Bun (Grandma Hair)
        ctx.fillStyle = '#D5D8DC';
        // Top Bun
        ctx.beginPath();
        ctx.arc(sway, -h / 2 + 2, 8, 0, Math.PI * 2);
        ctx.fill();

        // Side Hair curls
        ctx.beginPath();
        ctx.arc(-10 + sway, -h / 2 + 10, 6, 0, Math.PI * 2);
        ctx.arc(10 + sway, -h / 2 + 10, 6, 0, Math.PI * 2);
        ctx.fill();

        // Round Glasses
        ctx.strokeStyle = '#2C3E50';
        ctx.lineWidth = 1.8;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        
        // Left Lens
        ctx.beginPath();
        ctx.arc(-5 + sway, -h / 2 + 14, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Right Lens
        ctx.beginPath();
        ctx.arc(5 + sway, -h / 2 + 14, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Glasses bridge
        ctx.beginPath();
        ctx.moveTo(-1 + sway, -h / 2 + 14);
        ctx.lineTo(1 + sway, -h / 2 + 14);
        ctx.stroke();

        // Gentle Mouth
        ctx.strokeStyle = '#C0392B';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(sway, -h / 2 + 20, 3, 0, Math.PI);
        ctx.stroke();

        ctx.restore();
    }

    getHitbox() {
        const padding = 4;
        return {
            x: this.x + padding,
            y: this.y + padding,
            width: this.width - padding * 2,
            height: this.height - padding * 2
        };
    }
}

class BoneItem {
    constructor(x, y, speed) {
        this.x = x;
        this.y = y;
        this.width = 28;
        this.height = 20;
        this.speed = speed;
        this.angle = 0;
    }

    update() {
        this.y += this.speed;
        this.angle += 0.05;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.rotate(Math.sin(this.angle) * 0.2);

        // Golden Bone Graphic
        ctx.fillStyle = '#F1C40F';
        
        // Center bar
        ctx.fillRect(-10, -3, 20, 6);

        // Bone ends (4 circles)
        ctx.beginPath();
        ctx.arc(-10, -5, 5, 0, Math.PI * 2);
        ctx.arc(-10, 5, 5, 0, Math.PI * 2);
        ctx.arc(10, -5, 5, 0, Math.PI * 2);
        ctx.arc(10, 5, 5, 0, Math.PI * 2);
        ctx.fill();

        // Shininess glow
        ctx.fillStyle = '#FFF59D';
        ctx.beginPath();
        ctx.arc(-2, -1, 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    getHitbox() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
}

// Main Game Controller Class
class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.sound = new SoundSystem();
        this.dog = new GoldenDog(this.canvas.width, this.canvas.height);

        this.state = 'START'; // 'START', 'RUNNING', 'PAUSED', 'GAMEOVER'
        this.score = 0;
        this.dodgedCount = 0;
        this.speedMultiplier = 1.0;

        this.obstacles = [];
        this.items = [];
        this.particles = [];

        this.roadScrollY = 0;
        this.spawnTimer = 0;
        this.itemSpawnTimer = 0;

        this.keys = {};
        this.touchDir = null;

        this.initUI();
        this.initControls();
        this.fetchLeaderboard();

        // Start game animation loop
        requestAnimationFrame((timestamp) => this.loop(timestamp));
    }

    initUI() {
        this.scoreDisplay = document.getElementById('scoreDisplay');
        this.dodgeDisplay = document.getElementById('dodgeDisplay');
        
        this.startScreen = document.getElementById('startScreen');
        this.pauseScreen = document.getElementById('pauseScreen');
        this.gameOverScreen = document.getElementById('gameOverScreen');

        this.startGameBtn = document.getElementById('startGameBtn');
        this.resumeGameBtn = document.getElementById('resumeGameBtn');
        this.restartGameBtn = document.getElementById('restartGameBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.soundToggleBtn = document.getElementById('soundToggleBtn');

        this.finalScoreEl = document.getElementById('finalScore');
        this.finalDodgesEl = document.getElementById('finalDodges');
        this.playerNameInput = document.getElementById('playerNameInput');

        this.startGameBtn.addEventListener('click', () => this.start());
        this.resumeGameBtn.addEventListener('click', () => this.resume());
        this.restartGameBtn.addEventListener('click', () => this.saveScoreAndRestart());
        
        this.pauseBtn.addEventListener('click', () => {
            if (this.state === 'RUNNING') this.pause();
            else if (this.state === 'PAUSED') this.resume();
        });

        this.soundToggleBtn.addEventListener('click', () => {
            this.sound.enabled = !this.sound.enabled;
            const iconEl = document.getElementById('soundIcon');
            if (this.sound.enabled) {
                this.soundToggleBtn.innerHTML = '🔊 音效: 开';
            } else {
                this.soundToggleBtn.innerHTML = '🔇 音效: 关';
            }
        });
    }

    initControls() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            if (e.code === 'KeyP' || e.code === 'Space') {
                if (this.state === 'RUNNING') this.pause();
                else if (this.state === 'PAUSED') this.resume();
            }
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });

        // Touch control buttons
        const btnLeft = document.getElementById('btnLeft');
        const btnRight = document.getElementById('btnRight');

        if (btnLeft && btnRight) {
            const startLeft = (e) => { e.preventDefault(); this.touchDir = 'left'; };
            const endLeft = (e) => { e.preventDefault(); if (this.touchDir === 'left') this.touchDir = null; };
            
            const startRight = (e) => { e.preventDefault(); this.touchDir = 'right'; };
            const endRight = (e) => { e.preventDefault(); if (this.touchDir === 'right') this.touchDir = null; };

            btnLeft.addEventListener('touchstart', startLeft);
            btnLeft.addEventListener('touchend', endLeft);
            btnLeft.addEventListener('mousedown', startLeft);
            btnLeft.addEventListener('mouseup', endLeft);

            btnRight.addEventListener('touchstart', startRight);
            btnRight.addEventListener('touchend', endRight);
            btnRight.addEventListener('mousedown', startRight);
            btnRight.addEventListener('mouseup', endRight);
        }
    }

    start() {
        this.score = 0;
        this.dodgedCount = 0;
        this.speedMultiplier = 1.0;
        this.obstacles = [];
        this.items = [];
        this.particles = [];
        this.dog.reset();

        this.scoreDisplay.textContent = '0';
        this.dodgeDisplay.textContent = '0';

        this.startScreen.classList.add('hidden');
        this.gameOverScreen.classList.add('hidden');
        this.pauseScreen.classList.add('hidden');

        this.state = 'RUNNING';
        this.sound.playBark();
    }

    pause() {
        if (this.state !== 'RUNNING') return;
        this.state = 'PAUSED';
        this.pauseScreen.classList.remove('hidden');
    }

    resume() {
        if (this.state !== 'PAUSED') return;
        this.state = 'RUNNING';
        this.pauseScreen.classList.add('hidden');
    }

    gameOver() {
        this.state = 'GAMEOVER';
        this.sound.playCrash();

        // Spawn collision explosion particles
        for (let i = 0; i < 25; i++) {
            const speedX = (Math.random() - 0.5) * 8;
            const speedY = (Math.random() - 0.5) * 8;
            const color = ['#E74C3C', '#F39C12', '#FFFFFF', '#FAF0E6'][Math.floor(Math.random() * 4)];
            this.particles.push(new Particle(this.dog.x + this.dog.width / 2, this.dog.y + this.dog.height / 2, color, speedX, speedY, 4, 30));
        }

        this.finalScoreEl.textContent = this.score;
        this.finalDodgesEl.textContent = this.dodgedCount;

        setTimeout(() => {
            this.gameOverScreen.classList.remove('hidden');
        }, 600);
    }

    async saveScoreAndRestart() {
        const playerName = this.playerNameInput.value.trim() || '快乐的小金毛';
        try {
            await fetch('/api/scores', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    player_name: playerName,
                    score: this.score,
                    dodged_count: this.dodgedCount
                })
            });
            this.fetchLeaderboard();
        } catch (err) {
            console.error("Failed to submit score:", err);
        }
        this.start();
    }

    async fetchLeaderboard() {
        const listEl = document.getElementById('leaderboardList');
        try {
            const res = await fetch('/api/scores');
            const data = await res.json();
            if (data.success && data.scores) {
                listEl.innerHTML = '';
                data.scores.forEach((item, index) => {
                    const li = document.createElement('li');
                    li.className = 'leaderboard-item';
                    
                    let medal = index + 1;
                    if (index === 0) medal = '🥇';
                    else if (index === 1) medal = '🥈';
                    else if (index === 2) medal = '🥉';

                    li.innerHTML = `
                        <div class="rank-badge">${medal}</div>
                        <div class="player-info">
                            <div class="player-name">${this.escapeHtml(item.player_name)}</div>
                            <div class="player-meta">避开 ${item.dodged_count} 人 · ${item.date || ''}</div>
                        </div>
                        <div class="score-value">${item.score}分</div>
                    `;
                    listEl.appendChild(li);
                });
            }
        } catch (err) {
            listEl.innerHTML = '<li class="leaderboard-item">无法加载排行榜</li>';
        }
    }

    escapeHtml(str) {
        return str.replace(/[&<>"']/g, function(m) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m];
        });
    }

    spawnObstacle() {
        // Road span is between X: 55 and 385 (width: 330)
        const roadXStart = 60;
        const roadWidth = 320;
        const obstacleWidth = 42;

        // Pick one of 3 main lanes or random offset
        const lanes = [
            roadXStart + 20,
            roadXStart + roadWidth / 2 - obstacleWidth / 2,
            roadXStart + roadWidth - obstacleWidth - 20
        ];

        const posX = lanes[Math.floor(Math.random() * lanes.length)] + (Math.random() * 20 - 10);
        const baseSpeed = 3.5 + Math.random() * 1.5;
        const speed = baseSpeed * this.speedMultiplier;

        this.obstacles.push(new OldLadyObstacle(posX, -60, speed));
    }

    spawnItem() {
        const roadXStart = 60;
        const roadWidth = 320;
        const posX = roadXStart + Math.random() * (roadWidth - 40);
        const speed = 3.0 * this.speedMultiplier;

        this.items.push(new BoneItem(posX, -30, speed));
    }

    checkCollision(rect1, rect2) {
        return (
            rect1.x < rect2.x + rect2.width &&
            rect1.x + rect1.width > rect2.x &&
            rect1.y < rect2.y + rect2.height &&
            rect1.y + rect1.height > rect2.y
        );
    }

    update() {
        if (this.state !== 'RUNNING') return;

        // Increase score & speed over time
        this.score += 1;
        this.scoreDisplay.textContent = this.score;

        // Gradually increase difficulty speed multiplier up to 2.2x
        this.speedMultiplier = 1.0 + Math.min(1.2, this.score / 1500);

        // Update dog movement
        this.dog.update(this.keys, this.touchDir);

        // Scroll Road background
        this.roadScrollY = (this.roadScrollY + 4 * this.speedMultiplier) % 60;

        // Spawn obstacles (Old Ladies)
        this.spawnTimer++;
        const currentSpawnInterval = Math.max(35, 75 - Math.floor(this.score / 80));
        if (this.spawnTimer >= currentSpawnInterval) {
            this.spawnObstacle();
            this.spawnTimer = 0;
        }

        // Spawn bone items occasionally
        this.itemSpawnTimer++;
        if (this.itemSpawnTimer >= 220) {
            if (Math.random() < 0.6) {
                this.spawnItem();
            }
            this.itemSpawnTimer = 0;
        }

        // Update obstacles
        const dogBox = this.dog.getHitbox();
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const obs = this.obstacles[i];
            obs.update();

            // Collision check with dog
            if (this.checkCollision(dogBox, obs.getHitbox())) {
                this.gameOver();
                return;
            }

            // Successfully dodged
            if (obs.y > this.canvas.height) {
                this.dodgedCount++;
                this.score += 20; // Bonus points for dodging
                this.dodgeDisplay.textContent = this.dodgedCount;
                this.obstacles.splice(i, 1);
            }
        }

        // Update items (Bone)
        for (let i = this.items.length - 1; i >= 0; i--) {
            const item = this.items[i];
            item.update();

            // Collect bone
            if (this.checkCollision(dogBox, item.getHitbox())) {
                this.score += 100;
                this.sound.playCollect();

                // Sparkle particles
                for (let p = 0; p < 12; p++) {
                    const speedX = (Math.random() - 0.5) * 6;
                    const speedY = (Math.random() - 0.5) * 6;
                    this.particles.push(new Particle(item.x + item.width / 2, item.y + item.height / 2, '#F1C40F', speedX, speedY, 3, 20));
                }

                this.items.splice(i, 1);
                continue;
            }

            if (item.y > this.canvas.height) {
                this.items.splice(i, 1);
            }
        }

        // Update particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.update();
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    drawRoad() {
        const w = this.canvas.width;
        const h = this.canvas.height;

        // Grass Side Margins
        this.ctx.fillStyle = '#27ae60';
        this.ctx.fillRect(0, 0, w, h);

        // Grass texture detail strips
        this.ctx.fillStyle = '#2ecc71';
        this.ctx.fillRect(0, 0, 50, h);
        this.ctx.fillRect(w - 50, 0, 50, h);

        // Main Asphalt Road
        this.ctx.fillStyle = '#34495e';
        this.ctx.fillRect(50, 0, w - 100, h);

        // Road Borders (White Solid Lines)
        this.ctx.fillStyle = '#ECF0F1';
        this.ctx.fillRect(52, 0, 5, h);
        this.ctx.fillRect(w - 57, 0, 5, h);

        // Dashed Center Lanes (Scrolling)
        this.ctx.fillStyle = '#F1C40F';
        const laneX1 = 50 + (w - 100) / 3;
        const laneX2 = 50 + ((w - 100) / 3) * 2;

        for (let y = -60 + this.roadScrollY; y < h; y += 40) {
            this.ctx.fillRect(laneX1 - 2, y, 4, 22);
            this.ctx.fillRect(laneX2 - 2, y, 4, 22);
        }

        // Roadside Trees / Bushes
        this.ctx.fillStyle = '#1e8449';
        for (let y = -60 + this.roadScrollY * 1.5; y < h; y += 120) {
            this.ctx.beginPath();
            this.ctx.arc(25, y, 16, 0, Math.PI * 2);
            this.ctx.arc(w - 25, y + 60, 16, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // 1. Draw Environment
        this.drawRoad();

        // 2. Draw Items
        this.items.forEach(item => item.draw(this.ctx));

        // 3. Draw Obstacles (Old Ladies)
        this.obstacles.forEach(obs => obs.draw(this.ctx));

        // 4. Draw Dog
        if (this.state !== 'GAMEOVER' || Math.floor(Date.now() / 150) % 2 === 0) {
            this.dog.draw(this.ctx);
        }

        // 5. Draw Particles
        this.particles.forEach(p => p.draw(this.ctx));
    }

    loop(timestamp) {
        this.update();
        this.draw();
        requestAnimationFrame((ts) => this.loop(ts));
    }
}

// Initialize game on window load
window.addEventListener('load', () => {
    window.gameInstance = new Game();
});
