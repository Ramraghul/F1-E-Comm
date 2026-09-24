import type { ProductCategory } from '@shopswift/shared';
import { readableTextColor } from './color';

/**
 * Flat-style category icon paths, hand-drawn on a 0-100 viewBox. There's no licensed
 * product photography available for this demo (real team-merch photos are the
 * teams'/retailers' copyrighted property), so every product image is instead an
 * original icon illustration — a recognizable category glyph over the team's brand
 * color, with the specific product name printed on the card.
 */
const CATEGORY_ICONS: Record<ProductCategory, string> = {
  apparel: '<path d="M30 15 L40 5 L60 5 L70 15 L88 26 L76 42 L65 33 L65 92 L35 92 L35 33 L24 42 L12 26 Z"/>',
  headwear:
    '<path d="M14 58 Q14 18 50 18 Q86 18 86 58 L86 64 L14 64 Z"/><ellipse cx="38" cy="63" rx="36" ry="9"/>',
  'model-cars':
    '<path d="M8 58 L14 42 L26 30 L40 24 L66 24 L80 32 L92 42 L92 58 L92 66 L8 66 Z"/>' +
    '<circle cx="27" cy="68" r="11" fill="#0a0a0f" stroke-width="6"/>' +
    '<circle cx="73" cy="68" r="11" fill="#0a0a0f" stroke-width="6"/>',
  accessories:
    '<path d="M15 50 L38 22 H82 Q88 22 88 28 V72 Q88 78 82 78 H38 Z"/><circle cx="32" cy="50" r="7" fill="#0a0a0f"/>',
  collectibles:
    '<path d="M30 12 H70 V34 Q70 56 50 56 Q30 56 30 34 Z"/><rect x="43" y="56" width="14" height="14"/>' +
    '<rect x="28" y="70" width="44" height="10" rx="2"/>' +
    '<path d="M30 18 Q13 18 13 34 Q13 46 30 44" fill="none" stroke-width="5"/>' +
    '<path d="M70 18 Q87 18 87 34 Q87 46 70 44" fill="none" stroke-width="5"/>',
  other:
    '<path d="M50,8 L60.5,35.9 L90.5,36.6 L66.9,55.2 L75.4,84.2 L50,67.3 L24.6,84.2 L33.1,55.2 L9.5,36.6 L39.5,35.9 Z"/>',
};

function escapeXml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** Splits a label onto up to 2 lines so it fits the card without overflowing. */
function wrapLabel(label: string, maxCharsPerLine = 16): string[] {
  if (label.length <= maxCharsPerLine) return [label];
  const words = label.split(' ');
  let line1 = '';
  let i = 0;
  while (i < words.length && (line1 + words[i]!).length <= maxCharsPerLine) {
    line1 += (line1 ? ' ' : '') + words[i];
    i++;
  }
  const line2 = words.slice(i).join(' ');
  return line2 ? [line1, line2] : [line1];
}

/**
 * Builds a `data:image/svg+xml;base64,...` product image: the team's brand color,
 * a subtle racing-stripe watermark, a category icon badge, and the product name.
 * A data URI is used (rather than an external placeholder service) so images never
 * depend on network availability and render identically in every environment.
 */
export function generateProductImage(
  category: ProductCategory,
  teamColorPrimary: string,
  label: string,
): string {
  const fg = `#${readableTextColor(teamColorPrimary)}`;
  const icon = CATEGORY_ICONS[category];
  const lines = wrapLabel(label);
  const lineHeight = 52;
  const startY = 700 - ((lines.length - 1) * lineHeight) / 2;
  const textEls = lines
    .map(
      (line, i) =>
        `<text x="400" y="${startY + i * lineHeight}" font-family="Montserrat, Arial, sans-serif" font-weight="700" font-size="44" fill="${fg}" text-anchor="middle">${escapeXml(line)}</text>`,
    )
    .join('');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${teamColorPrimary}"/>
        <stop offset="100%" stop-color="${teamColorPrimary}" stop-opacity="0.78"/>
      </linearGradient>
    </defs>
    <rect width="800" height="800" fill="url(#bg)"/>
    <g opacity="0.10" stroke="${fg}" stroke-width="14">
      <line x1="-50" y1="150" x2="850" y2="-150"/>
      <line x1="-50" y1="950" x2="850" y2="650"/>
    </g>
    <circle cx="400" cy="330" r="230" fill="${fg}" opacity="0.14"/>
    <g transform="translate(400,330) scale(4.6) translate(-50,-50)" fill="${fg}" stroke="${fg}">${icon}</g>
    <rect x="0" y="620" width="800" height="180" fill="#000000" opacity="0.28"/>
    ${textEls}
  </svg>`;

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}
