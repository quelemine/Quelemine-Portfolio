"use client";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Mail, MessageCircle, Download } from "lucide-react";
import { FaWhatsapp, FaLinkedin } from "react-icons/fa6";

const services = [
  "Full Stack Web Applications",
  "Backend & REST API Development",
  "Database Design & Management",
  "Church / School Management Systems",
  "Frontend UI Development",
  "Software Engineering Consulting",
];

export default function WorkTogether() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="work-together" className="section-padding relative bg-[#0B1F3A] overflow-x-hidden" ref={ref}>
      {/* Subtle glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(600px,100%)] h-[400px] bg-blue-600/8 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <span className="text-blue-400 text-sm font-semibold tracking-widest uppercase mb-3 block">Open to Opportunities</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Let&apos;s Work Together</h2>
          <p className="text-slate-300 text-base max-w-2xl mx-auto leading-relaxed mb-10">
            I&apos;m available for freelance projects, full-time roles, and collaborations.
            Whether you need a web application, a backend API, or a complete software solution — let&apos;s build something great.
          </p>
        </motion.div>

        {/* Services */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-2 mb-10"
        >
          {services.map((s, i) => (
            <motion.span
              key={s}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.3, delay: 0.3 + i * 0.06 }}
              className="px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300 text-sm"
            >
              {s}
            </motion.span>
          ))}
        </motion.div>

        {/* Availability badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-green-500/30 bg-green-500/10 text-green-400 text-sm font-medium mb-10"
        >
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          Available for selected projects
        </motion.div>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="flex flex-wrap justify-center gap-3"
        >
          <a
            href="#contact"
            className="btn-primary inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold"
          >
            <Mail size={16} /> Send a Message
          </a>
          <a
            href="https://wa.me/231880857969?text=Hi%20Isaac!%20I%20found%20you%20through%20your%20portfolio%20and%20I%27d%20like%20to%20work%20with%20you."
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline-white inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold"
          >
            <FaWhatsapp size={16} /> WhatsApp
          </a>
          <a
            href="https://www.linkedin.com/in/isaac-l-quelemine-873633132"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline-white inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold"
          >
            <FaLinkedin size={16} /> LinkedIn
          </a>
          <a
            href="/resume.pdf"
            download
            className="btn-outline-white inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold"
          >
            <Download size={16} /> Download CV
          </a>
        </motion.div>

        {/* Chat CTA */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="mt-8 text-slate-500 text-sm"
        >
          <MessageCircle size={13} className="inline mr-1 text-green-400" />
          Or chat with my AI assistant — click the button in the bottom right corner.
        </motion.p>
      </div>
    </section>
  );
}
