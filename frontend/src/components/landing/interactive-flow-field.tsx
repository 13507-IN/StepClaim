'use client';

import React, { useEffect, useRef, useState } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// ThreeUI-inspired Flow Field with Particle Trails & Hexagonal Territory Nodes
// Based on ThreeUI Procedural WebGL & Particle Systems (threeui.com/backgrounds)
// ─────────────────────────────────────────────────────────────────────────────

// Compact Fast Simplex Noise (Stefan Gustavson algorithm)
class SimplexNoise {
  private perm = new Uint8Array(512);
  private permMod12 = new Uint8Array(512);

  constructor(seed = 13507) {
    const p = new Uint8Array(256);
    for (let i = 0; i < 256; i++) p[i] = i;
    let s = seed;
    for (let i = 255; i > 0; i--) {
      s = (s * 16807 + 0) % 2147483647;
      const j = s % (i + 1);
      const tmp = p[i];
      p[i] = p[j];
      p[j] = tmp;
    }
    for (let i = 0; i < 512; i++) {
      this.perm[i] = p[i & 255];
      this.permMod12[i] = this.perm[i] % 12;
    }
  }

  noise2D(xin: number, yin: number): number {
    const F2 = 0.5 * (Math.sqrt(3) - 1);
    const G2 = (3 - Math.sqrt(3)) / 6;
    const s = (xin + yin) * F2;
    const i = Math.floor(xin + s);
    const j = Math.floor(yin + s);
    const t = (i + j) * G2;
    const X0 = i - t;
    const Y0 = j - t;
    const x0 = xin - X0;
    const y0 = yin - Y0;

    let i1 = 0, j1 = 1;
    if (x0 > y0) { i1 = 1; j1 = 0; }

    const x1 = x0 - i1 + G2;
    const y1 = y0 - j1 + G2;
    const x2 = x0 - 1 + 2 * G2;
    const y2 = y0 - 1 + 2 * G2;

    const ii = i & 255;
    const jj = j & 255;

    let t0 = 0.5 - x0 * x0 - y0 * y0;
    let n0 = 0;
    if (t0 > 0) {
      t0 *= t0;
      const gi = this.permMod12[ii + this.perm[jj]];
      n0 = t0 * t0 * (grad2[gi][0] * x0 + grad2[gi][1] * y0);
    }

    let t1 = 0.5 - x1 * x1 - y1 * y1;
    let n1 = 0;
    if (t1 > 0) {
      t1 *= t1;
      const gi = this.permMod12[ii + i1 + this.perm[jj + j1]];
      n1 = t1 * t1 * (grad2[gi][0] * x1 + grad2[gi][1] * y1);
    }

    let t2 = 0.5 - x2 * x2 - y2 * y2;
    let n2 = 0;
    if (t2 > 0) {
      t2 *= t2;
      const gi = this.permMod12[ii + 1 + this.perm[jj + 1]];
      n2 = t2 * t2 * (grad2[gi][0] * x2 + grad2[gi][1] * y2);
    }

    return 70 * (n0 + n1 + n2);
  }
}

const grad2 = [
  [1, 1], [-1, 1], [1, -1], [-1, -1],
  [1, 0], [-1, 0], [0, 1], [0, -1],
  [0.707, 0.707], [-0.707, 0.707], [0.707, -0.707], [-0.707, -0.707],
];

interface Particle {
  x: number;
  y: number;
  prevX: number;
  prevY: number;
  vx: number;
  vy: number;
  speed: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
}

