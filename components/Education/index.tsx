"use client";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { GraduationCap, BookOpen, Award, MapPin, Calendar, CheckCircle, Clock } from "lucide-react";
import { educationData } from "@/data/education";

const iconMap = { GraduationCap, BookOpen, Award };

export default function Education() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="education" className="section-padding relative section-alt" ref={ref}>
      {/* Background accent */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-blue-600/4 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-blue-600 text-sm font-semibold tracking-widest uppercase mb-3 block">Academic Background</span>
          <h2 className="text-3xl sm:text-4xl font-bold section-title">Education</h2>
        </motion.div>

        <div className="relative max-w-4xl mx-auto">
          {/* Timeline line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 timeline-line hidden md:block" />

          <div className="space-y-8">
            {educationData.map((edu, i) => {
              const Icon = iconMap[edu.icon as keyof typeof iconMap] || GraduationCap;
              return (
                <motion.div
                  key={edu.id}
                  initial={{ opacity: 0, x: -40 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.6, delay: i * 0.15 }}
                  className="relative md:pl-20"
                >
                  {/* Timeline dot */}
                  <div className="absolute left-4 top-6 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center hidden md:flex shadow-lg shadow-blue-500/30 z-10">
                    <Icon size={16} className="text-white" />
                  </div>

                  <div className="glass-card rounded-2xl p-6 hover:border-blue-500/30 transition-all duration-300 group">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                      <div className="flex items-start gap-3">
                        {/* Mobile icon */}
                        <div className="md:hidden w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                          <Icon size={18} className="text-white" />
                        </div>
                        <div>
                  <h3 className="text-slate-900 font-bold text-lg leading-tight">{edu.degree}</h3>
                          <p className="text-blue-600 font-medium mt-1">{edu.institution}</p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                        edu.status === "Completed"
                          ? "bg-green-500/10 text-green-400 border border-green-500/20"
                          : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                      }`}>
                        {edu.status === "Completed" ? <CheckCircle size={12} /> : <Clock size={12} />}
                        {edu.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-slate-500 mb-3">
                      <span className="flex items-center gap-1.5">
                        <MapPin size={14} className="text-slate-400" />
                        {edu.location}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Calendar size={14} className="text-slate-400" />
                        {edu.period}
                      </span>
                    </div>

                    <p className="text-slate-600 text-sm leading-relaxed">{edu.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
