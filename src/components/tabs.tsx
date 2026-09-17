"use client";

import { useState, type ReactNode } from "react";

export function Tabs({ tabs }: { tabs: { label: string; content: ReactNode }[] }) {
  const [active, setActive] = useState(0);

  return (
    <div>
      <div className="border-foreground/10 mb-6 flex gap-1 overflow-x-auto border-b text-sm whitespace-nowrap">
        {tabs.map((tab, index) => (
          <button
            key={tab.label}
            type="button"
            onClick={() => setActive(index)}
            className={`-mb-px border-b-2 px-3 py-2 transition-colors ${
              index === active
                ? "border-primary text-primary font-medium"
                : "text-foreground/60 hover:text-foreground border-transparent"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {tabs[active]?.content}
    </div>
  );
}
