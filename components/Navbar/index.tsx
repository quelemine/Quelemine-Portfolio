"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown } from "lucide-react";
import Image from "next/image";
import { useTranslation, LANGUAGES, type LocaleCode } from "@/context/LanguageContext";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState("");
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const { t, locale, setLocale } = useTranslation();

  const navLinks = [
    { href: "#about",     label: t.nav.about },
    { href: "#education", label: t.nav.education },
    { href: "#skills",    label: t.nav.skills },
    { href: "#projects",  label: t.nav.projects },
    { href: "#contact",   label: t.nav.contact },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleNav = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setActive(href);
    setMenuOpen(false);
    setTimeout(() => {
      const el = document.querySelector(href);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "shadow-lg shadow-black/20 border-b border-white/8"
          : ""
      } bg-[#0B1F3A] w-full`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="#home" className="flex items-center gap-2 group flex-shrink-0">
            <div className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-blue-500/50 group-hover:ring-blue-400 transition-all duration-300">
              <Image src="/images/profile/isaac-profile-four.jpeg" alt="Isaac" width={32} height={32} className="object-cover object-top w-full h-full" />
            </div>
            <span className="font-bold text-white text-sm hidden sm:block">
              Isaac<span className="text-blue-400">.dev</span>
            </span>
          </a>

          {/* Desktop Links */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleNav(e, link.href)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  active === link.href
                    ? "text-blue-400 bg-blue-500/15"
                    : "text-slate-300 hover:text-white hover:bg-white/8"
                }`}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* CTA + Language switcher — desktop */}
          <div className="hidden lg:flex items-center gap-3">
            <div className="relative" ref={langRef}>
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/8 transition-all"
              >
                <span>{LANGUAGES.find((l) => l.code === locale)?.flag}</span>
                <span className="text-xs font-medium">{locale.toUpperCase()}</span>
                <ChevronDown size={13} className={`transition-transform duration-200 ${langOpen ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {langOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-44 bg-[#0B1F3A] border border-white/10 rounded-xl shadow-xl overflow-hidden z-50"
                  >
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => { setLocale(lang.code as LocaleCode); setLangOpen(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                          locale === lang.code
                            ? "bg-blue-500/20 text-blue-400"
                            : "text-slate-300 hover:bg-white/8 hover:text-white"
                        }`}
                      >
                        <span className="text-base">{lang.flag}</span>
                        <span>{lang.label}</span>
                        {locale === lang.code && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400" />}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <a
              href="#contact"
              className="btn-primary px-4 py-2 rounded-lg text-sm font-medium text-white"
            >
              {t.nav.hireMe}
            </a>
          </div>

          {/* Right side — mobile/tablet */}
          <div className="flex lg:hidden items-center gap-2">
            <a
              href="#contact"
              onClick={(e) => handleNav(e, "#contact")}
              className="hidden sm:inline-flex btn-primary px-4 py-2 rounded-lg text-sm font-medium text-white"
            >
              {t.nav.hireMe}
            </a>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/8 transition-all"
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile / Tablet Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden bg-[#0B1F3A] border-t border-white/8 overflow-hidden w-full"
          >
            <div className="px-4 py-4 max-w-7xl mx-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 mb-3">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={(e) => handleNav(e, link.href)}
                    className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      active === link.href
                        ? "text-blue-400 bg-blue-500/15"
                        : "text-slate-300 hover:text-white hover:bg-white/8"
                    }`}
                  >
                    {link.label}
                  </a>
                ))}
              </div>

              {/* Hire Me — only on mobile (tablet already has it in navbar) */}
              <a
                href="#contact"
                onClick={(e) => handleNav(e, "#contact")}
                className="sm:hidden block mb-3 btn-primary px-4 py-3 rounded-xl text-sm font-medium text-white text-center"
              >
                {t.nav.hireMe}
              </a>

              {/* Language picker */}
              <div className="pt-3 border-t border-white/8">
                <p className="text-xs text-slate-500 px-1 mb-2">{t.language.label}</p>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => { setLocale(lang.code as LocaleCode); setMenuOpen(false); }}
                      className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                        locale === lang.code
                          ? "bg-blue-500/20 text-blue-400 ring-1 ring-blue-500/30"
                          : "text-slate-400 hover:bg-white/8 hover:text-white"
                      }`}
                    >
                      <span className="text-base leading-none">{lang.flag}</span>
                      <span>{lang.code.toUpperCase()}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
