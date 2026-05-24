import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "../components/ThemeProvider";
import { MusicProvider } from "../components/MusicProvider";
import { OperationProvider } from "../context/OperationContext";
import { ToastProvider } from "../components/ToastProvider";
import ClickEffect from "../components/ClickEffect";
import BackgroundSlider from "../components/BackgroundSlider";
import BackgroundEffects from "../components/BackgroundEffects";
import SplashScreen from "../components/SplashScreen";
import CyberCat from "../components/CyberCat";
import DynamicBlurOverlay from "../components/DynamicBlurOverlay";
import { siteConfig } from "../siteConfig";

export const metadata: Metadata = {
  title: siteConfig.title,
  description: siteConfig.bio,
  icons: {
    icon: siteConfig.faviconUrl,
    apple: siteConfig.faviconUrl,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <style
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `
              #app-mount-root { opacity: 0; visibility: hidden; pointer-events: none; }
              html.splash-seen #app-mount-root { opacity: 1 !important; visibility: visible !important; pointer-events: auto !important; }
            `,
          }}
        />
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (sessionStorage.getItem('hasSeenSplash') === 'true') {
                  document.documentElement.classList.add('splash-seen');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>

      <body className="w-screen overflow-x-hidden min-h-full flex flex-col relative transition-colors duration-1000 bg-slate-50 dark:bg-slate-950 font-serif">
        <ThemeProvider>
          <OperationProvider>
            <ToastProvider>
              <SplashScreen />

              <MusicProvider>
                <div id="app-mount-root" className="flex-1 flex flex-col transition-opacity duration-1000">
                  <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden">
                    {!siteConfig.useGradient && <BackgroundSlider />}

                    <DynamicBlurOverlay />

                    <div
                      className="absolute inset-0 z-[-8] opacity-50 dark:opacity-15 mix-blend-color transition-opacity duration-1000 transform-gpu"
                      style={{
                        background: `linear-gradient(135deg, ${siteConfig.themeColors.join(", ")})`,
                        backgroundSize: "400% 400%",
                        animation: "gradient-mesh 20s ease infinite",
                      }}
                    ></div>

                    <div className="absolute top-[5%] left-[10%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] bg-indigo-400/15 dark:bg-indigo-600/10 blur-[120px] rounded-full z-[-7] animate-breathe"></div>
                    <div className="absolute top-[40%] right-[5%] w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] bg-purple-400/15 dark:bg-purple-600/8 blur-[100px] rounded-full z-[-7] animate-float-delayed"></div>
                    <div className="absolute bottom-[10%] left-[30%] w-[35vw] h-[35vw] max-w-[400px] max-h-[400px] bg-pink-400/10 dark:bg-fuchsia-600/8 blur-[90px] rounded-full z-[-7] animate-float"></div>

                    <div className="absolute top-[15%] right-[20%] w-[3px] h-[3px] bg-indigo-400/60 rounded-full z-[-5] animate-orbit">
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-indigo-300/40 rounded-full blur-[2px]"></div>
                    </div>
                    <div className="absolute top-[25%] left-[25%] w-[2px] h-[2px] bg-purple-400/50 rounded-full z-[-5] animate-orbit-reverse">
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-purple-300/30 rounded-full blur-[2px]"></div>
                    </div>

                    <div className="absolute top-[60%] left-[60%] w-[200px] h-[200px] border border-indigo-300/10 dark:border-indigo-500/5 rounded-full z-[-4] animate-pulse-glow"></div>
                    <div className="absolute top-[20%] left-[70%] w-[150px] h-[150px] border border-purple-300/10 dark:border-purple-500/5 rounded-full z-[-4] animate-pulse-glow" style={{ animationDelay: '1.5s' }}></div>

                    <div className="hidden md:block absolute inset-0 w-full h-full z-[-6]">
                      <BackgroundEffects />
                    </div>
                  </div>

                  <div className="relative z-10 flex-1 flex flex-col">{children}</div>
                </div>
              </MusicProvider>
            </ToastProvider>
          </OperationProvider>
        </ThemeProvider>

        <CyberCat />

        <div className="hidden md:block">
          <ClickEffect />
        </div>
      </body>
    </html>
  );
}
