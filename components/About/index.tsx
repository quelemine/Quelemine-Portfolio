"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { MapPin, GraduationCap, Code2, Globe } from "lucide-react";
import Image from "next/image";
import { useTranslation } from "@/context/LanguageContext";
import { useSettings } from "@/context/SettingsContext";

export default function About() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const { t } = useTranslation();
  const { settings, tx, cvUrl } = useSettings();
  const aboutContent = settings?.siteContent?.about;
  const aboutImage = aboutContent?.image || settings?.profile?.profileImage || "/images/profile/isaac-profile.jpg";

  const bio1 = tx(aboutContent?.bio1, "");
  const bio3 = tx(aboutContent?.bio3, "");
  const adminTags = aboutContent?.tags?.length ? aboutContent.tags : null;
  const tags = adminTags ?? t.about.tags;

  const highlights = [
    { icon: Globe,          label: tx(aboutContent?.highlights?.international?.label, t.about.highlights.international.label), desc: tx(aboutContent?.highlights?.international?.desc, t.about.highlights.international.desc) },
    { icon: GraduationCap, label: tx(aboutContent?.highlights?.education?.label, t.about.highlights.education.label), desc: tx(aboutContent?.highlights?.education?.desc, t.about.highlights.education.desc) },
    { icon: Code2,          label: tx(aboutContent?.highlights?.stack?.label, t.about.highlights.stack.label), desc: tx(aboutContent?.highlights?.stack?.desc, t.about.highlights.stack.desc) },
    { icon: MapPin,         label: tx(aboutContent?.highlights?.location?.label, t.about.highlights.location.label), desc: tx(aboutContent?.highlights?.location?.desc, t.about.highlights.location.desc) },
  ];

  return (
    <section id="about" className="section-padding overflow-x-hidden" ref={ref}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <span className="section-label">{tx(aboutContent?.sectionLabel, t.about.sectionLabel)}</span>
          <h2 className="section-title">{tx(aboutContent?.sectionTitle, t.about.sectionTitle)}</h2>
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
              <Image src={aboutImage} alt="About" fill className="object-cover object-top" />
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
              {bio1 ? (
                <p>{bio1}</p>
              ) : (
                <p>
                  I am a <span className="text-slate-900 font-medium">Liberian Junior Software Engineer</span> currently
                  based in <span className="text-blue-600">Kigali, Rwanda</span>. I am passionate about building
                  scalable software solutions and solving real-world problems through technology.
                </p>
              )}
              <p>{tx(aboutContent?.bio2, t.about.bio2)}</p>
              {bio3 ? (
                <p>{bio3}</p>
              ) : (
                <p>
                  I specialize in <span className="text-slate-900 font-medium">full-stack development</span>, working
                  across the entire stack with React.js on the frontend, Java and Spring Boot on the backend,
                  and MySQL and PostgreSQL for data management. I am committed to writing clean, maintainable
                  code that delivers real value.
                </p>
              )}
              <p>{tx(aboutContent?.bio4, t.about.bio4)}</p>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 pt-2">
              {tags.map((tag) => (
                <span key={tag} className="skill-badge px-3 py-1 rounded-full text-xs font-medium">
                  {tag}
                </span>
              ))}
            </div>

            {/* CTA */}
            <div className="flex gap-3 pt-2">
              <a href="#contact" className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold">
                {tx(aboutContent?.getInTouch, t.about.getInTouch)}
              </a>
              <a href={cvUrl} download className="btn-outline inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold">
                {tx(aboutContent?.downloadCV, t.about.downloadCV)}
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
