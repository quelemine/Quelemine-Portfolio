"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Minus, Send, MessageCircle, ArrowRight, X } from "lucide-react";
import Image from "next/image";
import { IMAGES } from "@/lib/images";
import { FaWhatsapp } from "react-icons/fa6";
import AIAvatar from "@/components/UI/AIAvatar";
import { createSession, logMessage } from "@/lib/chatLogger";
import { useChatContext } from "@/context/ChatContext";

interface Message { id: number; role: "bot" | "user"; text: string; attachment?: { name: string; url: string; type: string }; }

const WA_PRIMARY   = "+231880857969";
const WA_SECONDARY = "+905338721736";
const PHONE_RW     = "+250793148624";
const EMAIL        = "quelemineisaacl@gmail.com";
const BOT_NAME     = "Isaac L. Quelemine";
const BOT_ROLE     = "Junior Software Engineer";

// Chat width / height constants used for viewport clamping
const CHAT_W  = 384; // ~w-96 on desktop
const CHAT_H  = 600;
const HANDLE_H = 10;
const MOBILE_BP = 640; // px — below this, render as bottom sheet (no drag)
const MIN_W = 320;
const MIN_H = 400;
const MAX_W = 600;
const MAX_H = 800;

export function getBotReply(input: string, name: string): { text: string; whatsappMsg?: string; attachment?: { name: string; url: string; type: string } } {
  const q = input.toLowerCase().trim();

  if (/who is isaac|tell me about isaac|about isaac|introduce|isaac quelemine|quelemine|what do you know about (him|isaac)|tell me (more|something) about (him|isaac)/.test(q))
    return {
      text: `Isaac L. Quelemine is a Liberian Junior Software Engineer and Full Stack Developer currently based in Kigali, Rwanda. He specializes in React.js, Java, Spring Boot, PHP, MySQL, and PostgreSQL. He holds an Associate Degree in Computer Programming from Rauf Denktas University (Northern Cyprus) and is currently studying Software Engineering at UNILAK (Rwanda) and Information Technology at BYU Pathway Worldwide. He is open to full-time, part-time, and freelance opportunities. Want to know more about his skills, projects, or how to contact him, ${name}? 😊`,
    };

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

  if (/skill|tech|stack|react|java|php|spring|mysql|language|what (can|does) (he|isaac) (do|know|use)|what (technologies|tools|languages|frameworks) does (he|isaac) (use|know|work with)/.test(q))
    return {
      text: `Isaac's core stack includes React.js, Java, Spring Boot, PHP, MySQL, and PostgreSQL — covering both frontend and backend development. He also works with HTML5, CSS3, JavaScript, Git, and Linux. Anything else you'd like to know, ${name}? ⚡`,
    };

  if (/education|degree|university|school|study|student|where did (he|isaac) (study|go to school|learn)|what (did|does) (he|isaac) (study|learn)/.test(q))
    return {
      text: `Isaac holds an Associate Degree in Computer Programming from Rauf Denktas University (Northern Cyprus). He is currently studying Software Engineering at UNILAK (University of Lay Adventist of Kigali, Rwanda) and Information Technology at BYU Pathway Worldwide – Ensign College (online). 🎓`,
    };

  if (/location|where|country|rwanda|liberia|based|where (is|does) (he|isaac) (live|work|stay)/.test(q))
    return {
      text: `Isaac is a Liberian software engineer currently based in Kigali, Rwanda. His background spans Liberia, Northern Cyprus, and Rwanda. 🌍`,
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

  if (/sicm|church management|church system|sicm church/.test(q))
    return {
      text: `The SICM Church Management System is a full-stack web application built for SICM — a faith-based organization in Liberia. It features member registration, attendance tracking, event scheduling, and administrative dashboards, built with PHP and MySQL. It also supports the organization's website to streamline ministry coordination and communication across Liberia.\n\nVisit the SICM website: https://sicmchurch.gt.tc/index.php?i=1 🙏`,
    };

  if (/^(?:bye|goodbye|good night|see you|take care|farewell|cya|later)\b/.test(q))
    return {
      text: `Thanks for chatting, ${name}! Have a wonderful day! 😊👋`,
    };

  if (/^(?:hello|hi|hey|howdy|good\s+(?:morning|afternoon|evening))\b/.test(q))
    return {
      text: `Hey ${name}! 👋 How can I help you today? You can ask about Isaac's skills, projects, education, or I can connect you with him directly on WhatsApp.`,
    };

  if (/portfolio|website|built/.test(q))
    return {
      text: `Isaac's portfolio at queleminetech.info showcases his full-stack projects including the SICM Church Management System, REST API systems, responsive frontends, and database-driven applications. Check out the Projects section above! 🖥️`,
    };

  if (/available|open|free/.test(q))
    return {
      text: `Yes, ${name}! Isaac is currently available for full-time, part-time, and freelance opportunities. Reach out on WhatsApp for the fastest response! ✅`,
      whatsappMsg: `Hi Isaac! I'm ${name}. I saw you're available for work and I'd like to discuss an opportunity.`,
    };

  if (/resume|cv|download.*resume|see.*cv|send.*resume|get.*resume|want.*cv|sent.*resume|his resume|your resume|the resume|a resume/.test(q))
    return {
      text: `Of course, ${name}! Here is Isaac's resume. It contains his full work experience, skills, and education. 📄`,
      attachment: { name: "Isaac_Quelemine_Resume.pdf", url: "/resume.pdf", type: "application/pdf" },
    };

  if (/no[!\s]*thanks|no[!\s]*thank you|nothing|no more|that'?s all|that is all|i'?m good|i am good|bye|goodbye|see you|take care|farewell/.test(q))
    return {
      text: `Thanks for chatting, ${name}! Have a wonderful day! 😊👋`,
    };

  return {
    text: `I understand your question, ${name}! I can tell you about Isaac's skills, projects, education, background, or how to contact him. You can ask things like:\n\n• "What are his skills?"\n• "Tell me about his projects"\n• "Where did he study?"\n• "How can I contact him?"\n• "Is he available for work?"\n\nOr reach Isaac directly on WhatsApp for detailed responses — he typically replies within minutes! 😊`,
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

const SUGGESTED_QUESTIONS = [
  "Who is Isaac?",
  "What technical skills does Isaac have?",
  "How can I contact Isaac?",
];

/** Returns true when the viewport is narrower than the mobile breakpoint */
function isMobileViewport() {
  return typeof window !== "undefined" && window.innerWidth < MOBILE_BP;
}

/** Clamp chatbox position so it stays fully inside the viewport */
function clampPos(x: number, y: number, width: number = CHAT_W, height: number = CHAT_H): { x: number; y: number } {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const w  = Math.min(width, vw - 16);
  const h  = Math.min(height, vh - 40);
  return {
    x: Math.max(8, Math.min(x, vw - w - 8)),
    y: Math.max(20, Math.min(y, vh - h - 20)),
  };
}

export default function WhatsAppAgent() {
  const [open,       setOpen]       = useState(false);
  const [minimized,  setMinimized]  = useState(false);
  const [mobile,     setMobile]     = useState(false); // true when viewport < MOBILE_BP
  const [userName,   setUserName]   = useState("");
  const [nameInput,  setNameInput]  = useState("");
  const [messages,   setMessages]   = useState<Message[]>([]);
  const [input,      setInput]      = useState("");
  const [typing,     setTyping]     = useState(false);
  const [typingStatus, setTypingStatus] = useState("AI Assistant is thinking...");
  const [lastWhatsappMsg, setLastWhatsappMsg] = useState("");
  const [sessionId,  setSessionId]  = useState("");

  // Drag state — null means "use default bottom-right anchor via CSS"
  const [pos,      setPos]      = useState<{ x: number; y: number } | null>(null);
  const [dragging, setDragging] = useState(false);

  // Resize state
  const [chatWidth,  setChatWidth]  = useState(CHAT_W);
  const [chatHeight, setChatHeight] = useState(CHAT_H);
  const [resizing,   setResizing]   = useState(false);

  const bottomRef  = useRef<HTMLDivElement>(null);
  const chatRef    = useRef<HTMLDivElement>(null);
  const dragOrigin = useRef<{ mx: number; my: number; bx: number; by: number } | null>(null);
  const didDrag    = useRef(false);
  const resizeOrigin = useRef<{ mx: number; my: number; w: number; h: number } | null>(null);

  const { pendingMessage, clearPending } = useChatContext();

  /* ── Detect mobile viewport ── */
  useEffect(() => {
    const check = () => setMobile(isMobileViewport());
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  /* ── Chat logic ── */
  const sendMessageWithSession = useCallback((text: string, sid: string, name: string) => {
    setMessages((prev) => [...prev, { id: performance.now(), role: "user", text }]);
    logMessage(sid, "user", text);
    setTyping(true);
    setTypingStatus("AI Assistant is thinking...");
    
    setTimeout(() => {
      setTypingStatus("Analyzing your request...");
    }, 300);
    
    setTimeout(() => {
      setTypingStatus("Preparing your answer...");
    }, 600);
    
    setTimeout(() => {
      try {
        const reply = getBotReply(text, name);
        setMessages((prev) => [...prev, { id: performance.now() + 1, role: "bot", text: reply.text, attachment: reply.attachment }]);
        logMessage(sid, "bot", reply.text, "success");
        if (reply.whatsappMsg) setLastWhatsappMsg(reply.whatsappMsg);
      } catch {
        const errText = "Sorry, something went wrong. Please try again.";
        setMessages((prev) => [...prev, { id: performance.now() + 1, role: "bot", text: errText }]);
        logMessage(sid, "bot", errText, "error");
      }
      setTyping(false);
    }, 1200);
  }, []);

  const sendMessage = useCallback((text: string) => {
    if (!text.trim() || !sessionId) return;
    sendMessageWithSession(text, sessionId, userName);
    setInput("");
  }, [sessionId, userName, sendMessageWithSession]);

  /* ── Pending message from project cards ── */
  useEffect(() => {
    if (!pendingMessage) return;
    setTimeout(() => {
      setOpen(true);
      setMinimized(false);
      if (userName) {
        sendMessage(pendingMessage);
        clearPending();
      }
    }, 0);
  }, [pendingMessage, userName, sendMessage, clearPending]);

  /* ── Auto-scroll to latest message ── */
  useEffect(() => {
    if (open && !minimized) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open, minimized, typing]);

  /* ── Clamp position on window resize ── */
  useEffect(() => {
    const onResize = () => {
      if (pos) setPos((p) => p && clampPos(p.x, p.y));
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [pos]);

  /* ── Shared drag start — disabled on mobile ── */
  const startDrag = useCallback((e: React.PointerEvent<HTMLElement>) => {
    if (mobile) return;
    if ((e.target as HTMLElement).closest("button")) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    didDrag.current = false;
    const rect = chatRef.current?.getBoundingClientRect();
    dragOrigin.current = {
      mx: e.clientX,
      my: e.clientY,
      bx: rect?.left ?? (window.innerWidth  - Math.min(chatWidth, window.innerWidth  - 16) - 24),
      by: rect?.top  ?? (window.innerHeight - Math.min(chatHeight, window.innerHeight - 40) - 24),
    };
  }, [mobile, chatWidth, chatHeight]);

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLElement>) => {
    if (mobile || !dragOrigin.current) return;
    const dx = e.clientX - dragOrigin.current.mx;
    const dy = e.clientY - dragOrigin.current.my;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
      didDrag.current = true;
      setDragging(true);
    }
    if (!didDrag.current) return;
    setPos(clampPos(dragOrigin.current.bx + dx, dragOrigin.current.by + dy, chatWidth, chatHeight));
  }, [mobile, chatWidth, chatHeight]);

  const onPointerUp = useCallback(() => {
    dragOrigin.current = null;
    setDragging(false);
  }, []);

  /* ── Resize handlers ── */
  const startResize = useCallback((e: React.PointerEvent<HTMLElement>) => {
    if (mobile) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    resizeOrigin.current = {
      mx: e.clientX,
      my: e.clientY,
      w: chatWidth,
      h: chatHeight,
    };
    setResizing(true);
  }, [mobile, chatWidth, chatHeight]);

  const onResizeMove = useCallback((e: React.PointerEvent<HTMLElement>) => {
    if (mobile || !resizeOrigin.current) return;
    const dx = e.clientX - resizeOrigin.current.mx;
    const dy = e.clientY - resizeOrigin.current.my;
    
    const newWidth = Math.max(MIN_W, Math.min(MAX_W, resizeOrigin.current.w + dx));
    const newHeight = Math.max(MIN_H, Math.min(MAX_H, resizeOrigin.current.h + dy));
    
    setChatWidth(newWidth);
    setChatHeight(newHeight);
  }, [mobile]);

  const onResizeUp = useCallback(() => {
    resizeOrigin.current = null;
    setResizing(false);
  }, []);

  /* ── Open / minimize helpers ── */
  const openChat = () => { setOpen(true); setMinimized(false); };
  const minimize = () => setMinimized(true);

  /* ── Start chat ── */
  const startChat = (e: React.FormEvent) => {
    e.preventDefault();
    const name = nameInput.trim();
    if (!name) return;
    const sid = createSession(name);
    setSessionId(sid);
    setUserName(name);
    const greeting = `Hello ${name}! 👋 I'm Quelemine AI Assistant. I can help answer questions about the website, services, projects, and provide useful information. How can I assist you today?`;
    setMessages([{ id: performance.now(), role: "bot", text: greeting }]);
    logMessage(sid, "bot", greeting);
    if (pendingMessage) {
      setTimeout(() => { sendMessageWithSession(pendingMessage, sid, name); clearPending(); }, 1000);
    }
  };

  /* ── Position style ──
     Mobile  : full-width bottom sheet, ignore drag pos
     Desktop : use drag pos or default bottom-right anchor
  */
  const posStyle: React.CSSProperties = mobile
    ? { left: 0, right: 0, bottom: 0, top: "auto", width: "100%", borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }
    : pos
      ? { left: pos.x, top: pos.y, right: "auto", bottom: "auto", width: chatWidth }
      : { right: 24, bottom: 24, width: chatWidth };

  return (
    <>
      {/* ── Floating button ── */}
      <motion.button
        onClick={openChat}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#0B1F3A] border-2 border-blue-500/60 flex items-center justify-center shadow-2xl shadow-blue-500/30 transition-all hover:border-blue-400"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 2, type: "spring" }}
        aria-label={open && !minimized ? "AI Assistant is open" : "Open Isaac's AI assistant"}
      >
        <AIAvatar size={38} />
        {(!open || minimized) && (
          <span className="absolute inset-0 rounded-full border-2 border-blue-400 animate-ping opacity-20" />
        )}
      </motion.button>

      {/* ── Tooltip (only when fully closed) ── */}
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

      {/* ── Chat window ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            ref={chatRef}
            key="chat-window"
            initial={{ opacity: 0, scale: mobile ? 1 : 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: mobile ? 1 : 0.92, y: 20 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            style={{
              ...posStyle,
              ...(mobile ? {} : { width: `${chatWidth}px` }),
              maxHeight: minimized ? "auto" : mobile ? "92dvh" : `${Math.min(chatHeight, window.innerHeight - 40)}px`,
            }}
            className="fixed z-50 flex flex-col rounded-2xl overflow-hidden shadow-2xl shadow-black/50 border border-white/10"
            aria-label="AI Assistant chat window"
            role="dialog"
            aria-modal="false"
          >
            {/* ── Header (drag handle on desktop, static on mobile) ── */}
            <div
              className="bg-gradient-to-r from-green-600 to-green-500 px-4 py-3 flex items-center justify-between flex-shrink-0 select-none"
              style={{ cursor: mobile ? "default" : dragging ? "grabbing" : "grab" }}
              onPointerDown={startDrag}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              aria-label={mobile ? "Chat header" : "Drag to move chat window"}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full overflow-hidden ring-1 ring-white/30 flex-shrink-0 bg-slate-800">
                  <Image
                    src="/images/profile/isaac-profile.jpg"
                    alt="Isaac L. Quelemine"
                    width={36} height={36}
                    className="object-cover object-top w-full h-full"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-white font-semibold text-sm leading-tight truncate">{BOT_NAME}</p>
                  <p className="text-green-100 text-[10px] uppercase tracking-[0.12em] leading-tight">{BOT_ROLE}</p>
                </div>
              </div>

              {/* Header controls */}
              <div className="flex items-center gap-1">
                <button
                  onClick={minimize}
                  className="text-white/70 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/10"
                  aria-label="Minimize chat"
                >
                  <Minus size={16} />
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="text-white/70 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/10"
                  aria-label="Close chat"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* ── Body (hidden when minimized) ── */}
            {!minimized && (
              <>
                {/* Name capture */}
                {!userName ? (
                  <div className="flex-1 bg-[#0a0f1e] flex flex-col items-center justify-center p-8 gap-6 overflow-y-auto">
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
                    <div className="w-full">
                      <p className="text-slate-500 text-xs text-center mb-2">You can ask things like:</p>
                      <div className="flex flex-col gap-1.5">
                        {SUGGESTED_QUESTIONS.slice(0, 3).map((q) => (
                          <div key={q} className="px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-400 text-xs">
                            &ldquo;{q}&rdquo;
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Messages */}
                    <div
                      className="flex-1 overflow-y-auto bg-[#0a0f1e] p-4 space-y-3 min-h-0"
                      style={{ maxHeight: mobile ? "calc(92dvh - 280px)" : "calc(100vh - 320px)", minHeight: 160 }}
                    >
                      {messages.map((msg) => (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ duration: 0.3 }}
                          className={`flex items-end gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                        >
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
                            {msg.attachment && (
                              <a
                                href={msg.attachment.url}
                                download={msg.attachment.name}
                                className="mt-2 flex items-center gap-2 px-3 py-2 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors border border-slate-600/50"
                              >
                                <div className="w-8 h-8 rounded bg-red-500/20 flex items-center justify-center flex-shrink-0">
                                  <span className="text-red-400 text-xs font-bold">PDF</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium truncate">{msg.attachment.name}</p>
                                  <p className="text-[10px] text-slate-400">Click to download</p>
                                </div>
                                <ArrowRight size={14} className="text-slate-400 flex-shrink-0" />
                              </a>
                            )}
                          </div>
                        </motion.div>
                      ))}

                      {typing && (
                        <div className="flex items-end gap-2">
                          <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0">
                            <Image src={IMAGES.profile} alt="Isaac" width={28} height={28} className="object-cover object-top w-full h-full" />
                          </div>
                          <div className="bg-slate-800 px-4 py-3 rounded-2xl rounded-bl-sm">
                            <div className="flex items-center gap-2">
                              {[0, 1, 2].map((i) => (
                                <motion.span key={i} className="w-1.5 h-1.5 bg-slate-400 rounded-full"
                                  animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }} />
                              ))}
                              <span className="text-slate-400 text-xs ml-2">{typingStatus}</span>
                            </div>
                          </div>
                        </div>
                      )}
                      <div ref={bottomRef} />
                    </div>

                    {/* Suggested questions — scrollable row on mobile, column on desktop */}
                    <div className="bg-slate-900 px-3 py-2 flex-shrink-0 border-t border-white/5">
                      <p className="text-slate-500 text-[10px] uppercase tracking-widest mb-2 px-1">Suggested</p>
                      <div className={mobile ? "flex gap-2 overflow-x-auto pb-1 scrollbar-none" : "flex flex-col gap-1"}>
                        {SUGGESTED_QUESTIONS.map((q, index) => (
                          <motion.button
                            key={q}
                            onClick={() => sendMessage(q)}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`text-left px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs border border-slate-700 transition-colors ${
                              mobile ? "whitespace-nowrap flex-shrink-0" : ""
                            }`}
                          >
                            {q}
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* WhatsApp buttons */}
                    {lastWhatsappMsg && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="bg-slate-900 px-3 pb-2 flex gap-2 flex-shrink-0"
                      >
                        <button onClick={() => openWhatsApp(WA_PRIMARY, lastWhatsappMsg)}
                          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-green-600 hover:bg-green-500 text-white text-xs font-medium transition-colors">
                          <FaWhatsapp size={14} /> WhatsApp (Liberia)
                        </button>
                        <button onClick={() => openWhatsApp(WA_SECONDARY, lastWhatsappMsg)}
                          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-green-700 hover:bg-green-600 text-white text-xs font-medium transition-colors">
                          <FaWhatsapp size={14} /> WhatsApp (TR)
                        </button>
                      </motion.div>
                    )}

                    {/* Input */}
                    <form
                      onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
                      className="bg-slate-900 border-t border-white/5 px-3 py-3 flex gap-2 flex-shrink-0"
                    >
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
              </>
            )}

            {/* ── Bottom drag handle — desktop only ── */}
            {!mobile && (
              <div
                className="flex-shrink-0 flex items-center justify-center bg-slate-900 border-t border-white/5 select-none"
                style={{ height: HANDLE_H, cursor: dragging ? "grabbing" : "grab" }}
                onPointerDown={startDrag}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
                aria-label="Drag to move chat window"
              >
                <div className="w-8 h-1 rounded-full bg-slate-600" />
              </div>
            )}

            {/* ── Resize handle — desktop only ── */}
            {!mobile && !minimized && (
              <div
                className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize z-10"
                onPointerDown={startResize}
                onPointerMove={onResizeMove}
                onPointerUp={onResizeUp}
                onPointerCancel={onResizeUp}
                aria-label="Resize chat window"
              >
                <div className="absolute bottom-1 right-1 w-2 h-2 border-r-2 border-b-2 border-slate-500 rounded-br" />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
