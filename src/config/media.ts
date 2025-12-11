/**
 * Cloudflare R2 CDN Configuration for FUN Planet
 * All media files are served from this CDN
 */

export const R2_CDN_BASE = "https://media.funplanet.life";

/**
 * Get the full CDN URL for a media file
 * @param path - The path to the media file (e.g., "/videos/hero.mp4")
 * @returns The full CDN URL
 */
export const getMediaUrl = (path: string): string => {
  // Remove leading slash if present to avoid double slashes
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${R2_CDN_BASE}/${cleanPath}`;
};

// Pre-defined media URLs for common assets
export const MEDIA_URLS = {
  // Audio files
  audio: {
    coinReward: `${R2_CDN_BASE}/audio/coin-reward.mp3`,
    rich1: `${R2_CDN_BASE}/audio/rich1.mp3`,
    rich1_3: `${R2_CDN_BASE}/audio/rich1-3.mp3`,
    rich1_5: `${R2_CDN_BASE}/audio/rich1-5.mp3`,
    rich1_6: `${R2_CDN_BASE}/audio/rich1-6.mp3`,
    radiantDreamland: `${R2_CDN_BASE}/audio/radiant-dreamland.mp3`,
    angelOfTheStars: `${R2_CDN_BASE}/audio/angel-of-the-stars.mp3`,
  },
  // Video files
  videos: {
    heroBackground: `${R2_CDN_BASE}/videos/hero-background.mp4`,
    heroBackgroundLatest: `${R2_CDN_BASE}/videos/hero-background-latest.mp4`,
  },
  // Game images
  games: {
    platformer: `${R2_CDN_BASE}/images/games/platformer.jpg`,
    cityCreator: `${R2_CDN_BASE}/images/games/city-creator.jpg`,
    happyKitchenJoy: `${R2_CDN_BASE}/images/games/happy-kitchen-joy.jpg`,
  },
} as const;
