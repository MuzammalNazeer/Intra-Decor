import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, Send, X, Bot, ArrowRight, Check, Palette, 
  Maximize2, Minimize2, Trash2, Volume2, VolumeX, Mic, MicOff, 
  Copy, ShoppingBag, Calculator, Wrench, Package, ExternalLink
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const QUICK_SUGGESTIONS = [
  { label: '🎨 Bedroom Color Palette', prompt: 'Recommend best paint colors for a master bedroom' },
  { label: '🧮 12x14 Paint Calculator', prompt: 'How much paint is needed for a 12x14 ft room?' },
  { label: '🪵 TV Media Wall Panels', prompt: 'What are the best fluted wood panels for a TV wall?' },
  { label: '🏛️ Modern Bathroom Tiles', prompt: 'Suggest imported luxury tiles for a modern bathroom' },
  { label: '🇵🇰 Urdu: Paint Estimation', prompt: '10x12 room me 2 coats k lye kitna paint lagega?' },
  { label: '📦 Track My Order', prompt: 'How can I track my order delivery status?' },
  { label: '👷 Professional Painters', prompt: 'Do you provide verified painters and installers?' },
];

export default function AIConsultantModal({ onOpenEstimator }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [addedProductId, setAddedProductId] = useState(null);

  const initialBotGreeting = {
    sender: 'bot',
    text: "Assalam-o-Alaikum & Hello! I'm your **Intra Decor AI Interior Stylist & Architect**.\n\nTell me about your room dimensions, favorite color tones, or what you're renovating (paints, tiles, wallpapers, TV media panels). I'll calculate exact materials, suggest harmonious palettes, and show real products!",
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    actionLinks: [
      { label: 'Paint Visualizer', url: '/paint' },
      { label: 'Tiles Catalog', url: '/tiles' },
      { label: 'Wall Panelling', url: '/wallpenals' },
      { label: '3D Room Designer', url: '/room-designer' }
    ]
  };

  const [messages, setMessages] = useState(() => {
    try {
      const saved = sessionStorage.getItem('intradecor_ai_chat');
      return saved ? JSON.parse(saved) : [initialBotGreeting];
    } catch {
      return [initialBotGreeting];
    }
  });

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);
  const navigate = useNavigate();
  const { addToCart } = useCart();

  // Persist session messages
  useEffect(() => {
    try {
      sessionStorage.setItem('intradecor_ai_chat', JSON.stringify(messages));
    } catch (e) {
      // storage full or disabled
    }
  }, [messages]);

  // Scroll to bottom
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 250);
    }
  }, [isOpen]);

  // Speech Recognition Setup
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInput(transcript);
          handleSend(transcript);
        }
      };
      recognitionRef.current = recognition;
    }
  }, []);

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.warn('Speech recognition error:', err);
      }
    }
  };

  // Text-To-Speech read response
  const speakText = (text) => {
    if (!isSoundEnabled || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      // Strip markdown bold/bullets
      const clean = text.replace(/[*_#•]/g, '');
      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('TTS error:', e);
    }
  };

  const handleSend = async (textToSend) => {
    const query = (textToSend || input).trim();
    if (!query) return;

    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Append user message
    const userMsg = { sender: 'user', text: query, timestamp: timeString };
    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsTyping(true);

    try {
      // Call backend AI chat endpoint
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          history: messages.slice(-6)
        })
      });

      const data = await res.json();

      if (data.success) {
        const botMsg = {
          sender: 'bot',
          text: data.reply,
          recommendations: data.recommendations || [],
          calculatorData: data.calculatorData || null,
          actionLinks: data.actionLinks || [],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, botMsg]);
        speakText(data.reply);
      } else {
        throw new Error(data.message || 'Error occurred');
      }
    } catch (err) {
      console.error('Chat error:', err);
      const fallbackMsg = {
        sender: 'bot',
        text: "I'm having a brief connection delay. Please feel free to ask about paint calculations, tiles, wallpaper, or TV wall panel options!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionLinks: [
          { label: 'Paint Visualizer', url: '/paint' },
          { label: 'Tiles Catalog', url: '/tiles' }
        ]
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClearChat = () => {
    if (window.confirm('Reset and clear this AI chat conversation?')) {
      sessionStorage.removeItem('intradecor_ai_chat');
      setMessages([initialBotGreeting]);
    }
  };

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleAddToCart = (product, e) => {
    e.stopPropagation();
    addToCart(product, 1);
    setAddedProductId(product.id);
    setTimeout(() => setAddedProductId(null), 2200);
  };

  // Render markdown bold and bullets nicely
  const formatMessageText = (text) => {
    if (!text) return null;
    const lines = text.split('\n');

    return lines.map((line, lIdx) => {
      // Bold rendering
      const parts = line.split(/(\*\*.*?\*\*)/g);
      const formattedLine = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={pIdx} className="font-bold text-[#4b2c2c]">{part.slice(2, -2)}</strong>;
        }
        return part;
      });

      if (line.trim().startsWith('•')) {
        return (
          <div key={lIdx} className="flex items-start gap-2 my-1 pl-1">
            <span className="text-[#d4a56a] font-bold leading-tight mt-0.5">•</span>
            <span className="flex-1">{formattedLine}</span>
          </div>
        );
      }

      if (line.trim() === '') {
        return <div key={lIdx} className="h-2" />;
      }

      return <p key={lIdx} className="my-0.5">{formattedLine}</p>;
    });
  };

  const getProductImageSrc = (prod) => {
    if (!prod) return '/assets/images/logo.png';
    const img = prod.product_image;
    if (!img) return '/assets/images/logo.png';
    if (img.startsWith('http')) return img;
    if (img.startsWith('uploads/')) return `/${img}`;
    if (img.includes('/')) return img;
    return `/assets/images/${img}`;
  };

  return (
    <>
      {/* ── FLOATING LAUNCHER BUTTON ── */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="group relative flex items-center gap-3 bg-gradient-to-r from-[#4b2c2c] via-[#633535] to-[#2c1a1a] text-white pl-4 pr-5 py-3 sm:py-3.5 rounded-full shadow-2xl hover:shadow-luxury-hover border-2 border-[#d4a56a]/70 hover:scale-105 transition-all duration-300 active:scale-95 cursor-pointer"
          aria-label="Open AI Assistant"
        >
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#d4a56a] to-[#f3cf9b] text-[#2c1a1a] flex items-center justify-center shadow-md group-hover:rotate-12 transition-transform">
            <Sparkles className="w-5 h-5 fill-[#2c1a1a]" />
          </div>

          <div className="text-left hidden sm:block">
            <span className="text-[10px] text-[#d4a56a] uppercase font-bold tracking-widest block leading-none">
              IntraDecor AI
            </span>
            <span className="text-xs font-bold leading-tight flex items-center gap-1.5">
              <span>Interior Stylist</span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            </span>
          </div>

          {/* Active indicator dot */}
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#d4a56a] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white"></span>
          </span>
        </button>
      </div>

      {/* ── CHAT WINDOW CONTAINER ── */}
      {isOpen && (
        <div className="fixed inset-0 sm:inset-auto sm:bottom-24 sm:right-6 z-50 flex items-end sm:items-stretch justify-center animate-fadeIn">
          <div 
            className={`bg-white w-full sm:rounded-3xl shadow-2xl border border-brand-border flex flex-col overflow-hidden relative transition-all duration-300 ${
              isExpanded 
                ? 'sm:w-[720px] sm:h-[720px] max-w-full h-full' 
                : 'sm:w-[460px] sm:h-[620px] max-w-full h-[94vh]'
            }`}
          >
            
            {/* ── HEADER ── */}
            <div className="bg-gradient-to-r from-[#4b2c2c] via-[#5c3535] to-[#2c1a1a] text-white p-3.5 sm:p-4 flex items-center justify-between border-b border-[#5e3838] shadow-sm select-none">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#d4a56a] to-[#f5d7aa] text-[#2c1a1a] flex items-center justify-center font-bold shadow-md">
                    <Sparkles className="w-5 h-5 fill-[#2c1a1a]" />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-[#4b2c2c] rounded-full"></span>
                </div>
                <div>
                  <h3 className="font-serif text-sm sm:text-base font-bold flex items-center gap-2">
                    <span>IntraDecor AI Stylist</span>
                    <span className="bg-[#d4a56a]/25 text-[#f5d7aa] text-[9px] uppercase font-bold px-2 py-0.5 rounded-full border border-[#d4a56a]/40 tracking-wider">
                      Online
                    </span>
                  </h3>
                  <p className="text-[11px] text-gray-300 leading-tight">
                    Smart Colors • Calculations • Catalog Grounded
                  </p>
                </div>
              </div>

              {/* Header Action Tools */}
              <div className="flex items-center gap-1 text-gray-300">
                {/* Voice sound toggle */}
                <button
                  onClick={() => setIsSoundEnabled(!isSoundEnabled)}
                  title={isSoundEnabled ? "Sound Enabled (Click to Mute)" : "Sound Muted (Click to Enable Speech)"}
                  className={`p-1.5 rounded-lg hover:text-white transition-colors ${isSoundEnabled ? 'text-[#d4a56a] bg-white/10' : 'hover:bg-white/10'}`}
                >
                  {isSoundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>

                {/* Clear chat history */}
                <button
                  onClick={handleClearChat}
                  title="Clear conversation"
                  className="p-1.5 rounded-lg hover:text-white hover:bg-white/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                {/* Expand / Minimize toggle (desktop) */}
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  title={isExpanded ? "Standard view" : "Expanded view"}
                  className="hidden sm:block p-1.5 rounded-lg hover:text-white hover:bg-white/10 transition-colors"
                >
                  {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>

                {/* Close Button */}
                <button
                  onClick={() => setIsOpen(false)}
                  title="Close AI Assistant"
                  className="p-1.5 rounded-lg hover:text-white hover:bg-white/10 transition-colors ml-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* ── QUICK SUGGESTION CHIPS ── */}
            <div className="bg-[#faf7f3] px-3.5 py-2 border-b border-gray-100 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex-shrink-0 mr-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#d4a56a]" />
                <span>Ask:</span>
              </span>
              {QUICK_SUGGESTIONS.map((item, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(item.prompt)}
                  className="px-2.5 py-1 bg-white hover:bg-[#f3ebe1] text-[11px] text-gray-700 hover:text-[#4b2c2c] rounded-full border border-gray-200/90 whitespace-nowrap transition-all shadow-2xs hover:border-[#d4a56a] flex-shrink-0 cursor-pointer"
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* ── MESSAGES CONTAINER ── */}
            <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-4 bg-[#fcfbfa]">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'} group`}
                >
                  <div
                    className={`max-w-[90%] sm:max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed shadow-xs relative ${
                      m.sender === 'user'
                        ? 'bg-[#4b2c2c] text-white rounded-br-none'
                        : 'bg-white text-gray-800 border border-brand-border rounded-bl-none'
                    }`}
                  >
                    {/* Message Text with Markdown Formatting */}
                    <div className="prose-xs">
                      {formatMessageText(m.text)}
                    </div>

                    {/* ── CALCULATOR RESULT CARD ── */}
                    {m.calculatorData && (
                      <div className="mt-3 p-3 rounded-xl bg-gradient-to-br from-[#faf6f0] to-[#f4ebe1] border border-[#d4a56a]/40 text-gray-800 space-y-2">
                        <div className="flex items-center justify-between border-b border-[#d4a56a]/20 pb-1.5">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-[#4b2c2c] flex items-center gap-1.5">
                            <Calculator className="w-3.5 h-3.5 text-[#d4a56a]" />
                            <span>{m.calculatorData.type === 'tiles' ? 'Tile & Flooring Estimate' : 'Paint Coverage Estimate'}</span>
                          </span>
                          <span className="text-[10px] font-semibold bg-[#4b2c2c] text-white px-2 py-0.5 rounded-full">
                            {m.calculatorData.length} x {m.calculatorData.width} ft
                          </span>
                        </div>

                        {m.calculatorData.type === 'paint' ? (
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="bg-white/80 p-2 rounded-lg border border-gray-100">
                              <span className="text-[10px] text-gray-500 block">Net Wall Surface</span>
                              <span className="font-bold text-[#4b2c2c] text-sm">{m.calculatorData.netArea} sq.ft</span>
                            </div>
                            <div className="bg-white/80 p-2 rounded-lg border border-gray-100">
                              <span className="text-[10px] text-gray-500 block">Emulsion (2 Coats)</span>
                              <span className="font-bold text-[#4b2c2c] text-sm">~{m.calculatorData.litersNeeded} Liters</span>
                            </div>
                            <div className="bg-white/80 p-2 rounded-lg border border-gray-100">
                              <span className="text-[10px] text-gray-500 block">Gallons Needed</span>
                              <span className="font-bold text-[#4b2c2c] text-sm">~{m.calculatorData.gallonsNeeded} Gallons</span>
                            </div>
                            <div className="bg-white/80 p-2 rounded-lg border border-gray-100">
                              <span className="text-[10px] text-gray-500 block">Estimated Cost</span>
                              <span className="font-bold text-emerald-700 text-sm">~Rs. {m.calculatorData.estimatedCostPKR.toLocaleString()} PKR</span>
                            </div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="bg-white/80 p-2 rounded-lg border border-gray-100">
                              <span className="text-[10px] text-gray-500 block">Net Floor Area</span>
                              <span className="font-bold text-[#4b2c2c] text-sm">{m.calculatorData.floorArea} sq.ft</span>
                            </div>
                            <div className="bg-white/80 p-2 rounded-lg border border-gray-100">
                              <span className="text-[10px] text-gray-500 block">Area (+10% Wastage)</span>
                              <span className="font-bold text-[#4b2c2c] text-sm">{m.calculatorData.withWastage} sq.ft</span>
                            </div>
                            <div className="col-span-2 bg-white/80 p-2 rounded-lg border border-gray-100 flex items-center justify-between">
                              <div>
                                <span className="text-[10px] text-gray-500 block">Standard 60x60cm Boxes</span>
                                <span className="font-bold text-[#4b2c2c] text-sm">~{m.calculatorData.boxesNeeded} Boxes Required</span>
                              </div>
                              <span className="text-[10px] text-gray-400">({m.calculatorData.boxCoverage} sq.ft/box)</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* ── RECOMMENDED PRODUCTS CARDS ── */}
                    {m.recommendations && m.recommendations.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-gray-100 space-y-2">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block flex items-center gap-1">
                          <ShoppingBag className="w-3 h-3 text-[#d4a56a]" />
                          <span>Matching Products from Catalog:</span>
                        </span>
                        
                        <div className="space-y-2">
                          {m.recommendations.map((prod) => {
                            const isAdded = addedProductId === prod.id;
                            const imageSrc = getProductImageSrc(prod);
                            const price = Number(prod.price) || 0;
                            const discount = Number(prod.discount) || 0;
                            const finalPrice = prod.finalPrice || Math.round(price - (price * discount / 100));

                            return (
                              <div
                                key={prod.id}
                                onClick={() => {
                                  setIsOpen(false);
                                  navigate(`/product/${prod.id}`);
                                }}
                                className="w-full text-left p-2.5 rounded-xl bg-[#faf8f5] hover:bg-[#f2ece3] border border-gray-200/90 flex items-center gap-3 transition-all duration-200 group/card cursor-pointer shadow-2xs"
                              >
                                {/* Thumbnail */}
                                <div className="w-12 h-12 rounded-lg overflow-hidden bg-white flex-shrink-0 border border-gray-200">
                                  <img
                                    src={imageSrc}
                                    alt={prod.name}
                                    className="w-full h-full object-cover group-hover/card:scale-105 transition-transform"
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = '/assets/images/logo.png';
                                    }}
                                  />
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-[#4b2c2c]/10 text-[#4b2c2c]">
                                      {prod.category || 'Product'}
                                    </span>
                                    {discount > 0 && (
                                      <span className="text-[9px] font-bold text-rose-600 bg-rose-50 px-1 py-0.2 rounded">
                                        -{discount}%
                                      </span>
                                    )}
                                  </div>
                                  <h4 className="font-semibold text-xs text-[#2c1a1a] truncate group-hover/card:text-[#4b2c2c] mt-0.5">
                                    {prod.name}
                                  </h4>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <span className="font-bold text-xs text-[#4b2c2c]">
                                      Rs. {finalPrice.toLocaleString()} PKR
                                    </span>
                                    {discount > 0 && (
                                      <span className="text-[10px] text-gray-400 line-through">
                                        Rs. {price.toLocaleString()}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {/* Quick Add Button */}
                                <button
                                  onClick={(e) => handleAddToCart(prod, e)}
                                  title="Add to cart directly"
                                  className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 transition-all ${
                                    isAdded
                                      ? 'bg-emerald-600 text-white'
                                      : 'bg-[#4b2c2c] hover:bg-[#381f1f] text-white'
                                  }`}
                                >
                                  {isAdded ? (
                                    <>
                                      <Check className="w-3 h-3" />
                                      <span>Added</span>
                                    </>
                                  ) : (
                                    <>
                                      <ShoppingBag className="w-3 h-3 text-[#d4a56a]" />
                                      <span className="hidden sm:inline">+Cart</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* ── QUICK ACTION LINKS ── */}
                    {m.actionLinks && m.actionLinks.length > 0 && (
                      <div className="mt-2.5 pt-2 border-t border-gray-100 flex flex-wrap gap-1.5">
                        {m.actionLinks.map((link, lIdx) => (
                          <button
                            key={lIdx}
                            onClick={() => {
                              if (link.action === 'estimator') {
                                setIsOpen(false);
                                if (onOpenEstimator) onOpenEstimator();
                                else window.dispatchEvent(new CustomEvent('open-estimator'));
                              } else if (link.url) {
                                setIsOpen(false);
                                navigate(link.url);
                              }
                            }}
                            className="px-2.5 py-1 bg-white hover:bg-[#4b2c2c] text-[#4b2c2c] hover:text-white rounded-lg border border-[#4b2c2c]/30 text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center gap-1 shadow-2xs cursor-pointer"
                          >
                            <span>{link.label}</span>
                            <ArrowRight className="w-2.5 h-2.5" />
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Timestamp & Copy for Bot */}
                    <div className={`mt-2 flex items-center justify-between text-[9px] ${m.sender === 'user' ? 'text-gray-300' : 'text-gray-400'}`}>
                      <span>{m.timestamp}</span>
                      {m.sender === 'bot' && (
                        <button
                          onClick={() => handleCopy(m.text, idx)}
                          title="Copy response"
                          className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-[#4b2c2c] flex items-center gap-0.5"
                        >
                          {copiedIndex === idx ? (
                            <>
                              <Check className="w-2.5 h-2.5 text-emerald-600" />
                              <span className="text-emerald-600 font-bold">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-2.5 h-2.5" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Bot Typing Indicator */}
              {isTyping && (
                <div className="flex items-center gap-2 text-xs text-gray-500 bg-white p-3 rounded-2xl max-w-xs border border-gray-200 shadow-2xs animate-pulse">
                  <div className="w-6 h-6 rounded-full bg-[#d4a56a]/20 flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5 text-[#d4a56a] animate-spin" />
                  </div>
                  <span className="font-medium text-[11px]">AI Stylist is computing recommendations...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* ── INPUT BAR ── */}
            <form
              onSubmit={(e) => { e.preventDefault(); handleSend(); }}
              className="p-3 bg-white border-t border-brand-border flex items-center gap-2"
            >
              {/* Mic / Speech Input Button */}
              <button
                type="button"
                onClick={toggleVoiceInput}
                title={isListening ? "Listening... Click to stop" : "Speak your question (Voice Input)"}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                  isListening 
                    ? 'bg-rose-50 border-rose-300 text-rose-600 animate-pulse' 
                    : 'bg-[#faf8f5] hover:bg-gray-100 text-gray-500 border-gray-200'
                }`}
              >
                {isListening ? <Mic className="w-4 h-4 text-rose-600" /> : <Mic className="w-4 h-4" />}
              </button>

              {/* Text Input */}
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask e.g. '12x14 bedroom paint liters' or in Urdu..."
                className="flex-1 bg-[#faf8f5] text-xs sm:text-sm p-2.5 sm:p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#4b2c2c] transition-colors"
              />

              {/* Send Button */}
              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                title="Send message"
                className={`p-2.5 sm:p-3 rounded-xl transition-all shadow-xs flex-shrink-0 cursor-pointer ${
                  input.trim() && !isTyping
                    ? 'bg-[#4b2c2c] hover:bg-[#381f1f] text-white scale-100 active:scale-95'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Send className="w-4 h-4 text-[#d4a56a]" />
              </button>
            </form>

            {/* Bottom Footer Note */}
            <div className="bg-[#f8f5f2] px-3 py-1.5 text-center text-[10px] text-gray-400 border-t border-gray-100 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>IntraDecor AI v2.0 • Live MySQL</span>
              </span>
              <span>Ask in English or Roman Urdu</span>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
