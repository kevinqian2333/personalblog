import { siteConfig } from "../siteConfig";

export function getSiteConfig(): typeof siteConfig {
  if (typeof window === "undefined") return siteConfig;
  try {
    const saved = localStorage.getItem("site-settings");
    if (!saved) return siteConfig;
    const parsed = JSON.parse(saved);

    const bgImages = Array.isArray(parsed.bgImages) && parsed.bgImages.length > 0 ? parsed.bgImages : siteConfig.bgImages;
    const themeColors = Array.isArray(parsed.themeColors) && parsed.themeColors.length > 0 ? parsed.themeColors : siteConfig.themeColors;
    const cloudMusicIds = Array.isArray(parsed.cloudMusicIds) && parsed.cloudMusicIds.length > 0 ? parsed.cloudMusicIds : siteConfig.cloudMusicIds;

    return {
      ...siteConfig,
      authorName: parsed.authorName || siteConfig.authorName,
      bio: parsed.bio || siteConfig.bio,
      avatarUrl: parsed.avatarUrl || siteConfig.avatarUrl,
      bgImages,
      themeColors,
      cloudMusicIds,
      bgBlur: typeof parsed.bgBlur === "number" ? parsed.bgBlur : siteConfig.bgBlur ?? 8,
      buildDate: parsed.buildDate || siteConfig.buildDate,
      friendLinkApplyFormat: parsed.friendLinkApplyFormat || siteConfig.friendLinkApplyFormat,
      friendLinkIntro: parsed.friendLinkIntro || siteConfig.friendLinkIntro,
      social: {
        ...siteConfig.social,
        github: parsed.github || siteConfig.social.github,
        email: parsed.email || siteConfig.social.email,
        qq: parsed.qq || siteConfig.social.qq,
        wechat: parsed.wechat || siteConfig.social.wechat,
      },
      icpConfig: {
        ...siteConfig.icpConfig,
        name: parsed.icpName || siteConfig.icpConfig.name,
        link: parsed.icpLink || siteConfig.icpConfig.link,
      },
      gitalkConfig: {
        ...siteConfig.gitalkConfig,
        clientID: parsed.clientID || siteConfig.gitalkConfig.clientID,
        clientSecret: parsed.clientSecret || siteConfig.gitalkConfig.clientSecret,
        repo: parsed.repo || siteConfig.gitalkConfig.repo,
        owner: parsed.owner || siteConfig.gitalkConfig.owner,
      },
    };
  } catch {
    return siteConfig;
  }
}
