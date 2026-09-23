import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, MessageSquare, Send, X, Bot, ArrowRight, Check, Palette } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const QUICK_PROMPTS = [
  "Recommend colors for a small bedroom with warm sunlight",
  "Best tile & panel combination for a modern TV media wall",
  "Suggest cozy earthy palette for living room with Dulux or Berger",
  "How many paint liters do I need for a 12x14 ft room?"
];

const KNOWLEDGE_RESPONSES = [
  {
    keywords: ["bedroom", "small", "sunlight", "warm"],
    reply: "For a south or west-facing small bedroom, I recommend soft reflective neutrals that bounce sunlight without glaring. Consider pairing **Alabaster White** (or Linen Canvas) on 3 walls with an accent wall in **Vintage Sage (#9BB09E)**. For flooring, 60x60cm **Spanish Travertine Beige** adds calming Mediterranean warmth.",
    recommendations: [
      { name: "Dulux Velvet Touch - Vintage Sage", category: "Paint", link: "/paint", color: "#9BB09E" },
      { name: "Spanish Travertine Beige Tiles", category: "Tiles", link: "/tiles" }
    ]
  },
  {
    keywords: ["tv", "media", "wall", "panel"],
    reply: "For modern TV media feature walls, the most trending combination in Pakistan right now is **Natural Oak Fluted Wood Slat Panels** behind the television, paired with **Carrara White Marble Tiles** (or Nero Marquina Glass) at the base. You can accent the sides with a warm greige paint shade.",
    recommendations: [
      { name: "Natural Oak Fluted Wood Wall Panels", category: "Wall Panelling", link: "/wallpenals" },
      { name: "Carrara White Marble Tiles", category: "Tiles", link: "/tiles" }
    ]
  },
  {
    keywords: ["earthy", "living", "lounge", "dulux", "berger"],
    reply: "For a rich, cozy living lounge, an earthy triad works wonders: **Terracotta Blush (#CB7C69)** as the focal accent wall, complemented by **Warm Greige (#D8CFC4)** on perimeter walls, and **Espresso Velvet (#4B2C2C)** accents for trims or furniture styling.",
    recommendations: [
      { name: "Berger Silk Emulsion - Terracotta", category: "Paint", link: "/paint", color: "#CB7C69" },
      { name: "Nordic Minimalist Geometric Wallpaper", category: "Wallpaper", link: "/wallpaper" }
    ]
  },
  {
    keywords: ["liters", "calculate", "12x14", "quantity"],
    reply: "For a standard 12x14 ft room with 10 ft ceiling height (approx. 430 sq.ft net wall area deducting 1 door and 1 window), you will need **approx. 6 to 7 Liters** of premium emulsion for 2 solid coats (roughly two 4-Liter gallon buckets).",
    recommendations: [
      { name: "Launch Paint Coverage Calculator", category: "Tool", link: "/paint" }
    ]
  }
];

