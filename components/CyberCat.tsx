"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "./ThemeProvider";

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
          "Authorization": `Bearer ${localStorage.getItem("deepseek-api-key") || "sk-placeholder"}`,
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
    try {
      localStorage.setItem("cat-system-prompt", prompt);
    } catch {}
  };

  return (
    <>
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-6 right-6 z-[9998] w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 shadow-xl shadow-indigo-500/30 border-2 border-white/40 dark:border-white/20 flex items-center justify-center cursor-pointer"
      >
        <span className="text-2xl">🐱</span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-24 right-6 z-[9998] w-80 sm:w-96 h-[500px] rounded-3xl bg-white/70 dark:bg-slate-800/80 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-2xl flex flex-col overflow-hidden"
          >
            <div className="flex items-center justify-between p-4 border-b border-white/20 dark:border-white/10 bg-indigo-500/10 dark:bg-indigo-500/5">
              <div className="flex items-center gap-2">
                <span className="text-xl">🐱</span>
                <div>
                  <h3 className="font-black text-slate-800 dark:text-white text-sm">煤球 · AI猫娘</h3>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Powered by DeepSeek</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setShowPromptSettings(!showPromptSettings)}
                  className="w-7 h-7 rounded-lg bg-white/40 dark:bg-slate-700/40 flex items-center justify-center text-xs hover:bg-white/60 dark:hover:bg-slate-600/60 transition-colors"
                  title="设置提示词"
                >
                  ⚙️
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-7 h-7 rounded-lg bg-white/40 dark:bg-slate-700/40 flex items-center justify-center text-xs hover:bg-white/60 dark:hover:bg-slate-600/60 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            <AnimatePresence>
              {showPromptSettings && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden border-b border-white/20 dark:border-white/10 bg-amber-50/80 dark:bg-amber-900/20 p-3"
                >
                  <p className="text-xs font-bold text-amber-700 dark:text-amber-300 mb-2">系统提示词（如"我是一个猫娘"）</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={systemPrompt}
                      onChange={(e) => savePrompt(e.target.value)}
                      placeholder="我是一个猫娘..."
                      className="flex-1 text-xs bg-white/60 dark:bg-slate-700/60 border border-amber-200 dark:border-amber-700/30 rounded-xl px-3 py-1.5 outline-none focus:border-indigo-500 text-slate-800 dark:text-white"
                    />
                  </div>
                  <div className="mt-2">
                    <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400 mb-1">API Key</p>
                    <input
                      type="password"
                      defaultValue={localStorage.getItem("deepseek-api-key") || ""}
                      onChange={(e) => localStorage.setItem("deepseek-api-key", e.target.value)}
                      placeholder="sk-xxxxxxxxxxxxxxxx"
                      className="w-full text-xs bg-white/60 dark:bg-slate-700/60 border border-amber-200 dark:border-amber-700/30 rounded-xl px-3 py-1.5 outline-none focus:border-indigo-500 text-slate-800 dark:text-white"
                    />
                    <p className="text-[9px] text-amber-500 dark:text-amber-400 mt-1">⚠️ Key 仅存储在浏览器本地，不会上传至服务器</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                      msg.role === "user"
                        ? "bg-indigo-500 text-white rounded-br-md"
                        : "bg-white/60 dark:bg-slate-700/60 text-slate-800 dark:text-white rounded-bl-md border border-white/40 dark:border-white/10"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white/60 dark:bg-slate-700/60 rounded-2xl rounded-bl-md px-4 py-3 border border-white/40 dark:border-white/10">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "0s" }} />
                      <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "0.15s" }} />
                      <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "0.3s" }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            <div className="p-3 border-t border-white/20 dark:border-white/10">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="和煤球聊天喵~"
                  className="flex-1 bg-white/50 dark:bg-slate-700/50 border border-white/30 dark:border-white/10 rounded-2xl px-4 py-2 text-sm outline-none focus:border-indigo-500 text-slate-800 dark:text-white placeholder-slate-400"
                />
                <button
                  onClick={handleSend}
                  disabled={loading}
                  className="w-10 h-10 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white rounded-2xl flex items-center justify-center transition-all"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                  </svg>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
