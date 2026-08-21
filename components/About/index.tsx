"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { MapPin, GraduationCap, Code2, Globe } from "lucide-react";
import ProfileImage from "@/components/UI/ProfileImage";
import { useTranslation } from "@/context/LanguageContext";

export default function About() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const { t } = useTranslation();

  const highlights = [
    { icon: Globe,          ...t.about.highlights.international },
    { icon: GraduationCap, ...t.about.highlights.education },
    { icon: Code2,          ...t.about.highlights.stack },
    { icon: MapPin,         ...t.about.highlights.location },
  ];

  return (
    <section id="about" className="section-padding" ref={ref}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <span className="section-label">{t.about.sectionLabel}</span>
          <h2 className="section-title">{t.about.sectionTitle}</h2>
        </motion.div>

        <div className="grid lg:grid-cols-[280px_1fr] gap-12 items-start">

          {/* ── Left: Profile image + quick facts ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex flex-col items-center lg:items-start gap-6"
          >
            {/* Profile photo */}
            <div className="relative w-52 h-60 rounded-2xl overflow-hidden ring-1 ring-blue-500/25 profile-glow flex-shrink-0">
              <ProfileImage size={240} />
            </div>

            {/* Quick facts */}
            <div className="w-full space-y-3">
              {highlights.map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.2 + i * 0.07 }}
                  className="flex items-start gap-3"
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <item.icon size={15} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-slate-800 text-sm font-semibold">{item.label}</p>
                    <p className="text-slate-500 text-sm mt-0.5">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* ── Right: Bio text ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="space-y-5"
          >
            <div className="space-y-4 text-slate-600 text-[0.9375rem] leading-[1.8]">
              <p>
                I am a <span className="text-slate-900 font-medium">Liberian Junior Software Engineer</span> currently
                based in <span className="text-blue-600">Kigali, Rwanda</span>. I am passionate about building
                scalable software solutions and solving real-world problems through technology.
              </p>
              <p>{t.about.bio2}</p>
              <p>
                I specialize in <span className="text-slate-900 font-medium">full-stack development</span>, working
                across the entire stack with React.js on the frontend, Java and Spring Boot on the backend,
                and MySQL and PostgreSQL for data management. I am committed to writing clean, maintainable
                code that delivers real value.
              </p>
              <p>{t.about.bio4}</p>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 pt-2">
              {t.about.tags.map((tag) => (
                <span key={tag} className="skill-badge px-3 py-1 rounded-full text-xs font-medium">
                  {tag}
                </span>
              ))}
            </div>

            {/* CTA */}
            <div className="flex gap-3 pt-2">
              <a href="#contact" className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold">
                {t.about.getInTouch}
              </a>
              <a href="/resume.pdf" download className="btn-outline inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold">
                {t.about.downloadCV}
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
