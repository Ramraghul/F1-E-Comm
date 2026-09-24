import type { ProductCategory } from '@shopswift/shared';

/** Short, commonly-used team names for product titles (e.g. "Red Bull Team Cap", not "Oracle Red Bull Racing Team Cap"). */
export const TEAM_SHORT_NAME: Record<string, string> = {
  mercedes: 'Mercedes',
  'red-bull-racing': 'Red Bull',
  ferrari: 'Ferrari',
  mclaren: 'McLaren',
  'aston-martin': 'Aston Martin',
  alpine: 'Alpine',
  williams: 'Williams',
  'racing-bulls': 'Racing Bulls',
  'kick-sauber': 'Sauber',
  haas: 'Haas',
};

export interface ProductTemplate {
  /** May reference `{team}` — replaced with the team's short display name. */
  name: string;
  category: ProductCategory;
  description: string;
  /** Inclusive price range in whole dollars; converted to cents at seed time. */
  priceRange: [number, number];
  sizes?: string[];
  isFeaturedCandidate?: boolean;
}

const APPAREL_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

/** A realistic, non-team-specific F1 merchandise catalog — every team gets this same lineup. */
export const PRODUCT_CATALOG: ProductTemplate[] = [
  {
    name: '{team} Team Polo Shirt',
    category: 'apparel',
    description:
      'Official-style team polo in performance fabric, featuring the team crest and title-partner branding. As worn by the pit crew on race weekends.',
    priceRange: [55, 75],
    sizes: APPAREL_SIZES,
    isFeaturedCandidate: true,
  },
  {
    name: '{team} Softshell Team Jacket',
    category: 'apparel',
    description:
      'Lightweight, water-resistant softshell jacket in the team livery, built for the paddock and the school run alike. Full-zip with embroidered team logo.',
    priceRange: [120, 165],
    sizes: APPAREL_SIZES,
    isFeaturedCandidate: true,
  },
  {
    name: '{team} Race Day T-Shirt',
    category: 'apparel',
    description:
      '100% cotton crew-neck tee in team colors with large front print. The easiest way to show your colors trackside.',
    priceRange: [32, 45],
    sizes: APPAREL_SIZES,
  },
  {
    name: '{team} Team Hoodie',
    category: 'apparel',
    description: 'Heavyweight fleece hoodie with kangaroo pocket and embroidered team wordmark. Built for chilly garage mornings.',
    priceRange: [78, 95],
    sizes: APPAREL_SIZES,
  },
  {
    name: '{team} Team Scarf',
    category: 'apparel',
    description: 'Classic knitted supporters scarf in the team’s primary and secondary colors — a grandstand essential.',
    priceRange: [26, 36],
  },
  {
    name: '{team} Team Cap',
    category: 'headwear',
    description: 'Adjustable curved-brim cap with embroidered 3D team logo on the front panel. One size fits most.',
    priceRange: [30, 40],
    isFeaturedCandidate: true,
  },
  {
    name: '{team} Knit Beanie',
    category: 'headwear',
    description: 'Ribbed-knit beanie with woven team badge — cold-weather race-week essential.',
    priceRange: [24, 32],
  },
  {
    name: '{team} 1:43 Scale Car Model',
    category: 'model-cars',
    description: 'Die-cast 1:43 scale replica of this season’s challenger, finished in full team livery with detailed decals and display stand.',
    priceRange: [45, 68],
    isFeaturedCandidate: true,
  },
  {
    name: '{team} 1:18 Scale Car Model',
    category: 'model-cars',
    description: 'Museum-quality 1:18 scale die-cast model with opening cockpit detail, printed sponsor livery, and a numbered certificate of authenticity.',
    priceRange: [165, 240],
    isFeaturedCandidate: true,
  },
  {
    name: '{team} Team Keyring',
    category: 'accessories',
    description: 'Die-cast metal keyring featuring the team crest — a small piece of the garage for your keychain.',
    priceRange: [12, 18],
  },
  {
    name: '{team} Storm Umbrella',
    category: 'accessories',
    description: 'Windproof golf umbrella in team colors, printed with the team logo across every panel. A paddock-club favorite for a wet race day.',
    priceRange: [42, 58],
  },
  {
    name: '{team} Insulated Water Bottle',
    category: 'accessories',
    description: 'Double-wall stainless steel bottle that keeps drinks cold on the pit wall all session long, printed with the team logo.',
    priceRange: [22, 30],
  },
  {
    name: '{team} Team Backpack',
    category: 'accessories',
    description: 'Durable team-branded backpack with padded laptop sleeve — built to survive a full race weekend in the paddock.',
    priceRange: [72, 98],
    isFeaturedCandidate: true,
  },
  {
    name: '{team} Phone Case',
    category: 'accessories',
    description: 'Impact-resistant phone case wrapped in the team’s race livery. Available for most popular phone models.',
    priceRange: [22, 30],
  },
  {
    name: '{team} Paddock Lanyard',
    category: 'other',
    description: 'Woven team lanyard with breakaway clasp and card holder — exactly what the crew wears in the paddock.',
    priceRange: [10, 15],
  },
  {
    name: '{team} Championship Print (Framed)',
    category: 'collectibles',
    description: 'A framed, limited-edition print celebrating the team’s championship history — printed on museum-grade matte stock.',
    priceRange: [60, 92],
  },
  {
    name: '{team} Pit Wall Mug',
    category: 'collectibles',
    description: 'Ceramic mug printed with the current season’s livery — the official way to take your coffee on a race morning.',
    priceRange: [16, 22],
  },
];

/** Driver-specific items, generated per driver listed on the team (see shared/src/constants/teams.ts). */
export const DRIVER_PRODUCT_TEMPLATES: Omit<ProductTemplate, 'name'>[] = [
  {
    category: 'headwear',
    description: 'Driver-edition cap featuring the number and signature graphic, as worn in pre-race press sessions.',
    priceRange: [35, 45],
  },
  {
    category: 'collectibles',
    description: 'Collectible driver card print with race number, nationality flag, and season stats — a must for the collection.',
    priceRange: [16, 24],
  },
  {
    category: 'apparel',
    description: 'Driver-number tee printed front and back with race number and surname, in the team’s primary color.',
    priceRange: [34, 44],
  },
];

export function driverProductName(driverName: string, template: Omit<ProductTemplate, 'name'>): string {
  const surname = driverName.trim().split(' ').at(-1);
  if (template.category === 'headwear') return `${surname} Driver Cap`;
  if (template.category === 'collectibles') return `${surname} Driver Card`;
  return `${surname} Number Tee`;
}