export default function AIConsultantModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: "Hello! I'm your AI Interior Design Stylist at Intra Decor. Tell me about your space, room dimensions, or color preferences, and I'll recommend the ideal paints, tiles, wallpapers, and layout combos!"
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = (textToSend) => {
    const query = (textToSend || input).trim();
    if (!query) return;

    // Add user message
    setMessages(prev => [...prev, { sender: 'user', text: query }]);
    if (!textToSend) setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const qLower = query.toLowerCase();
      // Match keywords
      const match = KNOWLEDGE_RESPONSES.find(k => 
        k.keywords.some(kw => qLower.includes(kw))
      );

      if (match) {
        setMessages(prev => [
          ...prev,
          {
            sender: 'bot',
            text: match.reply,
            recommendations: match.recommendations
          }
        ]);
      } else {
        setMessages(prev => [
          ...prev,
          {
            sender: 'bot',
            text: `That's a fantastic interior concept! For your request, I suggest exploring our **Real-Time Paint Visualizer** where you can test colors under different light conditions, or browse our **Acoustic Wall Panels** and **Porcelain Tiles** collections.`,
            recommendations: [
              { name: "Open Paint Visualizer Tool", category: "Visualizer", link: "/paint" },
              { name: "Browse Tiles & Panels", category: "Catalog", link: "/tiles" }
            ]
          }
        ]);
      }
      setIsTyping(false);
    }, 800);
  };

  return (
    <>
      {/* ── FLOATING LAUNCHER BUTTON ── */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2.5 bg-gradient-to-r from-[#4b2c2c] to-[#7a4040] text-white px-4 py-3 sm:px-5 sm:py-3.5 rounded-full shadow-2xl hover:shadow-luxury-hover border-2 border-[#d4a56a]/60 hover:scale-105 transition-all duration-300 active:scale-95"
          aria-label="Open AI Interior Stylist"
        >
          <div className="w-8 h-8 rounded-full bg-[#d4a56a] text-[#2c1a1a] flex items-center justify-center shadow-md animate-pulse">
            <Sparkles className="w-4 h-4 fill-[#2c1a1a]" />
          </div>
          <div className="text-left hidden sm:block">
            <span className="text-[10px] text-[#d4a56a] uppercase font-bold tracking-widest block leading-none">
              AI Interior Stylist
            </span>
            <span className="text-xs font-bold leading-tight">Design Advice & Match</span>
          </div>
          {/* Ping badge */}
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></span>
        </button>
      </div>

      {/* ── CHAT MODAL ── */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-end sm:items-center justify-end sm:justify-center p-0 sm:p-4 animate-fadeIn">
          <div className="bg-white w-full sm:max-w-lg h-[92vh] sm:h-[620px] rounded-t-3xl sm:rounded-3xl shadow-2xl border border-brand-border flex flex-col overflow-hidden relative">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-[#4b2c2c] via-[#5c3535] to-[#2c1a1a] text-white p-4 sm:p-5 flex items-center justify-between border-b border-[#5e3838]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#d4a56a] text-[#2c1a1a] flex items-center justify-center font-bold shadow-md">
                  <Sparkles className="w-5 h-5 fill-[#2c1a1a]" />
                </div>
                <div>
                  <h3 className="font-serif text-base font-bold flex items-center gap-2">
                    <span>IntraDecor AI Stylist</span>
                    <span className="bg-[#d4a56a]/20 text-[#d4a56a] text-[9px] uppercase font-bold px-2 py-0.5 rounded border border-[#d4a56a]/40">
                      Smart Assistant
                    </span>
                  </h3>
                  <p className="text-[11px] text-gray-300">Architectural & Color Harmony Consultant</p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-300 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Prompts Bar */}
            <div className="bg-[#faf8f5] px-4 py-2 border-b border-gray-100 flex gap-2 overflow-x-auto scrollbar-none">
              {QUICK_PROMPTS.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(prompt)}
                  className="px-3 py-1 bg-white hover:bg-gray-100 text-[11px] text-gray-700 rounded-full border border-gray-200 whitespace-nowrap transition-colors flex-shrink-0"
                >
                  💡 {prompt.slice(0, 28)}...
                </button>
              ))}
            </div>

            {/* Messages Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-[#fbf9f6]">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed shadow-xs ${
                      m.sender === 'user'
                        ? 'bg-[#4b2c2c] text-white rounded-br-none'
                        : 'bg-white text-gray-800 border border-brand-border rounded-bl-none'
                    }`}
                  >
                    <p>{m.text}</p>

                    {/* Product / Tool Recommendations */}
                    {m.recommendations && m.recommendations.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-gray-100 space-y-2">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
                          Suggested Action & Catalog:
                        </span>
                        <div className="space-y-1.5">
                          {m.recommendations.map((rec, rIdx) => (
                            <button
                              key={rIdx}
                              onClick={() => {
                                setIsOpen(false);
                                navigate(rec.link);
                              }}
                              className="w-full text-left p-2 rounded-xl bg-[#faf8f5] hover:bg-[#f0ebe3] border border-gray-200 flex items-center justify-between transition-colors group"
                            >
                              <div className="flex items-center gap-2 truncate">
                                {rec.color && (
                                  <span
                                    className="w-3.5 h-3.5 rounded-full border border-black/20 flex-shrink-0"
                                    style={{ backgroundColor: rec.color }}
                                  ></span>
                                )}
                                <span className="font-semibold text-xs text-[#2c1a1a] truncate group-hover:text-[#4b2c2c]">
                                  {rec.name}
                                </span>
                              </div>
                              <span className="text-[10px] text-[#d4a56a] font-bold uppercase tracking-wider flex items-center gap-1">
                                <span>Try</span>
                                <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex items-center gap-1.5 text-xs text-gray-400 bg-white p-3 rounded-2xl max-w-xs border border-gray-100">
                  <Bot className="w-3.5 h-3.5 text-[#d4a56a] animate-spin" />
                  <span>AI Stylist is composing design suggestions...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => { e.preventDefault(); handleSend(); }}
              className="p-3 bg-white border-t border-brand-border flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask e.g. 'Best wall color for small bedroom'..."
                className="flex-1 bg-[#faf8f5] text-xs sm:text-sm p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#4b2c2c]"
              />
              <button
                type="submit"
                className="bg-[#4b2c2c] hover:bg-[#3a2020] text-white p-3 rounded-xl transition-colors shadow-xs flex-shrink-0"
              >
                <Send className="w-4 h-4 text-[#d4a56a]" />
              </button>
            </form>

          </div>
        </div>
      )}
    </>
  );
}
