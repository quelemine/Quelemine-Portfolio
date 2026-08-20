"use client";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Globe } from "lucide-react";

const languages = [
  { name: "English", level: "Professional Fluency", flag: "🇺🇸", proficiency: 95, color: "from-blue-500 to-blue-600", badge: "Professional" },
  { name: "Kpelle", level: "Native Language / Mother Tongue", flag: "🇱🇷", proficiency: 100, color: "from-red-500 to-red-600", badge: "Native" },
  { name: "French", level: "Basic Knowledge", flag: "🇫🇷", proficiency: 30, color: "from-indigo-500 to-indigo-600", badge: "Basic" },
  { name: "Turkish", level: "Basic Knowledge", flag: "🇹🇷", proficiency: 25, color: "from-red-600 to-orange-500", badge: "Basic" },
  { name: "Kinyarwanda", level: "Basic Knowledge", flag: "🇷🇼", proficiency: 25, color: "from-teal-500 to-green-500", badge: "Basic" },
];

const badgeColors: Record<string, string> = {
  Native: "bg-green-100 text-green-700 border-green-200",
  Professional: "bg-blue-100 text-blue-700 border-blue-200",
  Basic: "bg-slate-100 text-slate-600 border-slate-200",
};

export default function Languages() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="languages" className="section-padding relative" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-blue-600 text-sm font-semibold tracking-widest uppercase mb-3 block">Multilingual</span>
          <h2 className="text-3xl sm:text-4xl font-bold section-title">Language Skills</h2>
          <p className="text-slate-500 mt-6 max-w-xl mx-auto text-sm">
            Speaking multiple languages reflects my international background and ability to connect with diverse communities.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 max-w-5xl mx-auto">
          {languages.map((lang, i) => (
            <motion.div
              key={lang.name}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -4 }}
              className="glass-card rounded-2xl p-5 text-center transition-all duration-300 group"
            >
              <div className="text-4xl mb-3">{lang.flag}</div>
              <h3 className="text-slate-900 font-bold text-base mb-1">{lang.name}</h3>
              <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold border mb-3 ${badgeColors[lang.badge]}`}>
                {lang.badge}
              </span>
              <p className="text-slate-500 text-sm mb-4 leading-relaxed">{lang.level}</p>

              {/* Progress bar */}
              <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                <motion.div
                  className={`h-full rounded-full bg-gradient-to-r ${lang.color}`}
                  initial={{ width: 0 }}
                  animate={inView ? { width: `${lang.proficiency}%` } : {}}
                  transition={{ duration: 1, delay: i * 0.1 + 0.3, ease: "easeOut" }}
                />
              </div>
              <p className="text-slate-400 text-sm mt-1">{lang.proficiency}%</p>
            </motion.div>
          ))}
        </div>

        {/* Globe accent */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex justify-center mt-10"
        >
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <Globe size={16} className="text-blue-600" aria-hidden="true" />
            <span>Communicating across cultures and continents</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
