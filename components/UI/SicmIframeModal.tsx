"use client";
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink, Maximize2 } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function SicmIframeModal({ open, onClose }: Props) {
  const url = "https://sicmchurch.gt.tc/index.php";

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-6xl h-[90vh] flex flex-col rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
            style={{ background: "#0a1428" }}
          >
            {/* Header bar */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 flex-shrink-0"
              style={{ background: "#0f1e3c" }}>
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />
                <span className="text-white text-sm font-semibold truncate">
                  SICM Church Management System
                </span>
                <span className="hidden sm:block text-slate-500 text-xs truncate">{url}</span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/20 text-blue-400 hover:bg-blue-600/40 text-xs transition-all"
                >
                  <Maximize2 size={13} /> Open Full
                </a>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* iframe */}
            <div className="flex-1 relative">
              <iframe
                src={url}
                title="SICM Church Management System"
                className="w-full h-full border-0"
                allow="fullscreen"
                loading="lazy"
              />
              {/* Fallback overlay shown if iframe is blocked */}
              <noscript>
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-slate-900">
                  <p className="text-slate-400 text-sm">Preview unavailable.</p>
                  <a href={url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 btn-primary px-5 py-2.5 rounded-lg text-sm font-semibold">
                    <ExternalLink size={15} /> Open in New Tab
                  </a>
                </div>
              </noscript>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
