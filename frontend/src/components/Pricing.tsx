"use client";

import { Check, Zap, Crown, Building2 } from "lucide-react";

const plans = [
  {
    name: "Starter",
    icon: Zap,
    price: "Free",
    period: "",
    description: "Perfect for trying out S Lounge in a small setup.",
    color: "text-slate-300",
    iconBg: "bg-slate-500/15",
    iconColor: "text-slate-400",
    badge: null,
    cta: "Try Free",
    ctaClass: "btn-outline text-slate-300 hover:text-white",
    features: [
      "Up to 5 devices",
      "Session management",
      "Basic billing",
      "1 user account",
      "7-day reports",
      "Community support",
    ],
  },
  {
    name: "Pro",
    icon: Crown,
    price: "$29",
    period: "/ one-time",
    description: "Everything you need to run a professional gaming lounge.",
    color: "text-purple-400",
    iconBg: "bg-purple-500/15",
    iconColor: "text-purple-400",
    badge: "Most Popular",
    cta: "Get Pro License",
    ctaClass: "btn-primary text-white",
    features: [
      "Unlimited devices",
      "Full session management",
      "Café & drinks module",
      "Advanced billing & invoices",
      "Admin + Cashier roles",
      "Expenses tracking",
      "Full analytics dashboard",
      "Backup & restore",
      "6 platform builds",
      "Priority email support",
    ],
  },
  {
    name: "Enterprise",
    icon: Building2,
    price: "Custom",
    period: "",
    description: "Multiple branches, white-labeling, and dedicated support.",
    color: "text-cyan-400",
    iconBg: "bg-cyan-500/15",
    iconColor: "text-cyan-400",
    badge: null,
    cta: "Contact Us",
    ctaClass: "btn-outline text-cyan-300 border-cyan-500/40 hover:border-cyan-500/70",
    features: [
      "Everything in Pro",
      "Multi-branch support",
      "White-label builds",
      "Custom feature development",
      "Dedicated account manager",
      "SLA guarantee",
      "On-site training",
      "Source code access",
    ],
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="relative py-24 lg:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-dark-900" />
      <div className="absolute inset-0 bg-grid opacity-30" />

      {/* Orbs */}
      <div className="absolute top-0 right-1/4 w-96 h-96 orb orb-purple opacity-15" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 orb orb-cyan opacity-10" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 feature-badge px-4 py-1.5 rounded-full mb-6">
            <span className="text-xs text-green-400 font-semibold uppercase tracking-widest">
              Pricing
            </span>
          </div>
          <h2 className="font-display font-black text-4xl lg:text-6xl text-white mb-6">
            Simple, <span className="gradient-text">Honest Pricing</span>
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            One-time purchase. No subscriptions, no hidden fees.
            Own the software forever.
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const isPopular = plan.badge === "Most Popular";
            return (
              <div
                key={plan.name}
                className={`relative flex flex-col rounded-3xl p-8 ${
                  isPopular
                    ? "pricing-popular"
                    : "glass-card border border-white/6"
                }`}
              >
                {/* Popular badge */}
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-bold px-5 py-1.5 rounded-full shadow-neon-purple">
                    {plan.badge}
                  </div>
                )}

                {/* Plan icon & name */}
                <div className={`w-12 h-12 rounded-xl ${plan.iconBg} flex items-center justify-center mb-4`}>
                  <Icon className={`w-6 h-6 ${plan.iconColor}`} />
                </div>

                <h3 className={`font-display font-bold text-xl ${plan.color} mb-1`}>
                  {plan.name}
                </h3>
                <p className="text-sm text-slate-400 mb-6 min-h-[40px]">
                  {plan.description}
                </p>

                {/* Price */}
                <div className="flex items-baseline gap-1 mb-8">
                  <span className="font-display font-black text-5xl text-white">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-slate-500 text-sm">{plan.period}</span>
                  )}
                </div>

                {/* CTA */}
                <a
                  href="#contact"
                  className={`${plan.ctaClass} w-full text-center py-3 px-6 rounded-xl font-semibold transition-all duration-300 relative overflow-hidden mb-8 block`}
                >
                  <span className="relative z-10">{plan.cta}</span>
                </a>

                {/* Features */}
                <ul className="space-y-3 flex-1">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-3 text-sm text-slate-300"
                    >
                      <div className="w-5 h-5 rounded-full bg-green-500/15 flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-green-400" />
                      </div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Bottom note */}
        <p className="text-center text-slate-500 text-sm mt-8">
          All licenses include free updates for 6 months · Source code clean & documented
        </p>
      </div>
    </section>
  );
}
