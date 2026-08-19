"use client";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Star, GitFork, Code2, Activity, ExternalLink } from "lucide-react";
import { FaGithub } from "react-icons/fa6";

const stats = [
  { icon: Code2, label: "Repositories", value: "20+", color: "text-blue-600", bg: "bg-blue-100" },
  { icon: Star, label: "Stars Earned", value: "10+", color: "text-yellow-600", bg: "bg-yellow-100" },
  { icon: GitFork, label: "Forks", value: "5+", color: "text-teal-600", bg: "bg-teal-100" },
  { icon: Activity, label: "Contributions", value: "100+", color: "text-purple-600", bg: "bg-purple-100" },
];

const techBadges = [
  { name: "Java", color: "bg-orange-50 text-orange-700 border-orange-200" },
  { name: "Spring Boot", color: "bg-green-50 text-green-700 border-green-200" },
  { name: "React.js", color: "bg-blue-50 text-blue-700 border-blue-200" },
  { name: "PHP", color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  { name: "MySQL", color: "bg-teal-50 text-teal-700 border-teal-200" },
  { name: "JavaScript", color: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  { name: "HTML5", color: "bg-red-50 text-red-700 border-red-200" },
  { name: "CSS3", color: "bg-blue-50 text-blue-600 border-blue-200" },
  { name: "Git", color: "bg-orange-50 text-orange-600 border-orange-200" },
  { name: "Linux", color: "bg-slate-100 text-slate-600 border-slate-200" },
];

export default function GithubStats() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="github" className="section-padding relative section-alt" ref={ref}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-blue-600/3 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-blue-600 text-sm font-semibold tracking-widest uppercase mb-3 block">Open Source</span>
          <h2 className="text-3xl sm:text-4xl font-bold section-title">GitHub Statistics</h2>
        </motion.div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -4 }}
              className="glass-card rounded-2xl p-6 text-center transition-all duration-300 group"
            >
              <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                <stat.icon size={22} className={stat.color} />
              </div>
              <div className="text-2xl font-bold text-slate-900 mb-1">{stat.value}</div>
              <div className="text-slate-500 text-xs">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* GitHub stats images */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid md:grid-cols-2 gap-5 mb-10"
        >
          <div className="glass-card rounded-2xl p-4 overflow-hidden">
            <img
              src="https://github-readme-stats.vercel.app/api?username=quelemine&show_icons=true&theme=tokyonight&bg_color=0d1117&border_color=1e293b&title_color=60a5fa&text_color=94a3b8&icon_color=3b82f6&hide_border=false"
              alt="GitHub Stats"
              className="w-full rounded-lg"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          </div>
          <div className="glass-card rounded-2xl p-4 overflow-hidden">
            <img
              src="https://github-readme-streak-stats.herokuapp.com/?user=quelemine&theme=tokyonight&background=0d1117&border=1e293b&stroke=3b82f6&ring=60a5fa&fire=f59e0b&currStreakLabel=60a5fa"
              alt="GitHub Streak"
              className="w-full rounded-lg"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          </div>
        </motion.div>

        {/* Tech badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="glass-card rounded-2xl p-6"
        >
          <h3 className="text-slate-900 font-semibold text-sm mb-4 text-center">Technology Badges</h3>
          <div className="flex flex-wrap justify-center gap-2">
            {techBadges.map((badge) => (
              <span key={badge.name} className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${badge.color}`}>
                {badge.name}
              </span>
            ))}
          </div>
        </motion.div>

        {/* GitHub CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center mt-8"
        >
        <a
            href="https://github.com/quelemine"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium"
          >
            <FaGithub size={18} />
            View GitHub Profile
            <ExternalLink size={14} />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
