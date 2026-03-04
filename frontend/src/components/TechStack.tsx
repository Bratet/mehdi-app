"use client";

const techs = [
  {
    name: "Flutter 3.x",
    description: "Beautiful cross-platform UI with Material Design 3",
    icon: "🐦",
    color: "from-blue-500/20 to-blue-500/5",
    border: "border-blue-500/20",
    tag: "Frontend",
    tagColor: "text-blue-400 bg-blue-500/10",
  },
  {
    name: "SQLite / Drift",
    description: "Fully offline database with reactive streams & migrations",
    icon: "🗃️",
    color: "from-green-500/20 to-green-500/5",
    border: "border-green-500/20",
    tag: "Database",
    tagColor: "text-green-400 bg-green-500/10",
  },
  {
    name: "Provider / GetX",
    description: "Efficient reactive state management throughout the app",
    icon: "⚡",
    color: "from-purple-500/20 to-purple-500/5",
    border: "border-purple-500/20",
    tag: "State",
    tagColor: "text-purple-400 bg-purple-500/10",
  },
  {
    name: "Material Design 3",
    description: "Polished, accessible UI with dynamic theming support",
    icon: "🎨",
    color: "from-pink-500/20 to-pink-500/5",
    border: "border-pink-500/20",
    tag: "Design",
    tagColor: "text-pink-400 bg-pink-500/10",
  },
  {
    name: "6 Platforms",
    description: "Android, iOS, Windows, macOS, Linux, Web — one codebase",
    icon: "🌐",
    color: "from-cyan-500/20 to-cyan-500/5",
    border: "border-cyan-500/20",
    tag: "Cross-Platform",
    tagColor: "text-cyan-400 bg-cyan-500/10",
  },
  {
    name: "Offline First",
    description: "Zero internet dependency — works perfectly without any server",
    icon: "📡",
    color: "from-amber-500/20 to-amber-500/5",
    border: "border-amber-500/20",
    tag: "Architecture",
    tagColor: "text-amber-400 bg-amber-500/10",
  },
];

export default function TechStack() {
  return (
    <section className="relative py-24 lg:py-28 overflow-hidden">
      <div className="absolute inset-0 bg-dark-800" />
      <div className="absolute inset-0 bg-grid opacity-30" />
      <div className="absolute top-0 left-0 right-0 h-px section-divider" />
      <div className="absolute bottom-0 left-0 right-0 h-px section-divider" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 feature-badge px-4 py-1.5 rounded-full mb-6">
            <span className="text-xs text-amber-400 font-semibold uppercase tracking-widest">
              Built With
            </span>
          </div>
          <h2 className="font-display font-black text-4xl lg:text-5xl text-white mb-4">
            Modern <span className="gradient-text">Tech Stack</span>
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            Engineered with production-grade tools for reliability, performance,
            and developer experience.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {techs.map((tech) => (
            <div
              key={tech.name}
              className={`group relative glass-card border ${tech.border} rounded-2xl p-6 overflow-hidden`}
            >
              {/* BG gradient */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${tech.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl`}
              />

              <div className="relative z-10 flex items-start gap-4">
                <div className="text-4xl leading-none">{tech.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold text-white text-lg">{tech.name}</h3>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${tech.tagColor}`}
                    >
                      {tech.tag}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {tech.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
