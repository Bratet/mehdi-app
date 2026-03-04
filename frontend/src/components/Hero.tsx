"use client";

import { useEffect, useRef } from "react";
import {
  Gamepad2,
  Play,
  Star,
  Users,
  Zap,
  Shield,
  Globe,
  ChevronDown,
} from "lucide-react";

const platforms = [
  { label: "Android", icon: "📱" },
  { label: "iOS", icon: "🍎" },
  { label: "Windows", icon: "🪟" },
  { label: "macOS", icon: "💻" },
  { label: "Linux", icon: "🐧" },
  { label: "Web", icon: "🌐" },
];

const badges = [
  { icon: Shield, label: "100% Offline", color: "text-purple-400" },
  { icon: Globe, label: "6 Platforms", color: "text-cyan-400" },
  { icon: Zap, label: "Real-time", color: "text-yellow-400" },
];

export default function Hero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const particles: {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      opacity: number;
      color: string;
    }[] = [];

    const colors = [
      "rgba(124,58,237,",
      "rgba(6,182,212,",
      "rgba(59,130,246,",
    ];

    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.6 + 0.1,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    let animationId: number;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${p.opacity})`;
        ctx.fill();
      });

      // Draw connections
      particles.forEach((a, i) => {
        particles.slice(i + 1).forEach((b) => {
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(124,58,237,${0.08 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-grid">
      {/* Canvas particles */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full opacity-60 pointer-events-none"
      />

      {/* Orbs */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] orb orb-purple opacity-30" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] orb orb-cyan opacity-20" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] orb orb-blue opacity-10" />

      {/* Radial gradient center glow */}
      <div className="absolute inset-0 bg-gradient-radial from-purple-900/20 via-transparent to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        <div className="text-center max-w-5xl mx-auto">
          {/* Top badge */}
          <div className="inline-flex items-center gap-2 feature-badge px-4 py-2 rounded-full mb-8 animate-fade-up">
            <span className="flex h-2 w-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-sm text-slate-300 font-medium">
              Now Available — Flutter 3.x Cross-Platform
            </span>
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
          </div>

          {/* Main headline */}
          <h1 className="font-display font-black text-5xl sm:text-6xl lg:text-8xl text-white mb-6 leading-none tracking-tight animate-fade-up delay-100">
            MANAGE YOUR{" "}
            <span className="gradient-text block mt-2">GAMING LOUNGE</span>
            <span className="text-4xl sm:text-5xl lg:text-6xl block mt-3 text-slate-300 font-semibold tracking-normal font-sans">
              Like a Pro
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto mb-10 leading-relaxed animate-fade-up delay-200">
            The complete management platform for{" "}
            <span className="text-purple-400 font-medium">
              PlayStation lounges
            </span>
            ,{" "}
            <span className="text-cyan-400 font-medium">cyber cafés</span>,{" "}
            <span className="text-yellow-400 font-medium">billiard halls</span>{" "}
            and gaming centers. Real-time sessions, billing, analytics — all
            offline, all in one app.
          </p>

          {/* Badges */}
          <div className="flex flex-wrap justify-center gap-4 mb-10 animate-fade-up delay-300">
            {badges.map(({ icon: Icon, label, color }) => (
              <div
                key={label}
                className="flex items-center gap-2 px-4 py-2 glass-card rounded-lg"
              >
                <Icon className={`w-4 h-4 ${color}`} />
                <span className="text-sm text-slate-300 font-medium">
                  {label}
                </span>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-fade-up delay-400">
            <a
              href="https://pslounghe.web.app"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary group flex items-center justify-center gap-3 px-8 py-4 text-base font-bold text-white rounded-xl relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-3">
                <Play className="w-5 h-5 fill-white" />
                Try Live Demo
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                  Free
                </span>
              </span>
            </a>
            <a
              href="#features"
              className="btn-outline flex items-center justify-center gap-3 px-8 py-4 text-base font-semibold text-slate-300 hover:text-white rounded-xl"
            >
              <Gamepad2 className="w-5 h-5" />
              Explore Features
            </a>
          </div>

          {/* Platform support */}
          <div className="animate-fade-up delay-500">
            <p className="text-xs text-slate-500 uppercase tracking-widest mb-4">
              Available on all platforms
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {platforms.map(({ label, icon }) => (
                <div
                  key={label}
                  className="flex items-center gap-2 px-3 py-1.5 glass-card rounded-full text-sm text-slate-400"
                >
                  <span>{icon}</span>
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-20 animate-fade-up delay-600">
          {[
            { value: "10K+", label: "Active Users", color: "text-purple-400" },
            { value: "6", label: "Platforms Supported", color: "text-cyan-400" },
            {
              value: "100%",
              label: "Offline Capable",
              color: "text-green-400",
            },
            { value: "4.9★", label: "Average Rating", color: "text-yellow-400" },
          ].map(({ value, label, color }) => (
            <div key={label} className="stat-card rounded-2xl p-5 text-center">
              <div
                className={`font-display font-black text-3xl lg:text-4xl ${color} mb-1`}
              >
                {value}
              </div>
              <div className="text-sm text-slate-400">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce-slow">
        <span className="text-xs text-slate-500 tracking-widest uppercase">
          Scroll
        </span>
        <ChevronDown className="w-5 h-5 text-slate-500" />
      </div>
    </section>
  );
}
