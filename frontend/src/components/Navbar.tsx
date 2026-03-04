"use client";

import { useState, useEffect } from "react";
import { Menu, X, Gamepad2, Zap } from "lucide-react";

const navLinks = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "#pricing", label: "Pricing" },
  { href: "#testimonials", label: "Reviews" },
  { href: "#contact", label: "Contact" },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? "bg-dark-900/90 backdrop-blur-xl border-b border-white/5 shadow-lg shadow-black/20"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <a href="#" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center group-hover:shadow-neon-purple transition-all duration-300">
                <Gamepad2 className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -inset-1 bg-gradient-to-br from-purple-600 to-cyan-500 rounded-xl opacity-0 group-hover:opacity-30 blur-md transition-opacity duration-300" />
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-lg text-white leading-none tracking-wider">
                S LOUNGE
              </span>
              <span className="text-xs text-purple-400 leading-none tracking-widest">
                MANAGEMENT
              </span>
            </div>
          </a>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-slate-400 hover:text-white transition-colors duration-200 relative group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-purple-500 to-cyan-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              </a>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <a
              href="https://pslounghe.web.app"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:text-white border border-white/10 hover:border-purple-500/50 rounded-lg transition-all duration-300"
            >
              Live Demo
            </a>
            <a
              href="#contact"
              className="btn-primary flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white rounded-lg relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Get Started
              </span>
            </a>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="lg:hidden p-2 text-slate-400 hover:text-white transition-colors"
          >
            {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden transition-all duration-300 overflow-hidden ${
          isMobileOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="bg-dark-800/95 backdrop-blur-xl border-b border-white/5 px-4 py-4 space-y-1">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setIsMobileOpen(false)}
              className="block px-4 py-3 text-slate-300 hover:text-white hover:bg-purple-500/10 rounded-lg transition-all duration-200"
            >
              {link.label}
            </a>
          ))}
          <div className="pt-3 flex gap-3">
            <a
              href="https://pslounghe.web.app"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center px-4 py-2.5 text-sm text-slate-300 border border-white/10 rounded-lg"
            >
              Live Demo
            </a>
            <a
              href="#contact"
              onClick={() => setIsMobileOpen(false)}
              className="btn-primary flex-1 text-center px-4 py-2.5 text-sm font-semibold text-white rounded-lg relative overflow-hidden"
            >
              <span className="relative z-10">Get Started</span>
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}
