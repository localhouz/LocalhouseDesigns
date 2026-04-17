export type PrototypeMode =
  | 'visual-menu'
  | 'late-night'
  | 'market-landing'
  | 'searchable-menu'
  | 'order-flow'
  | 'pairing-agent';

export interface PrototypeMetric {
  value: string;
  label: string;
}

export interface PrototypeFeature {
  title: string;
  detail: string;
}

export interface PrototypeMenuCard {
  title: string;
  subtitle: string;
  price?: string;
  badge?: string;
}

export interface PrototypePairingOption {
  cut: string;
  wine: string;
  note: string;
}

export interface MarketLandingConfig {
  heroSubtext: string;
  freshHeadline: string;
  departmentHeadline: string;
  diningHeadline: string;
  diningBody: string;
  diningBullets: string[];
  diningCardTitle: string;
  diningCardBody: string;
  visitIntroHeadline: string;
  visitIntroBody: string;
  visitMarketBody: string;
  visitRestaurantBody: string;
}

export interface RestaurantPrototype {
  slug: string;
  shareSlug: string;
  businessName: string;
  instagramHandle: string;
  website: string;
  cityLabel: string;
  mode: PrototypeMode;
  opportunity: string;
  prototypeLabel: string;
  summary: string;
  heroTitle: string;
  heroSubtitle: string;
  primaryCta: string;
  secondaryCta: string;
  theme: {
    background: string;
    panel: string;
    panelAlt: string;
    line: string;
    accent: string;
    accentSoft: string;
    text: string;
    muted: string;
  };
  metrics: PrototypeMetric[];
  features: PrototypeFeature[];
  menuCards: PrototypeMenuCard[];
  marketDepartments?: PrototypeMenuCard[];
  marketLanding?: MarketLandingConfig;
  searchCategories?: string[];
  pairingOptions?: PrototypePairingOption[];
}

