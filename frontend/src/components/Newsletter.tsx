"use client";

import { useState } from "react";
import { Bell, CheckCircle, AlertCircle } from "lucide-react";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${apiUrl}/api/newsletter/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to subscribe.");

      setStatus("success");
      setMessage(data.message);
      setEmail("");
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Something went wrong.");
    }
  };

  return (
    <section className="relative py-20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-dark-800 to-cyan-900/20" />
      <div className="absolute inset-0 bg-grid opacity-20" />

      {/* Orbs */}
      <div className="absolute top-0 left-1/3 w-72 h-72 orb orb-purple opacity-20" />
      <div className="absolute bottom-0 right-1/3 w-72 h-72 orb orb-cyan opacity-15" />

      <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="w-14 h-14 rounded-2xl bg-purple-500/15 border border-purple-500/20 flex items-center justify-center mx-auto mb-6">
          <Bell className="w-7 h-7 text-purple-400" />
        </div>

        <h2 className="font-display font-bold text-3xl lg:text-4xl text-white mb-4">
          Stay in the <span className="gradient-text">Loop</span>
        </h2>
        <p className="text-slate-400 mb-8 max-w-md mx-auto">
          Get notified about new features, updates, and exclusive offers for S
          Lounge.
        </p>

        {status === "success" ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-green-500/15 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
            <p className="text-green-300 font-medium">{message}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-3 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
              className="input-gaming flex-1 px-4 py-3 rounded-xl text-white placeholder-slate-600 text-sm"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="btn-primary px-6 py-3 text-sm font-bold text-white rounded-xl relative overflow-hidden whitespace-nowrap disabled:opacity-60"
            >
              <span className="relative z-10">
                {status === "loading" ? "..." : "Subscribe"}
              </span>
            </button>
          </form>
        )}

        {status === "error" && (
          <div className="flex items-center justify-center gap-2 mt-3">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <p className="text-sm text-red-300">{message}</p>
          </div>
        )}

        <p className="text-xs text-slate-600 mt-4">
          No spam. Unsubscribe anytime.
        </p>
      </div>
    </section>
  );
}
