"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Bot, User, MessageCircle } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa6";

interface Message {
  id: number;
  role: "bot" | "user";
  text: string;
}

// WhatsApp numbers — primary Liberia, secondary Turkey, Rwanda phone
const WA_PRIMARY = "+231880857969";
const WA_SECONDARY = "+905338721736";
const PHONE_RW = "+250793148624";
const EMAIL = "quelemineisaacl@gmail.com";

const BOT_NAME = "Isaac's Assistant";

// AI agent decision tree
function getBotReply(input: string): { text: string; whatsappMsg?: string } {
  const q = input.toLowerCase().trim();

  if (/hire|job|work|opportunit|recruit|position|role|employ/.test(q))
    return {
      text: `Great! Isaac is open to new opportunities. You can reach him directly on WhatsApp for a quick response, or send an email to ${EMAIL}. Click the WhatsApp button below to start a conversation! 🚀`,
      whatsappMsg: `Hi Isaac! I found you through your portfolio and I'd like to discuss a job opportunity with you.`,
    };

  if (/project|collaborat|freelanc|build|develop/.test(q))
    return {
      text: `Isaac loves collaborating on projects! Whether it's a full-stack web app, backend API, or database system — he's your guy. Tap WhatsApp below to discuss your project idea directly. 💡`,
      whatsappMsg: `Hi Isaac! I'd like to collaborate on a project with you. Can we talk?`,
    };

  if (/skill|tech|stack|react|java|php|spring|mysql|language/.test(q))
    return {
      text: `Isaac's core stack includes React.js, Java, Spring Boot, PHP, MySQL, and PostgreSQL. He's a Full Stack Developer with strong software engineering fundamentals. Want to know more? Ask away or contact him on WhatsApp! ⚡`,
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
      text: `You can reach Isaac at ${EMAIL} or via WhatsApp for a faster response. His phone number in Rwanda is ${PHONE_RW}. Click the WhatsApp button below! 📧`,
      whatsappMsg: `Hi Isaac! I'd like to get in touch with you.`,
    };

  if (/whatsapp|phone|call|number/.test(q))
    return {
      text: `Isaac is available on WhatsApp at ${WA_PRIMARY} (Liberia) or ${WA_SECONDARY} (Turkey). His Rwanda phone is ${PHONE_RW}. Click the button below for a quick WhatsApp chat! 📱`,
      whatsappMsg: `Hi Isaac! I'm reaching out from your portfolio website.`,
    };

  if (/hello|hi|hey|good|morning|afternoon|evening|howdy/.test(q))
    return {
      text: `Hello! 👋 I'm Isaac's AI assistant. I can help you learn about Isaac's skills, projects, education, or connect you with him directly on WhatsApp. What would you like to know?`,
    };

  if (/portfolio|website|project|work|built/.test(q))
    return {
      text: `Isaac's portfolio at queleminetech.info showcases full-stack applications, backend APIs, database systems, and frontend interfaces. Check out the Projects section above! 🖥️`,
    };

  if (/available|open|hire|free/.test(q))
    return {
      text: `Yes! Isaac is currently available for full-time, part-time, and freelance opportunities. Reach out on WhatsApp for the fastest response! ✅`,
      whatsappMsg: `Hi Isaac! I saw you're available for work. I'd like to discuss an opportunity.`,
    };

  return {
    text: `Thanks for your message! For the best response, I recommend reaching Isaac directly on WhatsApp — he typically replies within minutes. You can also email him at ${EMAIL}. Is there anything specific about his skills or experience I can help with? 😊`,
    whatsappMsg: `Hi Isaac! I have a question for you from your portfolio website.`,
  };
}

function openWhatsApp(number: string, message: string) {
  const encoded = encodeURIComponent(message);
  window.open(`https://wa.me/${number.replace(/\D/g, "")}?text=${encoded}`, "_blank");
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: 0,
    role: "bot",
    text: `Hi there! 👋 I'm Isaac's AI assistant. I can answer questions about his skills, experience, and projects — or connect you with him directly on WhatsApp for a quick response. How can I help you today?`,
  },
];

