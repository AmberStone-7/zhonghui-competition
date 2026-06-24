import { Outlet, Link, useLocation } from "react-router-dom";
import { ClipboardList, Image, ScrollText, Trophy, ThumbsUp, type LucideIcon } from "lucide-react";

const BASE = import.meta.env.BASE_URL;

interface NavItem {
  path: string;
  label: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  { path: "/register", label: "报名上传", icon: ClipboardList },
  { path: "/showcase", label: "作品展示", icon: Image },
  { path: "/rules", label: "赛制规则", icon: ScrollText },
  { path: "/awards", label: "赛事奖项", icon: Trophy },
  { path: "/vote", label: "人气投票", icon: ThumbsUp },
];

export default function Layout() {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-brand-bg">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 min-h-[72px] py-3 flex flex-col gap-3 sm:h-[72px] sm:flex-row sm:items-center sm:justify-between">
          {/* Mobile Simplified Bar */}
      <div className="mobile-only flex items-center justify-between px-4 py-3 border-b border-gray-100 sm:hidden">
        <Link to="/" className="flex items-center gap-3">
          <img src={`${BASE}assets/logo-gold.png`} alt="中汇文具" className="w-10 h-6 object-contain" />
          <span className="font-bold text-sm text-[#111111]">中汇文具 20 周年</span>
        </Link>
      </div>

      {/* Brand */}
          <Link to="/" className="flex items-center gap-3 shrink-0">
            <div className="w-[64px] h-[38px] sm:w-[84px] sm:h-[48px] flex items-center justify-center">
              <img src={`${BASE}assets/logo-gold.png`} alt="中汇文具" className="max-w-full max-h-full object-contain" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="font-bold text-sm sm:text-base text-[#111111]">中汇文具</span>
              <span className="text-[11px] sm:text-xs text-[#F52222] font-semibold">20周年 · 特别橱窗大赛</span>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="pc-header-nav grid grid-cols-5 gap-1 w-full sm:w-auto sm:flex sm:items-center sm:gap-1">
            {navItems.map((item) => {
              const active = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex flex-col items-center justify-center gap-1 px-1 py-2 rounded-md text-[11px] sm:text-sm sm:flex-row sm:gap-1.5 sm:px-3 transition-all ${
                    active
                      ? "bg-brand-pink text-brand-red-light font-semibold"
                      : "text-[#667085] hover:text-[#111827] hover:bg-gray-50"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <Outlet />
    </div>
  );
}
