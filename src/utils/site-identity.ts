/** Resolved media reference from getSiteSettings() */
export interface MediaReference {
  mediaId: string;
  alt?: string;
  url?: string;
}

export interface StarterSiteIdentitySettings {
  title?: string;
  tagline?: string;
  logo?: MediaReference;
  favicon?: MediaReference;
}

const DEFAULT_SITE_TITLE = "My Site";
const DEFAULT_SITE_TAGLINE = "Built with EmDash";

/**
 * ウィンドウのタイトルバーに出す架空のブラウザ名。
 * 90 年代の雰囲気づくり用なので、実在製品の名前は使わない。
 */
export const BROWSER_NAME = "Web Browser";

export function resolveStarterSiteIdentity(settings?: StarterSiteIdentitySettings) {
  return {
    siteTitle: settings?.title ?? DEFAULT_SITE_TITLE,
    siteTagline: settings?.tagline ?? DEFAULT_SITE_TAGLINE,
    siteLogo: settings?.logo?.url ? settings.logo : null,
  };
}