const QUICK_PROMPTS = [
  "What are his skills?",
  "I want to hire him",
  "Let's collaborate",
  "How to contact Isaac?",
];

export default function WhatsAppAgent() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [lastWhatsappMsg, setLastWhatsappMsg] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open, typing]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { id: Date.now(), role: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTyping(true);

    setTimeout(() => {
      const reply = getBotReply(text);
      setMessages((prev) => [...prev, { id: Date.now() + 1, role: "bot", text: reply.text }]);
      if (reply.whatsappMsg) setLastWhatsappMsg(reply.whatsappMsg);
      setTyping(false);
    }, 900);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <>
      {/* Floating button */}
      <motion.button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-green-500 hover:bg-green-400 flex items-center justify-center shadow-2xl shadow-green-500/40 transition-colors"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 2, type: "spring" }}
        aria-label="Chat with Isaac's AI assistant"
      >
        <FaWhatsapp size={28} className="text-white" />
        {/* Pulse ring */}
        <span className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-30" />
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
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                  <Bot size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{BOT_NAME}</p>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-green-200 rounded-full animate-pulse" />
                    <span className="text-green-100 text-xs">Online · Replies instantly</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-white/70 hover:text-white transition-colors p-1"
              >
                <X size={18} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto bg-[#0a0f1e] p-4 space-y-3 min-h-0 max-h-80">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-end gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                    msg.role === "bot" ? "bg-green-500/20" : "bg-blue-500/20"
                  }`}>
                    {msg.role === "bot"
                      ? <Bot size={14} className="text-green-400" />
                      : <User size={14} className="text-blue-400" />
                    }
                  </div>
                  <div className={`max-w-[78%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                    msg.role === "bot"
                      ? "bg-slate-800 text-slate-200 rounded-bl-sm"
                      : "bg-blue-600 text-white rounded-br-sm"
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {typing && (
                <div className="flex items-end gap-2">
                  <div className="w-7 h-7 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Bot size={14} className="text-green-400" />
                  </div>
                  <div className="bg-slate-800 px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        className="w-1.5 h-1.5 bg-slate-400 rounded-full"
                        animate={{ y: [0, -4, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                      />
                    ))}
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Quick prompts */}
            <div className="bg-slate-900 px-3 py-2 flex gap-2 overflow-x-auto flex-shrink-0 border-t border-white/5">
              {QUICK_PROMPTS.map((p) => (
                <button
                  key={p}
                  onClick={() => sendMessage(p)}
                  className="flex-shrink-0 px-3 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 transition-colors"
                >
                  {p}
                </button>
              ))}
            </div>

            {/* WhatsApp direct button (shown after relevant bot reply) */}
            {lastWhatsappMsg && (
              <div className="bg-slate-900 px-3 pb-2 flex gap-2 flex-shrink-0">
                <button
                  onClick={() => openWhatsApp(WA_PRIMARY, lastWhatsappMsg)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-green-600 hover:bg-green-500 text-white text-xs font-medium transition-colors"
                >
                  <FaWhatsapp size={14} /> WhatsApp (Liberia)
                </button>
                <button
                  onClick={() => openWhatsApp(WA_SECONDARY, lastWhatsappMsg)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-green-700 hover:bg-green-600 text-white text-xs font-medium transition-colors"
                >
                  <FaWhatsapp size={14} /> WhatsApp (TR)
                </button>
              </div>
            )}

            {/* Input */}
            <form
              onSubmit={handleSubmit}
              className="bg-slate-900 border-t border-white/5 px-3 py-3 flex gap-2 flex-shrink-0"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything about Isaac..."
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-green-500/50 transition-colors"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="w-9 h-9 rounded-xl bg-green-600 hover:bg-green-500 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors flex-shrink-0"
              >
                <Send size={15} className="text-white" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tooltip on first load */}
      <AnimatePresence>
        {!open && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
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
