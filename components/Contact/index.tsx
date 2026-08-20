"use client";
import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Send, Mail, MapPin, CheckCircle, Loader2, Phone } from "lucide-react";
import { FaLinkedin, FaGithub, FaWhatsapp } from "react-icons/fa6";

export default function Contact() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    // Open Gmail compose with pre-filled fields as the real send mechanism
    const gmailUrl = `https://mail.google.com/mail/?view=cm&to=quelemineisaacl@gmail.com&su=${encodeURIComponent(form.subject)}&body=${encodeURIComponent(`Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`)}`;
    window.open(gmailUrl, "_blank");
    setStatus("sent");
    setForm({ name: "", email: "", subject: "", message: "" });
    setTimeout(() => setStatus("idle"), 4000);
  };

  const inputClass = "w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all duration-200";

  return (
    <section id="contact" className="section-padding relative" ref={ref}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-600/3 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-blue-600 text-sm font-semibold tracking-widest uppercase mb-3 block">Get In Touch</span>
          <h2 className="text-3xl sm:text-4xl font-bold section-title">Contact Me</h2>
          <p className="text-slate-500 mt-6 text-lg font-medium">Let&apos;s build something amazing together.</p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-10 max-w-5xl mx-auto">
          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="space-y-6"
          >
            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-slate-900 font-bold text-lg mb-1">Let&apos;s Connect</h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-6">
                I&apos;m currently open to new opportunities, collaborations, and interesting projects.
                Whether you have a job offer, a project idea, or just want to say hello — my inbox is always open.
              </p>

              {/* Two contact cards — stacked on mobile, side-by-side on sm+ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                {/* Card 1 */}
                <div className="rounded-xl border border-slate-100 bg-white p-4 space-y-4 shadow-sm">
                  {[
                    { icon: Mail,       label: "Email",           value: "quelemineisaacl@gmail.com", href: "mailto:quelemineisaacl@gmail.com",                                                         iconColor: "text-blue-600",  iconBg: "bg-blue-50" },
                    { icon: Phone,      label: "Phone (Rwanda)",  value: "+250 793 148 624",          href: "tel:+250793148624",                                                                           iconColor: "text-blue-600",  iconBg: "bg-blue-50" },
                    { icon: FaWhatsapp, label: "WhatsApp (LR)",   value: "+231 880 857 969",          href: "https://wa.me/231880857969?text=Hi%20Isaac!%20I%20found%20you%20through%20your%20portfolio.", iconColor: "text-green-600", iconBg: "bg-green-50" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg ${item.iconBg} flex items-center justify-center flex-shrink-0`}>
                        <item.icon size={15} className={item.iconColor} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-slate-400 text-[10px] font-medium uppercase tracking-wide">{item.label}</p>
                        <a href={item.href} target="_blank" rel="noopener noreferrer"
                          className="text-slate-800 text-xs font-semibold hover:text-blue-600 transition-colors break-all leading-snug">
                          {item.value}
                        </a>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Card 2 */}
                <div className="rounded-xl border border-slate-100 bg-white p-4 space-y-4 shadow-sm">
                  {[
                    { icon: FaWhatsapp, label: "WhatsApp (TR)", value: "+90 533 872 1736",    href: "https://wa.me/905338721736?text=Hi%20Isaac!%20I%20found%20you%20through%20your%20portfolio.", iconColor: "text-green-600",  iconBg: "bg-green-50" },
                    { icon: FaLinkedin, label: "LinkedIn",      value: "Isaac L. Quelemine",   href: "https://www.linkedin.com/in/isaac-l-quelemine-873633132",                                     iconColor: "text-blue-700",   iconBg: "bg-blue-50" },
                    { icon: FaGithub,   label: "GitHub",        value: "quelemine",           href: "https://github.com/quelemine",                                                               iconColor: "text-slate-700",  iconBg: "bg-slate-100" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg ${item.iconBg} flex items-center justify-center flex-shrink-0`}>
                        <item.icon size={15} className={item.iconColor} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-slate-400 text-[10px] font-medium uppercase tracking-wide">{item.label}</p>
                        <a href={item.href} target="_blank" rel="noopener noreferrer"
                          className="text-slate-800 text-xs font-semibold hover:text-blue-600 transition-colors break-all leading-snug">
                          {item.value}
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Location map */}
              <div className="rounded-xl overflow-hidden border border-slate-100 shadow-sm">
                <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border-b border-slate-100">
                  <MapPin size={14} className="text-indigo-600 flex-shrink-0" />
                  <span className="text-slate-700 text-xs font-semibold">Kigali, Rwanda</span>
                </div>
                <iframe
                  title="Kigali, Rwanda"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63799.41051493849!2d30.0187!3d-1.9441!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x19dca4258ed8e797%3A0xa0bc47a2f5e0f5e!2sKigali%2C%20Rwanda!5e0!3m2!1sen!2sus!4v1700000000000"
                  width="100%"
                  height="180"
                  style={{ border: 0, display: "block" }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>

            <div className="glass-card rounded-2xl p-5 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-green-400 text-sm font-medium">Available for Work</span>
              </div>
              <p className="text-slate-500 text-xs">Open to full-time, part-time, and freelance opportunities</p>
            </div>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-6 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-600 text-xs mb-1.5 block">Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    placeholder="Your full name"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="text-slate-600 text-xs mb-1.5 block">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    placeholder="your@email.com"
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-600 text-xs mb-1.5 block">Subject *</label>
                <input
                  type="text"
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  required
                  placeholder="What is this about?"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="text-slate-600 text-xs mb-1.5 block">Message *</label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  placeholder="Tell me about your project or opportunity..."
                  className={`${inputClass} resize-none`}
                />
              </div>

              <button
                type="submit"
                disabled={status === "sending" || status === "sent"}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-sm transition-all duration-300 ${
                  status === "sent"
                    ? "bg-green-600 text-white"
                    : "btn-primary text-white"
                }`}
              >
                {status === "sending" && <Loader2 size={16} className="animate-spin" />}
                {status === "sent" && <CheckCircle size={16} />}
                {status === "idle" && <Send size={16} />}
                {status === "idle" ? "Send Message" : status === "sending" ? "Sending..." : "Message Sent!"}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
