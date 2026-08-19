"use client";
import { motion } from "framer-motion";
import { Code2, ArrowUp, Globe } from "lucide-react";
import { FaGithub, FaLinkedin } from "react-icons/fa6";

export default function Footer() {
  const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer className="relative border-t border-white/5 bg-slate-950/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <Code2 size={16} className="text-white" />
              </div>
              <span className="font-bold text-white">Isaac L. Quelemine</span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed">
              Junior Software Engineer & Full Stack Developer. Building modern software solutions from Rwanda.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Quick Links</h4>
            <div className="grid grid-cols-2 gap-1">
              {["#about", "#education", "#skills", "#projects", "#communication", "#contact"].map((href) => (
                <a
                  key={href}
                  href={href}
                  className="text-slate-500 hover:text-blue-400 text-sm transition-colors capitalize"
                >
                  {href.replace("#", "")}
                </a>
              ))}
            </div>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Connect</h4>
            <div className="flex gap-3">
              {[
                { icon: FaGithub, href: "https://github.com/quelemine", label: "GitHub" },
                { icon: FaLinkedin, href: "https://www.linkedin.com/in/isaac-l-quelemine-873633132", label: "LinkedIn" },
                { icon: Globe, href: "https://queleminetech.info", label: "Website" },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="w-9 h-9 rounded-lg glass flex items-center justify-center text-slate-400 hover:text-blue-400 hover:border-blue-500/30 transition-all"
                >
                  <s.icon size={16} />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} Isaac L. Quelemine. All rights reserved.
          </p>
          <button
            onClick={scrollTop}
            className="flex items-center gap-2 text-slate-500 hover:text-blue-400 text-sm transition-colors group"
          >
            Back to top
            <ArrowUp size={14} className="group-hover:-translate-y-1 transition-transform" />
          </button>
        </div>
      </div>
    </footer>
  );
}
