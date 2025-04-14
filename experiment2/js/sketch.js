let galaxy;
let bgStars = [];
let agents = [];
let bullets = [];
let explosions = [];

let spawnInterval = 6000;
let spawnChance = 0.015;

let canvasContainer;

function resizeScreen() {
    centerHorz = canvasContainer.width() / 2; // Adjusted for drawing logic
    centerVert = canvasContainer.height() / 2; // Adjusted for drawing logic
    console.log("Resizing...");
    resizeCanvas(canvasContainer.width(), canvasContainer.height());
    // redrawCanvas(); // Redraw everything based on new size
    galaxy = new Galaxy(width / 2, height / 2, 220);
    generateBGStars(200);
  }

function setup() {
canvasContainer = $("#canvas-container");
  let canvas = createCanvas(canvasContainer.width(), canvasContainer.height());
  canvas.parent("canvas-container");
  noStroke();
  galaxy = new Galaxy(width / 2, height / 2, 220);
  generateBGStars(200);
  createAgents(8);

  $(window).resize(function() {
    resizeScreen();
  });
  resizeScreen();

}

function draw() {
  background(0, 25);

  updateBGStars();
  drawBGStars();

  let tScale = map(mouseX, 0, width, 0.2, 2.5);
  galaxy.update(tScale);
  galaxy.display();

  spawnShips();
  updateAgents(tScale);
  drawAgents();
  updateBullets();
  drawBullets();
  checkBulletHits();
  drawExplosions();
}

// -------------------- Background --------------------

function generateBGStars(n) {
  for (let i = 0; i < n; i++) {
    bgStars.push({
      x: random(width),
      y: random(height),
      size: random(0.5, 2),
      brightness: random(40, 100),
      speed: random(0.01, 0.05),
    });
  }
}

function updateBGStars() {
  for (let s of bgStars) {
    s.x -= s.speed;
    if (s.x < 0) {
      s.x = width;
      s.y = random(height);
    }
  }
}

function drawBGStars() {
  for (let s of bgStars) {
    fill(s.brightness);
    ellipse(s.x, s.y, s.size);
  }
}

// ------------------------ Galaxy ------------------------

class Galaxy {
  constructor(x, y, r) {
    this.x = x;
    this.y = y;
    this.radius = r;
    this.rotation = 0;
    this.rotationSpeed = 0.002;
    this.stars = this.makeSpiralStars(800);
    this.gas = this.makeGas(20);
  }

  generateStarColor() {
    let baseHue = 220 + random(-30, 60);
    let sat = random(40, 100);
    let bright = random(80, 100);
    colorMode(HSB, 360, 100, 100);
    let c = color(baseHue, sat, bright, 100);
    colorMode(RGB, 255);
    return c;
  }

  makeSpiralStars(count) {
    let stars = [];
    for (let i = 0; i < count; i++) {
      let angle = random(TWO_PI * 2);
      let radius = pow(random(1), 1.4) * this.radius;
      let armOffset = sin(angle * 2 + random(-0.5, 0.5)) * 40;
      stars.push({
        angle,
        radius: radius + armOffset,
        size: random(1, 2.8),
        color: this.generateStarColor(),
        speed: random(0.5, 1.2),
      });
    }
    return stars;
  }

  makeGas(count) {
    let clouds = [];
    for (let i = 0; i < count; i++) {
      clouds.push({
        x: random(-this.radius * 0.5, this.radius * 0.5),
        y: random(-this.radius * 0.2, this.radius * 0.2),
        size: random(this.radius * 0.2, this.radius * 0.5),
        color: color(140, 200, 255, random(1, 3)),
      });
    }
    return clouds;
  }

  update(tScale) {
    this.rotation += this.rotationSpeed * tScale;
  }

  display() {
    push();
    translate(this.x, this.y);
    rotate(this.rotation);
    blendMode(ADD);

    for (let g of this.gas) {
      fill(g.color);
      ellipse(g.x, g.y, g.size, g.size * 0.6);
    }

    for (let s of this.stars) {
      let angle = s.angle + this.rotation * s.speed;
      let x = cos(angle) * s.radius;
      let y = sin(angle) * s.radius * 0.5;
      fill(s.color);
      ellipse(x, y, s.size);
    }

    for (let i = 0; i < 8; i++) {
      fill(100, 100, 100, 1);
      ellipse(0, 0, this.radius * 0.6 - i * 5);
    }

    fill(20, 255, 100, 255);
    ellipse(0, 0, this.radius * 0.15);

    fill(random(1, 15), 0, random(0, 5), 255);
    ellipse(0, 0, this.radius * 0.4 + sin(frameCount * 0.1) * 20, this.radius * 0.4 + cos(frameCount * 0.1) * 20);

    pop();
    blendMode(BLEND);
  }
}

