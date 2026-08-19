"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { MapPin, GraduationCap, Code2, Globe } from "lucide-react";
import ProfileImage from "@/components/UI/ProfileImage";

const highlights = [
  { icon: Globe,          label: "International Background", desc: "Liberia · Northern Cyprus · Rwanda" },
  { icon: GraduationCap, label: "Multi-Institution Student",  desc: "UNILAK · BYU Pathway · Rauf Denktas" },
  { icon: Code2,          label: "Full Stack Developer",       desc: "React · Java · Spring Boot · PHP · MySQL" },
  { icon: MapPin,         label: "Currently Based In",         desc: "Kigali, Rwanda" },
];

export default function About() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="about" className="section-padding" ref={ref}>
      <div className="max-w-6xl mx-auto px-6 lg:px-8">

        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <span className="section-label">Who I Am</span>
          <h2 className="section-title">About Me</h2>
        </motion.div>

        <div className="grid lg:grid-cols-[280px_1fr] gap-12 items-start">

          {/* ── Left: Profile image + quick facts ── */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex flex-col items-center lg:items-start gap-6"
          >
            {/* Profile photo */}
            <div className="relative w-52 h-52 rounded-2xl overflow-hidden ring-1 ring-blue-500/25 profile-glow flex-shrink-0">
              <ProfileImage size={208} />
            </div>

            {/* Quick facts */}
            <div className="w-full space-y-3">
              {highlights.map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: -16 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.2 + i * 0.07 }}
                  className="flex items-start gap-3"
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <item.icon size={15} className="text-blue-400" />
                  </div>
                  <div>
                    <p className="text-white text-xs font-semibold">{item.label}</p>
                    <p className="text-slate-500 text-xs mt-0.5">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* ── Right: Bio text ── */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="space-y-5"
          >
            <div className="space-y-4 text-slate-400 text-[0.9375rem] leading-[1.8]">
              <p>
                I am a <span className="text-white font-medium">Liberian Junior Software Engineer</span> currently
                based in <span className="text-blue-400">Kigali, Rwanda</span>. I am passionate about building
                scalable software solutions and solving real-world problems through technology.
              </p>
              <p>
                My engineering journey spans multiple countries and institutions — from Northern Cyprus to Rwanda —
                giving me a unique international perspective and the ability to collaborate effectively in
                multicultural environments.
              </p>
              <p>
                I specialize in <span className="text-white font-medium">full-stack development</span>, working
                across the entire stack with React.js on the frontend, Java and Spring Boot on the backend,
                and MySQL and PostgreSQL for data management. I am committed to writing clean, maintainable
                code that delivers real value.
              </p>
              <p>
                My goal is to grow as a software engineer, contribute to meaningful projects, and continue
                building solutions that make a positive impact.
              </p>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 pt-2">
              {["Full Stack Development", "Software Engineering", "Open to Work", "Rwanda", "Liberia"].map((tag) => (
                <span key={tag} className="skill-badge px-3 py-1 rounded-full text-xs font-medium">
                  {tag}
                </span>
              ))}
            </div>

            {/* CTA */}
            <div className="flex gap-3 pt-2">
              <a href="#contact" className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold">
                Get In Touch
              </a>
              <a href="/resume.pdf" download className="btn-outline inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold">
                Download CV
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
