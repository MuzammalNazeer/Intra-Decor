import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, 'data.json');

const initialData = {
  products: [
    // PAINTS
    {
      id: "p-paint-1",
      name: "Dulux Velvet Touch Matt Lux",
      category: "Paint",
      subCategory: "Interior",
      brand: "Dulux",
      price: 4800,
      discount: 15,
      stock: 45,
      product_type: "Interior Luxury Emulsion",
      finish_type: "Soft Matt Velvet",
      material: "Water-based Acrylic Latex",
      description: "Ultra-premium interior wall finish featuring Lumitec technology that brightens your space by reflecting up to twice as much light. Odorless and easy to clean.",
      product_image: "paint_white.jpg",
      colors: [
        { name: "Alabaster White", hex: "#f4f1ea", shade: "Light" },
        { name: "Warm Greige", hex: "#d8cfc4", shade: "Medium" },
        { name: "Vintage Sage", hex: "#9bb09e", shade: "Medium" },
        { name: "Navy Velvet", hex: "#1f2a44", shade: "Dark" }
      ],
      rating: 4.9,
      reviewsCount: 38,
      status: "approved"
    },
    {
      id: "p-paint-2",
      name: "Berger Silk Emulsion Luxury",
      category: "Paint",
      subCategory: "Interior",
      brand: "Berger",
      price: 4200,
      discount: 10,
      stock: 60,
      product_type: "Silk Emulsion",
      finish_type: "High Sheen Silk",
      material: "Acrylic Emulsion",
      description: "Berger Silk Emulsion imparts a luxurious silky glow to interior walls with stain-resistant stain-shield polymer formula.",
      product_image: "paint_pink.jpg",
      colors: [
        { name: "Rose Silk", hex: "#eed5d7", shade: "Light" },
        { name: "Terracotta Blush", hex: "#cb7c69", shade: "Medium" },
        { name: "Burgundy Rich", hex: "#4b2c2c", shade: "Dark" }
      ],
      rating: 4.8,
      reviewsCount: 24,
      status: "approved"
    },
    {
      id: "p-paint-3",
      name: "Master Super Emulsion Classic",
      category: "Paint",
      subCategory: "Interior",
      brand: "Master",
      price: 3600,
      discount: 12,
      stock: 80,
      product_type: "Super Emulsion",
      finish_type: "Smooth Matt",
      material: "Polyvinyl Acetate Copolymer",
      description: "Smooth interior wall paint formulated with antifungal agents for mold resistance and durability in humid climates.",
      product_image: "paint_blue.jpg",
      colors: [
        { name: "Cloud Mist", hex: "#dce4ec", shade: "Light" },
        { name: "Nordic Blue", hex: "#4a6984", shade: "Medium" },
        { name: "Midnight Ocean", hex: "#172b4d", shade: "Dark" }
      ],
      rating: 4.7,
      reviewsCount: 19,
      status: "approved"
    },
    {
      id: "p-paint-4",
      name: "Nippon Weatherbond Extreme Exterior",
      category: "Paint",
      subCategory: "Exterior",
      brand: "Nippon",
      price: 5400,
      discount: 8,
      stock: 35,
      product_type: "Exterior Weatherproof Paint",
      finish_type: "Satin Shield",
      material: "Pure Acrylic Silicone",
      description: "High-performance exterior wall paint offering 10-year weather protection against UV rays, rain, algae, and thermal cracking.",
      product_image: "paint_grey.jpg",
      colors: [
        { name: "Granite Grey", hex: "#7a7f85", shade: "Medium" },
        { name: "Desert Sand", hex: "#e0cfb8", shade: "Light" },
        { name: "Charcoal Slate", hex: "#2f3640", shade: "Dark" }
      ],
      rating: 4.9,
      reviewsCount: 42,
      status: "approved"
    },

    // TILES
    {
      id: "p-tile-1",
      name: "Carrara White Polished Marble Tiles",
      category: "Tiles",
      subCategory: "Marble",
      brand: "Intra Stoneworks",
      price: 6800,
      discount: 18,
      stock: 120,
      product_type: "60x120cm Porcelain Tile",
      finish_type: "High Gloss Polished",
      material: "Glazed Vitrified Porcelain",
      description: "Imported Italian Carrara marble veining on ultra-durable porcelain. Stain proof, scratch resistant and zero maintenance.",
      product_image: "merbal Tiles.jpeg",
      dimensions: "60cm x 120cm x 9mm",
      coverage: "15.5 sq.ft per box (2 pcs)",
      rating: 4.9,
      reviewsCount: 52,
      status: "approved"
    },
    {
      id: "p-tile-2",
      name: "Venetian Polished Terrazzo Tiles",
      category: "Tiles",
      subCategory: "Terrazzo",
      brand: "Intra Stoneworks",
      price: 5200,
      discount: 10,
      stock: 75,
      product_type: "60x60cm Terrazzo Stone",
      finish_type: "Satin Honed",
      material: "Engineered Aggregate Stone",
      description: "Retro modern terrazzo tiles embedded with marble chips and quartz. Ideal for modern cafes, living rooms, and luxury bathrooms.",
      product_image: "Terrazzo tiles.jpeg",
      dimensions: "60cm x 60cm x 10mm",
      coverage: "15.5 sq.ft per box (4 pcs)",
      rating: 4.8,
      reviewsCount: 31,
      status: "approved"
    },
    {
      id: "p-tile-3",
      name: "Black Nero Marquina Glass & Mosaic Tiles",
      category: "Tiles",
      subCategory: "Glass",
      brand: "Intra Stoneworks",
      price: 7400,
      discount: 15,
      stock: 40,
      product_type: "Accent Wall Tiles",
      finish_type: "Crystal Gloss",
      material: "Tempered Glass & Natural Stone",
      description: "Luxury reflective glass and marble composite tiles designed for statement kitchen splashbacks and shower feature walls.",
      product_image: "Glass Tiles.jpeg",
      dimensions: "30cm x 30cm sheets",
      coverage: "10 sq.ft per pack (10 sheets)",
      rating: 4.7,
      reviewsCount: 16,
      status: "approved"
    },
    {
      id: "p-tile-4",
      name: "Spanish Travertine Beige Floor Tiles",
      category: "Tiles",
      subCategory: "Travertine",
      brand: "Intra Stoneworks",
      price: 5900,
      discount: 12,
      stock: 85,
      product_type: "Indoor / Outdoor Tile",
      finish_type: "Matte Anti-Skid R10",
      material: "Full Body Porcelain",
      description: "Earthy, textured travertine replica providing timeless Mediterranean warmth with anti-skid safety for terraces and indoor hallways.",
      product_image: "Travertine.jpeg",
      dimensions: "60cm x 60cm",
      coverage: "15.5 sq.ft per box",
      rating: 4.8,
      reviewsCount: 27,
      status: "approved"
    },
    {
      id: "p-tile-5",
      name: "Rustic Slate Natural Stone Tiles",
      category: "Tiles",
      subCategory: "Slate",
      brand: "Intra Stoneworks",
      price: 4900,
      discount: 5,
      stock: 50,
      product_type: "Textured Slate",
      finish_type: "Natural Cleft Finish",
      material: "Natural Metamorphic Slate",
      description: "Charcoal and ochre multi-tone slate tiles for rustic accent walls, fireplaces, and courtyard pathways.",
      product_image: "Slate.jpeg",
      dimensions: "30cm x 60cm",
      coverage: "12 sq.ft per box",
      rating: 4.6,
      reviewsCount: 14,
      status: "approved"
    },

    // WALLPAPERS
    {
      id: "p-wall-1",
      name: "Nordic Minimalist Geometric Wallpaper",
      category: "Wallpaper",
      subCategory: "Geometric",
      brand: "Studio Intra",
      price: 3800,
      discount: 20,
      stock: 90,
      product_type: "Non-Woven Vinyl Wallpaper",
      finish_type: "Textured Embossed",
      material: "Eco Heavyweight Vinyl",
      description: "Sophisticated Scandinavian arcs and lines with subtle gold leaf highlights. Peel-and-stick or paste-the-wall installation.",
      product_image: "Geomeric wallpaper.jpeg",
      dimensions: "Roll 10m x 0.53m (57 sq.ft)",
      coverage: "Approx. 50-54 sq.ft with pattern match",
      rating: 4.9,
      reviewsCount: 44,
      status: "approved"
    },
    {
      id: "p-wall-2",
      name: "Tropical Vintage Botanical Mural Wallpaper",
      category: "Wallpaper",
      subCategory: "Floral",
      brand: "Studio Intra",
      price: 4500,
      discount: 15,
      stock: 65,
      product_type: "Custom Feature Mural",
      finish_type: "Matte Canvas Grain",
      material: "Breathable Non-Woven Fabric",
      description: "Hand-painted aesthetic palm leaves and floral blooms in soft pink and teal. Transforms bedrooms and dining alcoves into tranquil retreats.",
      product_image: "floral.jpeg",
      dimensions: "Roll 10m x 0.53m (57 sq.ft)",
      coverage: "Approx. 52 sq.ft",
      rating: 4.9,
      reviewsCount: 38,
      status: "approved"
    },
    {
      id: "p-wall-3",
      name: "Fluid Modern Abstract Waves Wallpaper",
      category: "Wallpaper",
      subCategory: "Abstract",
      brand: "Studio Intra",
      price: 4100,
      discount: 10,
      stock: 70,
      product_type: "Abstract Wall Covering",
      finish_type: "Fine Silk Texture",
      material: "High Density Vinyl",
      description: "Neutral tones with flowing organic lines that add depth and movement to living rooms and executive home offices.",
      product_image: "Abstract wallpaper.jpeg",
      dimensions: "Roll 10m x 0.53m",
      coverage: "Approx. 53 sq.ft",
      rating: 4.8,
      reviewsCount: 22,
      status: "approved"
    },
    {
      id: "p-wall-4",
      name: "Woodgrain Slats Textured Wallpaper",
      category: "Wallpaper",
      subCategory: "Wood",
      brand: "Studio Intra",
      price: 3600,
      discount: 15,
      stock: 80,
      product_type: "3D Effect Wallpaper",
      finish_type: "Embossed Wood Grain",
      material: "Washable Vinyl",
      description: "Realistic 3D acoustic wood slat visual effect without the carpentry costs. Waterproof and scrubbable.",
      product_image: "wood wallpaper.jpeg",
      dimensions: "Roll 10m x 0.53m",
      coverage: "Approx. 54 sq.ft",
      rating: 4.7,
      reviewsCount: 29,
      status: "approved"
    },
    {
      id: "p-wall-5",
      name: "Whimsical Jungle Safari Kids Wallpaper",
      category: "Wallpaper",
      subCategory: "Kids",
      brand: "Studio Intra",
      price: 3400,
      discount: 12,
      stock: 45,
      product_type: "Kids Room Wallpaper",
      finish_type: "Smooth Matte",
      material: "Non-Toxic Water-Ink Paper",
      description: "Gentle watercolor safari animals and pastel trees designed to inspire imaginations in nurseries and play areas.",
      product_image: "kids wallpaper.jpeg",
      dimensions: "Roll 10m x 0.53m",
      coverage: "Approx. 52 sq.ft",
      rating: 5.0,
      reviewsCount: 18,
      status: "approved"
    },

    // WALL PANELS
    {
      id: "p-panel-1",
      name: "Natural Oak Fluted Wood Wall Panels",
      category: "Wall Panelling",
      subCategory: "Wood",
      brand: "Intra Panels",
      price: 8500,
      discount: 15,
      stock: 55,
      product_type: "Acoustic Slatted Panel",
      finish_type: "Natural Oak Veneer on Black Felt",
      material: "MDF Core + Recycled PET Felt",
      description: "High-end Scandinavian fluted wood slats on sound-dampening acoustic felt. Enhances audio acoustics while giving luxury hotel aesthetics.",
      product_image: "wood wall penals.png",
      dimensions: "240cm x 60cm x 21mm",
      coverage: "15.5 sq.ft per panel",
      rating: 4.9,
      reviewsCount: 63,
      status: "approved"
    },
    {
      id: "p-panel-2",
      name: "Charcoal 3D PVC Waterproof Wall Panels",
      category: "Wall Panelling",
      subCategory: "PVC",
      brand: "Intra Panels",
      price: 4200,
      discount: 10,
      stock: 110,
      product_type: "Interlocking Wall Planks",
      finish_type: "Matte Charcoal Textured",
      material: "High Grade PVC & Stone Composite",
      description: "100% moisture-proof, termite-resistant PVC panels with tongue-and-groove jointing for quick DIY install on accent walls.",
      product_image: "PVC wall  penals.jpeg",
      dimensions: "290cm x 16cm x 12mm (Box of 8)",
      coverage: "39 sq.ft per box",
      rating: 4.8,
      reviewsCount: 41,
      status: "approved"
    },
    {
      id: "p-panel-3",
      name: "Modern 3D Metallic Accent Wall Panels",
      category: "Wall Panelling",
      subCategory: "Metal",
      brand: "Intra Panels",
      price: 9800,
      discount: 20,
      stock: 30,
      product_type: "Decorative Metal Facets",
      finish_type: "Brushed Champagne Gold & Bronze",
      material: "Anodized Aluminum Facet Shell",
      description: "Avant-garde architectural metallic wall panels that catch light dynamically from all viewing angles.",
      product_image: "Metal wall penals.png",
      dimensions: "60cm x 60cm modular tiles",
      coverage: "16 sq.ft per set (4 tiles)",
      rating: 4.9,
      reviewsCount: 22,
      status: "approved"
    },
    {
      id: "p-panel-4",
      name: "Classic Georgian Wainscoting Wall Kit",
      category: "Wall Panelling",
      subCategory: "Wainscoting",
      brand: "Intra Panels",
      price: 6200,
      discount: 12,
      stock: 40,
      product_type: "Dado & Box Panelling",
      finish_type: "Primed White Ready-To-Paint",
      material: "Moisture-Resistant HDF",
      description: "Timeless pre-cut wainscoting panel strips including baseboard, wall boxes, and chair rail moulding for hallways and dining rooms.",
      product_image: "wainscoting wall penals.png",
      dimensions: "Kit covers 8 linear feet x 3.5 ft height",
      coverage: "28 sq.ft",
      rating: 4.8,
      reviewsCount: 35,
      status: "approved"
    },
    {
      id: "p-panel-5",
      name: "Upholstered Velvet Acoustic Wall Blocks",
      category: "Wall Panelling",
      subCategory: "Upholstered",
      brand: "Intra Panels",
      price: 7600,
      discount: 15,
      stock: 35,
      product_type: "Padded Bedhead & Cinema Panels",
      finish_type: "Plush Stain-Shield Velvet",
      material: "High Resilience Foam + Wood Backing",
      description: "Luxurious soft padded modular blocks for master bedroom headboard walls, study nooks, or private home cinema acoustic damping.",
      product_image: "Upholstered penals.png",
      dimensions: "30cm x 60cm per block (Pack of 6)",
      coverage: "12 sq.ft per pack",
      rating: 4.9,
      reviewsCount: 19,
      status: "approved"
    }
  ],

  categories: [
    {
      id: "cat-1",
      slug: "paint",
      name: "Paint",
      label: "01 · Paint",
      title: "Premium Wall Paints",
      subTitle: "Interior & exterior emulsion with visualizer",
      image: "paint-colors.png",
      subCategories: ["Interior", "Exterior", "Enamel", "Primer"]
    },
    {
      id: "cat-2",
      slug: "tiles",
      name: "Tiles",
      label: "02 · Tiles",
      title: "Simple Tiles, Stylish Look",
      subTitle: "Porcelain, marble, terrazzo & ceramic",
      image: "Tiles.png",
      subCategories: ["Marble", "Terrazzo", "Glass", "Travertine", "Slate", "Ceramic"]
    },
    {
      id: "cat-3",
      slug: "wallpaper",
      name: "Wallpaper",
      label: "03 · Wallpaper",
      title: "Premium Quality Wallpapers",
      subTitle: "Designer prints, textures & murals",
      image: "wall wapaper.png",
      subCategories: ["Geometric", "Floral", "Abstract", "Wood", "Kids", "Damask"]
    },
    {
      id: "cat-4",
      slug: "wallpenals",
      name: "Wall Panelling",
      label: "04 · Panelling",
      title: "Stylish Wall Panels",
      subTitle: "Fluted wood, 3D PVC, acoustic & wainscoting",
      image: "wall penal.png",
      subCategories: ["Wood", "PVC", "Metal", "Wainscoting", "Upholstered"]
    }
  ],

  providers: [
    {
      id: "prov-1",
      name: "Master Paint Specialists & Texture Studio",
      owner: "Muhammad Usman",
      phone: "+92 300 8472910",
      city: "Lahore",
      area: "DHA",
      category: "Paint",
      experienceYears: 9,
      rating: 4.9,
      completedJobs: 142,
      profile_image: "provider1.png",
      badge: "Top Rated",
      bio: "Master-certified interior and exterior wall painters specializing in velvet finishes, spray lacquer, and texture art.",
      rates: "From Rs. 28 / sq.ft",
      services: ["Luxury Interior Emulsion", "Exterior Weatherproof Paint", "Texture Wall Art", "Color Consultation"]
    },
    {
      id: "prov-2",
      name: "Royal Stoneworks & Tile Masters",
      owner: "Tariq Mahmood",
      phone: "+92 321 4452189",
      city: "Lahore",
      area: "Gulberg",
      category: "Tiles",
      experienceYears: 12,
      rating: 4.8,
      completedJobs: 198,
      profile_image: "provider2.png",
      badge: "Verified Expert",
      bio: "Precision installation for large format porcelain slabs (60x120cm), terrazzo, and Italian marble flooring with seamless epoxy grouting.",
      rates: "From Rs. 45 / sq.ft",
      services: ["Large Porcelain Slab Laying", "Terrazzo Grinding & Polishing", "Waterproof Bathroom Tiling", "Custom Kitchen Splashbacks"]
    },
    {
      id: "prov-3",
      name: "DecoArt Luxury Wallpaper Installers",
      owner: "Shahid Rafiq",
      phone: "+92 333 7812093",
      city: "Islamabad",
      area: "F-7",
      category: "Wallpaper",
      experienceYears: 7,
      rating: 5.0,
      completedJobs: 115,
      profile_image: "provider3.png",
      badge: "Certified Pro",
      bio: "Seamless installation for designer non-woven wallpapers, fabric murals, and acoustic wall coverings with zero bubble guarantee.",
      rates: "From Rs. 1,200 / roll",
      services: ["Custom Mural Mounting", "Non-Woven Wallpaper Pasting", "Old Wallpaper Removal", "Wall Surface Preparation"]
    },
    {
      id: "prov-4",
      name: "Linear Woodcraft & 3D Panelling",
      owner: "Hamza Farooq",
      phone: "+92 312 9081234",
      city: "Karachi",
      area: "DHA Karachi",
      category: "Wall Panelling",
      experienceYears: 10,
      rating: 4.9,
      completedJobs: 167,
      profile_image: "provider4.png",
      badge: "Top Rated",
      bio: "Specializing in acoustic fluted slat walls, PVC interlocking systems, and modern media wall wooden backdrops.",
      rates: "From Rs. 120 / sq.ft",
      services: ["Acoustic Wood Slat Panelling", "PVC 3D Wall Installation", "Georgian Wainscoting", "LED Profile Channeling"]
    },
    {
      id: "prov-5",
      name: "Al-Rehman Decor & Finishing",
      owner: "Abdul Rehman",
      phone: "+92 301 5567890",
      city: "Rawalpindi",
      area: "Bahria Town",
      category: "Paint",
      experienceYears: 6,
      rating: 4.7,
      completedJobs: 89,
      profile_image: "provider5.png",
      badge: "Verified",
      bio: "Quick and clean turnaround for rental apartment refresh, villa interior coatings, and moisture-proofing treatment.",
      rates: "From Rs. 24 / sq.ft",
      services: ["Interior Paint Coating", "Dampness & Seepage Proofing", "Door & Window Enamel Painting"]
    },
    {
      id: "prov-6",
      name: "Elite Tiles & Mosaic Craft",
      owner: "Zulfiqar Ali",
      phone: "+92 345 6789012",
      city: "Karachi",
      area: "Clifton",
      category: "Tiles",
      experienceYears: 14,
      rating: 4.9,
      completedJobs: 230,
      profile_image: "provider6.png",
      badge: "Master Artisan",
      bio: "Specialist in geometric bathroom tiles, swimming pool glass mosaic, and terrace non-skid stone flooring.",
      rates: "From Rs. 40 / sq.ft",
      services: ["Bathroom Remodeling", "Outdoor Stone Cladding", "Laser Alignment Tile Fixing"]
    },
    {
      id: "prov-7",
      name: "Apex Wall Covering & Panels",
      owner: "Bilal Siddiqui",
      phone: "+92 315 8899221",
      city: "Faisalabad",
      area: "Canal Road",
      category: "Wall Panelling",
      experienceYears: 8,
      rating: 4.8,
      completedJobs: 94,
      profile_image: "provider7.png",
      badge: "Verified",
      bio: "Custom media walls, commercial boardrooms, and executive bedroom headboard panelling.",
      rates: "From Rs. 95 / sq.ft",
      services: ["Fluted Panels", "PVC Wall Cladding", "Acoustic Theater Lining"]
    },
    {
      id: "prov-8",
      name: "Capital Paint & Decorators",
      owner: "Kashif Butt",
      phone: "+92 300 2345678",
      city: "Islamabad",
      area: "F-10",
      category: "Paint",
      experienceYears: 11,
      rating: 4.9,
      completedJobs: 175,
      profile_image: "provider8.png",
      badge: "Top Rated",
      bio: "Premium residential painting for diplomatic enclaves and luxury residences across Islamabad and Rawalpindi.",
      rates: "From Rs. 30 / sq.ft",
      services: ["Velvet Luxury Emulsion", "Exterior Stucco Finish", "Color Matching Consultation"]
    }
  ],

  users: [
    {
      id: "usr-admin-1",
      name: "Intra Decor Admin",
      email: "admin@intradecor.com",
      role: "admin",
      phone: "+92 300 1234567",
      passwordHash: "$2a$10$K4rB7m2k0j1t2h3l4m5n6O.1v8G7v9m2c0j1t2h3l4m5n6O1v8G7v", // password123
      registeredAt: "2026-01-10T12:00:00Z"
    },
    {
      id: "usr-demo-1",
      name: "Ahmed Khan",
      email: "user@intradecor.com",
      role: "customer",
      phone: "+92 321 9876543",
      address: "House 42, Block Y, Phase 3, DHA",
      city: "Lahore",
      passwordHash: "$2a$10$K4rB7m2k0j1t2h3l4m5n6O.1v8G7v9m2c0j1t2h3l4m5n6O1v8G7v", // password123
      registeredAt: "2026-02-15T09:30:00Z"
    }
  ],

  orders: [
    {
      id: "ORD-94821",
      trackingNumber: "TRK-94821",
      userId: "usr-demo-1",
      customerName: "Ahmed Khan",
      phone: "+92 321 9876543",
      email: "user@intradecor.com",
      address: "House 42, Block Y, Phase 3, DHA",
      city: "Lahore",
      paymentMethod: "Cash on Delivery",
      paymentStatus: "Pending",
      status: "In Progress",
      items: [
        {
          productId: "p-paint-1",
          name: "Dulux Velvet Touch Matt Lux",
          selectedColor: "Vintage Sage (#9bb09e)",
          quantity: 2,
          price: 4080,
          total: 8160,
          image: "paint_white.jpg"
        },
        {
          productId: "p-panel-1",
          name: "Natural Oak Fluted Wood Wall Panels",
          quantity: 3,
          price: 7225,
          total: 21675,
          image: "wood wall penals.png"
        }
      ],
      subtotal: 29835,
      shipping: 500,
      grandTotal: 30335,
      timeline: [
        { title: "Order Placed", time: "2026-09-20 14:32", done: true },
        { title: "Order Confirmed & Packed", time: "2026-09-21 10:15", done: true },
        { title: "Dispatched with Courier", time: "2026-09-22 09:00", done: true },
        { title: "Out for Delivery", time: "2026-09-23 08:30", done: false },
        { title: "Delivered", time: "-", done: false }
      ],
      createdAt: "2026-09-20T14:32:00Z"
    }
  ]
};

