"use client";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Globe } from "lucide-react";
import { FaLinkedin, FaGithub, FaFacebook, FaTiktok, FaInstagram, FaXTwitter } from "react-icons/fa6";
import { socialLinks } from "@/data/socialLinks";

const iconMap: Record<string, React.ElementType> = { Linkedin: FaLinkedin, Github: FaGithub, Facebook: FaFacebook, Music2: FaTiktok, Instagram: FaInstagram, Twitter: FaXTwitter, Globe };

export default function SocialLinks() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="social" className="section-padding relative" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-blue-400 text-sm font-semibold tracking-widest uppercase mb-3 block">Stay Connected</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white section-title">Connect With Me</h2>
          <p className="text-slate-400 mt-6 max-w-xl mx-auto text-sm">
            Let&apos;s connect on social media and build a professional network together.
          </p>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-4 max-w-3xl mx-auto">
          {socialLinks.map((link, i) => {
            const Icon = iconMap[link.icon as keyof typeof iconMap] || Globe;
            return (
              <motion.a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={inView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                whileHover={{ scale: 1.08, y: -3 }}
                whileTap={{ scale: 0.95 }}
                className={`glass-card flex items-center gap-3 px-5 py-3 rounded-xl text-slate-400 border transition-all duration-300 ${link.color} ${link.bg} ${link.border}`}
              >
                <Icon size={20} />
                <span className="text-sm font-medium">{link.name}</span>
              </motion.a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
