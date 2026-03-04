"use client";

import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Ahmed Al-Rashidi",
    role: "PlayStation Lounge Owner",
    location: "Riyadh, Saudi Arabia",
    avatar: "AR",
    avatarColor: "from-purple-600 to-blue-600",
    rating: 5,
    text: "S Lounge completely transformed how I run my business. The real-time session tracking and automatic billing have saved me hours every single day. The bilingual support (Arabic/English) is a huge bonus for my staff.",
  },
  {
    name: "Carlos Mendez",
    role: "Cyber Café Manager",
    location: "Mexico City, Mexico",
    avatar: "CM",
    avatarColor: "from-cyan-600 to-teal-600",
    rating: 5,
    text: "I've tried many POS systems for my cyber café and nothing comes close to S Lounge. It runs offline, handles our drinks menu perfectly, and the analytics dashboard shows exactly where our revenue is coming from.",
  },
  {
    name: "Karim Benali",
    role: "Gaming Center Director",
    location: "Algiers, Algeria",
    avatar: "KB",
    avatarColor: "from-amber-600 to-orange-600",
    rating: 5,
    text: "The multi-device management is incredible. I can see all 20 stations at a glance and the session transfer feature is a game-changer when customers want to move. The UI is beautiful on both dark and light mode.",
  },
  {
    name: "Nguyen Van Thanh",
    role: "Internet Café Owner",
    location: "Ho Chi Minh City, Vietnam",
    avatar: "NT",
    avatarColor: "from-green-600 to-emerald-600",
    rating: 5,
    text: "The expenses tracking combined with revenue reports gives me a crystal clear picture of my profitability. Backup and restore features made migrating to new hardware completely stress-free.",
  },
  {
    name: "Omar Khalifa",
    role: "Billiard Hall Owner",
    location: "Dubai, UAE",
    avatar: "OK",
    avatarColor: "from-pink-600 to-rose-600",
    rating: 5,
    text: "What surprised me most was how seamlessly the drinks module integrates with table sessions. Customers can order snacks and it all gets added to their final bill. My cashiers love the simplified cashier mode.",
  },
  {
    name: "Yusuf Ibrahim",
    role: "Gaming Lounge Owner",
    location: "Lagos, Nigeria",
    avatar: "YI",
    avatarColor: "from-indigo-600 to-purple-600",
    rating: 5,
    text: "I was skeptical about a Flutter app but it runs perfectly on our Windows PCs and the web version is excellent as a backup. The one-time purchase price is incredibly fair for what you get.",
  },
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="relative py-24 lg:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-dark-800" />
      <div className="absolute inset-0 bg-grid opacity-30" />
      <div className="absolute top-0 left-0 right-0 h-px section-divider" />
      <div className="absolute bottom-0 left-0 right-0 h-px section-divider" />

      {/* Orbs */}
      <div className="absolute top-1/2 left-0 w-80 h-80 orb orb-purple opacity-12" />
      <div className="absolute top-1/2 right-0 w-80 h-80 orb orb-cyan opacity-12" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 feature-badge px-4 py-1.5 rounded-full mb-6">
            <span className="text-xs text-yellow-400 font-semibold uppercase tracking-widest">
              Customer Reviews
            </span>
          </div>
          <h2 className="font-display font-black text-4xl lg:text-6xl text-white mb-6">
            Loved By{" "}
            <span className="gradient-text">Lounge Owners</span>
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Gaming lounge operators around the world trust S Lounge to run
            their businesses every day.
          </p>

          {/* Rating summary */}
          <div className="inline-flex items-center gap-3 mt-8 px-6 py-3 glass-card rounded-2xl">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              ))}
            </div>
            <span className="font-display font-bold text-2xl text-white">4.9</span>
            <span className="text-slate-400 text-sm">/ 5 · 200+ reviews</span>
          </div>
        </div>

        {/* Testimonials grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t, idx) => (
            <div
              key={t.name}
              className={`glass-card border border-white/6 hover:border-purple-500/30 rounded-2xl p-6 flex flex-col gap-4 transition-all duration-300 hover:-translate-y-1`}
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              {/* Quote icon */}
              <Quote className="w-8 h-8 text-purple-500/40" />

              {/* Stars */}
              <div className="flex gap-0.5">
                {[...Array(t.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 text-yellow-400 fill-yellow-400"
                  />
                ))}
              </div>

              {/* Review text */}
              <p className="text-slate-300 text-sm leading-relaxed flex-1">
                "{t.text}"
              </p>

              {/* Reviewer */}
              <div className="flex items-center gap-3 pt-2 border-t border-white/5">
                <div
                  className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.avatarColor} flex items-center justify-center text-xs font-bold text-white flex-shrink-0`}
                >
                  {t.avatar}
                </div>
                <div>
                  <div className="font-semibold text-white text-sm">{t.name}</div>
                  <div className="text-xs text-slate-500">
                    {t.role} · {t.location}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
