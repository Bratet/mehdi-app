"use client";

import {
  Download,
  Settings,
  Play,
  TrendingUp,
  ChevronRight,
} from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Download,
    title: "Install the App",
    description:
      "Download S Lounge on your preferred platform — Android, iOS, Windows, macOS, Linux, or use it directly in your web browser. No server setup required.",
    iconColor: "text-purple-400",
    iconBg: "bg-purple-500/15",
    dotColor: "bg-purple-500",
    hoverColor: "group-hover:text-purple-400",
  },
  {
    number: "02",
    icon: Settings,
    title: "Configure Your Space",
    description:
      "Add your devices (PlayStation, PC, billiard tables, etc.), set pricing per hour for single and multiplayer modes, and add your café products.",
    iconColor: "text-cyan-400",
    iconBg: "bg-cyan-500/15",
    dotColor: "bg-cyan-500",
    hoverColor: "group-hover:text-cyan-400",
  },
  {
    number: "03",
    icon: Play,
    title: "Start Serving Customers",
    description:
      "Open sessions with one tap, track timers in real time, attach drinks and snacks, handle payments, and generate invoices instantly.",
    iconColor: "text-green-400",
    iconBg: "bg-green-500/15",
    dotColor: "bg-green-500",
    hoverColor: "group-hover:text-green-400",
  },
  {
    number: "04",
    icon: TrendingUp,
    title: "Grow With Analytics",
    description:
      "Review daily, weekly and monthly revenue. Identify your best products and busiest devices. Track expenses and monitor net profit automatically.",
    iconColor: "text-amber-400",
    iconBg: "bg-amber-500/15",
    dotColor: "bg-amber-500",
    hoverColor: "group-hover:text-amber-400",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-24 lg:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-dark-900" />
      <div className="absolute inset-0 bg-grid opacity-30" />

      {/* Center orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] orb orb-purple opacity-8" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 feature-badge px-4 py-1.5 rounded-full mb-6">
            <span className="text-xs text-cyan-400 font-semibold uppercase tracking-widest">
              Simple Setup
            </span>
          </div>
          <h2 className="font-display font-black text-4xl lg:text-6xl text-white mb-6">
            Up & Running in{" "}
            <span className="gradient-text">Minutes</span>
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            No complicated configuration. Just install, set up your devices, and
            start managing your lounge professionally from day one.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connecting line (desktop) */}
          <div className="hidden lg:block absolute top-16 left-0 right-0 h-px">
            <div className="mx-auto max-w-5xl h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div key={step.title} className="relative flex flex-col items-center text-center group">
                  {/* Step number + icon */}
                  <div className="relative mb-6">
                    <div
                      className={`w-20 h-20 rounded-2xl ${step.iconBg} border border-white/8 flex items-center justify-center group-hover:scale-110 transition-all duration-300 group-hover:shadow-lg`}
                    >
                      <Icon className={`w-9 h-9 ${step.iconColor}`} />
                    </div>
                    <div
                      className={`absolute -top-3 -right-3 w-8 h-8 ${step.dotColor} rounded-full flex items-center justify-center text-xs font-black text-white font-display shadow-lg`}
                    >
                      {idx + 1}
                    </div>
                  </div>

                  {/* Arrow between steps (desktop) */}
                  {idx < steps.length - 1 && (
                    <div className="hidden lg:flex absolute top-8 -right-4 z-10 items-center">
                      <ChevronRight className="w-5 h-5 text-slate-600" />
                    </div>
                  )}

                  {/* Content */}
                  <div className="font-display font-bold text-4xl text-white/10 mb-3">
                    {step.number}
                  </div>
                  <h3 className={`font-bold text-xl text-white mb-3 ${step.hoverColor} transition-colors duration-300`}>
                    {step.title}
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed max-w-xs mx-auto">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA below */}
        <div className="text-center mt-16">
          <a
            href="https://pslounghe.web.app"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary inline-flex items-center gap-3 px-8 py-4 text-base font-bold text-white rounded-xl relative overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-3">
              <Play className="w-5 h-5 fill-white" />
              Experience the Live Demo
            </span>
          </a>
          <p className="text-slate-500 text-sm mt-3">
            No account needed · Instant access
          </p>
        </div>
      </div>
    </section>
  );
}
