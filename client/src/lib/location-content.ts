export type LocationContent = {
  slug: string;
  displayName: string; // Must match the `location` column value in Supabase
  h1: string;
  subtitle: string;
  heroImage: string;
  // The about paragraph supports inline emphasis:
  //   **text**  →  bold in primary color (for key place names, numbers, facts)
  //   ~~text~~  →  accent (red) color (for standout stats / CTAs)
  about: string;
  // Optional bullets shown in an "At a glance" panel under the about paragraph.
  highlights?: string[];
  projectsContext: string;
  developersContext: string;
  // "Why {location}" section — two symmetric hero-stat cards.
  why: {
    operators: WhyCard;
    investors: WhyCard;
  };
};

export type WhyCard = {
  stat: string;       // e.g. "5+" or "10–15%"
  statLabel: string;  // short line under the stat
  headline: string;   // short bold heading
  bullets: string[];  // 3-4 short bullets
};

export const LOCATION_CONTENT: Record<string, LocationContent> = {
  "new-cairo": {
    slug: "new-cairo",
    displayName: "New Cairo",
    h1: "New Cairo",
    subtitle:
      "Egypt's fastest growing business hub — home to the highest concentration of business parks, mixed-use developments, and commercial destinations east of Cairo.",
    heroImage: "/images/new-cairo.jpg",
    about:
      "New Cairo is Egypt's **most active real estate market** for commercial and administrative property. Anchored by **90th Street** — the main commercial artery running through the **Fifth Settlement** — the district hosts major financial, administrative, and commercial centers serving both New Cairo and Greater Cairo. Strategically positioned with easy access to **Cairo International Airport** and major highway networks, New Cairo provides businesses with convenient access to both domestic and international markets. For investors, annual returns on administrative units in New Cairo can reach up to ~~10–15%~~ — significantly higher than residential yields in the same area.",
    highlights: [
      "Egypt's most active commercial real estate market",
      "Anchored by 90th Street in the Fifth Settlement",
      "Direct access to Cairo International Airport and major highways",
      "10–15% annual returns on administrative units",
      "Home to business parks, mixed-use hubs, and major commercial destinations",
    ],
    projectsContext:
      "New Cairo is home to some of Egypt's most prominent commercial and administrative developments — from large-scale business parks to mixed-use destinations.",
    developersContext:
      "New Cairo attracts Egypt's most active developers. These are the developers PLACES works with who have projects in this district.",
    why: {
      operators: {
        stat: "5+",
        statLabel: "Major commercial hubs across the district",
        headline: "Prestige, accessibility, and modern infrastructure",
        bullets: [
          "Modern infrastructure, wide roads, and reliable utilities",
          "Home to Cairo Festival City, The Waterway, District 5, One Ninety, and Mivida",
          "Prominent business corridors along North and South 90th Street",
          "Growing talent pool near major universities",
        ],
      },
      investors: {
        stat: "10–15%",
        statLabel: "Annual returns on administrative units",
        headline: "Egypt's most active commercial real estate market",
        bullets: [
          "Strong, consistent corporate tenant demand",
          "Consistently rising price per square meter",
          "Major developers continuing to deliver new office and mixed-use supply",
        ],
      },
    },
  },
  "sheikh-zayed": {
    slug: "sheikh-zayed",
    displayName: "Sheikh Zayed",
    h1: "Sheikh Zayed",
    subtitle:
      "West Cairo's most connected business corridor — a growing hub for mixed-use commercial developments along the 26th of July Axis, serving a high-income residential base.",
    heroImage: "/images/Sheikh-zayed.jpg",
    about:
      "Sheikh Zayed is one of **Greater Cairo's fastest-growing commercial districts**, located in **Giza Governorate** between **6th of October City** and the **26th of July Corridor** — approximately **20 km** from central Cairo. The city attracts businesses seeking proximity to a high-income, dense residential community while maintaining strong road connectivity to both east and west Cairo. Commercial development in Sheikh Zayed is concentrated along the **26th of July Axis** and the **Beverly Hills** district, with a mix of business parks, strip malls, and mixed-use towers. For investors, the area's rapidly expanding population and sustained corporate demand are driving ~~consistent growth~~ in commercial rental values.",
    highlights: [
      "West Cairo's most connected commercial district",
      "Anchored by the 26th of July Corridor and Ring Road access",
      "Close proximity to 6th of October and central Cairo",
      "Growing residential base driving consistent commercial demand",
      "Mix of business parks, strip malls, and mixed-use towers",
    ],
    projectsContext:
      "Sheikh Zayed is home to a growing portfolio of commercial and administrative developments — from mixed-use towers in Beverly Hills to business parks along the 26th of July Axis.",
    developersContext: "",
    why: {
      operators: {
        stat: "3+",
        statLabel: "Major road corridors connecting east and west Cairo",
        headline: "Connectivity, affluence, and accessibility",
        bullets: [
          "Serves a high-income residential catchment with strong purchasing power",
          "Well-connected via 26th of July Corridor, Ring Road, and Cairo–Alexandria Desert Road",
          "Growing community of local and international businesses",
          "Proximity to major universities, schools, and medical facilities in west Cairo",
        ],
      },
      investors: {
        stat: "Competitive",
        statLabel: "Entry prices vs New Cairo for equivalent commercial space",
        headline: "A rapidly expanding west Cairo market",
        bullets: [
          "Rapidly expanding residential population driving commercial demand",
          "Newer developments with modern infrastructure and flexible unit sizes",
          "Strong rental appetite from businesses serving the west Cairo corridor",
        ],
      },
    },
  },
  "maadi": {
    slug: "maadi",
    displayName: "Maadi",
    h1: "Maadi",
    subtitle:
      "Cairo's most established expatriate and corporate district — a quiet, well-connected address on the east bank of the Nile, preferred by multinationals, embassies, and professional services firms.",
    heroImage: "/images/Maadi.jpg",
    about:
      "Maadi is one of Cairo's most distinctive commercial addresses — a leafy, well-organized district on the east bank of the Nile, approximately **12 km** south of **Downtown Cairo**. The area has historically been home to multinational corporations, embassies, international schools, and professional services firms, making it one of the most in-demand office markets for companies that need a prestigious, internationally recognized Cairo address. Commercial space in Maadi is concentrated along **Road 9**, **Degla**, and the **New Maadi** axis — all accessible via the **Ring Road**, **Nile Corniche**, and the **Autostrad**. For investors, Maadi's strong corporate tenant base and consistent demand from foreign companies and diplomatic organizations translate into ~~reliable occupancy~~ and competitive rental yields.",
    highlights: [
      "Preferred address for multinationals, embassies, and professional services firms",
      "Accessible via Ring Road, Nile Corniche, and Autostrad",
      "Commercial clusters in Road 9, Degla, and New Maadi",
      "Strong, consistent corporate and diplomatic tenant demand",
      "Metro connectivity via Maadi, Hadayek, and Sakanat stations",
    ],
    projectsContext:
      "Maadi's commercial portfolio spans established office buildings and newer mixed-use destinations — all positioned to serve the district's dense corporate and expatriate tenant base.",
    developersContext: "",
    why: {
      operators: {
        stat: "3",
        statLabel: "Metro stations serving the district (Maadi, Hadayek, Sakanat)",
        headline: "A prestigious, established Cairo address",
        bullets: [
          "Internationally recognized, prestigious Cairo business address",
          "Preferred by multinationals, foreign companies, and diplomatic organizations",
          "Quiet, green environment with reliable infrastructure",
          "Metro access and strong road connectivity across Greater Cairo",
        ],
      },
      investors: {
        stat: "Stable",
        statLabel: "Rental performance driven by diplomatic and multinational occupiers",
        headline: "Predictable, long-term yield performance",
        bullets: [
          "Consistent corporate tenant demand with low vacancy rates",
          "Strong preference from foreign companies for Maadi addresses",
          "Established market with predictable, long-term yield performance",
        ],
      },
    },
  },
  "downtown-cairo": {
    slug: "downtown-cairo",
    displayName: "Downtown Cairo",
    h1: "Downtown Cairo",
    subtitle:
      "Egypt's original business center — a high-footfall district with unmatched centrality, government proximity, and metro connectivity, attracting legal firms, financial institutions, and boutique offices.",
    heroImage: "/images/downtown-cairo.jpg",
    about:
      "Downtown Cairo is Egypt's **historic commercial and financial center** — the **most centrally located district** in Greater Cairo, home to **government ministries**, major financial institutions, legal firms, and established commercial operations. While newer districts have drawn corporate headquarters eastward, Downtown remains highly active for businesses that require proximity to government bodies, courts, banks, and the dense foot traffic of central Cairo. Commercial space Downtown ranges from renovated historic buildings to newer boutique office developments. For investors, Downtown Cairo offers ~~accessible entry prices~~ relative to newer districts, with strong rental demand from legal, financial, and government-adjacent businesses that specifically require a central Cairo address.",
    highlights: [
      "Egypt's most centrally located commercial district",
      "Home to government ministries, courts, and major financial institutions",
      "Accessible via Cairo Metro and all major central Cairo roads",
      "Strong demand from legal, financial, and government-adjacent businesses",
      "Competitive entry prices with steady rental demand",
    ],
    projectsContext:
      "Downtown Cairo's commercial portfolio includes a mix of established office buildings and newer boutique developments — all positioned at the center of Cairo's government and financial activity.",
    developersContext: "",
    why: {
      operators: {
        stat: "Central",
        statLabel: "The most accessible district in Greater Cairo",
        headline: "The heart of Cairo's business and government ecosystem",
        bullets: [
          "Unmatched centrality — accessible from all directions across Greater Cairo",
          "Essential for businesses that need proximity to courts, ministries, and banks",
          "Dense foot traffic and established commercial catchment area",
          "Metro connectivity providing access to all Cairo districts",
        ],
      },
      investors: {
        stat: "Accessible",
        statLabel: "Entry prices vs New Cairo and Sheikh Zayed, with steady demand",
        headline: "Established market with long-term, predictable demand",
        bullets: [
          "Steady rental demand from legal, government-adjacent, and financial tenants",
          "Boutique office market with strong occupancy in well-located buildings",
          "Renovation potential in established commercial buildings with strong bones",
        ],
      },
    },
  },
  "6th-october": {
    slug: "6th-october",
    displayName: "6th October",
    h1: "6th of October",
    subtitle:
      "One of Egypt's largest planned cities west of Cairo — an established commercial and industrial hub with mature infrastructure, competitive pricing, and strong road connectivity via the Cairo–Alexandria Desert Road.",
    heroImage: "/images/6thoctober .jpg",
    about:
      "6th of October City is one of **Egypt's largest and most established planned cities**, located in **Giza Governorate** along the **Cairo–Alexandria Desert Road**. Originally developed as an industrial and residential expansion of Greater Cairo, the city has grown into a fully self-contained commercial destination with its own retail corridors, administrative zones, educational institutions, and logistics hubs. Commercial space in 6th of October offers businesses scale and infrastructure at price points that are typically more competitive than east Cairo equivalents — making it an attractive option for companies that prioritize cost efficiency and west Cairo market access without sacrificing connectivity. For investors, the city's large and established residential base generates ~~consistent commercial and retail demand~~ across all property types.",
    highlights: [
      "One of Egypt's largest planned cities with mature commercial infrastructure",
      "Accessible via Cairo–Alexandria Desert Road and 26th of July Corridor",
      "Competitive commercial pricing versus newer Cairo districts",
      "Large, established residential base driving consistent commercial demand",
      "Strong presence of retail, industrial, and services sector tenants",
    ],
    projectsContext:
      "6th of October's commercial portfolio spans large-scale retail destinations, mixed-use developments, and standalone administrative buildings serving the city's dense residential and business population.",
    developersContext: "",
    why: {
      operators: {
        stat: "Competitive",
        statLabel: "Commercial pricing versus east Cairo for equivalent infrastructure",
        headline: "Cost-efficient scale in west Cairo",
        bullets: [
          "Cost-efficient alternative to east Cairo with equivalent infrastructure quality",
          "Access to a large, established residential catchment in west Cairo",
          "Well-connected via Cairo–Alexandria Desert Road and Ring Road",
          "Proximity to industrial zones and logistics corridors serving west Cairo",
        ],
      },
      investors: {
        stat: "Established",
        statLabel: "Commercial zones with predictable, long-term rental performance",
        headline: "A mature market with stable, consistent returns",
        bullets: [
          "Competitive entry prices with strong yield potential in well-located assets",
          "Stable occupancy driven by industrial, retail, and services sector demand",
          "Large residential population ensuring consistent commercial footfall",
          "Established commercial zones with predictable, long-term rental performance",
        ],
      },
    },
  },
  "sheraton": {
    slug: "sheraton",
    displayName: "Sheraton",
    h1: "Sheraton",
    subtitle:
      "A high-traffic commercial corridor in east Cairo — strategically positioned on Nasr Road between Heliopolis and Nasr City, minutes from Cairo International Airport and connected to all major Cairo arteries.",
    heroImage: "/images/sheraton.jpg",
    about:
      "Sheraton is a dense, well-connected commercial district in east Cairo, positioned along **Nasr Road** between **Heliopolis** and **Nasr City** — with **Cairo International Airport** just **5 minutes** away. The area has a long-established commercial character, attracting a wide range of tenants from multinational corporations and banks to retail brands and professional services firms. Key commercial corridors run through **El Mosheer Ahmed Ismail Street** and the **Autostrad Road**, home to established offices and newer mixed-use developments. Sheraton's commercial appeal lies in its centrality — it sits at a natural crossroads between Heliopolis, Nasr City, New Cairo, and Downtown Cairo, making it one of east Cairo's most accessible business addresses. For investors, the district's ~~high foot traffic~~, strong tenant mix, and airport proximity deliver consistent occupancy and solid commercial returns.",
    highlights: [
      "5 minutes from Cairo International Airport",
      "Positioned on Nasr Road between Heliopolis and Nasr City",
      "Established commercial corridor with strong corporate and retail tenant mix",
      "Connected to Ring Road, Autostrad, and all major east Cairo arteries",
      "Consistent commercial demand from banking, retail, and professional services sectors",
    ],
    projectsContext:
      "Sheraton's commercial portfolio includes established office buildings and newer mixed-use developments along Nasr Road — all positioned at one of east Cairo's most accessible and high-traffic business intersections.",
    developersContext: "",
    why: {
      operators: {
        stat: "5 min",
        statLabel: "To Cairo International Airport",
        headline: "East Cairo's most accessible airport-adjacent corridor",
        bullets: [
          "One of east Cairo's most central and accessible commercial addresses",
          "Minutes from Cairo International Airport — critical for travel-dependent businesses",
          "Strong surrounding tenant mix including banks, multinationals, and retail brands",
          "Well-connected to Heliopolis, Nasr City, New Cairo, and Downtown via major roads",
        ],
      },
      investors: {
        stat: "Consistent",
        statLabel: "Occupancy driven by airport proximity and established tenant mix",
        headline: "Stable returns in a high-demand east Cairo corridor",
        bullets: [
          "High foot traffic location with consistent commercial and retail occupancy",
          "Airport proximity drives sustained demand from international and logistics businesses",
          "Established market with a proven commercial tenant mix including banks and corporates",
          "Newer mixed-use supply delivering modern units into a high-demand corridor",
        ],
      },
    },
  },
};

