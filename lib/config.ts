import { siteConfig } from "../siteConfig";

export function getSiteConfig(): typeof siteConfig {
  if (typeof window === "undefined") return siteConfig;
  try {
    const saved = localStorage.getItem("site-settings");
    if (!saved) return siteConfig;
    const parsed = JSON.parse(saved);

    const bgImages = Array.isArray(parsed.bgImages) ? parsed.bgImages : siteConfig.bgImages;
    const themeColors = Array.isArray(parsed.themeColors) ? parsed.themeColors : siteConfig.themeColors;
    const cloudMusicIds = Array.isArray(parsed.cloudMusicIds) ? parsed.cloudMusicIds : siteConfig.cloudMusicIds;

    return {
      ...siteConfig,
      authorName: parsed.authorName || siteConfig.authorName,
      bio: parsed.bio || siteConfig.bio,
      avatarUrl: parsed.avatarUrl || siteConfig.avatarUrl,
      bgImages: bgImages.length > 0 ? bgImages : siteConfig.bgImages,
      themeColors: themeColors.length > 0 ? themeColors : siteConfig.themeColors,
      cloudMusicIds: cloudMusicIds.length > 0 ? cloudMusicIds : siteConfig.cloudMusicIds,
      social: {
        ...siteConfig.social,
        github: parsed.github || siteConfig.social.github,
        email: parsed.email || siteConfig.social.email,
        qq: parsed.qq || siteConfig.social.qq,
        wechat: parsed.wechat || siteConfig.social.wechat,
      },
    };
  } catch {
    return siteConfig;
  }
}
