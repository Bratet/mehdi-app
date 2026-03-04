"use client";

import { useState } from "react";
import { Send, MessageCircle, Mail, MapPin, CheckCircle, AlertCircle } from "lucide-react";

type FormState = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

type SubmitState = "idle" | "loading" | "success" | "error";

export default function Contact() {
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitState("loading");
    setErrorMsg("");

    try {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${apiUrl}/api/contact/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Failed to send message.");
      }

      setSubmitState("success");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      setSubmitState("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
    }
  };

  return (
    <section id="contact" className="relative py-24 lg:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-dark-900" />
      <div className="absolute inset-0 bg-grid opacity-30" />
      <div className="absolute top-0 left-0 right-0 h-px section-divider" />

      {/* Orbs */}
      <div className="absolute top-1/3 right-10 w-80 h-80 orb orb-purple opacity-15" />
      <div className="absolute bottom-1/3 left-10 w-80 h-80 orb orb-cyan opacity-10" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 feature-badge px-4 py-1.5 rounded-full mb-6">
            <span className="text-xs text-purple-400 font-semibold uppercase tracking-widest">
              Get In Touch
            </span>
          </div>
          <h2 className="font-display font-black text-4xl lg:text-6xl text-white mb-6">
            Ready to <span className="gradient-text">Level Up</span>?
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Have questions or need a custom solution? Reach out and our team
            will get back to you within 24 hours.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-12 max-w-5xl mx-auto">
          {/* Left info panel */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="glass-card border border-white/6 rounded-2xl p-6">
              <h3 className="font-bold text-white text-xl mb-6">
                Contact Information
              </h3>
              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Mail className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white mb-0.5">Email</div>
                    <div className="text-sm text-slate-400">support@slouge.app</div>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <MessageCircle className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white mb-0.5">Live Chat</div>
                    <div className="text-sm text-slate-400">Available Mon–Sat, 9am–6pm</div>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-green-500/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <MapPin className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white mb-0.5">Response Time</div>
                    <div className="text-sm text-slate-400">Within 24 hours guaranteed</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Demo CTA */}
            <div className="glass-card border border-purple-500/20 rounded-2xl p-6 bg-gradient-to-br from-purple-500/10 to-blue-500/5">
              <h4 className="font-bold text-white mb-2">Try Before You Buy</h4>
              <p className="text-sm text-slate-400 mb-4">
                Experience the full system live in your browser — no account
                needed.
              </p>
              <a
                href="https://pslounghe.web.app"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary w-full text-center py-2.5 px-4 rounded-xl text-sm font-semibold text-white relative overflow-hidden block"
              >
                <span className="relative z-10">Open Live Demo →</span>
              </a>
            </div>
          </div>

          {/* Contact form */}
          <div className="lg:col-span-3">
            <div className="glass-card border border-white/6 rounded-2xl p-8">
              {submitState === "success" ? (
                <div className="flex flex-col items-center justify-center text-center py-12 gap-4">
                  <div className="w-16 h-16 rounded-full bg-green-500/15 flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-green-400" />
                  </div>
                  <h3 className="font-bold text-xl text-white">Message Sent!</h3>
                  <p className="text-slate-400 text-sm max-w-xs">
                    Thanks for reaching out. We'll get back to you within 24 hours.
                  </p>
                  <button
                    onClick={() => setSubmitState("idle")}
                    className="mt-4 text-sm text-purple-400 hover:text-purple-300 underline"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        required
                        placeholder="Your name"
                        className="input-gaming w-full px-4 py-3 rounded-xl text-white placeholder-slate-600 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        required
                        placeholder="your@email.com"
                        className="input-gaming w-full px-4 py-3 rounded-xl text-white placeholder-slate-600 text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Subject
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={form.subject}
                      onChange={handleChange}
                      required
                      placeholder="How can we help?"
                      className="input-gaming w-full px-4 py-3 rounded-xl text-white placeholder-slate-600 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Message
                    </label>
                    <textarea
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      required
                      rows={5}
                      placeholder="Tell us about your lounge and what you need..."
                      className="input-gaming w-full px-4 py-3 rounded-xl text-white placeholder-slate-600 text-sm resize-none"
                    />
                  </div>

                  {submitState === "error" && (
                    <div className="flex items-center gap-3 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                      <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                      <p className="text-sm text-red-300">{errorMsg}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitState === "loading"}
                    className="btn-primary w-full flex items-center justify-center gap-3 px-6 py-4 text-sm font-bold text-white rounded-xl relative overflow-hidden disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <span className="relative z-10 flex items-center gap-3">
                      {submitState === "loading" ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Send Message
                        </>
                      )}
                    </span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