export const restaurantPrototypes: RestaurantPrototype[] = [
  {
    slug: 'wild-fork',
    shareSlug: 'wild-fork-amber-table-2026',
    businessName: 'Wild Fork',
    instagramHandle: '@wildforktulsa',
    website: 'https://www.wildforktulsa.com/',
    cityLabel: 'Tulsa',
    mode: 'visual-menu',
    opportunity: 'Show them a visual menu they can actually link in bio.',
    prototypeLabel: 'Visual Menu Prototype',
    summary: 'A food-first mobile landing page that trades text-heavy navigation for visual menu discovery, fast reservation intent, and clearer bio-link usability.',
    heroTitle: 'A bio-link menu that feels like the restaurant.',
    heroSubtitle: 'Wild Fork already has the atmosphere. This concept turns that into a cleaner mobile experience with visual menu cards, reserve-first flow, and stronger first-click confidence.',
    primaryCta: 'Reserve a table',
    secondaryCta: 'View tonight’s menu',
    theme: {
      background: 'radial-gradient(circle at top, #243229 0%, #111612 58%, #090b09 100%)',
      panel: 'rgba(17, 24, 18, 0.88)',
      panelAlt: 'rgba(29, 39, 31, 0.92)',
      line: 'rgba(206, 229, 199, 0.12)',
      accent: '#d7b67a',
      accentSoft: 'rgba(215, 182, 122, 0.18)',
      text: '#f6f1e8',
      muted: '#c6bdae'
    },
    metrics: [
      { value: '1 tap', label: 'Menu access from bio' },
      { value: '3', label: 'Food-first category cards' },
      { value: 'Mobile', label: 'Built around the first screen' }
    ],
    features: [
      { title: 'Visual menu tiles', detail: 'Swap plain text links for high-intent cards like brunch, dinner, and cocktails.' },
      { title: 'Reserve-first hero', detail: 'Keep the strongest action visible before a guest has to scroll.' },
      { title: 'Atmosphere carried forward', detail: 'Use photography, spacing, and warm contrast to match the in-person feel.' }
    ],
    menuCards: [
      { title: 'Brunch highlights', subtitle: 'Bright plates, pastries, and patio energy', badge: 'Most clicked' },
      { title: 'Dinner features', subtitle: 'Seasonal mains and house favorites', badge: 'Tonight' },
      { title: 'Cocktails + wine', subtitle: 'Easy pairing path for date-night traffic', badge: 'Pairings' }
    ]
  },
  {
    slug: 'the-tavern',
    shareSlug: 'the-tavern-after-hours-cinder-2026',
    businessName: 'The Tavern',
    instagramHandle: '@taverntulsa',
    website: 'https://www.taverntulsa.com/',
    cityLabel: 'Tulsa',
    mode: 'late-night',
    opportunity: 'Pitch a late-night menu that shifts automatically.',
    prototypeLabel: 'Late Night Menu Prototype',
    summary: 'A dynamic mobile menu that highlights happy hour, dinner, or late-night food automatically so the first thing guests see is what is actually relevant right now.',
    heroTitle: 'The menu changes with the night.',
    heroSubtitle: 'This concept makes The Tavern feel more alive online by switching featured items and CTAs based on time of day instead of forcing every guest through the same static page.',
    primaryCta: 'See what’s live now',
    secondaryCta: 'Book for tonight',
    theme: {
      background: 'radial-gradient(circle at top, #4e2f18 0%, #1d120b 56%, #090605 100%)',
      panel: 'rgba(28, 17, 11, 0.9)',
      panelAlt: 'rgba(47, 29, 18, 0.96)',
      line: 'rgba(255, 222, 184, 0.1)',
      accent: '#ff9f58',
      accentSoft: 'rgba(255, 159, 88, 0.2)',
      text: '#fff2e4',
      muted: '#d7c0aa'
    },
    metrics: [
      { value: 'Auto', label: 'Time-aware menu state' },
      { value: '3 modes', label: 'Happy hour / dinner / late night' },
      { value: 'Faster', label: 'First-screen relevance' }
    ],
    features: [
      { title: 'Time-based hero module', detail: 'Surface late-night snacks after hours without burying them in a PDF.' },
      { title: 'Offer switching', detail: 'Happy hour, dinner, and after-hours specials each get their own moment.' },
      { title: 'DM-ready promo path', detail: 'Makes event nights and social traffic easier to convert.' }
    ],
    menuCards: [
      { title: 'Happy hour', subtitle: 'Cocktails, shareables, and quick-drop reservations', badge: '4-6 PM' },
      { title: 'Dinner', subtitle: 'Main menu favorites and feature plates', badge: 'Prime time' },
      { title: 'Late night', subtitle: 'The food people are actually looking for at 10:30', badge: 'After dark' }
    ]
  },
  {
    slug: 'bodean',
    shareSlug: 'bodean-market-tide-signal-2026',
    businessName: 'Bodean Seafood',
    instagramHandle: '@bodeanseafood',
    website: 'https://www.bodeanrestaurant.com/',
    cityLabel: 'Tulsa',
    mode: 'market-landing',
    opportunity: 'Turn the outdated market page into a premium landing page that cleanly sells both the seafood case and the restaurant.',
    prototypeLabel: 'Seafood Market Landing Page',
    summary: 'A premium market-first landing page that surfaces what is fresh today, groups the inventory into useful departments, and gives visitors a cleaner split between shopping the market and reserving dinner.',
    heroTitle: 'Make the market the reason to visit.',
    heroSubtitle: 'This concept reframes Bodean as a destination seafood market with a restaurant attached, not a restaurant with a hard-to-scan market page buried underneath it.',
    primaryCta: 'Shop today’s market',
    secondaryCta: 'Reserve for dinner',
    theme: {
      background: 'radial-gradient(circle at top, #26506a 0%, #0c1d28 52%, #071015 100%)',
      panel: 'rgba(9, 23, 33, 0.9)',
      panelAlt: 'rgba(16, 43, 59, 0.95)',
      line: 'rgba(184, 226, 244, 0.16)',
      accent: '#9fdcf5',
      accentSoft: 'rgba(159, 220, 245, 0.18)',
      text: '#eff9fd',
      muted: '#c6dce7'
    },
    metrics: [
      { value: '2 paths', label: 'Market shop + dinner reservation' },
      { value: 'Today', label: 'Fresh arrivals surfaced first' },
      { value: 'Cleaner', label: 'Less text-heavy inventory' }
    ],
    features: [
      { title: 'Featured arrivals first', detail: 'Lead with the seafood case and what is fresh now instead of making guests parse a long inventory document.' },
      { title: 'Department-based layout', detail: 'Group fresh fish, shellfish, prepared foods, and market staples so the page feels premium and scannable.' },
      { title: 'Restaurant + market split', detail: 'Give visitors one clear path into shopping the market and another into reserving dinner.' }
    ],
    menuCards: [
      { title: 'Fresh Gulf snapper', subtitle: 'Whole fish and fillets surfaced right on the landing page', badge: 'Fresh arrival' },
      { title: 'East + west coast oysters', subtitle: 'A cleaner way to show what is actually in the case today', badge: 'Raw bar' },
      { title: 'House crab cakes', subtitle: 'Prepared seafood that should feel featured, not buried', badge: 'Prepared foods' }
    ],
    marketDepartments: [
      { title: 'Fresh fish', subtitle: 'Daily arrivals, featured cuts, and whole-fish availability' },
      { title: 'Shellfish', subtitle: 'Oysters, shrimp, crab, and clams from both coasts' },
      { title: 'Prepared foods', subtitle: 'Crab cakes, dips, sides, and take-home staples' },
      { title: 'Market staples', subtitle: 'Sauces, seasonings, and the pantry items regulars come back for' }
    ],
    marketLanding: {
      heroSubtext: 'Bodean has been Tulsa\'s seafood destination for over thirty years. Fresh arrivals from the Gulf, the Carolinas, and both coasts. Shop the market or stay for dinner.',
      freshHeadline: "What's fresh today",
      departmentHeadline: 'Everything in the case, organized the way you shop',
      diningHeadline: 'Dinner for two. Or twelve.',
      diningBody: 'The restaurant runs the same standard as the market — fresh catch, classic preparations, and an oyster bar that earns its own visit. Reserve ahead on weekends.',
      diningBullets: ['Raw bar open nightly', 'Fresh catch specials updated daily', 'Private dining available'],
      diningCardTitle: 'Raw bar, fresh catch, and seafood-house classics.',
      diningCardBody: 'Book early on weekends. The dining room fills around the market\'s busiest days.',
      visitIntroHeadline: 'Come for the market. Stay for dinner.',
      visitIntroBody: 'The market opens early. The restaurant stays open late. Both are worth the trip.',
      visitMarketBody: 'Fresh fish, shellfish, prepared foods, and take-home seafood staples.',
      visitRestaurantBody: 'Reservations recommended on weekends. Walk-ins welcome at the bar.'
    }
  },
  {
    slug: 'kilkennys',
    shareSlug: 'kilkennys-irish-menu-lantern-2026',
    businessName: 'Kilkenny’s Irish Pub',
    instagramHandle: '@tulsairishpub',
    website: 'https://www.kilkennysirishpub.com/',
    cityLabel: 'Tulsa',
    mode: 'searchable-menu',
    opportunity: 'Turn a giant menu into a searchable mobile UI.',
    prototypeLabel: 'Searchable Menu Prototype',
    summary: 'A mobile-first menu interface that helps guests search, filter, and actually find what they want instead of scrolling through an intimidating wall of categories.',
    heroTitle: 'Big menu. Much easier to use.',
    heroSubtitle: 'Kilkenny’s has range. This concept keeps that depth while giving guests a cleaner path through brunch, Irish staples, and pub favorites on mobile.',
    primaryCta: 'Search the menu',
    secondaryCta: 'Start with favorites',
    theme: {
      background: 'radial-gradient(circle at top, #183223 0%, #0d1711 56%, #080a08 100%)',
      panel: 'rgba(12, 20, 15, 0.92)',
      panelAlt: 'rgba(22, 36, 27, 0.96)',
      line: 'rgba(210, 235, 219, 0.12)',
      accent: '#e0b25e',
      accentSoft: 'rgba(224, 178, 94, 0.18)',
      text: '#f4f3eb',
      muted: '#c8c5b7'
    },
    metrics: [
      { value: 'Search', label: 'By craving or dish name' },
      { value: 'Filters', label: 'Favorites, Irish, brunch, pub' },
      { value: 'Less scroll', label: 'Faster path to order intent' }
    ],
    features: [
      { title: 'Search-first mobile experience', detail: 'Help guests jump to shepherd’s pie, fish and chips, or brunch immediately.' },
      { title: 'Smart category filters', detail: 'Turn menu depth into something useful instead of overwhelming.' },
      { title: 'Recommended starters', detail: 'Surface best bets before guests bounce.' }
    ],
    menuCards: [
      { title: 'Fish and chips', subtitle: 'Beer-battered pub classic', price: '$18' },
      { title: 'Shepherd’s pie', subtitle: 'Slow comfort favorite', price: '$19' },
      { title: 'Irish breakfast', subtitle: 'Brunch-heavy discovery card', price: '$17' },
      { title: 'Bangers and mash', subtitle: 'Easy dinner crowd favorite', price: '$18' },
      { title: 'Scotch egg', subtitle: 'Starter people actively search for', price: '$9' },
      { title: 'Bread pudding', subtitle: 'Dessert quick-add callout', price: '$8' }
    ],
    searchCategories: ['All', 'Irish classics', 'Pub mains', 'Brunch', 'Starters', 'Dessert']
  },
  {
    slug: 'nolas',
    shareSlug: 'nolas-bayou-order-orbit-2026',
    businessName: 'Nola’s Creole & Cocktails',
    instagramHandle: '@nolastulsa',
    website: 'https://www.nolastulsa.com/',
    cityLabel: 'Tulsa',
    mode: 'order-flow',
    opportunity: 'Build an interactive Bayou-vibes ordering path.',
    prototypeLabel: 'Interactive Ordering Prototype',
    summary: 'A richer mobile ordering and reservation concept that leans into the bayou atmosphere with flavor pathways, cocktail pairing prompts, and a stronger sense of personality.',
    heroTitle: 'Let the ordering flow carry the vibe.',
    heroSubtitle: 'This concept turns Nola’s personality into an interactive ordering surface with flavor routes, cocktail pairings, and a much more memorable first screen.',
    primaryCta: 'Start your order',
    secondaryCta: 'See cocktails first',
    theme: {
      background: 'radial-gradient(circle at top, #17444d 0%, #121828 48%, #090910 100%)',
      panel: 'rgba(13, 20, 31, 0.9)',
      panelAlt: 'rgba(22, 53, 59, 0.94)',
      line: 'rgba(224, 208, 150, 0.14)',
      accent: '#ef8f53',
      accentSoft: 'rgba(239, 143, 83, 0.2)',
      text: '#f7f1e8',
      muted: '#d2c6b8'
    },
    metrics: [
      { value: '3 paths', label: 'Bold / comfort / cocktails' },
      { value: 'Interactive', label: 'Choose-your-vibe ordering' },
      { value: 'Stronger', label: 'Brand personality online' }
    ],
    features: [
      { title: 'Flavor-first entry', detail: 'Start with what the guest is in the mood for instead of a plain category list.' },
      { title: 'Cocktail pairing path', detail: 'Tie food and drinks together in one smooth ordering flow.' },
      { title: 'Bayou visual system', detail: 'Carry the in-room energy into the digital experience.' }
    ],
    menuCards: [
      { title: 'Bold + spicy', subtitle: 'Blackened mains, heat-forward picks', badge: 'Heat seekers' },
      { title: 'Comfort classics', subtitle: 'Gumbo, etouffee, and richer plates', badge: 'Creole staples' },
      { title: 'Cocktail trail', subtitle: 'Start with drinks, then match the food', badge: 'Pair it' }
    ]
  },
  {
    slug: 'prhyme',
    shareSlug: 'prhyme-cellar-pairing-ledger-2026',
    businessName: 'PRHYME Steakhouse',
    instagramHandle: '@prhymetulsa',
    website: 'https://www.prhyme.com/',
    cityLabel: 'Tulsa',
    mode: 'pairing-agent',
    opportunity: 'Show a wine pairing guide that feels high-end instead of static.',
    prototypeLabel: 'Wine Pairing Prototype',
    summary: 'A luxe steakhouse landing page concept with a pairing assistant that turns the wine list into a guided experience, not just a dense document.',
    heroTitle: 'A pairing guide with the right level of ceremony.',
    heroSubtitle: 'This concept frames PRHYME’s digital experience around the steak-and-wine decision, with a calmer premium interface and a more persuasive path to reservation.',
    primaryCta: 'Explore pairings',
    secondaryCta: 'Reserve for dinner',
    theme: {
      background: 'radial-gradient(circle at top, #2c1218 0%, #11070a 52%, #070405 100%)',
      panel: 'rgba(18, 8, 11, 0.92)',
      panelAlt: 'rgba(35, 14, 19, 0.96)',
      line: 'rgba(241, 214, 170, 0.14)',
      accent: '#d9b27a',
      accentSoft: 'rgba(217, 178, 122, 0.18)',
      text: '#f8f2ea',
      muted: '#d8cbbf'
    },
    metrics: [
      { value: 'Guided', label: 'Steak-to-wine recommendations' },
      { value: 'Premium', label: 'Luxe reservation surface' },
      { value: 'Less friction', label: 'Wine list feels approachable' }
    ],
    features: [
      { title: 'Pairing-first entry point', detail: 'Lead with the decision guests actually want help making.' },
      { title: 'Premium restraint', detail: 'Dark tones, measured spacing, and a calmer luxury feel.' },
      { title: 'Reservation pressure reduced', detail: 'Move from curiosity to booking without making the page feel salesy.' }
    ],
    menuCards: [
      { title: 'Ribeye pairing', subtitle: 'Structured red for richer cuts', badge: 'Signature' },
      { title: 'Filet pairing', subtitle: 'Silky profile with softer tannin', badge: 'Guest favorite' },
      { title: 'Surf + turf pairing', subtitle: 'A white-red split that feels intentional', badge: 'Sommelier note' }
    ],
    pairingOptions: [
      { cut: 'Bone-in ribeye', wine: 'Napa cabernet sauvignon', note: 'Big tannin and dark fruit to match char and richness.' },
      { cut: 'Filet mignon', wine: 'Willamette pinot noir', note: 'Lighter body keeps the plate elegant without overpowering it.' },
      { cut: 'New York strip', wine: 'Super Tuscan blend', note: 'Balanced acidity and structure for a savory finish.' },
      { cut: 'Surf + turf', wine: 'Champagne + cabernet split', note: 'Start bright with shellfish, then land on depth with steak.' }
    ]
  }
];

export const restaurantPrototypeMap = new Map(
  restaurantPrototypes.flatMap((prototype) => [
    [prototype.slug, prototype] as const,
    [prototype.shareSlug, prototype] as const
  ])
);
