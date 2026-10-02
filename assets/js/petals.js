/**
 * Antigravity Flower Petals Physics & Animation Engine
 * Creates floating, drifting, rotating white flower petals with 3D depth and interactive wind.
 */

class PetalEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.petals = [];
    this.maxPetals = 45;
    this.mouse = { x: -1000, y: -1000, radius: 150 };
    this.wind = { x: 0.2, y: 0.6, targetX: 0.2, targetY: 0.6 };
    this.time = 0;
    
    this.init();
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize());
    
    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });

    window.addEventListener('mouseleave', () => {
      this.mouse.x = -1000;
      this.mouse.y = -1000;
    });

    // Populate initial petals
    for (let i = 0; i < this.maxPetals; i++) {
      this.petals.push(this.createPetal(true));
    }

    this.animate();
  }

  resize() {
    this.width = this.canvas.width = window.innerWidth;
    this.height = this.canvas.height = window.innerHeight;
  }

  createPetal(randomY = false) {
    const size = 12 + Math.random() * 22;
    return {
      x: Math.random() * this.width,
      y: randomY ? Math.random() * this.height : -30 - Math.random() * 50,
      size: size,
      aspectRatio: 0.6 + Math.random() * 0.4,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.02,
      tilt: Math.random() * Math.PI,
      tiltSpeed: 0.01 + Math.random() * 0.02,
      speedX: (Math.random() - 0.5) * 0.8,
      speedY: 0.4 + Math.random() * 0.9,
      opacity: 0.4 + Math.random() * 0.55,
      z: 0.5 + Math.random() * 1.5, // Depth scale
      curl: Math.random() * 0.4,
      colorVariant: Math.random(), // White, ivory, subtle cream
      oscillationSpeed: 0.01 + Math.random() * 0.02,
      oscillationAmp: 20 + Math.random() * 40,
      baseX: Math.random() * this.width
    };
  }

  drawPetal(p) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    ctx.scale(Math.cos(p.tilt) * p.z, p.z);

    const w = p.size * p.aspectRatio;
    const h = p.size;

    // Gradient for realistic petal translucent texture
    const grad = ctx.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2);
    if (p.colorVariant > 0.6) {
      // Soft creamy ivory
      grad.addColorStop(0, `rgba(255, 255, 255, ${p.opacity})`);
      grad.addColorStop(0.7, `rgba(247, 243, 235, ${p.opacity * 0.9})`);
      grad.addColorStop(1, `rgba(235, 228, 215, ${p.opacity * 0.7})`);
    } else if (p.colorVariant > 0.3) {
      // Pure floral white with gentle sage tint reflection
      grad.addColorStop(0, `rgba(255, 255, 255, ${p.opacity})`);
      grad.addColorStop(0.5, `rgba(250, 252, 250, ${p.opacity * 0.85})`);
      grad.addColorStop(1, `rgba(225, 235, 228, ${p.opacity * 0.65})`);
    } else {
      // Pure luminous white
      grad.addColorStop(0, `rgba(255, 255, 255, ${p.opacity})`);
      grad.addColorStop(1, `rgba(242, 245, 243, ${p.opacity * 0.75})`);
    }

    ctx.fillStyle = grad;
    ctx.beginPath();

    // Natural curved organic petal geometry
    ctx.moveTo(0, -h / 2);
    ctx.bezierCurveTo(w * 0.8, -h * 0.3, w * 0.9, h * 0.3, 0, h / 2);
    ctx.bezierCurveTo(-w * 0.9, h * 0.3, -w * 0.8, -h * 0.3, 0, -h / 2);
    ctx.closePath();

    ctx.shadowColor = 'rgba(15, 30, 20, 0.12)';
    ctx.shadowBlur = 8 * p.z;
    ctx.shadowOffsetX = 2 * p.z;
    ctx.shadowOffsetY = 4 * p.z;

    ctx.fill();

    // Subtle petal center vein
    ctx.beginPath();
    ctx.moveTo(0, -h * 0.4);
    ctx.quadraticCurveTo(w * 0.1, 0, 0, h * 0.35);
    ctx.strokeStyle = `rgba(255, 255, 255, ${p.opacity * 0.4})`;
    ctx.lineWidth = 0.75 * p.z;
    ctx.stroke();

    ctx.restore();
  }

  update() {
    this.time += 0.015;

    // Gentle global wind variation
    if (Math.random() < 0.01) {
      this.wind.targetX = 0.1 + (Math.random() - 0.3) * 0.6;
      this.wind.targetY = 0.4 + Math.random() * 0.5;
    }
    this.wind.x += (this.wind.targetX - this.wind.x) * 0.02;
    this.wind.y += (this.wind.targetY - this.wind.y) * 0.02;

    this.petals.forEach((p, idx) => {
      // Swaying horizontal motion
      p.x += p.speedX + this.wind.x + Math.sin(this.time * 2 + idx) * 0.4;
      p.y += p.speedY * this.wind.y * p.z;

      p.rotation += p.rotationSpeed;
      p.tilt += p.tiltSpeed;

      // Mouse deflection interaction
      const dx = p.x - this.mouse.x;
      const dy = p.y - this.mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < this.mouse.radius) {
        const force = (1 - dist / this.mouse.radius) * 3;
        p.x += (dx / dist) * force;
        p.y += (dy / dist) * force;
        p.rotation += 0.05 * force;
      }

      // Recycle petals when they exit the viewport
      if (p.y > this.height + 40 || p.x < -60 || p.x > this.width + 60) {
        this.petals[idx] = this.createPetal(false);
      }
    });
  }

  animate() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    this.update();
    for (let i = 0; i < this.petals.length; i++) {
      this.drawPetal(this.petals[i]);
    }

    requestAnimationFrame(() => this.animate());
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.petalEngine = new PetalEngine('petals-canvas');
});
