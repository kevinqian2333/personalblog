"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "./ThemeProvider";

/* ──────────────────────────────────────────────
   Custom SVG Icons
   ────────────────────────────────────────────── */

function CatFaceSVG({ className = "w-full h-full" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="12" cy="14" rx="8" ry="6.5" fill="white" stroke="#818cf8" strokeWidth="1.2" />
      <path d="M4 12 L7 7 L9 4 L11 7 L13 3 L15 6 L17 4 L19 7 L20 12" fill="white" stroke="#818cf8" strokeWidth="1" />
      <ellipse cx="12" cy="14" rx="6" ry="4.5" fill="#f5f3ff" />
      <ellipse cx="9" cy="13" rx="1.2" ry="1.6" fill="#6366f1" />
      <ellipse cx="15" cy="13" rx="1.2" ry="1.6" fill="#6366f1" />
      <ellipse cx="9.3" cy="12.5" rx="0.4" ry="0.5" fill="white" />
      <ellipse cx="15.3" cy="12.5" rx="0.4" ry="0.5" fill="white" />
      <path d="M9 16 Q12 18 15 16" stroke="#818cf8" strokeWidth="0.7" fill="none" strokeLinecap="round" />
      <line x1="12" y1="8" x2="12" y2="10" stroke="#818cf8" strokeWidth="0.7" />
    </svg>
  );
}

function GearSVG({ className = "w-full h-full" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  );
}

