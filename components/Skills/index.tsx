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

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 items-start">
          {skillCategories.map((cat, i) => {
            const Icon = iconMap[cat.icon as keyof typeof iconMap] || Code2;
            const tags = cat.skills.filter(s => s.split(" ").length <= 2);
            const descriptors = cat.skills.filter(s => s.split(" ").length > 2);
            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -4 }}
                className="glass-card rounded-2xl overflow-hidden transition-all duration-300 group"
              >
                {/* Accent top bar */}
                <div className="h-1 w-full bg-gradient-to-r from-blue-500 to-blue-400" />

                <div className="p-6">
                  {/* Card header */}
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center group-hover:bg-blue-100 transition-colors duration-300">
                        <Icon size={20} className="text-blue-600" />
                      </div>
                      <h3 className="text-slate-900 font-bold text-sm leading-tight">{cat.title}</h3>
                    </div>
                    <span className="text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-100 rounded-full px-2.5 py-0.5">
                      {cat.skills.length}
                    </span>
                  </div>

                  {/* Tag badges */}
                  <div className="flex flex-wrap gap-1.5">
                    {tags.map((skill, j) => (
                      <motion.span
                        key={skill}
                        initial={{ opacity: 0, scale: 0.85 }}
                        animate={inView ? { opacity: 1, scale: 1 } : {}}
                        transition={{ duration: 0.3, delay: i * 0.1 + j * 0.04 }}
                        className="skill-badge px-3 py-1 rounded-full text-xs font-medium cursor-default"
                      >
                        {skill}
                      </motion.span>
                    ))}
                  </div>

                  {/* Descriptor list */}
                  {descriptors.length > 0 && (
                    <>
                      <div className="my-4 border-t border-slate-100" />
                      <ul className="space-y-2">
                        {descriptors.map((skill, j) => (
                          <motion.li
                            key={skill}
                            initial={{ opacity: 0, x: -8 }}
                            animate={inView ? { opacity: 1, x: 0 } : {}}
                            transition={{ duration: 0.3, delay: i * 0.1 + (tags.length + j) * 0.04 }}
                            className="flex items-center gap-2.5 text-xs text-slate-500"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-300 shrink-0" />
                            {skill}
                          </motion.li>
                        ))}
                      </ul>
                    </>
                  )}
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
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                <Code2 size={18} className="text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest">At a Glance</p>
                <h3 className="text-slate-900 font-bold text-base">Core Technology Stack</h3>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {([
                { label: "Frontend", techs: ["HTML5", "CSS3", "JavaScript", "React.js"] },
                { label: "Backend",  techs: ["Java", "Spring Boot", "PHP", "REST APIs"] },
                { label: "Database", techs: ["MySQL", "PostgreSQL", "SQL"] },
                { label: "Tools",    techs: ["Git", "Linux", "GitHub"] },
              ] as { label: string; techs: string[] }[]).map((group, gi) => (
                <div key={group.label}>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">{group.label}</p>
                  <div className="flex flex-wrap gap-2">
                    {group.techs.map((tech, ti) => (
                      <motion.span
                        key={tech}
                        initial={{ opacity: 0, y: 8 }}
                        animate={inView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.3, delay: 0.6 + gi * 0.08 + ti * 0.04 }}
                        className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition-all cursor-default"
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
