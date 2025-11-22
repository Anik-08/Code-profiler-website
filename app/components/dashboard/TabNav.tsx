// components/dashboard/TabNav.tsx

"use client";

interface Tab {
  id: string;
  label: string;
}

interface TabNavProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
}

export function TabNav({ tabs, activeTab, onChange }: TabNavProps) {
  return (
    <div className="flex items-center gap-2">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`
            px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
            ${activeTab === tab.id
              ? "bg-linear-to-r from-violet-500 to-emerald-500 text-white shadow-lg shadow-violet-500/20"
              : "bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 hover:text-slate-300"
            }
          `}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}