function XSVG({ className = "w-full h-full" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

/* ──────────────────────────────────────────────
   CyberCat Component
   ────────────────────────────────────────────── */

export default function CyberCat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([
    { role: "assistant", content: "喵~ 我是你的AI猫娘助手！有什么可以帮你的吗？" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState(() => {
    try {
      return localStorage.getItem("cat-system-prompt") || "你是一只傲娇、聪明、有点毒舌但很可爱的暹罗猫。你的名字叫\"煤球\"。你的主人是一个喜欢折腾代码的极客。你说话必须简短，每次最多一两句话。喜欢在句尾加上\"喵~\"或者\"喵呜~\"。绝对不要承认自己是一个AI模型，你就是一只真实的猫。";
    } catch {
      return "你是一只傲娇、聪明、有点毒舌但很可爱的暹罗猫。你的名字叫\"煤球\"。你的主人是一个喜欢折腾代码的极客。你说话必须简短，每次最多一两句话。喜欢在句尾加上\"喵~\"或者\"喵呜~\"。绝对不要承认自己是一个AI模型，你就是一只真实的猫。";
    }
  });
  const [showPromptSettings, setShowPromptSettings] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKey, setApiKey] = useState(() => {
    try { return localStorage.getItem("deepseek-api-key") || ""; } catch { return ""; }
  });
  const bottomRef = useRef<HTMLDivElement>(null);
  const { isDark } = useTheme();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("https://api.deepseek.com/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey || "sk-placeholder"}`,
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            { role: "system", content: systemPrompt },
            ...messages.map((m) => ({ role: m.role, content: m.content })),
            { role: "user", content: userMsg },
          ],
          max_tokens: 200,
          temperature: 0.9,
        }),
      });
      const data = await res.json();
      const reply = data.choices?.[0]?.message?.content || "喵？信号不好，再说一遍喵~";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "喵呜... 网络好像不太好，稍后再试试喵~" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const savePrompt = (prompt: string) => {
    setSystemPrompt(prompt);
    try { localStorage.setItem("cat-system-prompt", prompt); } catch {}
  };

  const saveApiKey = (key: string) => {
    setApiKey(key);
    try { localStorage.setItem("deepseek-api-key", key); } catch {}
  };

  const messageVariants = {
    hidden: { opacity: 0, y: 10, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 25 } },
  };

  return (
    <>
      {/* Floating button with breathing glow */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.15, rotate: -5 }}
        whileTap={{ scale: 0.85, rotate: 10 }}
        className="fixed bottom-6 right-6 z-[9998] w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-xl shadow-indigo-500/30 border-2 border-white/40 dark:border-white/20 flex items-center justify-center cursor-pointer group"
      >
        {/* Breathing glow ring */}
        <motion.span
          className="absolute inset-0 rounded-2xl"
          animate={{
            boxShadow: [
              "0 0 8px 2px rgba(99,102,241,0.4)",
              "0 0 20px 6px rgba(139,92,246,0.6)",
              "0 0 8px 2px rgba(99,102,241,0.4)",
            ],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <span className="relative w-7 h-7 transition-transform duration-300 group-hover:scale-110">
          <CatFaceSVG />
        </span>
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white dark:border-slate-800 animate-pulse" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-24 right-6 z-[9998] w-80 sm:w-96 h-[520px] rounded-3xl overflow-hidden flex flex-col"
            style={{
              background: "rgba(255,255,255,0.7)",
              backdropFilter: "blur(24px) saturate(1.8)",
              WebkitBackdropFilter: "blur(24px) saturate(1.8)",
              border: "1px solid rgba(255,255,255,0.3)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.2), inset 0 1px 0 rgba(255,255,255,0.4)",
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between p-4"
              style={{
                background: "rgba(99,102,241,0.08)",
                borderBottom: "1px solid rgba(255,255,255,0.2)",
              }}
            >
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: [0, -10, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 5 }}
                  className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center shadow-md"
                >
                  <span className="w-6 h-6">
                    <CatFaceSVG />
                  </span>
                </motion.div>
                <div>
                  <h3 className="font-black text-slate-800 dark:text-white text-sm">煤球 · AI猫娘</h3>
                  <p className="text-[10px] text-indigo-500 dark:text-indigo-400 font-medium">Powered by DeepSeek</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowPromptSettings(!showPromptSettings)}
                  className="w-7 h-7 rounded-lg bg-white/40 dark:bg-slate-700/40 flex items-center justify-center hover:bg-white/60 dark:hover:bg-slate-600/60 transition-colors"
                  title="设置提示词"
                >
                  <span className="w-4 h-4">
                    <GearSVG />
                  </span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsOpen(false)}
                  className="w-7 h-7 rounded-lg bg-white/40 dark:bg-slate-700/40 flex items-center justify-center hover:bg-red-400 hover:text-white transition-colors"
                >
                  <span className="w-3.5 h-3.5">
                    <XSVG />
                  </span>
                </motion.button>
              </div>
            </div>

            {/* Settings Panel */}
            <AnimatePresence>
              {showPromptSettings && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden border-b border-white/20 dark:border-white/10 bg-amber-50/80 dark:bg-amber-900/20 p-3"
                >
                  <p className="text-xs font-bold text-amber-700 dark:text-amber-300 mb-2">系统提示词</p>
                  <input
                    type="text"
                    value={systemPrompt}
                    onChange={(e) => savePrompt(e.target.value)}
                    placeholder="我是一个猫娘..."
                    className="w-full text-xs bg-white/60 dark:bg-slate-700/60 border border-amber-200 dark:border-amber-700/30 rounded-xl px-3 py-1.5 outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-800 dark:text-white transition-all"
                  />
                  <div className="mt-2 flex items-center gap-2">
                    <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400">API Key</p>
                    <button
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="text-[10px] text-indigo-500 hover:text-indigo-600 font-bold"
                    >
                      {showApiKey ? "隐藏" : "展开"}
                    </button>
                  </div>
                  {showApiKey && (
                    <motion.div initial={{ height: 0 }} animate={{ height: "auto" }}>
                      <input
                        type="password"
                        value={apiKey}
                        onChange={(e) => saveApiKey(e.target.value)}
                        placeholder="sk-xxxxxxxxxxxxxxxx"
                        className="w-full text-xs bg-white/60 dark:bg-slate-700/60 border border-amber-200 dark:border-amber-700/30 rounded-xl px-3 py-1.5 outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-800 dark:text-white mt-1 transition-all"
                      />
                    </motion.div>
                  )}
                  <p className="text-[9px] text-amber-500 dark:text-amber-400 mt-1">Key 仅存储在浏览器本地</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  variants={messageVariants}
                  initial="hidden"
                  animate="visible"
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "assistant" && (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center mr-2 flex-shrink-0 self-end">
                      <span className="w-4 h-4">
                        <CatFaceSVG />
                      </span>
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-br-md shadow-md"
                        : "bg-white/70 dark:bg-slate-700/70 text-slate-800 dark:text-white rounded-bl-md border border-white/40 dark:border-white/10 shadow-sm"
                    }`}
                  >
                    {msg.content}
                  </div>
                </motion.div>
              ))}
              {loading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start items-end gap-2"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center flex-shrink-0">
                    <span className="w-4 h-4">
                      <CatFaceSVG />
                    </span>
                  </div>
                  <div className="bg-white/70 dark:bg-slate-700/70 rounded-2xl rounded-bl-md px-4 py-3 border border-white/40 dark:border-white/10 shadow-sm">
                    <div className="flex gap-1.5">
                      <motion.span
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                        className="w-2 h-2 bg-indigo-400 rounded-full"
                      />
                      <motion.span
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }}
                        className="w-2 h-2 bg-purple-400 rounded-full"
                      />
                      <motion.span
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }}
                        className="w-2 h-2 bg-pink-400 rounded-full"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div
              className="p-3"
              style={{ borderTop: "1px solid rgba(255,255,255,0.2)" }}
            >
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="和煤球聊天喵~"
                  className="flex-1 bg-white/50 dark:bg-slate-700/50 border border-white/30 dark:border-white/10 rounded-2xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-800 dark:text-white placeholder-slate-400 transition-all"
                />
                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleSend}
                  disabled={loading}
                  className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 text-white rounded-2xl flex items-center justify-center transition-all shadow-md shadow-indigo-500/20"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                  </svg>
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
