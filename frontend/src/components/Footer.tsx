"use client";

import { Gamepad2, Github, Twitter, MessageCircle, ExternalLink } from "lucide-react";

const footerLinks: Record<string, { label: string; href: string; external?: boolean }[]> = {
  Product: [
    { label: "Features", href: "#features" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Pricing", href: "#pricing" },
    { label: "Tech Stack", href: "#tech-stack" },
    { label: "Live Demo", href: "https://pslounghe.web.app", external: true },
  ],
  Support: [
    { label: "Contact Us", href: "#contact" },
    { label: "Testimonials", href: "#testimonials" },
  ],
  Company: [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
  ],
};

const socials = [
  { icon: Github, href: "#", label: "GitHub" },
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: MessageCircle, href: "#", label: "Discord" },
];

const platforms = ["Android", "iOS", "Windows", "macOS", "Linux", "Web"];

export default function Footer() {
  return (
    <footer className="relative bg-dark-900 border-t border-white/5 overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-20" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main footer content */}
        <div className="py-16 grid grid-cols-2 md:grid-cols-5 gap-10">
          {/* Brand column */}
          <div className="col-span-2">
            <a href="#" className="flex items-center gap-3 mb-5 group w-fit">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center">
                <Gamepad2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-display font-bold text-lg text-white tracking-wider block leading-none">
                  S LOUNGE
                </span>
                <span className="text-xs text-purple-400 tracking-widest">
                  MANAGEMENT
                </span>
              </div>
            </a>

            <p className="text-sm text-slate-400 leading-relaxed max-w-xs mb-6">
              The professional management solution for gaming lounges, cyber cafés,
              billiard halls and beverage cafés. Cross-platform. Fully offline.
            </p>

            {/* Platform tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              {platforms.map((p) => (
                <span
                  key={p}
                  className="text-xs px-2.5 py-1 bg-white/5 border border-white/8 rounded-full text-slate-500"
                >
                  {p}
                </span>
              ))}
            </div>

            {/* Socials */}
            <div className="flex gap-3">
              {socials.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center text-slate-400 hover:text-white hover:bg-purple-500/20 hover:border-purple-500/30 transition-all duration-300"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([group, links]) => (
            <div key={group}>
              <h4 className="font-semibold text-white text-sm mb-4 tracking-wide">
                {group}
              </h4>
              <ul className="space-y-3">
                {links.map(({ label, href, external }) => (
                  <li key={label}>
                    <a
                      href={href}
                      target={external ? "_blank" : undefined}
                      rel={external ? "noopener noreferrer" : undefined}
                      className="text-sm text-slate-400 hover:text-white transition-colors duration-200 flex items-center gap-1 group"
                    >
                      {label}
                      {external && (
                        <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/5 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} S Lounge. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span>Built with</span>
            <span className="text-red-400">♥</span>
            <span>using Flutter · Next.js · FastAPI · PostgreSQL</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <a href="#" className="hover:text-slate-300 transition-colors">
              Terms
            </a>
            <a href="#" className="hover:text-slate-300 transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-slate-300 transition-colors">
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
