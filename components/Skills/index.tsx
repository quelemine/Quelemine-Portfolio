"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Monitor, Server, Database, Code2, Wrench, X } from "lucide-react";
import { skillCategories } from "@/data/skills";

const iconMap = { Monitor, Server, Database, Code2, Wrench };

const tagInfo: Record<string, { use: string; how: string; related: string[] }> = {
  "HTML5":       { use: "Structure of web pages", how: "Isaac uses HTML5 to build semantic, accessible web layouts", related: ["CSS3", "JavaScript"] },
  "CSS3":        { use: "Styling and layout", how: "Used for responsive designs, animations, and modern UI", related: ["HTML5", "JavaScript"] },
  "JavaScript":  { use: "Web interactivity", how: "Core language for frontend logic and dynamic content", related: ["React.js", "HTML5"] },
  "React.js":    { use: "Component-based UI", how: "Isaac builds SPAs and dashboards with React.js", related: ["JavaScript", "REST APIs"] },
  "Java":        { use: "Backend applications", how: "Primary language for server-side logic and APIs", related: ["Spring Boot", "MySQL"] },
  "Spring Boot": { use: "Java web framework", how: "Used to build REST APIs and backend services quickly", related: ["Java", "REST APIs"] },
  "PHP":         { use: "Server-side scripting", how: "Used in projects like the SICM Church Management System", related: ["MySQL", "HTML5"] },
  "REST APIs":   { use: "Client-server communication", how: "Isaac designs and consumes REST APIs across all projects", related: ["Spring Boot", "Java"] },
  "MySQL":       { use: "Relational database", how: "Primary database for PHP and Java projects", related: ["SQL", "PHP", "Java"] },
  "PostgreSQL":  { use: "Advanced relational DB", how: "Used in Spring Boot backend projects", related: ["SQL", "Spring Boot"] },
  "SQL":         { use: "Database querying", how: "Writing optimized queries for data retrieval and management", related: ["MySQL", "PostgreSQL"] },
  "OOP":         { use: "Software design paradigm", how: "Applied in Java and PHP projects for clean architecture", related: ["Java", "PHP"] },
  "SDLC":        { use: "Software development lifecycle", how: "Isaac follows structured development processes", related: ["Git", "Debugging"] },
  "Git":         { use: "Version control", how: "Used for source control across all projects", related: ["GitHub", "Linux"] },
  "Debugging":   { use: "Finding and fixing bugs", how: "Systematic debugging in Java, PHP, and JavaScript", related: ["OOP", "SDLC"] },
  "GitHub":      { use: "Code hosting & collaboration", how: "All projects are hosted and versioned on GitHub", related: ["Git"] },
  "Linux":       { use: "Server OS", how: "Used for development environments and server management", related: ["Git", "GitHub"] },
  "VS Code":     { use: "Code editor", how: "Primary IDE for all development work", related: ["Git", "JavaScript"] },
};

