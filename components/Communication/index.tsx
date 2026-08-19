"use client";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { MessageSquare, Users, Globe, Mic, PenTool, Handshake, Lightbulb, HeartHandshake } from "lucide-react";

const skills = [
  { icon: MessageSquare, title: "Verbal Communication", desc: "Clear and confident verbal communication in professional and technical settings.", color: "text-blue-400", bg: "bg-blue-500/10" },
  { icon: PenTool, title: "Written Communication", desc: "Strong written skills for documentation, reports, emails, and technical writing.", color: "text-indigo-400", bg: "bg-indigo-500/10" },
  { icon: Users, title: "Team Collaboration", desc: "Experienced collaborating in diverse, cross-functional development teams.", color: "text-teal-400", bg: "bg-teal-500/10" },
  { icon: Globe, title: "Cross-Cultural Communication", desc: "Comfortable communicating across cultures, having lived and studied in multiple countries.", color: "text-purple-400", bg: "bg-purple-500/10" },
  { icon: Mic, title: "Technical Presentations", desc: "Ability to present technical concepts clearly to both technical and non-technical audiences.", color: "text-orange-400", bg: "bg-orange-500/10" },
  { icon: Lightbulb, title: "Problem-Solving Discussions", desc: "Skilled at facilitating technical discussions to identify and solve complex problems.", color: "text-yellow-400", bg: "bg-yellow-500/10" },
  { icon: Handshake, title: "Teamwork & Cooperation", desc: "Strong team player who values collaboration, mutual respect, and shared goals.", color: "text-green-400", bg: "bg-green-500/10" },
  { icon: HeartHandshake, title: "Active Listening", desc: "Attentive listener who understands requirements and responds thoughtfully.", color: "text-pink-400", bg: "bg-pink-500/10" },
];

export default function Communication() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="communication" className="section-padding relative section-alt" ref={ref}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-0 w-96 h-96 bg-blue-600/3 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-blue-600 text-sm font-semibold tracking-widest uppercase mb-3 block">Soft Skills</span>
          <h2 className="text-3xl sm:text-4xl font-bold section-title">Communication Skills</h2>
          <p className="text-slate-500 mt-6 max-w-2xl mx-auto text-sm leading-relaxed">
            Technical excellence combined with strong communication skills makes for a well-rounded software engineer.
            I bring both to every project and team I work with.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {skills.map((skill, i) => (
            <motion.div
              key={skill.title}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              whileHover={{ y: -4 }}
              className="glass-card rounded-2xl p-5 transition-all duration-300 group text-center"
            >
              <div className={`w-12 h-12 rounded-xl ${skill.bg} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <skill.icon size={22} className={skill.color} />
              </div>
              <h3 className="text-slate-900 font-semibold text-sm mb-2">{skill.title}</h3>
              <p className="text-slate-500 text-xs leading-relaxed">{skill.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