// Maps a developer name (as stored in Supabase) to its detail-page slug, if one exists.
// Add entries here when new developer pages are built.
const DEVELOPER_SLUGS: Record<string, string> = {
  emaar: "emaar",
  "emaar misr": "emaar",
  arabella: "arabella",
  "arabella developments": "arabella",
  "al futtaim": "al-futtaim",
  "al-futtaim": "al-futtaim",
  "al-futtaim real estate": "al-futtaim",
  afgre: "al-futtaim",
  "majid al futtaim": "majid-al-futtaim",
  maf: "majid-al-futtaim",
  lmd: "lmd",
  "landmark sabbour development": "lmd",
  sodic: "sodic",
  "sixth of october development and investment company": "sodic",
  "the waterway": "the-waterway",
  "the waterway developments": "the-waterway",
  waterway: "the-waterway",
  "imkan misr": "imkan-misr",
  imkan: "imkan-misr",
  "imkan properties": "imkan-misr",
  "misr italia": "misr-italia",
  "the ark developments": "the-ark-developments",
  "the ark": "the-ark-developments",
  "ark developments": "the-ark-developments",
  "people of ark": "the-ark-developments",
  kvrd: "kvrd",
  "pre developments": "pre-developments",
  "pioneers real estate": "pre-developments",
  pre: "pre-developments",
  marakez: "marakez",
  "fawaz al hokair": "marakez",
  "al rabat properties": "al-rabat-properties",
  "al rabat properties development": "al-rabat-properties",
  "al rabat": "al-rabat-properties",
  alrabat: "al-rabat-properties",
  "alrabat properties": "al-rabat-properties",
  "alrabat properties development": "al-rabat-properties",
  "al jazi": "al-jazi",
  "al jazi developments": "al-jazi",
  aljazi: "al-jazi",
  "aljazi developments": "al-jazi",
  "al faisal holding": "al-jazi",
  "seldar misr": "al-jazi",
  horizon: "horizon-egypt",
  "horizon egypt": "horizon-egypt",
  "horizon egypt developments": "horizon-egypt",
  "horizon developments": "horizon-egypt",
  "adnan saffarini": "horizon-egypt",
  "adnan saffarini group": "horizon-egypt",
  catalyst: "catalyst",
  "catalyst developments": "catalyst",
  afaaq: "afaaq",
  "afaaq developments": "afaaq",
  "afaaq for development": "afaaq",
  "afaaq for development and real estate investments": "afaaq",
  "town writers": "town-writers",
  "town writers developments": "town-writers",
  "eight developments": "town-writers",
  "aro holding": "town-writers",
  larz: "larz",
  "larz developments": "larz",
  "al-gawish": "larz",
  "al-gawish group": "larz",
  "al gawish group": "larz",
  morshedy: "morshedy",
  "morshedy group": "morshedy",
  "memaar al morshedy": "morshedy",
  "degla for real estate developments": "morshedy",
  "el sewedy": "el-sewedy",
  "el sewedy developments": "el-sewedy",
  "el-sewedy developments": "el-sewedy",
  elsewedy: "el-sewedy",
  "elsewedy industries": "el-sewedy",
  "abraj for urban development": "el-sewedy",
  inma: "inma-developments",
  "inma developments": "inma-developments",
  "genena group": "inma-developments",
  "genena investment": "inma-developments",
  "amer group": "amer-group",
  amer: "amer-group",
  "mansour amer": "amer-group",
  "madinet masr": "madinet-masr",
  madinet: "madinet-masr",
  "madinet nasr": "madinet-masr",
  "madinet nasr for housing & development": "madinet-masr",
  "madinet nasr for housing and development": "madinet-masr",
  raslan: "raslan-group",
  "raslan group": "raslan-group",
  "raslan group of companies": "raslan-group",
  "raslan real estate development": "raslan-group",
  upwyde: "upwyde",
  "upwyde developments": "upwyde",
  "palm hills": "palm-hills",
  "palm hills developments": "palm-hills",
  palmhills: "palm-hills",
  sky: "sky",
  "sky investments": "sky",
  "sky real estate": "sky",
  "park st": "sky",
  "park st.": "sky",
  "park street": "sky",
  "sky park st": "sky",
  "sky — park st.": "sky",
  ora: "ora",
  "ora developers": "ora",
  "ora developers egypt": "ora",
  "ora real estate": "ora",
  "naguib sawiris": "ora",
  gemini: "ora",
  akoya: "akoya",
  "akoya developments": "akoya",
  "green valley": "akoya",
  elghad: "akoya",
  "el hazek": "el-hazek",
  "el hazek group": "el-hazek",
  "el-hazek group": "el-hazek",
  hazek: "el-hazek",
  wealth: "wealth",
  "wealth developments": "wealth",
  "ahmed shaker": "wealth",
  "arkan engineering consulting": "wealth",
};

