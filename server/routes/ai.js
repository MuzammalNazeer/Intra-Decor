import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

// Helper: Check if query contains any keywords
function hasKeywords(text, keywords) {
  const lower = text.toLowerCase();
  return keywords.some(k => lower.includes(k.toLowerCase()));
}

// Helper: Extract dimensions like "12x14", "10 by 12", "15 * 20", "12 x 10"
function extractDimensions(text) {
  const match = text.match(/(\d+(?:\.\d+)?)\s*(?:x|\*|by)\s*(\d+(?:\.\d+)?)/i);
  if (match) {
    return {
      length: parseFloat(match[1]),
      width: parseFloat(match[2]),
      height: 10 // standard Pakistani ceiling height in feet
    };
  }
  return null;
}

// Detect Roman Urdu language
function isRomanUrdu(text) {
  const urduWords = [
    'kamra', 'kamray', 'rang', 'paint', 'kitna', 'kitni', 'chahiye', 'chahye',
    'batao', 'bataen', 'bataiye', 'kya', 'kia', 'acha', 'achi', 'ache', 'keemat',
    'price', 'lagana', 'lagaon', 'karen', 'wala', 'wali', 'kahan', 'hai', 'hain',
    'deewar', 'deewaron', 'farsh', 'ghr', 'ghar', 'mehnga', 'sasta', 'shukriya', 'kese', 'kaise'
  ];
  const lower = text.toLowerCase();
  let count = 0;
  for (const w of urduWords) {
    if (new RegExp(`\\b${w}\\b`, 'i').test(lower)) {
      count++;
    }
  }
  return count >= 2;
}

// Fetch products from database
async function getRelevantProducts(category, limit = 4, searchTerm = '') {
  try {
    let sql = `SELECT id, name, price, category, product_type, product_image, discount, description 
               FROM productadd 
               WHERE status = 'approved'`;
    const params = [];

    if (category) {
      sql += ' AND LOWER(category) = LOWER(?)';
      params.push(category);
    }
    if (searchTerm) {
      sql += ' AND (LOWER(name) LIKE ? OR LOWER(description) LIKE ? OR LOWER(product_type) LIKE ?)';
      params.push(`%${searchTerm.toLowerCase()}%`, `%${searchTerm.toLowerCase()}%`, `%${searchTerm.toLowerCase()}%`);
    }

    sql += ' ORDER BY id DESC LIMIT ?';
    params.push(limit);

    const [rows] = await pool.query(sql, params);
    return rows.map(r => ({
      ...r,
      finalPrice: Math.round(Number(r.price) - (Number(r.price) * (Number(r.discount) || 0) / 100))
    }));
  } catch (err) {
    console.error('AI Product fetch error:', err.message);
    return [];
  }
}

// Fetch top service providers
async function getServiceProviders(category = '', limit = 3) {
  try {
    let sql = `SELECT service_id, serviceprovider_name, service_name, city, experience, category,
                      COALESCE(call_number, '03479814741') as phone
               FROM addservice WHERE 1=1`;
    const params = [];
    if (category) {
      sql += ' AND LOWER(category) LIKE ?';
      params.push(`%${category.toLowerCase()}%`);
    }
    sql += ' LIMIT ?';
    params.push(limit);
    const [rows] = await pool.query(sql, params);
    return rows;
  } catch (err) {
    return [];
  }
}

