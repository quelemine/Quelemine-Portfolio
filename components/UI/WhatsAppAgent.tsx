"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, MessageCircle, ArrowRight } from "lucide-react";
import Image from "next/image";
import { IMAGES } from "@/lib/images";
import { FaWhatsapp } from "react-icons/fa6";
import AIAvatar from "@/components/UI/AIAvatar";
import { createSession, logMessage } from "@/lib/chatLogger";

interface Message {
  id: number;
  role: "bot" | "user";
  text: string;
}

const WA_PRIMARY   = "+231880857969";
const WA_SECONDARY = "+905338721736";
const PHONE_RW     = "+250793148624";
const EMAIL        = "quelemineisaacl@gmail.com";
const BOT_NAME     = "Isaac's Assistant";

function getBotReply(input: string, name: string): { text: string; whatsappMsg?: string } {
  const q = input.toLowerCase().trim();

  if (/hire|job|work|opportunit|recruit|position|role|employ/.test(q))
    return {
      text: `Great, ${name}! Isaac is open to new opportunities. You can reach him directly on WhatsApp for a quick response, or send an email to ${EMAIL}. Click the WhatsApp button below! 🚀`,
      whatsappMsg: `Hi Isaac! I'm ${name}. I found you through your portfolio and I'd like to discuss a job opportunity with you.`,
    };

  if (/project|collaborat|freelanc|build|develop/.test(q))
    return {
      text: `Isaac loves collaborating on projects, ${name}! Whether it's a full-stack web app, backend API, or database system — he's your guy. Tap WhatsApp below to discuss your idea directly. 💡`,
      whatsappMsg: `Hi Isaac! I'm ${name}. I'd like to collaborate on a project with you. Can we talk?`,
    };

  if (/skill|tech|stack|react|java|php|spring|mysql|language/.test(q))
    return {
      text: `Isaac's core stack includes React.js, Java, Spring Boot, PHP, MySQL, and PostgreSQL. He's a Full Stack Developer with strong software engineering fundamentals. Anything else you'd like to know, ${name}? ⚡`,
    };

  if (/education|degree|university|school|study|student/.test(q))
    return {
      text: `Isaac holds an Associate Degree in Computer Programming from Rauf Denktas University (Northern Cyprus), and is currently studying Software Engineering at UNILAK (Rwanda) and IT at BYU Pathway Worldwide. 🎓`,
    };

  if (/location|where|country|rwanda|liberia|based/.test(q))
    return {
      text: `Isaac is a Liberian software engineer currently based in Kigali, Rwanda. He has international experience across Liberia, Northern Cyprus, and Rwanda. 🌍`,
    };

  if (/email|mail|contact|reach|message/.test(q))
    return {
      text: `You can reach Isaac at ${EMAIL} or via WhatsApp for a faster response. His Rwanda number is ${PHONE_RW}. Click the WhatsApp button below, ${name}! 📧`,
      whatsappMsg: `Hi Isaac! I'm ${name}. I'd like to get in touch with you.`,
    };

  if (/whatsapp|phone|call|number/.test(q))
    return {
      text: `Isaac is available on WhatsApp at ${WA_PRIMARY} (Liberia) or ${WA_SECONDARY} (Turkey). His Rwanda phone is ${PHONE_RW}. Click below for a quick chat, ${name}! 📱`,
      whatsappMsg: `Hi Isaac! I'm ${name}, reaching out from your portfolio.`,
    };

  if (/hello|hi|hey|good|morning|afternoon|evening|howdy/.test(q))
    return {
      text: `Hey ${name}! 👋 How can I help you today? You can ask about Isaac's skills, projects, education, or I can connect you with him directly on WhatsApp.`,
    };

  if (/portfolio|website|built/.test(q))
    return {
      text: `Isaac's portfolio at queleminetech.info showcases full-stack applications, backend APIs, database systems, and frontend interfaces. Check out the Projects section above! 🖥️`,
    };

  if (/available|open|free/.test(q))
    return {
      text: `Yes, ${name}! Isaac is currently available for full-time, part-time, and freelance opportunities. Reach out on WhatsApp for the fastest response! ✅`,
      whatsappMsg: `Hi Isaac! I'm ${name}. I saw you're available for work and I'd like to discuss an opportunity.`,
    };

  if (/no[!\s]*thanks|no[!\s]*thank you|nothing|no more|that'?s all|that is all|i'?m good|i am good|bye|goodbye|see you|take care|farewell/.test(q))
    return {
      text: `Thanks for chatting, ${name}! Have a wonderful day! 😊👋`,
    };

  return {
    text: `Thanks, ${name}! For the best response, I recommend reaching Isaac directly on WhatsApp — he typically replies within minutes. You can also email him at ${EMAIL}. Is there anything specific about his skills or experience I can help with? 😊`,
    whatsappMsg: `Hi Isaac! I'm ${name}. I have a question from your portfolio website.`,
  };
}

