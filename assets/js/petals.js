/**
 * High-Performance Antigravity Flower Petals Physics & Animation Engine
 * Optimized for 60-120 FPS using Offscreen Canvas Sprite Caching, High-DPI scaling,
 * Delta-time smoothing, and GPU accelerated drawing.
 */

class HighPerformancePetalEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d', { alpha: true, desynchronized: true });
    this.petals = [];
    this.maxPetals = window.innerWidth < 768 ? 24 : 42; // Adaptive count for device power
    this.mouse = { x: -1000, y: -1000, radius: 160 };
    this.wind = { x: 0.15, y: 0.55, targetX: 0.15, targetY: 0.55 };
    this.time = 0;
    this.lastTime = performance.now();
    this.dpr = Math.min(window.devicePixelRatio || 1, 2); // Cap at 2x to save GPU fill rate

    this.petalSprites = [];
    this.initSprites();
    this.init();
  }

  // Pre-render petal variations into offscreen canvases to avoid expensive runtime vector/shadow calculations
  initSprites() {
    const spriteSizes = [24, 36, 48]; // Small, Medium, Large sprites
    const colorStyles = [
      { top: '#ffffff', mid: '#f7f4ed', bot: '#ebe3d3' }, // Ivory Cream
      { top: '#ffffff', mid: '#fafcfa', bot: '#dfe9e2' }, // Soft Sage Tint
      { top: '#ffffff', mid: '#fbfdfc', bot: '#edf2ef' }  // Pure Floral White
    ];

    colorStyles.forEach((style) => {
      spriteSizes.forEach((baseSize) => {
        const offCanvas = document.createElement('canvas');
        const padding = 16;
        const width = baseSize + padding * 2;
        const height = baseSize * 1.4 + padding * 2;
        offCanvas.width = width * this.dpr;
        offCanvas.height = height * this.dpr;

        const oCtx = offCanvas.getContext('2d');
        oCtx.scale(this.dpr, this.dpr);

        const cx = width / 2;
        const cy = height / 2;
        const w = baseSize * 0.75;
        const h = baseSize * 1.25;

        // Draw soft glow/shadow directly on sprite
        oCtx.shadowColor = 'rgba(12, 28, 18, 0.18)';
        oCtx.shadowBlur = 8;
        oCtx.shadowOffsetX = 1;
        oCtx.shadowOffsetY = 3;

        // Petal Gradient
        const grad = oCtx.createLinearGradient(cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2);
        grad.addColorStop(0, style.top);
        grad.addColorStop(0.65, style.mid);
        grad.addColorStop(1, style.bot);

        oCtx.fillStyle = grad;
        oCtx.beginPath();
        oCtx.moveTo(cx, cy - h / 2);
        oCtx.bezierCurveTo(cx + w * 0.8, cy - h * 0.3, cx + w * 0.9, cy + h * 0.3, cx, cy + h / 2);
        oCtx.bezierCurveTo(cx - w * 0.9, cy + h * 0.3, cx - w * 0.8, cy - h * 0.3, cx, cy - h / 2);
        oCtx.closePath();
        oCtx.fill();

        // Subtle petal vein
        oCtx.shadowColor = 'transparent';
        oCtx.beginPath();
        oCtx.moveTo(cx, cy - h * 0.38);
        oCtx.quadraticCurveTo(cx + w * 0.08, cy, cx, cy + h * 0.35);
        oCtx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
        oCtx.lineWidth = 1;
        oCtx.stroke();

        this.petalSprites.push({
          canvas: offCanvas,
          width: width,
          height: height
        });
      });
    });
  }

  init() {
    this.resize();
    
    // Throttled resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => this.resize(), 100);
    }, { passive: true });

    // Passive mouse tracking
    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    }, { passive: true });

    window.addEventListener('mouseleave', () => {
      this.mouse.x = -1000;
      this.mouse.y = -1000;
    }, { passive: true });

    for (let i = 0; i < this.maxPetals; i++) {
      this.petals.push(this.createPetal(true));
    }

    this.lastTime = performance.now();
    requestAnimationFrame((now) => this.animate(now));
  }

  resize() {
    this.cssWidth = window.innerWidth;
    this.cssHeight = window.innerHeight;
    this.canvas.width = this.cssWidth * this.dpr;
    this.canvas.height = this.cssHeight * this.dpr;
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  }

  createPetal(randomY = false) {
    const spriteIdx = Math.floor(Math.random() * this.petalSprites.length);
    const scale = 0.5 + Math.random() * 0.65;
    return {
      x: Math.random() * this.cssWidth,
      y: randomY ? Math.random() * this.cssHeight : -40 - Math.random() * 60,
      sprite: this.petalSprites[spriteIdx],
      scale: scale,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.018,
      tilt: Math.random() * Math.PI,
      tiltSpeed: 0.012 + Math.random() * 0.018,
      speedX: (Math.random() - 0.5) * 0.6,
      speedY: 0.35 + Math.random() * 0.75,
      opacity: 0.45 + Math.random() * 0.5,
      z: 0.6 + Math.random() * 0.9,
      oscillationSpeed: 0.01 + Math.random() * 0.02
    };
  }

  update(deltaFactor) {
    this.time += 0.015 * deltaFactor;

    // Smooth wind vector transitions
    if (Math.random() < 0.015) {
      this.wind.targetX = 0.1 + (Math.random() - 0.3) * 0.5;
      this.wind.targetY = 0.4 + Math.random() * 0.45;
    }
    this.wind.x += (this.wind.targetX - this.wind.x) * 0.02 * deltaFactor;
    this.wind.y += (this.wind.targetY - this.wind.y) * 0.02 * deltaFactor;

    const petalsLength = this.petals.length;
    for (let i = 0; i < petalsLength; i++) {
      const p = this.petals[i];

      // Lateral sway + wind drift
      p.x += (p.speedX + this.wind.x + Math.sin(this.time * 2 + i) * 0.35) * deltaFactor;
      p.y += (p.speedY * this.wind.y * p.z) * deltaFactor;

      p.rotation += p.rotationSpeed * deltaFactor;
      p.tilt += p.tiltSpeed * deltaFactor;

      // Cursor deflection interaction (GPU-friendly math)
      const dx = p.x - this.mouse.x;
      const dy = p.y - this.mouse.y;
      const distSq = dx * dx + dy * dy;
      const radSq = this.mouse.radius * this.mouse.radius;

      if (distSq < radSq && distSq > 0) {
        const dist = Math.sqrt(distSq);
        const force = (1 - dist / this.mouse.radius) * 2.8 * deltaFactor;
        p.x += (dx / dist) * force;
        p.y += (dy / dist) * force;
        p.rotation += 0.04 * force;
      }

      // Recycle out-of-bounds petals
      if (p.y > this.cssHeight + 50 || p.x < -60 || p.x > this.cssWidth + 60) {
        this.petals[i] = this.createPetal(false);
      }
    }
  }

  draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.cssWidth, this.cssHeight);

    const petalsLength = this.petals.length;
    for (let i = 0; i < petalsLength; i++) {
      const p = this.petals[i];
      const sprite = p.sprite;
      const w = sprite.width * p.scale;
      const h = sprite.height * p.scale;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.scale(Math.cos(p.tilt) * p.z, p.z);
      ctx.globalAlpha = p.opacity;

      // Ultra-fast blit from cached sprite canvas
      ctx.drawImage(sprite.canvas, -w / 2, -h / 2, w, h);

      ctx.restore();
    }
  }

  animate(currentTime) {
    const deltaMs = Math.min(currentTime - this.lastTime, 50); // Cap delta to avoid jumps
    this.lastTime = currentTime;
    const deltaFactor = deltaMs / 16.667; // Normalize to 60fps base

    this.update(deltaFactor);
    this.draw();

    requestAnimationFrame((now) => this.animate(now));
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.petalEngine = new HighPerformancePetalEngine('petals-canvas');
});