/* ─────────────────────────────────────────
   POST /api/ai/chat
   Main intelligent conversational endpoint
───────────────────────────────────────── */
router.post('/chat', async (req, res) => {
  try {
    const { message = '', history = [] } = req.body;
    const query = message.trim();
    if (!query) {
      return res.status(400).json({ success: false, message: 'Message cannot be empty' });
    }

    const lower = query.toLowerCase();
    const isUrdu = isRomanUrdu(query);
    const dims = extractDimensions(query);

    let reply = '';
    let recommendations = [];
    let calculatorData = null;
    let actionLinks = [];
    let categoryFound = null;

    // ── 1. ROOM DIMENSIONS / CALCULATOR QUERY ──
    if (dims || hasKeywords(lower, ['calculate', 'coverage', 'calculator', 'how many liter', 'liters', 'gallons', 'kitna paint', 'kitni tiles', 'sqft', 'square feet'])) {
      const L = dims ? dims.length : 12;
      const W = dims ? dims.width : 14;
      const H = 10; // standard 10ft ceiling

      if (hasKeywords(lower, ['tile', 'farsh', 'tiles', 'flooring'])) {
        // Floor tile calculation
        const floorSqFt = L * W;
        const wastage = Math.ceil(floorSqFt * 0.10); // 10% wastage
        const totalSqFt = floorSqFt + wastage;
        const boxCoverage = 16; // avg 16 sqft per box for 60x60cm tiles
        const boxesNeeded = Math.ceil(totalSqFt / boxCoverage);

        calculatorData = {
          type: 'tiles',
          length: L,
          width: W,
          floorArea: floorSqFt,
          withWastage: totalSqFt,
          boxesNeeded: boxesNeeded,
          boxCoverage: boxCoverage
        };

        if (isUrdu) {
          reply = `Aapke **${L} x ${W} ft** kamray ke farsh ke liye kul **${floorSqFt} sq.ft** area banta hai.\n\n` +
                  `• 10% cutting aur wastage ke sath: **${totalSqFt} sq.ft**\n` +
                  `• Standard tile box (~16 sq.ft/box) ke hisaab se aapko taqreeban **${boxesNeeded} boxes** ki zaroorat hogi.\n\n` +
                  `Neeche hamare premium Terrazzo aur Porcelain tiles mojood hain jinhe aap direct cart me add kar sakte hain:`;
        } else {
          reply = `For your **${L} x ${W} ft** room flooring, the net floor area is **${floorSqFt} sq.ft**.\n\n` +
                  `• With standard 10% cutting & border wastage allowance: **${totalSqFt} sq.ft**\n` +
                  `• For standard 60x60cm boxes (~16 sq.ft per box), you will need **approx. ${boxesNeeded} boxes**.\n\n` +
                  `Explore our curated premium tiles below:`;
        }

        recommendations = await getRelevantProducts('tiles', 3);
        actionLinks = [
          { label: isUrdu ? 'Tiles Catalog Dekhein' : 'Explore All Tiles', url: '/tiles' },
          { label: isUrdu ? 'House Cost Estimator' : 'Whole-House Estimator', action: 'estimator' }
        ];

      } else {
        // Paint calculation
        // Total wall area = 2 * (L + W) * H - deductions for 1 door & 1 window (~42 sq.ft)
        const grossWallArea = 2 * (L + W) * H;
        const deductions = 42;
        const netWallArea = Math.max(100, grossWallArea - deductions);
        // Emulsion coverage: ~130 sq.ft per liter for 2 coats
        const liters = (netWallArea / 65).toFixed(1); // 1 liter = ~65 sqft for 2 coats
        const gallons = (liters / 3.64).toFixed(1); // 1 gallon = ~3.64 liters
        const estCost = Math.round(liters * 650); // avg PKR 650/liter

        calculatorData = {
          type: 'paint',
          length: L,
          width: W,
          height: H,
          netArea: netWallArea,
          litersNeeded: liters,
          gallonsNeeded: gallons,
          estimatedCostPKR: estCost
        };

        if (isUrdu) {
          reply = `Aapke **${L} x ${W} ft** kamray (10 ft oonchai) ke liye deewaron ka net area taqreeban **${netWallArea} sq.ft** banta hai (darwaza aur khirki nikaal kar).\n\n` +
                  `• **Do (2) coats** ke liye aapko taqreeban **${liters} Liters** (yaani ~**${gallons} Gallons**) paint darkaar hoga.\n` +
                  `• Taqreeban andaza kharcha: **Rs. ${estCost.toLocaleString()} PKR**.\n\n` +
                  `Aap hamare real-time Paint Visualizer me colors test kar sakte hain ya neeche diye gaye paints select kar sakte hain:`;
        } else {
          reply = `For a **${L} x ${W} ft** room with standard 10 ft ceiling height, the net wall surface area is approx. **${netWallArea} sq.ft** (deducting door & window openings).\n\n` +
                  `• For **two (2) complete finish coats**, you will need **approx. ${liters} Liters** (around **${gallons} standard Gallons**).\n` +
                  `• Estimated paint cost: **~Rs. ${estCost.toLocaleString()} PKR**.\n\n` +
                  `You can test and preview exact shades in our interactive Paint Visualizer or order our top-selling paints below:`;
        }

        recommendations = await getRelevantProducts('paint', 3);
        actionLinks = [
          { label: isUrdu ? 'Paint Visualizer Kholein' : 'Launch Paint Visualizer', url: '/paint' },
          { label: isUrdu ? 'Pura Ghar Estimate' : 'Whole-House Estimator', action: 'estimator' }
        ];
      }

    // ── 2. TV / MEDIA WALL / WALL PANELS ──
    } else if (hasKeywords(lower, ['tv', 'media wall', 'panel', 'panelling', 'slat', 'fluted', 'wood panel', 'wooden', 'acoustic', 'feature wall'])) {
      categoryFound = 'paneling';
      if (isUrdu) {
        reply = `Modern TV Media Wall ke liye is waqt Pakistan me sab se trending combination **Fluted Natural Oak Wood Slat Panels** hain! ` +
                `Inke peechhe warm LED strip lights aur base me marble-finish console lagane se lounge ka look bilkul luxury 5-star hotel jaisa ho jata hai.\n\n` +
                `• **Wood Slats:** TV ke back par acoustic dampening aur rich warmth dete hain.\n` +
                `• **Accent Paint:** Sides par Alabaster White ya Warm Greige color lagayein.`;
      } else {
        reply = `For modern TV Media Feature Walls, the most sought-after architectural trend is **Fluted Natural Oak or Walnut Acoustic Wood Slat Panels**!\n\n` +
                `• **Focal Backing:** Slatted wood panels behind the screen provide rich organic texture and acoustic sound dampening.\n` +
                `• **Complementary Base:** Pair with Carrara Marble or Nero Marquina slabs at the media console ledge.\n` +
                `• **Lighting:** Concealed warm white (3000K) LED cove strips elevate the 3D depth.`;
      }
      recommendations = await getRelevantProducts('paneling', 3);
      actionLinks = [
        { label: isUrdu ? 'Tamam Wall Panels Dekhein' : 'Explore All Wall Panels', url: '/wallpenals' },
        { label: isUrdu ? 'Room Designer Me Test Karein' : 'Try in 3D Room Designer', url: '/room-designer' }
      ];

    // ── 3. TILES & MARBLE FLOORING ──
    } else if (hasKeywords(lower, ['tile', 'tiles', 'marble', 'terrazzo', 'travertine', 'bathroom tile', 'kitchen tile', 'flooring', 'farsh'])) {
      categoryFound = 'tiles';
      if (isUrdu) {
        reply = `Intra Decor par imported Spanish porcelain, handcrafted Terrazzo, aur polished Marble tiles dastyab hain!\n\n` +
                `• **Bathroom ke liye:** Matte finish anti-slip Travertine ya Carrara White 60x120cm tiles behtareen rehti hain.\n` +
                `• **Kitchen & Living Lounge:** Glossy Terrazzo aur Large-format vitrified porcelain tiles room ko khula aur roshan dikhati hain.\n\n` +
                `Hamari verified approved tiles neeche check karein:`;
      } else {
        reply = `Intra Decor features premium imported Spanish porcelain, geometric Terrazzo, and refined marble surface tiles:\n\n` +
                `• **Bathrooms:** Matte / honed anti-skid porcelain tiles (such as Spanish Travertine or Carrara White) ensure safety and timeless luxury.\n` +
                `• **Living Areas & Kitchens:** High-gloss or satin Terrazzo and large-format (60x120cm) porcelain tiles maximize reflected natural light.`;
      }
      recommendations = await getRelevantProducts('tiles', 3);
      actionLinks = [
        { label: isUrdu ? 'Tamam Tiles Dekhein' : 'View Tiles Catalog', url: '/tiles' },
        { label: isUrdu ? 'Cost Estimate Karein' : 'Calculate Cost & SqFt', action: 'estimator' }
      ];

    // ── 4. WALLPAPER INQUIRIES ──
    } else if (hasKeywords(lower, ['wallpaper', 'wall paper', 'paper', 'damask', 'geometric wallpaper', 'floral', 'texture'])) {
      categoryFound = 'wallpaper';
      if (isUrdu) {
        reply = `Wallpapers aapke room me instant luxury character add karte hain! Khususan bed ke peechhe accent wall ya powder room me:\n\n` +
                `• **Master Bedroom:** Nordic Minimalist Geometric ya Textured Fabric-finish wallpapers.\n` +
                `• **Feature Accent:** Metallic Gold leaf accents ya Deep Botanic prints.\n\n` +
                `Hamara latest wallpaper collection neeche browse karein:`;
      } else {
        reply = `Wallpapers add instant architectural sophistication and tactile depth, especially for bedroom headboard walls, dining alcoves, and powder rooms:\n\n` +
                `• **Master Bedrooms:** Nordic Geometric minimalist prints or subtle linen-weave vinyl wallpapers.\n` +
                `• **Luxury Statement Walls:** Botanical murals or metallic damask accents paired with complementary paint perimeter trims.`;
      }
      recommendations = await getRelevantProducts('wallpaper', 3);
      actionLinks = [
        { label: isUrdu ? 'Wallpaper Collection' : 'Browse Wallpapers', url: '/wallpaper' }
      ];

    // ── 5. COLOR SCHEMES / BEDROOM / LIVING ROOM PAINT ADVICE ──
    } else if (hasKeywords(lower, ['color', 'colour', 'paint', 'shade', 'rang', 'bedroom', 'living', 'hall', 'drawing room', 'lounge', 'dulux', 'berger', 'nippon', 'white', 'sage', 'beige', 'grey', 'gray', 'terracotta', 'blue'])) {
      categoryFound = 'paint';

      let specificAdvice = '';
      if (lower.includes('bedroom') || lower.includes('bed room') || lower.includes('kamra')) {
        specificAdvice = isUrdu 
          ? `Bedroom ke liye pur-sukoon (calming) colors behtareen hotay hain jaise **Alabaster White**, **Sage Green (#9BB09E)**, ya **Warm Linen**. Accent wall bed ke peeche banayein.`
          : `For bedrooms, calming restorative tones are optimal: Pair **Alabaster White** on 3 walls with a serene accent wall in **Vintage Sage Green (#9BB09E)** or **Muted Dusty Blue**.`;
      } else if (lower.includes('living') || lower.includes('lounge') || lower.includes('drawing')) {
        specificAdvice = isUrdu
          ? `Living lounge ke liye warm & welcoming earthy shades jese **Warm Greige**, **Terracotta Blush**, aur **Cream** bohot khubsoorat lagti hain.`
          : `For living lounges, an inviting earthy palette works wonders: **Warm Greige** on primary walls anchored with a bold **Terracotta Blush (#CB7C69)** or **Charcoal Velvet** accent wall.`;
      } else {
        specificAdvice = isUrdu
          ? `Hamare paas Premium Matte Emulsion, Silk Glow, aur Weather-resistant shades dastyab hain. Light shades room ko bara aur roshan banati hain.`
          : `Light reflective neutral tones bounce daylight to make rooms look expansive, while matte finishes conceal drywall imperfections effortlessly.`;
      }

      if (isUrdu) {
        reply = `Aapke space ke liye design recommendation:\n\n${specificAdvice}\n\n` +
                `Aap hamare **Interactive Paint Visualizer** me kisi bhi deewar ka color real-time badal kar dekh sakte hain! Neeche kuch top paint shades mojood hain:`;
      } else {
        reply = `Here is our expert design harmony recommendation for your space:\n\n${specificAdvice}\n\n` +
                `You can test any custom shade directly in our **Real-Time Paint Visualizer** to see how it looks under morning, daylight, and evening lighting:`;
      }

      recommendations = await getRelevantProducts('paint', 3);
      actionLinks = [
        { label: isUrdu ? 'Paint Visualizer Kholein' : 'Launch Paint Visualizer', url: '/paint' },
        { label: isUrdu ? 'Room Designer (3D)' : '3D Room Designer', url: '/room-designer' }
      ];

    // ── 6. SERVICE PROVIDERS / PAINTERS / INSTALLATION ──
    } else if (hasKeywords(lower, ['service', 'painter', 'contractor', 'installation', 'mistri', 'karigar', 'labour', 'fitting', 'renovation', 'worker'])) {
      const providers = await getServiceProviders('', 3);
      let providerText = '';
      if (providers.length > 0) {
        providerText = providers.map(p => `• **${p.serviceprovider_name}** (${p.service_name || p.category}) - 📍 ${p.city} | 📞 ${p.phone}`).join('\n');
      }

      if (isUrdu) {
        reply = `Intra Decor par verified professional painters, tile installers, aur wood craftsman mojood hain jo professional finishing provide karte hain:\n\n` +
                (providerText || `Hamari services team se rabta karne ke liye Services page visit karein.`) + 
                `\n\nAap direct unhe call ya WhatsApp kar sakte hain ya hamare Services page par booking kar sakte hain:`;
      } else {
        reply = `Intra Decor connects you with vetted, master craftsmen and installation specialists across Pakistan:\n\n` +
                (providerText || `Visit our Services hub to find top-rated local professionals in your city.`) +
                `\n\nContact them directly or request an on-site visit through our Services portal:`;
      }

      actionLinks = [
        { label: isUrdu ? 'Tamam Services Dekhein' : 'Explore All Services', url: '/services' }
      ];

    // ── 7. ORDER TRACKING / SHIPPING / SAFE PAY ──
    } else if (hasKeywords(lower, ['track', 'order', 'status', 'shipping', 'delivery', 'payment', 'safepay', 'kahan hai', 'pohanchna'])) {
      if (isUrdu) {
        reply = `Aap apna order asaani se track kar sakte hain! Intra Decor par orders 2-4 working days me delivered hotay hain.\n\n` +
                `Order ka live status janne ke liye apna **Order ID** aur **Email** hamare Track Order page par enter karein:`;
      } else {
        reply = `You can easily monitor your order status in real time! Standard Intra Decor deliveries arrive safely within 2-4 business days across Pakistan.\n\n` +
                `To check shipment progress, enter your **Order ID** and registered email on our Tracking portal:`;
      }

      actionLinks = [
        { label: isUrdu ? 'Order Track Karein' : 'Go to Order Tracking', url: '/track-order' },
        { label: isUrdu ? 'Contact Support' : 'Customer Support', url: '/services' }
      ];

    // ── 8. GREETINGS & GENERAL QUESTIONS ──
    } else if (hasKeywords(lower, ['hello', 'hi', 'salam', 'assalam', 'aoa', 'hey', 'start', 'help', 'madad'])) {
      if (isUrdu) {
        reply = `Walaikum Assalam! Main Intra Decor ka **AI Interior & Design Consultant** hoon.\n\n` +
                `Main aapki kis cheez me madad kar sakta hoon?\n` +
                `• 🎨 Kamray ke liye paint colors aur palettes ki recommendation\n` +
                `• 🧮 Deewaron ya farsh ke hisaab se paint ya tiles ka hisaab (liters/boxes)\n` +
                `• 🪵 TV Wall aur media feature wall ke panels\n` +
                `• 🏛️ Imported Tiles aur designer Wallpapers\n` +
                `• 📦 Order tracking aur delivery maloomat\n\n` +
                `Apne space ya dimensions ke baray me batayein (maslan: "12x14 bedroom k lye paint colors batao")!`;
      } else {
        reply = `Hello and welcome! I am your **Intra Decor AI Interior Stylist & Consultant**.\n\n` +
                `Here are some things I can assist you with today:\n` +
                `• 🎨 **Color & Palette Matching:** Personalized paint harmonies for bedrooms, living rooms, and offices.\n` +
                `• 🧮 **Coverage Estimation:** Instant paint (liters/gallons) & tile (sq.ft/boxes) calculations.\n` +
                `• 🪵 **Wall Panelling & TV Media Walls:** Fluted wood slats, acoustic panels, and lighting combos.\n` +
                `• 🏛️ **Tiles & Wallpapers:** Italian porcelain, Terrazzo, and Nordic geometric wallpapers.\n` +
                `• 📦 **Order Tracking & Pricing:** Check prices, discounts, and dispatch status.\n\n` +
                `How can I inspire your space today?`;
      }

      recommendations = await getRelevantProducts('', 3);
      actionLinks = [
        { label: 'Paint Visualizer', url: '/paint' },
        { label: '3D Room Designer', url: '/room-designer' },
        { label: 'Tiles Catalog', url: '/tiles' },
        { label: 'Wall Panelling', url: '/wallpenals' }
      ];

    // ── 9. DEFAULT SMART RESPONSE ──
    } else {
      // Search database for any matching words from the user query
      const words = lower.split(/\s+/).filter(w => w.length > 3);
      let matchedProds = [];
      for (const w of words.slice(0, 3)) {
        matchedProds = await getRelevantProducts('', 3, w);
        if (matchedProds.length > 0) break;
      }
      if (matchedProds.length === 0) {
        matchedProds = await getRelevantProducts('', 3);
      }

      if (isUrdu) {
        reply = `Bohot khub! Aapke sawal ke mutabiq, Intra Decor par aapko tamam luxury interior solutions milenge.\n\n` +
                `Aap hamare **Interactive Tools** (Paint Visualizer & Room Designer) use kar sakte hain ya specific room dimensions bata kar paint/tile ka exact kharcha maloom kar sakte hain.`;
      } else {
        reply = `That is a wonderful home styling idea! At Intra Decor, we offer end-to-end luxury materials crafted for modern spaces.\n\n` +
                `Feel free to share your room size (e.g. *"Calculate paint for 12x14 ft room"*), ask for specific wall color advice, or explore our top-rated collections below:`;
      }

      recommendations = matchedProds;
      actionLinks = [
        { label: 'Paint Visualizer', url: '/paint' },
        { label: 'Wall Panels', url: '/wallpenals' },
        { label: 'Tiles Collection', url: '/tiles' }
      ];
    }

    return res.json({
      success: true,
      reply,
      recommendations,
      calculatorData,
      actionLinks
    });

  } catch (err) {
    console.error('AI Chatbot error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error processing AI request',
      reply: 'I encountered a brief hiccup. Please ask your question again!'
    });
  }
});

export default router;
