"use client";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Monitor, Server, Database, Code2, Wrench } from "lucide-react";
import { skillCategories } from "@/data/skills";

const iconMap = { Monitor, Server, Database, Code2, Wrench };

export default function Skills() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="skills" className="section-padding relative" ref={ref}>
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
                      <h3 className="text-slate-800 font-bold text-sm leading-snug">{cat.title}</h3>
                    </div>
                    <span className="text-[11px] font-semibold text-blue-500 bg-blue-50 border border-blue-100 rounded-full px-2.5 py-0.5 shrink-0">
                      {cat.tags.length + cat.capabilities.length}
                    </span>
                  </div>

                  {/* Tech tags */}
                  <div className="flex flex-wrap gap-2">
                    {cat.tags.map((tag, j) => (
                      <motion.span
                        key={tag}
                        initial={{ opacity: 0, scale: 0.85 }}
                        animate={inView ? { opacity: 1, scale: 1 } : {}}
                        transition={{ duration: 0.25, delay: i * 0.1 + j * 0.05 }}
                        className="skill-badge px-3 py-1 rounded-full text-xs font-semibold cursor-default"
                      >
                        {tag}
                      </motion.span>
                    ))}
                  </div>

                  {/* Divider */}
                  <div className="border-t border-slate-100" />

                  {/* Capabilities */}
                  <ul className="space-y-2">
                    {cat.capabilities.map((cap, j) => (
                      <motion.li
                        key={cap}
                        initial={{ opacity: 0, x: -6 }}
                        animate={inView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.25, delay: i * 0.1 + (cat.tags.length + j) * 0.05 }}
                        className="flex items-center gap-2.5 text-xs text-slate-500"
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
                <p className="text-[11px] font-semibold text-blue-500 uppercase tracking-widest">At a Glance</p>
                <h3 className="text-slate-800 font-bold text-base">Core Technology Stack</h3>
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
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">{group.label}</p>
                  <div className="flex flex-col gap-2">
                    {group.techs.map((tech, ti) => (
                      <motion.span
                        key={tech}
                        initial={{ opacity: 0, x: -8 }}
                        animate={inView ? { opacity: 1, x: 0 } : {}}
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
