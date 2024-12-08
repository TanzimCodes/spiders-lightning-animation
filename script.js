const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

let w = canvas.width = window.innerWidth;
let h = canvas.height = window.innerHeight;

class Spider {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.targetX = x;
    this.targetY = y;
    this.vx = 0;
    this.vy = 0;
    this.speed = Math.random() * 0.1 + 0.01;
    this.legCount = 8;
    this.legSegmentCount = 3;
    this.legLength = 40;
    this.phase = Math.random() * Math.PI * 2;
  }

  follow(targetX, targetY) {
    this.targetX = targetX;
    this.targetY = targetY;
  }

  tick(t) {
    this.x += (this.targetX - this.x) * this.speed;
    this.y += (this.targetY - this.y) * this.speed;

    // Draw the body
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(this.x, this.y, 10, 0, Math.PI * 2);
    ctx.fill();

    // Draw the legs with bends
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;

    for (let i = 0; i < this.legCount; i++) {
      const baseAngle = (Math.PI * 2 / this.legCount) * i + Math.sin(this.phase + t / 200) * 0.2;
      let startX = this.x;
      let startY = this.y;

      const segmentLength = this.legLength / this.legSegmentCount;

      for (let j = 0; j < this.legSegmentCount; j++) {
        const bendAngle = baseAngle + Math.sin(this.phase + t / 300 + j * 0.5) * 0.4;
        const endX = startX + Math.cos(bendAngle) * segmentLength;
        const endY = startY + Math.sin(bendAngle) * segmentLength;

        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        startX = endX;
        startY = endY;
      }
    }

    // Update leg animation phase
    this.phase += 0.05;
  }
}

// Lightning effect manager
const lightningBolts = [];

class Lightning {
  constructor() {
    this.points = this.generatePoints();
    this.opacity = 1.0;
  }

  generatePoints() {
    const points = [];
    const startX = Math.random() * w;
    const startY = Math.random() * h * 0.5; // Lightning starts in the top half
    let currentX = startX;
    let currentY = startY;

    for (let i = 0; i < 10; i++) {
      const nextX = currentX + (Math.random() - 0.5) * 100;
      const nextY = currentY + Math.random() * 50;
      points.push({ x: currentX, y: currentY });
      currentX = nextX;
      currentY = nextY;
    }

    return points;
  }

  draw() {
    ctx.strokeStyle = `rgba(255, 255, 255, ${this.opacity})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < this.points.length - 1; i++) {
      const p1 = this.points[i];
      const p2 = this.points[i + 1];
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
    }
    ctx.stroke();
  }

  update() {
    this.opacity -= 0.03; // Fade out the lightning
  }

  isDone() {
    return this.opacity <= 0;
  }
}

const spiders = Array.from({ length: 3 }, () => new Spider(Math.random() * w, Math.random() * h));

addEventListener("pointermove", (e) => {
  spiders.forEach(spider => spider.follow(e.clientX, e.clientY));
});

function animate(t) {
  if (w !== innerWidth) w = canvas.width = innerWidth;
  if (h !== innerHeight) h = canvas.height = innerHeight;

  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, w, h);

  // Update and draw spiders
  spiders.forEach(spider => spider.tick(t));

  // Occasionally generate new lightning bolts
  if (Math.random() < 0.03) {
    lightningBolts.push(new Lightning());
  }

  // Update and draw lightning bolts
  for (let i = lightningBolts.length - 1; i >= 0; i--) {
    const bolt = lightningBolts[i];
    bolt.draw();
    bolt.update();
    if (bolt.isDone()) {
      lightningBolts.splice(i, 1); // Remove finished bolts
    }
  }

  requestAnimationFrame(animate);
}

requestAnimationFrame(animate);
