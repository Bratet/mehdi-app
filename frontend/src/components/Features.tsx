"use client";

import {
  Monitor,
  Clock,
  Coffee,
  Receipt,
  BarChart3,
  Users,
  Wallet,
  HardDrive,
  ArrowRight,
  Gamepad2,
  Wifi,
  Globe,
} from "lucide-react";

const features = [
  {
    icon: Monitor,
    title: "Device Management",
    description:
      "Add, edit, and remove devices with ease. Track real-time status (Available / Busy) with beautiful individual console icons for PlayStation, PC, billiards, ping pong, and more.",
    color: "purple",
    gradient: "from-purple-500/20 to-purple-500/5",
    border: "border-purple-500/20 hover:border-purple-500/50",
    iconBg: "bg-purple-500/15",
    iconColor: "text-purple-400",
    tags: ["PS5 / PS4", "PC / Xbox", "Billiards", "Ping Pong"],
  },
  {
    icon: Clock,
    title: "Session Management",
    description:
      "Start single or multiplayer sessions with real-time timers, smooth progress bars, and automatic cost calculation. Transfer sessions, switch modes, and add snacks on the fly.",
    color: "cyan",
    gradient: "from-cyan-500/20 to-cyan-500/5",
    border: "border-cyan-500/20 hover:border-cyan-500/50",
    iconBg: "bg-cyan-500/15",
    iconColor: "text-cyan-400",
    tags: ["Real-time Timer", "Mode Switching", "Session Transfer"],
  },
  {
    icon: Coffee,
    title: "Café & Drinks Module",
    description:
      "Manage your full product catalog — hot drinks, cold drinks, snacks — and attach them directly to active customer sessions. Full CRUD with category organization.",
    color: "amber",
    gradient: "from-amber-500/20 to-amber-500/5",
    border: "border-amber-500/20 hover:border-amber-500/50",
    iconBg: "bg-amber-500/15",
    iconColor: "text-amber-400",
    tags: ["Hot Drinks", "Cold Drinks", "Snacks"],
  },
  {
    icon: Receipt,
    title: "Billing & Payments",
    description:
      "Auto-calculate session + product totals and generate polished invoices in seconds. Supports cash and digital payment methods with full transaction history.",
    color: "green",
    gradient: "from-green-500/20 to-green-500/5",
    border: "border-green-500/20 hover:border-green-500/50",
    iconBg: "bg-green-500/15",
    iconColor: "text-green-400",
    tags: ["Auto Invoice", "Cash / Digital", "History"],
  },
  {
    icon: BarChart3,
    title: "Reports & Analytics",
    description:
      "Deep business insights with daily, weekly, and monthly revenue reports. Discover your best-selling products, most-used devices, and average revenue per session.",
    color: "blue",
    gradient: "from-blue-500/20 to-blue-500/5",
    border: "border-blue-500/20 hover:border-blue-500/50",
    iconBg: "bg-blue-500/15",
    iconColor: "text-blue-400",
    tags: ["Daily / Weekly", "Revenue Charts", "Top Products"],
  },
  {
    icon: Users,
    title: "User Roles",
    description:
      "Separate admin and cashier accounts with granular permissions. Admins get full control while cashiers see only what they need — clean and secure.",
    color: "pink",
    gradient: "from-pink-500/20 to-pink-500/5",
    border: "border-pink-500/20 hover:border-pink-500/50",
    iconBg: "bg-pink-500/15",
    iconColor: "text-pink-400",
    tags: ["Admin", "Cashier", "Permissions"],
  },
  {
    icon: Wallet,
    title: "Expenses Management",
    description:
      "Log daily expenses with categories and notes. Automatic net profit calculation (Revenue – Expenses) gives you a clear financial picture at all times.",
    color: "orange",
    gradient: "from-orange-500/20 to-orange-500/5",
    border: "border-orange-500/20 hover:border-orange-500/50",
    iconBg: "bg-orange-500/15",
    iconColor: "text-orange-400",
    tags: ["Daily Expenses", "Net Profit", "Categories"],
  },
  {
    icon: HardDrive,
    title: "Backup & Restore",
    description:
      "Full database backup and restore functionality. Your data is always safe, whether migrating devices or recovering from an unexpected failure.",
    color: "teal",
    gradient: "from-teal-500/20 to-teal-500/5",
    border: "border-teal-500/20 hover:border-teal-500/50",
    iconBg: "bg-teal-500/15",
    iconColor: "text-teal-400",
    tags: ["Full Backup", "Easy Restore", "Migration"],
  },
];

const highlights = [
  { icon: Gamepad2, text: "Dark & Light Mode" },
  { icon: Globe, text: "Arabic & English" },
  { icon: Wifi, text: "100% Offline First" },
];

export default function Features() {
  return (
    <section id="features" className="relative py-24 lg:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-dark-800" />
      <div className="absolute inset-0 bg-grid opacity-40" />
      <div className="absolute top-0 left-0 right-0 h-px section-divider" />
      <div className="absolute bottom-0 left-0 right-0 h-px section-divider" />

      {/* Orbs */}
      <div className="absolute top-1/3 right-0 w-96 h-96 orb orb-purple opacity-15" />
      <div className="absolute bottom-1/3 left-0 w-96 h-96 orb orb-cyan opacity-15" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 feature-badge px-4 py-1.5 rounded-full mb-6">
            <span className="text-xs text-purple-400 font-semibold uppercase tracking-widest">
              Everything You Need
            </span>
          </div>
          <h2 className="font-display font-black text-4xl lg:text-6xl text-white mb-6 leading-tight">
            Packed With{" "}
            <span className="gradient-text">Powerful Features</span>
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Every tool a gaming lounge operator needs — device tracking,
            sessions, billing, café management, analytics, and more.
          </p>

          {/* Highlights */}
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            {highlights.map(({ icon: Icon, text }) => (
              <div
                key={text}
                className="flex items-center gap-2 px-4 py-2 glass-card rounded-full"
              >
                <Icon className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-slate-300">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Features grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className={`glass-card border ${feature.border} rounded-2xl p-6 flex flex-col gap-4 group cursor-default`}
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                {/* Icon */}
                <div
                  className={`w-12 h-12 rounded-xl ${feature.iconBg} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                >
                  <Icon className={`w-6 h-6 ${feature.iconColor}`} />
                </div>

                {/* Content */}
                <div>
                  <h3 className="font-bold text-white text-lg mb-2 group-hover:text-purple-300 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mt-auto">
                  {feature.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-1 bg-white/5 border border-white/8 rounded-md text-slate-400"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Arrow */}
                <div className="flex items-center gap-1 text-xs text-slate-500 group-hover:text-purple-400 transition-colors duration-300">
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform duration-300" />
                  <span>Learn more</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
