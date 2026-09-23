import React from 'react';
import { NavLink } from 'react-router-dom';
import { Sparkles, Palette, Grid, Image, Layers, Wrench, Home as HomeIcon, Calculator, LayoutDashboard } from 'lucide-react';

export default function NavLinks({ isMobileOpen, onCloseMobile, onOpenEstimator }) {
  const links = [
    { to: '/', label: 'Home', icon: HomeIcon },
    { to: '/paint', label: 'Paint Visualizer', icon: Palette },
    { to: '/tiles', label: 'Tiles', icon: Grid },
    { to: '/wallpaper', label: 'Wallpaper', icon: Image },
    { to: '/wallpenals', label: 'Wall Panelling', icon: Layers },
    { to: '/services', label: 'Services', icon: Wrench },
    { to: '/room-designer', label: 'AI Room Designer', icon: Sparkles, badge: 'AI' },
  ];

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:block bg-[#3c2121] border-b border-[#522f2f] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-1 lg:gap-3 py-2 flex-wrap">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                      isActive
                        ? 'bg-[#d4a56a] text-[#2c1a1a] shadow-sm font-semibold'
                        : 'text-gray-200 hover:text-white hover:bg-[#4d2c2c]'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 opacity-80" />
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className="bg-[#e74c3c] text-white text-[10px] uppercase font-bold px-1.5 py-0.5 rounded tracking-wider ml-0.5">
                      {link.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}

            {/* Whole House Estimator Trigger Button */}
            <button
              onClick={onOpenEstimator}
              className="px-3.5 py-2 rounded-md text-sm font-semibold text-[#d4a56a] hover:bg-[#4d2c2c] transition-all flex items-center gap-2 border border-[#d4a56a]/40"
              title="Whole-House Project Budget Calculator"
            >
              <Calculator className="w-4 h-4" />
              <span>House Estimator</span>
              <span className="bg-[#d4a56a] text-[#2c1a1a] text-[10px] uppercase font-bold px-1.5 py-0.5 rounded">
                PRO
              </span>
            </button>

            {/* Direct User Dashboard Sidebar Button */}
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `px-3.5 py-2 rounded-md text-sm font-semibold transition-all flex items-center gap-2 border ${
                  isActive
                    ? 'bg-[#ffa502] text-slate-950 border-[#ffa502] font-bold shadow-sm'
                    : 'text-[#ffa502] border-[#ffa502]/60 hover:bg-[#ffa502] hover:text-slate-950'
                }`
              }
              title="Open User Dashboard with Left Sidebar"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>User Dashboard</span>
              <span className="bg-[#ffa502] text-slate-950 text-[10px] uppercase font-black px-1.5 py-0.5 rounded">
                SIDEBAR
              </span>
            </NavLink>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation Drawer */}
      {isMobileOpen && (
        <div className="md:hidden bg-[#3c2121] border-b border-[#522f2f] px-4 pt-2 pb-4 space-y-1 transition-all">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-md text-base font-medium ${
                    isActive
                      ? 'bg-[#d4a56a] text-[#2c1a1a] font-semibold'
                      : 'text-gray-200 hover:bg-[#4d2c2c] hover:text-white'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 text-[#d4a56a]" />
                  <span>{link.label}</span>
                </div>
                {link.badge && (
                  <span className="bg-[#e74c3c] text-white text-[10px] uppercase font-bold px-1.5 py-0.5 rounded">
                    {link.badge}
                  </span>
                )}
              </NavLink>
            );
          })}

          <button
            onClick={() => {
              onCloseMobile();
              onOpenEstimator();
            }}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-md text-base font-medium text-[#d4a56a] hover:bg-[#4d2c2c]"
          >
            <div className="flex items-center gap-3">
              <Calculator className="w-5 h-5" />
              <span>House Cost Estimator</span>
            </div>
            <span className="bg-[#d4a56a] text-[#2c1a1a] text-[10px] uppercase font-bold px-1.5 py-0.5 rounded">
              PRO
            </span>
          </button>

          {/* User Dashboard Sidebar Button for Mobile */}
          <NavLink
            to="/dashboard"
            onClick={onCloseMobile}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-md text-base font-bold bg-[#ffa502]/20 text-[#ffa502] border border-[#ffa502]/40 hover:bg-[#ffa502] hover:text-slate-950 transition-colors"
          >
            <div className="flex items-center gap-3">
              <LayoutDashboard className="w-5 h-5 text-[#ffa502]" />
              <span>User Dashboard</span>
            </div>
            <span className="bg-[#ffa502] text-slate-950 text-[10px] uppercase font-black px-2 py-0.5 rounded">
              SIDEBAR
            </span>
          </NavLink>
        </div>
      )}
    </>
  );
}