export function getDeveloperSlug(name: string | null | undefined): string | undefined {
  if (!name) return undefined;
  return DEVELOPER_SLUGS[name.toLowerCase().trim()];
}

// Developer name → logo path. Fallback-safe (returns undefined if no logo).
const DEVELOPER_LOGOS: Record<string, string> = {
  emaar: "/images/Emaar_logo.png",
  sodic: "/images/SODIC_Logo.png",
  marakez: "/images/Marakez _logo.png",
  "al futtaim": "/images/Al futtaim _ logo.png",
  "palm hills": "/images/PalmHills_logo.png",
  lmd: "/images/LMD-developments.png",
  "the waterway": "/images/waterway.png",
  "imkan misr": "/images/imkan-misr-logo.png",
  "misr italia": "/images/Misritalia_logoo.png",
  "the ark developments": "/images/the-ark-developments-logo.png",
  kvrd: "/images/kvrd-logo.png",
  "pre developments": "/images/Pre-developments-logo.png",
  "morshedy group": "/images/morshedy-group.png",
  "town writers": "/images/town-writers-logo.png",
  arabella: "/images/arabella-developments.png",
  "arabella developments": "/images/arabella-developments.png",
  "majid al futtaim": "/images/majid-al-futtaim.png",
  "al rabat properties": "/images/alrabat-properties.png",
  "al rabat properties development": "/images/alrabat-properties.png",
  alrabat: "/images/alrabat-properties.png",
  "al jazi": "/images/aljazi-logo.png",
  "al jazi developments": "/images/aljazi-logo.png",
  aljazi: "/images/aljazi-logo.png",
  horizon: "/images/Horizon-logo.png",
  "horizon egypt": "/images/Horizon-logo.png",
  "horizon egypt developments": "/images/Horizon-logo.png",
  catalyst: "/images/catalyst-logo.png",
  "catalyst developments": "/images/catalyst-logo.png",
  afaaq: "/images/Afaaq-developments-logo.png",
  "afaaq developments": "/images/Afaaq-developments-logo.png",
  "el sewedy": "/images/elsewedy-developments-logo.png",
  "el sewedy developments": "/images/elsewedy-developments-logo.png",
  elsewedy: "/images/elsewedy-developments-logo.png",
  inma: "/images/inma-developments.png",
  "inma developments": "/images/inma-developments.png",
  "amer group": "/images/amer-group-logo.png",
  amer: "/images/amer-group-logo.png",
  "madinet masr": "/images/Madinest-masr-logo.png",
  madinet: "/images/Madinest-masr-logo.png",
  raslan: "/images/raslan-group-logo.png",
  "raslan group": "/images/raslan-group-logo.png",
  upwyde: "/images/upwyde-logo.png",
  sky: "/images/SKY-Park-st-logo.png",
  "sky investments": "/images/SKY-Park-st-logo.png",
  "park st": "/images/SKY-Park-st-logo.png",
  "park st.": "/images/SKY-Park-st-logo.png",
  ora: "/images/ora-logo.png",
  "ora developers": "/images/ora-logo.png",
  "ora developers egypt": "/images/ora-logo.png",
  akoya: "/images/Akoya-developments-logo.png",
  "akoya developments": "/images/Akoya-developments-logo.png",
  "el hazek": "/images/El-Hazek-Group.png",
  "el hazek group": "/images/El-Hazek-Group.png",
  // wealth: no logo file uploaded yet (was a 404); add it and restore these two lines.
};