// ----------------------- Ships -----------------------

function createAgents(n) {
  for (let i = 0; i < n; i++) spawnSingleShip();
}

function spawnSingleShip() {
  let side = random(["left", "right", "top", "bottom"]);
  let x = random(width), y = random(height);
  if (side === "left") x = -random(50, 100);
  if (side === "right") x = width + random(50, 100);
  if (side === "top") y = -random(50, 100);
  if (side === "bottom") y = height + random(50, 100);

  agents.push({
    type: random() < 0.5 ? "ufo" : "rocket",
    x,
    y,
    prevX: x,
    prevY: y,
    seed: random(1000),
    fireCooldown: 0,
  });
}

function spawnShips() {
  if (frameCount % spawnInterval !== 0) return;

  let rocketCount = agents.filter(a => a.type === "rocket").length;
  let ufoCount = agents.filter(a => a.type === "ufo").length;

  if (random() < spawnChance) {
    let newType = random(["rocket", "ufo"]);
    if ((newType === "rocket" && rocketCount < 4) ||
        (newType === "ufo" && ufoCount < 4)) {
      spawnSingleShip();
    }
  }
}

function updateAgents(tScale) {
  for (let a of agents) {
    let angle = noise(a.seed, frameCount * 0.005) * TWO_PI * 2;
    let speed = tScale * 1.2;

    a.prevX = a.x;
    a.prevY = a.y;

    a.x += cos(angle) * speed;
    a.y += sin(angle) * speed;
    a.fireCooldown--;

    for (let b of agents) {
      if (a === b || a.type === b.type) continue;
      if (dist(a.x, a.y, b.x, b.y) < 160 && a.fireCooldown <= 0) {
        let angleToTarget = atan2(b.y - a.y, b.x - a.x);
        bullets.push({
          x: a.x,
          y: a.y,
          vx: cos(angleToTarget) * 4,
          vy: sin(angleToTarget) * 4,
          from: a.type
        });
        a.fireCooldown = 60;
        break;
      }
    }

    if (a.x < -150) a.x = width + random(50);
    if (a.x > width + 150) a.x = -random(50);
    if (a.y < -150) a.y = height + random(50);
    if (a.y > height + 150) a.y = -random(50);
  }
}

function drawAgents() {
  textSize(24);
  textAlign(CENTER, CENTER);
  for (let a of agents) {
    if (a.type === "ufo") {
      text("🛸", a.x, a.y);
    } else {
      let angle = atan2(a.y - a.prevY, a.x - a.prevX);
      push();
      translate(a.x, a.y);
      rotate(angle + PI / 4); // match emoji angle
      text("🚀", 0, 0);
      pop();
    }
  }
}

// ----------------------- BULLETS -----------------------

function updateBullets() {
  for (let i = bullets.length - 1; i >= 0; i--) {
    let b = bullets[i];
    b.x += b.vx;
    b.y += b.vy;
    if (b.x < 0 || b.x > width || b.y < 0 || b.y > height) {
      bullets.splice(i, 1);
    }
  }
}

function drawBullets() {
  textSize(16);
  for (let b of bullets) {
    text("•", b.x, b.y);
  }
}

function checkBulletHits() {
  for (let i = bullets.length - 1; i >= 0; i--) {
    let b = bullets[i];
    for (let j = agents.length - 1; j >= 0; j--) {
      let a = agents[j];
      if (a.type !== b.from && dist(b.x, b.y, a.x, a.y) < 16) {
        explosions.push({ x: a.x, y: a.y, life: 25 });
        agents.splice(j, 1);
        bullets.splice(i, 1);
        return;
      }
    }
  }
}

function drawExplosions() {
  textSize(24);
  for (let i = explosions.length - 1; i >= 0; i--) {
    let e = explosions[i];
    text("💥", e.x, e.y);
    e.life--;
    if (e.life <= 0) explosions.splice(i, 1);
  }
}
