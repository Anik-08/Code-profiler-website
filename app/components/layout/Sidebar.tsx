// components/layout/Sidebar.tsx

"use client";

import { Zap, Home, Flame, FileText, BarChart3, Settings, ChevronRight } from "lucide-react";
import { NavItem } from "@/lib/types";

const navItems: NavItem[] = [
  { icon: Home, label: "Dashboard", href: "/", active: true },
  { icon: Flame, label: "Hotspots", href: "/hotspots" },
  { icon: FileText, label: "File Analysis", href: "/analysis" },
  { icon: BarChart3, label: "Metrics", href: "/metrics" },
];

export function Sidebar() {
  return (
    <aside className="w-60 flex flex-col border-r border-slate-800/50 bg-slate-900/80 backdrop-blur-xl">
      {/* Logo */}
      <div className="p-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-violet-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-[10px] font-semibold tracking-widest text-slate-500 uppercase">
              Energy
            </div>
            <div className="text-sm font-semibold text-slate-200">
              Profiler
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2">
        <div className="text-[10px] font-semibold tracking-wider text-slate-600 uppercase px-3 mb-2">
          Menu
        </div>
        {navItems.map((item) => (
          <NavButton key={item.label} item={item} />
        ))}
      </nav>

      {/* Compiler Status */}
      <div className="p-3">
        <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
          <div className="flex items-center gap-2 mb-2">
            <Settings className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-medium text-slate-400">Compiler</span>
          </div>
          <div className="text-sm font-medium text-emerald-400">Piston API</div>
          <div className="text-xs text-slate-500 mt-1">Free tier active</div>
        </div>
      </div>
    </aside>
  );
}

function NavButton({ item }: { item: NavItem }) {
  const Icon = item.icon;
  
  return (
    <button
      className={`
        w-full flex items-center gap-3 px-3 py-2.5 mb-1 rounded-xl
        text-sm transition-all duration-200
        ${item.active 
          ? "bg-linear-to-r from-violet-500/20 to-emerald-500/10 text-white border border-violet-500/20" 
          : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
        }
      `}
    >
      <Icon className={`w-4 h-4 ${item.active ? "text-violet-400" : "text-slate-500"}`} />
      <span className="flex-1 text-left">{item.label}</span>
      {item.active && <ChevronRight className="w-4 h-4 text-violet-400" />}
    </button>
  );
}