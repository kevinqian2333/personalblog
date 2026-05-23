"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";

interface StarParticle {
  width: string;
  height: string;
  left: string;
  top: string;
  animationDelay: string;
  animationDuration: string;
}

function LoginForm() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/admin";

  const handleLogin = async () => {
    setError("");
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
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative z-10 w-full max-w-sm mx-4"
    >
      <div className="rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl p-8 text-center">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-xl shadow-indigo-500/30">
          <span className="text-3xl">🔐</span>
        </div>
        <h1 className="text-2xl font-black text-white mb-1">无敌猫猫拳</h1>
        <p className="text-sm text-indigo-300/80 mb-8">管理后台登录</p>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="请输入管理密码"
          className="w-full bg-white/10 border border-white/20 rounded-2xl px-5 py-3 text-white placeholder-white/40 outline-none focus:border-indigo-400 transition-all mb-3 text-center"
        />

        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-400 text-sm mb-3"
          >
            {error}
          </motion.p>
        )}

        <button
          onClick={handleLogin}
          className="w-full py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-2xl font-bold transition-all shadow-lg shadow-indigo-500/25 active:scale-95"
        >
          登录
        </button>
      </div>
    </motion.div>
  );
}

export default function LoginPage() {
  const [stars, setStars] = useState<StarParticle[]>([]);

  useEffect(() => {
    const generated = [...Array(30)].map(() => ({
      width: `${2 + Math.random() * 4}px`,
      height: `${2 + Math.random() * 4}px`,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 3}s`,
      animationDuration: `${2 + Math.random() * 3}s`,
    }));
    setStars(generated);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 relative overflow-hidden">
      <div className="fixed inset-0 bg-gradient-to-br from-indigo-950 via-slate-950 to-purple-950" />
      <div className="fixed inset-0 opacity-30">
        {stars.map((star, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-pulse"
            style={{
              width: star.width,
              height: star.height,
              left: star.left,
              top: star.top,
              backgroundColor: "rgba(129, 140, 248, 0.6)",
              animationDelay: star.animationDelay,
              animationDuration: star.animationDuration,
            }}
          />
        ))}
      </div>
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}