export function InteractiveFlowField() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [activePreset, setActivePreset] = useState<'gps' | 'territory'>('gps');
  const mouseRef = useRef({ x: -1000, y: -1000, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationId: number;
    const simplex = new SimplexNoise(42);

    let width = (canvas.width = canvas.parentElement?.clientWidth || 800);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 600);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener('resize', handleResize);

    // Particle Palette inspired by StepClaim (Cyan Sky Blue, Strava Sport Orange, Emerald Claim)
    const colors = [
      '#38bdf8', // Neon Sky (Run)
      '#38bdf8',
      '#fc4c02', // Sport Orange (Cadence)
      '#34d399', // Claim Green (Territory)
      '#e0f2fe', // White Glow (GPS Spark)
    ];

    const particleCount = Math.min(Math.floor((width * height) / 900), 550);
    const particles: Particle[] = [];

    const createParticle = (): Particle => {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const maxLife = 120 + Math.random() * 200;
      return {
        x,
        y,
        prevX: x,
        prevY: y,
        vx: 0,
        vy: 0,
        speed: 1.2 + Math.random() * 1.8,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 0.8 + Math.random() * 1.5,
        life: 0,
        maxLife,
      };
    };

    for (let i = 0; i < particleCount; i++) {
      particles.push(createParticle());
    }

    let time = 0;

    const render = () => {
      time += 0.003;

      // Trail decay layer for high-end glowing comet tails
      ctx.fillStyle = 'rgba(10, 13, 20, 0.12)';
      ctx.fillRect(0, 0, width, height);

      // Noise field scaling
      const noiseScale = activePreset === 'gps' ? 0.0025 : 0.0045;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.prevX = p.x;
        p.prevY = p.y;

        // Calculate flow angle via 2D Simplex Noise
        let angle = simplex.noise2D(p.x * noiseScale, p.y * noiseScale + time) * Math.PI * 3;

        // Mouse deflection (interactive physics)
        if (mouseRef.current.active) {
          const dx = p.x - mouseRef.current.x;
          const dy = p.y - mouseRef.current.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 140) {
            const push = (1 - dist / 140) * 4;
            p.x += (dx / dist) * push;
            p.y += (dy / dist) * push;
          }
        }

        p.vx = Math.cos(angle) * p.speed;
        p.vy = Math.sin(angle) * p.speed;

        p.x += p.vx;
        p.y += p.vy;
        p.life++;

        // Draw particle trail line
        ctx.beginPath();
        ctx.moveTo(p.prevX, p.prevY);
        ctx.lineTo(p.x, p.y);
        ctx.strokeStyle = p.color;
        ctx.lineWidth = p.size;
        ctx.stroke();

        // Respawn if offscreen or exceeded life
        if (
          p.x < 0 ||
          p.x > width ||
          p.y < 0 ||
          p.y > height ||
          p.life >= p.maxLife
        ) {
          particles[i] = createParticle();
        }
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    // Mouse & Touch interaction handlers
    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
      mouseRef.current.x = clientX - rect.left;
      mouseRef.current.y = clientY - rect.top;
      mouseRef.current.active = true;
    };

    const onPointerLeave = () => {
      mouseRef.current.active = false;
    };

    canvas.addEventListener('mousemove', onPointerMove);
    canvas.addEventListener('mouseleave', onPointerLeave);
    canvas.addEventListener('touchmove', onPointerMove, { passive: true });
    canvas.addEventListener('touchend', onPointerLeave);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousemove', onPointerMove);
      canvas.removeEventListener('mouseleave', onPointerLeave);
      canvas.removeEventListener('touchmove', onPointerMove);
      canvas.removeEventListener('touchend', onPointerLeave);
    };
  }, [activePreset]);

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-auto overflow-hidden">
      <canvas 
        ref={canvasRef} 
        className="w-full h-full block cursor-crosshair opacity-85"
      />
      {/* Control pill inspired by ThreeUI demo controls */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 p-1 bg-[#131824]/85 backdrop-blur-md border border-white/10 rounded-full text-xs font-mono text-gray-300 shadow-lg">
        <button
          type="button"
          onClick={() => setActivePreset('gps')}
          className={`px-3 py-1 rounded-full transition-all duration-200 ${
            activePreset === 'gps'
              ? 'bg-[#38bdf8] text-[#0a0d14] font-semibold shadow-sm'
              : 'hover:text-white'
          }`}
        >
          GPS Stream
        </button>
        <button
          type="button"
          onClick={() => setActivePreset('territory')}
          className={`px-3 py-1 rounded-full transition-all duration-200 ${
            activePreset === 'territory'
              ? 'bg-[#fc4c02] text-white font-semibold shadow-sm'
              : 'hover:text-white'
          }`}
        >
          Vortex
        </button>
      </div>
    </div>
  );
}
