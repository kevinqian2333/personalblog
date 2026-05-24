"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";

function LoginForm() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/admin";

  const handleLogin = async () => {
    if (loading) return;
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (data.success) {
        router.push(redirect);
      } else {
        setError(data.error || "密码错误");
      }
    } catch {
      setError("网络错误，请稍后再试");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !loading) handleLogin();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative z-10 w-full max-w-sm mx-4"
    >
      <div
        className="rounded-3xl p-8 text-center"
        style={{
          background: "rgba(255,255,255,0.08)",
          backdropFilter: "blur(32px) saturate(1.4)",
          WebkitBackdropFilter: "blur(32px) saturate(1.4)",
          border: "1px solid rgba(255,255,255,0.18)",
          boxShadow:
            "0 8px 32px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.08), inset 0 1px 0 rgba(255,255,255,0.12), inset 0 -1px 0 rgba(0,0,0,0.18)",
        }}
      >
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-xl shadow-indigo-500/30">
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            <rect x="5" y="11" width="14" height="11" rx="2" />
            <path d="M8 11V7a4 4 0 018 0v4" />
            <circle cx="12" cy="16" r="1" />
          </svg>
        </div>
        <h1 className="text-2xl font-black text-white mb-1">无敌猫猫拳</h1>
        <p className="text-sm text-indigo-300/80 mb-8">管理后台登录</p>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="请输入管理密码"
          disabled={loading}
          className="w-full bg-white/10 border border-white/20 rounded-2xl px-5 py-3 text-white placeholder-white/40 outline-none focus:border-indigo-400 transition-all mb-3 text-center disabled:opacity-50"
        />

        {error && (
          <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-red-400 text-sm mb-3">
            {error}
          </motion.p>
        )}

        <motion.button
          onClick={handleLogin}
          disabled={loading}
          whileHover={loading ? {} : { scale: 1.02 }}
          whileTap={loading ? {} : { scale: 0.95 }}
          className="w-full py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-2xl font-bold transition-all shadow-lg shadow-indigo-500/25 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>验证中...</span>
            </>
          ) : (
            "登录"
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}

export default function LoginPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 relative overflow-hidden">
      <div className="fixed inset-0 bg-gradient-to-br from-indigo-950 via-slate-950 to-purple-950" />

      {mounted && (
        <>
          <div className="fixed top-[15%] left-[20%] w-[300px] h-[300px] rounded-full bg-indigo-500/10 blur-[100px] animate-pulse" />
          <div className="fixed bottom-[20%] right-[25%] w-[250px] h-[250px] rounded-full bg-purple-500/10 blur-[80px] animate-pulse" style={{ animationDelay: "2s" }} />
          <div className="fixed top-[60%] left-[50%] w-[200px] h-[200px] rounded-full bg-pink-500/8 blur-[70px] animate-pulse" style={{ animationDelay: "4s" }} />
        </>
      )}

      <Suspense fallback={<div className="text-white/50">Loading...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