function openWhatsApp(number: string, message: string) {
  window.open(`https://wa.me/${number.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`, "_blank");
}

function UserAvatar({ name, size = 28 }: { name: string; size?: number }) {
  const initials = name.trim().split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  const colors = ["#3B82F6", "#8B5CF6", "#EC4899", "#F59E0B", "#10B981", "#EF4444", "#06B6D4"];
  const color = colors[name.charCodeAt(0) % colors.length];
  return (
    <div
      className="rounded-full flex items-center justify-center flex-shrink-0 font-bold text-white"
      style={{ width: size, height: size, background: color, fontSize: size * 0.38 }}
    >
      {initials}
    </div>
  );
}

const QUICK_PROMPTS = ["What are his skills?", "I want to hire him", "Let's collaborate", "How to contact Isaac?"];

export default function WhatsAppAgent() {
  const [open, setOpen]             = useState(false);
  const [userName, setUserName]     = useState("");
  const [nameInput, setNameInput]   = useState("");
  const [messages, setMessages]     = useState<Message[]>([]);
  const [input, setInput]           = useState("");
  const [typing, setTyping]         = useState(false);
  const [lastWhatsappMsg, setLastWhatsappMsg] = useState("");
  const [sessionId, setSessionId]   = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open, typing]);

  const startChat = (e: React.FormEvent) => {
    e.preventDefault();
    const name = nameInput.trim();
    if (!name) return;
    const sid = createSession(name);
    setSessionId(sid);
    setUserName(name);
    const greeting = `Hi ${name}! 👋 I'm Isaac's AI assistant. I can answer questions about his skills, experience, and projects — or connect you with him directly on WhatsApp. How can I help you today?`;
    setMessages([{ id: Date.now(), role: "bot", text: greeting }]);
    logMessage(sid, "bot", greeting);
  };

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    setMessages((prev) => [...prev, { id: Date.now(), role: "user", text }]);
    logMessage(sessionId, "user", text);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      try {
        const reply = getBotReply(text, userName);
        setMessages((prev) => [...prev, { id: Date.now() + 1, role: "bot", text: reply.text }]);
        logMessage(sessionId, "bot", reply.text, "success");
        if (reply.whatsappMsg) setLastWhatsappMsg(reply.whatsappMsg);
      } catch {
        const errText = "Sorry, something went wrong. Please try again.";
        setMessages((prev) => [...prev, { id: Date.now() + 1, role: "bot", text: errText }]);
        logMessage(sessionId, "bot", errText, "error");
      }
      setTyping(false);
    }, 900);
  };

  return (
    <>
      {/* Floating button — AI avatar */}
      <motion.button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#0B1F3A] border-2 border-blue-500/60 flex items-center justify-center shadow-2xl shadow-blue-500/30 transition-all hover:border-blue-400"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 2, type: "spring" }}
        aria-label="Chat with Isaac's AI assistant"
      >
        <AIAvatar size={38} />
        <span className="absolute inset-0 rounded-full border-2 border-blue-400 animate-ping opacity-20" />
      </motion.button>

      {/* Chat window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed bottom-24 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-96 max-h-[600px] flex flex-col rounded-2xl overflow-hidden shadow-2xl shadow-black/50 border border-white/10"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-green-500 px-4 py-3 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full overflow-hidden ring-1 ring-white/30 flex-shrink-0">
                  <Image src="/images/profile/isaac-profile.jpg" alt="Isaac" width={36} height={36} className="object-cover object-top w-full h-full" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{BOT_NAME}</p>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-green-200 rounded-full animate-pulse" />
                    <span className="text-green-100 text-xs">Online · Replies instantly</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white transition-colors p-1">
                <X size={18} />
              </button>
            </div>

            {/* Name capture */}
            {!userName ? (
              <div className="flex-1 bg-[#0a0f1e] flex flex-col items-center justify-center p-8 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-[#0B1F3A] border-2 border-blue-500/40 flex items-center justify-center mx-auto mb-4">
                    <AIAvatar size={44} />
                  </div>
                  <p className="text-white font-semibold text-base">Welcome! 👋</p>
                  <p className="text-slate-400 text-sm mt-1">What&apos;s your name so I can greet you properly?</p>
                </div>
                <form onSubmit={startChat} className="w-full flex flex-col gap-3">
                  <input
                    autoFocus
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="Enter your name..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-green-500/60 transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={!nameInput.trim()}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-green-600 hover:bg-green-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors"
                  >
                    Start Chatting <ArrowRight size={15} />
                  </button>
                </form>
              </div>
            ) : (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto bg-[#0a0f1e] p-4 space-y-3 min-h-0 max-h-80">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex items-end gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                      {msg.role === "bot" ? (
                        <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0">
                          <Image src={IMAGES.profile} alt="Isaac" width={28} height={28} className="object-cover object-top w-full h-full" />
                        </div>
                      ) : (
                        <UserAvatar name={userName} size={28} />
                      )}
                      <div className={`max-w-[78%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                        msg.role === "bot"
                          ? "bg-slate-800 text-slate-200 rounded-bl-sm"
                          : "bg-blue-600 text-white rounded-br-sm"
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}

                  {typing && (
                    <div className="flex items-end gap-2">
                      <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0">
                        <Image src={IMAGES.profile} alt="Isaac" width={28} height={28} className="object-cover object-top w-full h-full" />
                      </div>
                      <div className="bg-slate-800 px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1">
                        {[0, 1, 2].map((i) => (
                          <motion.span key={i} className="w-1.5 h-1.5 bg-slate-400 rounded-full"
                            animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }} />
                        ))}
                      </div>
                    </div>
                  )}
                  <div ref={bottomRef} />
                </div>

                {/* Quick prompts */}
                <div className="bg-slate-900 px-3 py-2 flex gap-2 overflow-x-auto flex-shrink-0 border-t border-white/5">
                  {QUICK_PROMPTS.map((p) => (
                    <button key={p} onClick={() => sendMessage(p)}
                      className="flex-shrink-0 px-3 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 transition-colors">
                      {p}
                    </button>
                  ))}
                </div>

                {/* WhatsApp buttons */}
                {lastWhatsappMsg && (
                  <div className="bg-slate-900 px-3 pb-2 flex gap-2 flex-shrink-0">
                    <button onClick={() => openWhatsApp(WA_PRIMARY, lastWhatsappMsg)}
                      className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-green-600 hover:bg-green-500 text-white text-xs font-medium transition-colors">
                      <FaWhatsapp size={14} /> WhatsApp (Liberia)
                    </button>
                    <button onClick={() => openWhatsApp(WA_SECONDARY, lastWhatsappMsg)}
                      className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-green-700 hover:bg-green-600 text-white text-xs font-medium transition-colors">
                      <FaWhatsapp size={14} /> WhatsApp (TR)
                    </button>
                  </div>
                )}

                {/* Input */}
                <form onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
                  className="bg-slate-900 border-t border-white/5 px-3 py-3 flex gap-2 flex-shrink-0">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={`Ask me anything, ${userName}...`}
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-green-500/50 transition-colors"
                  />
                  <button type="submit" disabled={!input.trim()}
                    className="w-9 h-9 rounded-xl bg-green-600 hover:bg-green-500 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors flex-shrink-0">
                    <Send size={15} className="text-white" />
                  </button>
                </form>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tooltip */}
      <AnimatePresence>
        {!open && (
          <motion.div
            initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
            transition={{ delay: 3, duration: 0.4 }}
            className="fixed bottom-8 right-20 z-40 glass px-3 py-2 rounded-xl text-xs text-slate-300 pointer-events-none whitespace-nowrap"
          >
            <MessageCircle size={12} className="inline mr-1 text-green-400" />
            Chat with Isaac&apos;s AI assistant
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
