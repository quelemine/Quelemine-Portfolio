"use client";
import { motion } from "framer-motion";
import { Download, Mail, FolderOpen, MapPin } from "lucide-react";
import ProfileImage from "@/components/UI/ProfileImage";

export default function Hero() {
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden grid-pattern"
    >
      {/* Subtle background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-blue-600/6 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-blue-800/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 lg:px-8 py-24">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* ── Left: Text content ── */}
          <div className="text-center lg:text-left order-2 lg:order-1">

            {/* Location badge */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-sm text-slate-400 mb-8"
            >
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
              <MapPin size={13} className="text-blue-400" />
              Liberian Developer · Kigali, Rwanda
            </motion.div>

            {/* Name */}
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl sm:text-6xl font-bold text-white mb-3 leading-[1.1] tracking-tight"
            >
              Isaac L.{" "}
              <span className="gradient-text">Quelemine</span>
            </motion.h1>

            {/* Title */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-blue-400 font-medium text-lg mb-6 tracking-wide"
            >
              Junior Software Engineer &nbsp;·&nbsp; Full Stack Developer
            </motion.p>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-slate-400 text-base leading-relaxed mb-10 max-w-lg mx-auto lg:mx-0"
            >
              Building modern web applications and software solutions with strong foundations in
              frontend development, backend engineering, databases, and software architecture.
            </motion.p>

            {/* CTA buttons */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-wrap gap-3 justify-center lg:justify-start"
            >
              <a
                href="#projects"
                className="btn-primary inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold"
              >
                <FolderOpen size={16} />
                View Projects
              </a>
              <a
                href="/resume.pdf"
                download
                className="btn-outline inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold"
              >
                <Download size={16} />
                Download CV
              </a>
              <a
                href="#contact"
                className="btn-outline inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold"
              >
                <Mail size={16} />
                Contact Me
              </a>
            </motion.div>
          </div>

          {/* ── Right: Profile image ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="flex justify-center lg:justify-end order-1 lg:order-2"
          >
            <div className="relative">
              {/* Outer glow ring */}
              <div className="absolute -inset-3 rounded-full bg-blue-500/8 blur-2xl" />

              {/* Profile circle */}
              <div className="relative w-64 h-72 sm:w-72 sm:h-80 lg:w-80 lg:h-[22rem] rounded-[50%] profile-glow overflow-hidden ring-2 ring-blue-500/30 hover:ring-blue-400/50 transition-all duration-500">
                <ProfileImage priority size={360} />
              </div>

              {/* Status badge */}
              <motion.div
                className="absolute -bottom-3 left-1/2 -translate-x-1/2 glass px-4 py-1.5 rounded-full text-xs text-green-400 font-medium border border-green-500/20 whitespace-nowrap"
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block mr-1.5 align-middle" />
                Available for Work
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-5 h-8 rounded-full border border-slate-700 flex items-start justify-center pt-1.5"
          >
            <div className="w-1 h-2 bg-blue-400 rounded-full" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