// Load or initialize
function getDB() {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify(initialData, null, 2), 'utf-8');
    return initialData;
  }
  try {
    const raw = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading database file, resetting:", err);
    return initialData;
  }
}

function saveDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

export const db = {
  getProducts: (category, search, subCategory) => {
    const data = getDB();
    let res = data.products || [];
    if (category) {
      const catLower = category.toLowerCase().trim();
      res = res.filter(p => p.category.toLowerCase().trim() === catLower);
    }
    if (subCategory) {
      const subLower = subCategory.toLowerCase().trim();
      res = res.filter(p => (p.subCategory || '').toLowerCase().trim() === subLower);
    }
    if (search) {
      const q = search.toLowerCase().trim();
      res = res.filter(p => 
        p.name.toLowerCase().includes(q) || 
        (p.brand && p.brand.toLowerCase().includes(q)) ||
        (p.subCategory && p.subCategory.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q))
      );
    }
    return res;
  },

  getProductById: (id) => {
    const data = getDB();
    return data.products.find(p => p.id === id) || null;
  },

  addProduct: (product) => {
    const data = getDB();
    const newProduct = {
      id: "p-" + Date.now(),
      status: "approved",
      rating: 5.0,
      reviewsCount: 1,
      createdAt: new Date().toISOString(),
      ...product
    };
    data.products.unshift(newProduct);
    saveDB(data);
    return newProduct;
  },

  getCategories: () => {
    const data = getDB();
    return data.categories || [];
  },

  getProviders: (city, area, category) => {
    const data = getDB();
    let res = data.providers || [];
    if (city) {
      const c = city.toLowerCase();
      res = res.filter(p => p.city.toLowerCase() === c);
    }
    if (area) {
      const a = area.toLowerCase();
      res = res.filter(p => p.area.toLowerCase() === a);
    }
    if (category) {
      const cat = category.toLowerCase();
      res = res.filter(p => p.category.toLowerCase() === cat);
    }
    return res;
  },

  createOrder: (orderPayload) => {
    const data = getDB();
    const orderNum = Math.floor(10000 + Math.random() * 90000);
    const orderId = `ORD-${orderNum}`;
    const trackingNumber = `TRK-${orderNum}`;

    const newOrder = {
      id: orderId,
      trackingNumber,
      createdAt: new Date().toISOString(),
      status: "Order Placed",
      timeline: [
        { title: "Order Placed", time: new Date().toLocaleString(), done: true },
        { title: "Processing & QC Inspection", time: "Pending", done: false },
        { title: "Dispatched with Logistics Partner", time: "Pending", done: false },
        { title: "Out for Delivery", time: "Pending", done: false },
        { title: "Delivered", time: "Pending", done: false }
      ],
      ...orderPayload
    };

    data.orders = data.orders || [];
    data.orders.unshift(newOrder);
    saveDB(data);
    return newOrder;
  },

  getOrderByTracking: (query) => {
    const data = getDB();
    const q = (query || '').trim().toUpperCase();
    return (data.orders || []).find(o => 
      o.id.toUpperCase() === q || 
      o.trackingNumber.toUpperCase() === q ||
      (o.phone && o.phone.replace(/[^0-9]/g, '') === query.replace(/[^0-9]/g, ''))
    ) || null;
  },

  getOrdersByUser: (userId) => {
    const data = getDB();
    return (data.orders || []).filter(o => o.userId === userId);
  },

  getAllOrders: () => {
    const data = getDB();
    return data.orders || [];
  },

  updateOrderStatus: (orderId, status) => {
    const data = getDB();
    const order = (data.orders || []).find(o => o.id === orderId);
    if (order) {
      order.status = status;
      if (order.timeline) {
        const idx = order.timeline.findIndex(t => t.title.toLowerCase().includes(status.toLowerCase()));
        if (idx !== -1) {
          order.timeline[idx].done = true;
          order.timeline[idx].time = new Date().toLocaleString();
        }
      }
      saveDB(data);
    }
    return order;
  },

  findUserByEmail: (email) => {
    const data = getDB();
    return (data.users || []).find(u => u.email.toLowerCase() === email.toLowerCase());
  },

  createUser: (userData) => {
    const data = getDB();
    const newUser = {
      id: "usr-" + Date.now(),
      registeredAt: new Date().toISOString(),
      ...userData
    };
    data.users = data.users || [];
    data.users.push(newUser);
    saveDB(data);
    return newUser;
  },

  // getStats moved to bottom of file

  // SERVICE BOOKINGS
  createBooking: (bookingData) => {
    const data = getDB();
    const newBooking = {
      id: 'BK-' + Math.floor(100000 + Math.random() * 900000),
      createdAt: new Date().toISOString(),
      status: 'Confirmed',
      ...bookingData
    };
    data.bookings = data.bookings || [];
    data.bookings.unshift(newBooking);
    saveDB(data);
    return newBooking;
  },

  getBookingsByUser: (userId) => {
    const data = getDB();
    return (data.bookings || []).filter(b => b.userId === userId || b.phone === userId);
  },

  getAllBookings: () => {
    const data = getDB();
    return data.bookings || [];
  },

  updateBookingStatus: (bookingId, status) => {
    const data = getDB();
    const b = (data.bookings || []).find(x => x.id === bookingId);
    if (b) {
      b.status = status;
      saveDB(data);
    }
    return b;
  },

  // WISHLIST / FAVORITES
  getFavorites: (userId) => {
    const data = getDB();
    data.favorites = data.favorites || {};
    const productIds = data.favorites[userId] || [];
    return (data.products || []).filter(p => productIds.includes(p.id));
  },

  addFavorite: (userId, productId) => {
    const data = getDB();
    data.favorites = data.favorites || {};
    data.favorites[userId] = data.favorites[userId] || [];
    if (!data.favorites[userId].includes(productId)) {
      data.favorites[userId].push(productId);
      saveDB(data);
    }
    return data.favorites[userId];
  },

  removeFavorite: (userId, productId) => {
    const data = getDB();
    data.favorites = data.favorites || {};
    data.favorites[userId] = (data.favorites[userId] || []).filter(id => id !== productId);
    saveDB(data);
    return data.favorites[userId];
  },

  // USER PROFILE UPDATE
  updateUserProfile: (userId, profile) => {
    const data = getDB();
    const user = (data.users || []).find(u => u.id === userId || u.email.toLowerCase() === userId.toLowerCase());
    if (user) {
      if (profile.name) user.name = profile.name;
      if (profile.phone) user.phone = profile.phone;
      if (profile.address) user.address = profile.address;
      if (profile.city) user.city = profile.city;
      saveDB(data);
    }
    return user;
  },

  // PRODUCT REVIEWS
  getProductReviews: (productId) => {
    const data = getDB();
    data.reviews = data.reviews || {};
    return data.reviews[productId] || [
      {
        id: 'rev-1',
        userName: 'Ayesha Tariq',
        rating: 5,
        comment: 'Outstanding build quality and finish! Looks even better installed on our drawing room feature wall.',
        date: '2026-08-14'
      },
      {
        id: 'rev-2',
        userName: 'Hamza Khan',
        rating: 5,
        comment: 'Delivered promptly in Lahore. The color match was exactly as displayed in the visualizer.',
        date: '2026-09-02'
      }
    ];
  },

  addProductReview: (productId, reviewData) => {
    const data = getDB();
    data.reviews = data.reviews || {};
    data.reviews[productId] = data.reviews[productId] || [];
    const newRev = {
      id: 'rev-' + Date.now(),
      date: new Date().toISOString().split('T')[0],
      ...reviewData
    };
    data.reviews[productId].unshift(newRev);

    // Update product rating
    const prod = (data.products || []).find(p => p.id === productId);
    if (prod) {
      const allRevs = data.reviews[productId];
      const avg = allRevs.reduce((sum, r) => sum + Number(r.rating || 5), 0) / allRevs.length;
      prod.rating = Number(avg.toFixed(1));
      prod.reviewsCount = allRevs.length;
    }

    saveDB(data);
    return newRev;
  },

  // CONTACT MESSAGES
  saveContactMessage: (msg) => {
    const data = getDB();
    data.contactMessages = data.contactMessages || [];
    const newMsg = {
      id: 'MSG-' + Date.now(),
      createdAt: new Date().toISOString(),
      status: 'unread',
      ...msg
    };
    data.contactMessages.unshift(newMsg);
    saveDB(data);
    return newMsg;
  },

  getAllContactMessages: () => {
    const data = getDB();
    return data.contactMessages || [];
  },

  markMessageRead: (msgId) => {
    const data = getDB();
    const msg = (data.contactMessages || []).find(m => m.id === msgId);
    if (msg) { msg.status = 'read'; saveDB(data); }
    return msg;
  },

  // PASSWORD RESET OTP (in-memory, not persisted)
  // Stored externally in api.js resetOtpStore Map

  // USER MANAGEMENT (ADMIN)
  getAllUsers: () => {
    const data = getDB();
    return (data.users || []).map(u => {
      const { password, passwordHash, ...safe } = u;
      return safe;
    });
  },

  deleteUser: (userId) => {
    const data = getDB();
    const idx = (data.users || []).findIndex(u => u.id === userId);
    if (idx === -1) return false;
    data.users.splice(idx, 1);
    saveDB(data);
    return true;
  },

  // PRODUCT MANAGEMENT (ADMIN)
  deleteProduct: (productId) => {
    const data = getDB();
    const idx = (data.products || []).findIndex(p => p.id === productId);
    if (idx === -1) return false;
    data.products.splice(idx, 1);
    saveDB(data);
    return true;
  },

  updateProduct: (productId, updates) => {
    const data = getDB();
    const product = (data.products || []).find(p => p.id === productId);
    if (!product) return null;
    Object.assign(product, updates);
    saveDB(data);
    return product;
  },

  getStats: () => {
    const data = getDB();
    const orders = data.orders || [];
    const totalRevenue = orders.reduce((sum, o) => sum + (o.grandTotal || 0), 0);
    return {
      totalProducts: (data.products || []).length,
      totalOrders: orders.length,
      totalRevenue,
      totalProviders: (data.providers || []).length,
      totalUsers: (data.users || []).length,
      totalBookings: (data.bookings || []).length,
      totalContacts: (data.contactMessages || []).length,
      unreadContacts: (data.contactMessages || []).filter(m => m.status === 'unread').length
    };
  }
};