export function getDeveloperLogo(name: string | null | undefined): string | undefined {
  if (!name) return undefined;
  return DEVELOPER_LOGOS[name.toLowerCase().trim()];
}

// Project name → image path. Add entries here as images are added to /public/images/.
// Matching is done by normalized (lowercased, punctuation-trimmed) project name.
const PROJECT_IMAGES: Record<string, string> = {
  "mivida business park": "/images/Mivida-Business-Park.jpg",
  eterna: "/images/Eterna-Medical-hub.jpg",
  "mivida the place": "/images/Mivida-The-Place.jpg",
  "mivida my park": "/images/Mivida-my-park.jpg",
  "mivida linea": "/images/Mivida-Linea.webp",
  "three towers": "/images/Three-towers.jpeg",
  enawalks: "/images/Enawalks.webp",
  "arabella plaza mall": "/images/Arabella Plaza Mall.webp",
  "district 5": "/images/District-5.jpg",
  "cairo festival city": "/images/cairo-festival-city.webp",
  "mall of arabia": "/images/mall-of-arabia.jpg",
  "mall of egypt": "/images/Mall-Of-Egypt.webp",
  "amorada hub": "/images/Amorada-Hub.jpg",
  "allegria business park": "/images/Allegria-Business-Park.jpg",
  "alegria business park": "/images/Allegria-Business-Park.jpg",
  "alburouj business park": "/images/business-park.jpg",
  "the ark business district": "/images/business-park.jpg",
  polaris: "/images/polaris.webp",
  sidewalk: "/images/sidewalk.jpeg",
  "point 90": "/images/point-90.jpeg",
  zag: "/images/the-ZAG.jpeg",
  "the big": "/images/the-big.webp",
  "one ninety": "/images/one-ninety.jpg",
  "three sixty": "/images/three-sixty.webp",
  stei8ht: "/images/stei8ht.webp",
  mindset: "/images/Mindset.png",
  ednc: "/images/EDNC.jpg",
  "westown hub": "/images/Westown-hub.jpg",
  "october plaza business district": "/images/October Plaza Business District.webp",
  "the estates": "/images/The Estates.jpg",
  "cairo gate": "/images/Cairo-gate.webp",
  "5a": "/images/5A.jpg",
  "waterway the view": "/images/the-view.webp",
  "waterway villas – gentle turquoise": "/images/gentle-turqouise.webp",
  "waterway w signature": "/images/W-Signature.png",
  "waterway 1": "/images/waterway-1.jpeg",
  "waterway 2": "/images/waterway-2.jpg",
  "waterway villas": "/images/waterway-villas.jpg",
  "waterway the hub": "/images/Waterway-the-hub.jpg",
  "waterway w55": "/images/waterway-w55.webp",
};

export function getProjectImage(name: string | null | undefined): string | undefined {
  if (!name) return undefined;
  return PROJECT_IMAGES[name.toLowerCase().trim()];
}