export default function Skills() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const info = activeTag ? tagInfo[activeTag] : null;

  return (
    <section id="skills" className="section-padding relative overflow-x-hidden" ref={ref}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/3 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-blue-600 text-sm font-semibold tracking-widest uppercase mb-3 block">What I Work With</span>
          <h2 className="text-3xl sm:text-4xl font-bold section-title">Technical Skills</h2>
        </motion.div>

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {skillCategories.map((cat, i) => {
            const Icon = iconMap[cat.icon as keyof typeof iconMap] || Code2;
            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -4 }}
                className="glass-card rounded-2xl overflow-hidden transition-all duration-300 group flex flex-col"
              >
                {/* Accent bar */}
                <div className="h-1 w-full bg-gradient-to-r from-blue-500 to-blue-300" />

                <div className="p-6 flex flex-col gap-5 flex-1">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center group-hover:bg-blue-100 transition-colors duration-300 shrink-0">
                        <Icon size={19} className="text-blue-600" />
                      </div>
                      <h3 className="text-slate-800 font-bold text-base leading-snug">{cat.title}</h3>
                    </div>
                    <span className="text-xs font-semibold text-blue-500 bg-blue-50 border border-blue-100 rounded-full px-2.5 py-0.5 shrink-0" aria-label={`${cat.tags.length + cat.capabilities.length} skills`}>
                      {cat.tags.length + cat.capabilities.length}
                    </span>
                  </div>

                  {/* Tech tags — clickable */}
                  <div className="flex flex-wrap gap-2">
                    {cat.tags.map((tag, j) => (
                      <motion.button
                        key={tag}
                        initial={{ opacity: 0, scale: 0.85 }}
                        animate={inView ? { opacity: 1, scale: 1 } : {}}
                        transition={{ duration: 0.25, delay: i * 0.1 + j * 0.05 }}
                        onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                        aria-pressed={activeTag === tag}
                        aria-label={`View info for ${tag}`}
                        className={`skill-badge px-3 py-1 rounded-full text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                          activeTag === tag ? "ring-2 ring-blue-400 bg-blue-100" : "cursor-pointer hover:ring-1 hover:ring-blue-300"
                        }`}
                      >
                        {tag}
                      </motion.button>
                    ))}
                  </div>

                  {/* Divider */}
                  <div className="border-t border-slate-100" />

                  {/* Capabilities */}
                  <ul className="space-y-2">
                    {cat.capabilities.map((cap, j) => (
                      <motion.li
                        key={cap}
                        initial={{ opacity: 0, y: 6 }}
                        animate={inView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.25, delay: i * 0.1 + (cat.tags.length + j) * 0.05 }}
                        className="flex items-center gap-2.5 text-sm text-slate-500"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-300 shrink-0" />
                        {cap}
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Skill info popover */}
        <AnimatePresence>
          {info && activeTag && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="mt-6 glass-card rounded-2xl p-5 border-l-4 border-blue-500"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="text-slate-800 font-bold text-base mb-3">{activeTag}</p>
                  <div className="grid sm:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-slate-400 uppercase tracking-widest text-xs font-semibold mb-1">Used for</p>
                      <p className="text-slate-700">{info.use}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 uppercase tracking-widest text-xs font-semibold mb-1">How Isaac uses it</p>
                      <p className="text-slate-700">{info.how}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 uppercase tracking-widest text-xs font-semibold mb-1">Related</p>
                      <div className="flex flex-wrap gap-1">
                        {info.related.map((r) => (
                          <button key={r} onClick={() => setActiveTag(r)}
                            aria-label={`View info for ${r}`}
                            className="skill-badge px-2 py-0.5 rounded-full text-xs font-medium hover:ring-1 hover:ring-blue-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                            {r}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <button onClick={() => setActiveTag(null)} aria-label="Close skill info" className="text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded">
                  <X size={16} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Core Technology Stack */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-10 glass-card rounded-2xl overflow-hidden"
        >
          <div className="h-1 w-full bg-gradient-to-r from-blue-600 via-blue-400 to-blue-600" />
          <div className="p-8">
            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                <Code2 size={18} className="text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-blue-500 uppercase tracking-widest">At a Glance</p>
                <h3 className="text-slate-800 font-bold text-lg">Core Technology Stack</h3>
              </div>
            </div>

            {/* Groups */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {([
                { label: "Frontend", color: "border-blue-400",   techs: ["HTML5", "CSS3", "JavaScript", "React.js"] },
                { label: "Backend",  color: "border-indigo-400", techs: ["Java", "Spring Boot", "PHP", "REST APIs"] },
                { label: "Database", color: "border-teal-400",   techs: ["MySQL", "PostgreSQL", "SQL"] },
                { label: "Tools",    color: "border-slate-400",  techs: ["Git", "GitHub", "Linux"] },
              ] as { label: string; color: string; techs: string[] }[]).map((group, gi) => (
                <div key={group.label} className={`pl-4 border-l-2 ${group.color}`}>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">{group.label}</p>
                  <div className="flex flex-col gap-2">
                    {group.techs.map((tech, ti) => (
                      <motion.span
                        key={tech}
                        initial={{ opacity: 0, y: 8 }}
                        animate={inView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.25, delay: 0.6 + gi * 0.08 + ti * 0.04 }}
                        className="text-sm font-medium text-slate-700"
                      >
                        {tech}
                      </motion.span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
