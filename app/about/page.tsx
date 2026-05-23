"use client";

import { useState, useEffect } from "react";
import { siteConfig } from "../../siteConfig";
import ClientSocials from "../../components/ClientSocials";
import Navbar from "../../components/Navbar";
import PageTransition from "../../components/PageTransition";
import FloatingPlayer from "../../components/FloatingPlayer";

interface EducationItem {
  school: string;
  degree: string;
  period: string;
  description: string;
}

const fallbackEducation: EducationItem[] = [
  {
    school: "某某大学",
    degree: "硕士 · 计算化学",
    period: "2024 - 至今",
    description: "研究方向：分子动力学模拟与神经网络势能面构建",
  },
  {
    school: "某某大学",
    degree: "本科 · 化学",
    period: "2020 - 2024",
    description: "主修化学，辅修计算机科学。毕业论文：GROMACS在蛋白质模拟中的应用",
  },
];

export default function AboutPage() {
  const [education, setEducation] = useState<EducationItem[]>(fallbackEducation);

  useEffect(() => {
    fetch("/api/education")
      .then((r) => r.json())
      .then((d) => {
        if (d.education && d.education.length > 0) {
          setEducation(d.education);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen relative pb-10">
      <Navbar />
      <PageTransition>
        <div className="w-full max-w-4xl mx-auto mt-24 sm:mt-28 px-4 sm:px-6 lg:px-10 relative z-10">
          <h1 className="text-3xl sm:text-4xl font-black text-slate-800 dark:text-white mb-2 tracking-tight">
            关于我
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mb-8 text-sm sm:text-base">
            一个在代码与学术之间穿梭的普通人
          </p>

          <div className="rounded-3xl bg-white/40 dark:bg-slate-800/50 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-xl p-6 sm:p-8 mb-6">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">
              个人简介
            </h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm sm:text-base">
              {siteConfig.bio}
            </p>
          </div>

          <div className="rounded-3xl bg-white/40 dark:bg-slate-800/50 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-xl p-6 sm:p-8 mb-6">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6">
              教育经历
            </h2>
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-indigo-200 dark:bg-indigo-800" />
              {education.map((item, index) => (
                <div key={index} className="relative pl-10 pb-8 last:pb-0">
                  <div className="absolute left-2.5 top-1.5 w-3 h-3 rounded-full bg-indigo-500 border-2 border-white dark:border-slate-800 shadow" />
                  <h3 className="font-bold text-slate-800 dark:text-white text-sm sm:text-base">
                    {item.school}
                  </h3>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mt-0.5">
                    {item.degree}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {item.period}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1.5">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-white/40 dark:bg-slate-800/50 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-xl p-6 sm:p-8">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">
              联系方式
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-5">
              欢迎通过以下方式找到我，点击图标即可复制～
            </p>
            <ClientSocials />
          </div>
        </div>
      </PageTransition>
      <FloatingPlayer />
    </div>
  );
}
