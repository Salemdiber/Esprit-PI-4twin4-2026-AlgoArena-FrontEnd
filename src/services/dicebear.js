// dicebear.js
// Utilitaire pour générer une URL d'avatar DiceBear (sprites: identicon, bottts, etc)

import { createAvatar } from '@dicebear/avatars';
import * as style from '@dicebear/collection';

/**
 * Génère une URL SVG DiceBear pour un pseudo donné
 * @param {string} seed - Le pseudo ou email
 * @param {string} sprite - Le style ("identicon", "bottts", "adventurer", etc)
 * @returns {string} - Data URL SVG
 */
export function getDiceBearAvatar(seed, sprite = 'adventurer') {
  // DiceBear v4: createAvatar(style, { seed })
  // v5+: createAvatar(style["adventurer"], { seed })
  return createAvatar(style[sprite], { seed });
}

/**
 * Génère une URL HTTP DiceBear (API officielle, fallback)
 */
export function getDiceBearUrl(seed, sprite = 'adventurer') {
  return `https://api.dicebear.com/7.x/${sprite}/svg?seed=${encodeURIComponent(seed)}`;
}
